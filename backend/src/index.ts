import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import helmet from "helmet";
import { existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { getDependencies } from "./compositionRoot.js";
import { startCleanupJob } from "./services/cleanupService.js";
import { startTrendingSnapshotService } from "./services/trendingSnapshotService.js";
import {
  createGuideOgPreviewMiddleware,
  createSiteOgPreviewMiddleware,
} from "./http/middlewares/guideOgPreviewMiddleware.js";
import { createLegacyUrlRedirectMiddleware } from "./http/middlewares/legacyUrlRedirectMiddleware.js";
import {
  authWriteRateLimiter,
  dynamicContentCreationRateLimiter,
} from "./http/middlewares/rateLimitMiddleware.js";
dotenv.config();
const app = express();

// Trust proxy - Required for rate limiting to work correctly behind Nginx
// Nginx passes real IP via X-Forwarded-For header
app.set("trust proxy", 1);

const PORT = process.env.PORT_BACKEND ?? 3001;
const NODE_ENV = process.env.NODE_ENV ?? "development";
const CORS_ORIGIN = process.env.CORS_ORIGIN ?? "*";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
// Frontend dist is located at project-root/frontend/dist
// When compiled, this file is at project-root/backend/dist/index.js
const FRONTEND_DIST = join(__dirname, "../../frontend/dist");
// Uploads directory for card images (project-root/backend/uploads)
const UPLOADS_DIR = join(__dirname, "../uploads");
import {
  searchArchetype,
  logout,
  searchCards,
  selectCard,
  confirmCards,
  archetypeGuide,
  deleteGuide,
  guideLikes,
  guideFavorites,
  guideViews,
  recommendedDeck,
  initialHands,
  comboSteps,
  getCardDetails,
  getArchetypeGuides,
  getUserGuides,
  getGuideById,
  searchArchetypeGuides,
  searchUserGuides,
  getLatestGuides,
  getAllGuides,
  getGuidesGeneralStats,
  admin,
  report,
  comments,
  ranking,
  notifications,
} from "./routes/index.js";
import auth from "./routes/auth/auth.js";
import getGuideCardPairs from "./routes/guides/getGuideCardPairs.js";
import profile from "./routes/profile/profile.js";
import customDecks from "./routes/customDecks.js";
import guideRequests from "./routes/guide-request/guideRequests.js";
import sitemap from "./routes/sitemap.js";
import cardThumbnails from "./routes/cardThumbnails.js";

// Middleware for redirect 301 legacy URLs to new ones
const { redirectLegacyArchetypeListUrl, redirectLegacyGuideUrl, redirectLegacyProfileUrl, redirectLegacyGuidesListUrl } = createLegacyUrlRedirectMiddleware(getDependencies());

// SCP configuration
const isDevelopment = NODE_ENV === "development";

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        imgSrc: isDevelopment
          ? [
              "'self'",
              "data:",
              "blob:",
              "http://localhost:3001",
              "https://res.cloudinary.com",
              "https://*.cloudinary.com",
              "https://images.ygoprodeck.com",
              "https://*.ygoprodeck.com",
              "https://ygoprodeck.com",
            ]
          : [
              "'self'",
              "data:",
              "blob:",
              "https://res.cloudinary.com",
              "https://*.cloudinary.com",
              "https://images.ygoprodeck.com",
              "https://*.ygoprodeck.com",
              "https://ygoprodeck.com",
            ],
        scriptSrc: [
          "'self'",
          "'unsafe-inline'",
          "https://challenges.cloudflare.com",
          "https://static.cloudflareinsights.com",
          "https://www.googletagmanager.com",
          "blob:",
        ],
        styleSrc: [
          "'self'",
          "'unsafe-inline'",
          "https://challenges.cloudflare.com",
        ],
        connectSrc: isDevelopment
          ? [
              "'self'",
              "http://localhost:3001",
              "http://localhost:5173",
              "ws://localhost:5173",
              "https://db.ygoprodeck.com",
              "https://challenges.cloudflare.com",
              "https://discord.com",
              "https://*.discord.com",
              "https://www.google-analytics.com",
              "https://www.googletagmanager.com",
              "https://discordapp.com",
              "https://*.discordapp.com",
              "https://*.sentry.io",
              "https://*.ingest.sentry.io",
              "https://*.ingest.us.sentry.io",
            ]
          : [
              "'self'",
              "https://masterduelcounter.com",
              "https://*.masterduelcounter.com",
              "https://db.ygoprodeck.com",
              "https://challenges.cloudflare.com",
              "https://discord.com",
              "https://*.discord.com",
              "https://discordapp.com",
              "https://*.discordapp.com",
              "https://*.sentry.io",
              "https://*.ingest.sentry.io",
              "https://*.ingest.us.sentry.io",
            ],
        fontSrc: ["'self'", "https://challenges.cloudflare.com"],
        objectSrc: ["'none'"],
        frameSrc: ["'self'", "https://challenges.cloudflare.com"],
        frameAncestors: ["'none'"],
        baseUri: ["'self'"],
        formAction: ["'self'", "https://discord.com", "https://discordapp.com"],
        childSrc: ["'self'", "https://challenges.cloudflare.com", "blob:"],
        workerSrc: ["'self'", "blob:"],
      },
    },
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" },
  }),
);

