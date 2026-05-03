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
 * Middleware that intercepts guide page URLs and injects OG meta tags
 * into the frontend's index.html for social media link previews.
 * Only active if the frontend dist folder exists (production build).
 */
export function createGuideOgPreviewMiddleware(dependencies: Dependencies) {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Only handle guide URL patterns
    const match = req.path.match(/^\/archetype\/(\d+)\/instance\/(\d+)\/?$/);
    if (!match) return next();

    // Skip if frontend dist doesn't exist
    if (!existsSync(INDEX_HTML_PATH)) return next();

    const instanceId = parseInt(match[2]);
    const archetypeId = parseInt(match[1]);

    if (isNaN(instanceId) || isNaN(archetypeId)) return next();

    try {
      const instanceRepository = dependencies.getInstanceRepository();
      const cardRepository = dependencies.getCardRepository();
      const archetypeRepository = dependencies.getArchetypeRepository();

      const [instance, archetype] = await Promise.all([
        instanceRepository.findArchetypeInstanceById(instanceId),
        archetypeRepository.findArchetypeById(archetypeId),
      ]);

      if (!instance || !archetype) return next();

      // Try to get the header card image
      let headerImageUrl = `${SITE_URL}/og-default.png`;
      if (instance.headerCardId) {
        const headerCard = await cardRepository.finCardById(
          instance.headerCardId,
        );
        if (headerCard?.imageUrl) {
          headerImageUrl = headerCard.imageUrl;
        }
      }

      const title = instance.title || archetype.name;
      const description =
        instance.generalTip ||
        `${instance.guideType === "DECK" ? "Deck" : "Counter"} guide for ${archetype.name} in Yu-Gi-Oh!.`;
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
