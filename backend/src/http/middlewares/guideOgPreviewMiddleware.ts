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
const SOCIAL_BOT_UA_REGEX = /bot|crawler|spider|crawling|discordbot|twitterbot|facebookexternalhit|whatsapp|telegram|slack|linkedin|pinterest/i;

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function isSocialBotRequest(req: Request): boolean {
  const userAgent = req.headers["user-agent"] || "";
  return SOCIAL_BOT_UA_REGEX.test(userAgent);
}

async function loadFrontendIndexHtml(): Promise<string | null> {
  if (!existsSync(INDEX_HTML_PATH)) return null;
  return readFile(INDEX_HTML_PATH, "utf-8");
}

function replaceTitleAndDescription(
  html: string,
  title: string,
  description: string,
): string {
  let updated = html.replace(
    /<title>[^<]*<\/title>/,
    `<title>${escapeHtml(title)}</title>`,
  );
  updated = updated.replace(
    /<meta\s+name="description"\s+content="[^"]*"\s*\/?>/,
    `<meta name="description" content="${escapeHtml(description)}" />`,
  );

  return updated;
}

function stripExistingOgAndTwitterTags(html: string): string {
  let updated = html.replace(
    /\s*<meta\s+property="og:[^"]+"\s+content="[^"]*"\s*\/?>/g,
    "",
  );
  updated = updated.replace(
    /\s*<meta\s+name="twitter:[^"]+"\s+content="[^"]*"\s*\/?>/g,
    "",
  );

  return updated;
}

function withInjectedTagsBeforeHeadClose(html: string, tags: string): string {
  return html.replace("</head>", `${tags}\n  </head>`);
}

function buildRuntimeBaseUrl(req: Request): string {
  const forwardedProto = req.headers["x-forwarded-proto"];
  const protocol =
    typeof forwardedProto === "string"
      ? forwardedProto.split(",")[0]
      : req.protocol;
  const host = req.get("host");
  return protocol && host ? `${protocol}://${host}` : SITE_URL;
}

function buildSiteOgTags(params: {
  title: string;
  description: string;
  imageUrl: string;
  pageUrl: string;
}): string {
  const { title, description, imageUrl, pageUrl } = params;
  const safeTitle = escapeHtml(title);
  const safeDesc = escapeHtml(description);

  return `
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="Masterduel Counter" />
    <meta property="og:title" content="${safeTitle}" />
    <meta property="og:description" content="${safeDesc}" />
    <meta property="og:image" content="${imageUrl}" />
    <meta property="og:image:secure_url" content="${imageUrl}" />
    <meta property="og:url" content="${pageUrl}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${safeTitle}" />
    <meta name="twitter:description" content="${safeDesc}" />
    <meta name="twitter:image" content="${imageUrl}" />`;
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

    // Only process for social media bots
    if (!isSocialBotRequest(req)) return next();

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
      const runtimeBaseUrl = buildRuntimeBaseUrl(req);
      const pageUrl = `${runtimeBaseUrl}${req.originalUrl}`;

      const ogTags = buildOgTags({
        title,
        description: description.slice(0, 300),
        imageUrl: headerImageUrl,
        pageUrl,
        guideType: instance.guideType,
      });

      const htmlTemplate = await loadFrontendIndexHtml();
      if (!htmlTemplate) return next();

      let html = replaceTitleAndDescription(
        htmlTemplate,
        `${title} - Masterduel Counter`,
        description.slice(0, 300),
      );
      html = stripExistingOgAndTwitterTags(html);
      html = withInjectedTagsBeforeHeadClose(html, ogTags);

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

/**
 * Middleware that injects OG tags for the home/domain URL so Discord and other
 * social previews show the site logo when sharing the base domain.
 */
export function createSiteOgPreviewMiddleware() {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Handle only the base domain URL variants
    if (req.path !== "/" && req.path !== "") return next();
    if (!isSocialBotRequest(req)) return next();

    try {
      const htmlTemplate = await loadFrontendIndexHtml();
      if (!htmlTemplate) return next();

      const title = "Masterduel Counter - Yu-Gi-Oh! TCG, OCG & Master Duel Guides";
      const description =
        "Find the best counter strategies and deck guides for all Yu-Gi-Oh! formats (TCG, OCG, Master Duel).";
      const runtimeBaseUrl = buildRuntimeBaseUrl(req);
      const pageUrl = `${runtimeBaseUrl}${req.originalUrl || "/"}`;
      const logoUrl = `${SITE_URL}/logo.webp`;
      const ogTags = buildSiteOgTags({
        title,
        description,
        imageUrl: logoUrl,
        pageUrl,
      });

      let html = replaceTitleAndDescription(htmlTemplate, title, description);
      html = stripExistingOgAndTwitterTags(html);
      html = withInjectedTagsBeforeHeadClose(html, ogTags);

      res.setHeader("Content-Type", "text/html");
      res.setHeader("X-Site-OG-Preview", "hit");
      res.setHeader("Cache-Control", "no-store, max-age=0");
      res.send(html);
    } catch (error) {
      console.error("[siteOgPreviewMiddleware] Failed to inject site OG tags", {
        path: req.originalUrl,
        error,
      });
      next();
    }
  };
}