app.use(
  cors({
    origin: NODE_ENV === "development" ? true : CORS_ORIGIN.split(","),
    credentials: true,
  }),
);
app.use(cookieParser());
app.use(express.json());

// Serve thumbnails with dynamic generation (must come before static middleware)
app.use("/api/uploads", cardThumbnails);

// Serve card images from local uploads directory
// This allows frontend to request images via /api/uploads/cards/{cardId}.jpg
app.use("/api/uploads", express.static(UPLOADS_DIR));

// RATE LIMITING - MINIMAL APPROACH
// Only protect real attack vectors, let everything else run freely

// Rate limiting helper: Only apply to write operations (POST, PUT, PATCH, DELETE)
const onlyWriteOperations = (limiter: express.RequestHandler) => {
  return (req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (["POST", "PUT", "PATCH", "DELETE"].includes(req.method)) {
      return limiter(req, res, next);
    }
    next();   
  };
};

// 1. AUTHENTICATION - Prevent brute force attacks (login/register only)
app.use("/api/auth", onlyWriteOperations(authWriteRateLimiter));

// 2. REPORT SPAM - Prevent malicious report flooding
app.use("/api/reports", onlyWriteOperations(dynamicContentCreationRateLimiter));

// ROUTES WITHOUT RATE LIMITING

// BetterAuth routes
app.use("/api/auth", auth);
app.use("/api/logout", logout);

// Profile
app.use("/api/profile", profile);

// Custom Decks
app.use("/api", customDecks);

// Archetypes & Instances
app.use("/api/archetypes", archetypeGuide);

// Guides
app.use("/api", deleteGuide);
app.use("/api", guideLikes);
app.use("/api", guideFavorites);
app.use("/api", guideViews);
app.use("/api", recommendedDeck);
app.use("/api/instances", initialHands);
app.use("/api/initial-hands", comboSteps);
app.use("/api", getArchetypeGuides);
app.use("/api", getUserGuides);
app.use("/api", searchArchetypeGuides);
app.use("/api", searchUserGuides);
app.use("/api", getGuideById);
app.use("/api", getLatestGuides);
app.use("/api", getAllGuides);
app.use("/api", getGuidesGeneralStats);
app.use("/api", getGuideCardPairs);

// Search
app.use("/api/searchArchetype", searchArchetype);

// Comments
app.use("/api/comments", comments);

// Notifications
app.use("/api/notifications", notifications);

// Ranking
app.use("/api/ranking", ranking);

// Cards
app.use("/api/cards/search", searchCards);
app.use("/api/cards/select", selectCard);
app.use("/api/cards/confirm", confirmCards);
app.use("/api/cards", getCardDetails);

// Admin routes
app.use("/api/admin", admin);

// Reports
app.use("/api/reports", report);

// Guide Requests
app.use("/api/guide-requests", guideRequests);

// Sitemap for SEO
app.use(sitemap);

// Serve the React frontend (only if the build exists — production)
if (existsSync(FRONTEND_DIST)) {
  // OG tag injection for the shared domain/home URL (Discord, Slack, etc.)
  // Must run before static/catch-all so crawlers get enriched HTML.
  app.get("/", createSiteOgPreviewMiddleware());

  // OG tag injection for guide pages (MUST come BEFORE redirects so bots see meta tags)
  // Register as specific routes to have priority over redirect middleware
  const guideOgMiddleware = createGuideOgPreviewMiddleware(getDependencies());
  app.get("/archetype/:archetypeId/instance/:instanceId", guideOgMiddleware);
  app.get("/archetypes/:archetypeSlug/:authorSlug/:guideSlug", guideOgMiddleware);

  // Permanent redirects tell search engines that the old public URLs moved
  app.get("/guides", redirectLegacyGuidesListUrl);
  app.get("/archetype/:archetypeId", redirectLegacyArchetypeListUrl);
  app.get("/archetype/:archetypeId/instance/:instanceId", redirectLegacyGuideUrl);
  app.get("/archetypes/:archetypeSlug/:authorSlug/:guideSlug", redirectLegacyGuideUrl);
  app.get("/profile/:userId", redirectLegacyProfileUrl);
  app.get("/profile/:userId/:tab", redirectLegacyProfileUrl);

  // Serve static assets (JS, CSS, images, etc.)
  app.use(express.static(FRONTEND_DIST));

  // Catch-all: serve index.html for all non-API client-side routes
  // Only serve index.html for routes that don't start with /api/
  app.use((req, res, next) => {
    if (req.path.startsWith("/api/")) {
      return next();
    }
    res.sendFile(join(FRONTEND_DIST, "index.html"));
  });
}

app.listen(PORT, () => {
  startCleanupJob();
  startTrendingSnapshotService();
});
