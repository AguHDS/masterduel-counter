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
import { createGuideOgPreviewMiddleware } from "./http/middlewares/guideOgPreviewMiddleware.js";
dotenv.config();
const app = express();
const PORT = process.env.PORT_BACKEND ?? 3001;
const NODE_ENV = process.env.NODE_ENV ?? "development";
const CORS_ORIGIN = process.env.CORS_ORIGIN ?? "*";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
// Frontend dist is located at project-root/frontend/dist
// When compiled, this file is at project-root/backend/dist/index.js
const FRONTEND_DIST = join(__dirname, "../../frontend/dist");
import {
  searchArchetype,
  logout,
  searchCards,
  selectCard,
  confirmCards,
  archetypeGuide,
  registeredArchetypes,
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

// SCP configuration
const isDevelopment = NODE_ENV === "development";

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        imgSrc: [
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

// BetterAuth routes (handles /api/auth/*)
app.use("/api/auth", auth);
app.use("/api/logout", logout);

// Profile
app.use("/api/profile", profile);

// Custom Decks
app.use("/api", customDecks);

// Archetypes & Instances
app.use("/api/archetypes", archetypeGuide);
app.use("/api/archetypes", registeredArchetypes);
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
app.use("/api", getGuidesGeneralStats);
app.use("/api", getGuideCardPairs);
app.use("/api/searchArchetype", searchArchetype);
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

// Serve the React frontend (only if the build exists — production)
if (existsSync(FRONTEND_DIST)) {
  // OG tag injection for guide pages (must come before static middleware)
  app.use(createGuideOgPreviewMiddleware(getDependencies()));

  // Serve static assets (JS, CSS, images, etc.)
  app.use(express.static(FRONTEND_DIST));

  // Catch-all: serve index.html for all non-API client-side routes
  app.get("/{*path}", (_req, res) => {
    res.sendFile(join(FRONTEND_DIST, "index.html"));
  });
}

app.listen(PORT, () => {
  
  startCleanupJob();
});
