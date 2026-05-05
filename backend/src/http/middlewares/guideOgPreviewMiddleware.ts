import { Request, Response, NextFunction } from "express";
import { readFile } from "fs/promises";
import { existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { Dependencies } from "@/compositionRoot.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Path to the built frontend (relative to compiled backend/dist/http/middlewares/ → project root → frontend/dist)
const FRONTEND_DIST = join(__dirname, "../../../../frontend/dist");
const INDEX_HTML_PATH = join(FRONTEND_DIST, "index.html");

const SITE_URL = process.env.SITE_URL ?? "https://masterduelcounter.com";

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function buildOgTags(params: {
  title: string;
  description: string;
  imageUrl: string;
  pageUrl: string;
  guideType: string;
}): string {
  const { title, description, imageUrl, pageUrl, guideType } = params;
  const safeTitle = escapeHtml(title);
  const safeDesc = escapeHtml(description);
  const typeLabel = guideType === "DECK" ? "Deck Guide" : "Counter Guide";

  return `
    <meta property="og:type" content="article" />
    <meta property="og:site_name" content="Masterduel Counter" />
    <meta property="og:title" content="${safeTitle} - ${typeLabel}" />
    <meta property="og:description" content="${safeDesc}" />
    <meta property="og:image" content="${imageUrl}" />
    <meta property="og:image:secure_url" content="${imageUrl}" />
    <meta property="og:image:width" content="421" />
    <meta property="og:image:height" content="614" />
    <meta property="og:url" content="${pageUrl}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${safeTitle} - ${typeLabel}" />
    <meta name="twitter:description" content="${safeDesc}" />
    <meta name="twitter:image" content="${imageUrl}" />`;
}

/**
 * Extract instance ID from guide URL (both legacy and SEO-friendly formats)
 * - Legacy: /archetype/123/instance/456 → 456
 * - SEO: /archetypes/blue-eyes/ponyrosa/counter-guide-32 → 32
 */
function extractInstanceIdFromPath(path: string): number | null {
  // Try legacy format first: /archetype/:archetypeId/instance/:instanceId
  const legacyMatch = path.match(/^\/archetype\/\d+\/instance\/(\d+)\/?$/);
  if (legacyMatch) {
    return parseInt(legacyMatch[1], 10);
  }

  // Try SEO-friendly format: /archetypes/:archetypeSlug/:authorSlug/:guideSlug
  // Guide slug ends with the instance ID (e.g., "counter-guide-32")
  const seoMatch = path.match(/^\/archetypes\/[^\/]+\/[^\/]+\/[^\/]+-(\d+)\/?$/);
  if (seoMatch) {
    return parseInt(seoMatch[1], 10);
  }

  return null;
}

/**
 * Middleware that intercepts guide page URLs and injects OG meta tags
 * into the frontend's index.html for social media link previews.
 * Only active if the frontend dist folder exists (production build).
 */
export function createGuideOgPreviewMiddleware(dependencies: Dependencies) {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Extract instance ID from both legacy and SEO-friendly URLs
    const instanceId = extractInstanceIdFromPath(req.path);
    if (!instanceId) return next();

    // Skip if frontend dist doesn't exist
    if (!existsSync(INDEX_HTML_PATH)) return next();

    // Only process for social media bots
    const userAgent = req.headers["user-agent"] || "";
    const isSocialBot = /bot|crawler|spider|crawling|discordbot|twitterbot|facebookexternalhit|whatsapp|telegram|slack|linkedin|pinterest/i.test(userAgent);
    
    if (!isSocialBot) return next(); // Let regular users be redirected

    try {
      const instanceRepository = dependencies.getInstanceRepository();
      const cardRepository = dependencies.getCardRepository();

      const instance = await instanceRepository.findArchetypeInstanceById(instanceId);

      if (!instance) return next();

      // Get archetype information if needed
      const archetypeRepository = dependencies.getArchetypeRepository();
      const archetype = instance.archetypeId 
        ? await archetypeRepository.findArchetypeById(instance.archetypeId)
        : null;

      // Try to get the header card image (prefer cropped version for better OG previews)
      let headerImageUrl = `${SITE_URL}/og-default.png`;
      if (instance.headerCardId) {
        const headerCard = await cardRepository.finCardById(
          instance.headerCardId,
        );
        if (headerCard?.imageUrlCropped) {
          // Convert relative URL to absolute if needed
          const imageUrl = headerCard.imageUrlCropped;
          headerImageUrl = imageUrl.startsWith("http") 
            ? imageUrl 
            : `${SITE_URL}${imageUrl}`;
        }
      }

      const archetypeName = archetype?.name || "Yu-Gi-Oh!";
      const title = instance.title || archetypeName;
      const description =
        instance.generalTip ||
        `${instance.guideType === "DECK" ? "Deck" : "Counter"} guide for ${archetypeName} in Yu-Gi-Oh!.`;
      const forwardedProto = req.headers["x-forwarded-proto"];
      const protocol =
        typeof forwardedProto === "string"
          ? forwardedProto.split(",")[0]
          : req.protocol;
      const host = req.get("host");
      const runtimeBaseUrl =
        protocol && host ? `${protocol}://${host}` : SITE_URL;
      const pageUrl = `${runtimeBaseUrl}${req.originalUrl}`;

      const ogTags = buildOgTags({
        title,
        description: description.slice(0, 300),
        imageUrl: headerImageUrl,
        pageUrl,
        guideType: instance.guideType,
      });

      let html = await readFile(INDEX_HTML_PATH, "utf-8");

      // Replace the generic title and description with guide-specific ones
      html = html.replace(
        /<title>[^<]*<\/title>/,
        `<title>${escapeHtml(title)} - Masterduel Counter</title>`,
      );
      html = html.replace(
        /<meta\s+name="description"\s+content="[^"]*"\s*\/?>/,
        `<meta name="description" content="${escapeHtml(description.slice(0, 300))}" />`,
      );

      // Remove any previously injected OG/Twitter tags to avoid duplicates
      html = html.replace(/\s*<meta\s+property="og:[^"]+"\s+content="[^"]*"\s*\/?>/g, "");
      html = html.replace(/\s*<meta\s+name="twitter:[^"]+"\s+content="[^"]*"\s*\/?>/g, "");

      // Inject OG tags before </head>
      html = html.replace("</head>", `${ogTags}\n  </head>`);

      res.setHeader("Content-Type", "text/html");
      res.setHeader("X-Guide-OG-Preview", "hit");
      res.setHeader("Cache-Control", "no-store, max-age=0");
      res.send(html);
    } catch (error) {
      console.error("[guideOgPreviewMiddleware] Failed to inject OG tags", {
        path: req.originalUrl,
        error,
      });
      // On any error, fall through to serve the normal index.html
      next();
    }
  };
}
