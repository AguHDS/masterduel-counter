import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import cron from "node-cron";
import dotenv from "dotenv";
import helmet from "helmet";
import { getDependencies } from "./compositionRoot";
dotenv.config();
const app = express();
const PORT = process.env.PORT_BACKEND ?? 3001;
const NODE_ENV = process.env.NODE_ENV ?? "development";
const CORS_ORIGIN = process.env.CORS_ORIGIN ?? "*";
import {
  searchArchetype,
  logout,
  searchCards,
  selectCard,
  confirmCards,
  registerArchetype,
  registeredArchetypes,
  deleteGuide,
  guideLikes,
  guideFavorites,
  guideViews,
  recommendedDeck,
  getCardDetails,
  createGetArchetypeGuidesRoute,
  createGetUserGuidesRoute,
  createOrUpdateGuideRoute,
  createGetGuideByIdRoute,
  createSearchArchetypeGuidesRoute,
  createSearchUserGuidesRoute,
  admin,
  report,
  comments,
  ranking,
  createNotificationsRoute,
} from "./routes/index";
import auth from "./routes/auth/auth";
import getInstanceCardPairs from "./routes/guides/getInstanceCardPairs";
import profile from "./routes/profile/profile";
import customDecks from "./routes/customDecks";

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
app.use("/api/archetypes", registerArchetype);
app.use("/api/archetypes", registeredArchetypes);
app.use("/api", deleteGuide);
app.use("/api", guideLikes);
app.use("/api", guideFavorites);
app.use("/api", guideViews);
app.use("/api", recommendedDeck);
app.use("/api", createGetArchetypeGuidesRoute(getDependencies()));
app.use("/api", createGetUserGuidesRoute(getDependencies()));
app.use("/api", createSearchArchetypeGuidesRoute(getDependencies()));
app.use("/api", createSearchUserGuidesRoute(getDependencies()));
app.use("/api", createOrUpdateGuideRoute(getDependencies()));
app.use("/api", createGetGuideByIdRoute(getDependencies()));
app.use("/api", getInstanceCardPairs);
app.use("/api/searchArchetype", searchArchetype);
app.use("/api/comments", comments);

// Notifications
app.use("/api/notifications", createNotificationsRoute(getDependencies()));

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

// Cron job: Failsafe cleanup of temporary cards every 24 hours (at 3:00 AM)
// Cards are created as temporary only when confirmCards is called.
// This cleans up cards that weren't confirmed due to crashes, errors, or user cancellation.
cron.schedule("0 3 * * *", async () => {
  console.log("[Cron] Starting failsafe cleanup of temporary cards...");
  try {
    const cardService = getDependencies().getCardService();
    const deletedCount = await cardService.cleanupTemporaryCards();
    console.log(
      `[Cron] Cleanup completed: ${deletedCount} temporary card(s) deleted`,
    );
  } catch (error) {
    console.error("[Cron] Error during cleanup:", error);
  }
});

app.listen(PORT, () => {
  console.log(`Listening to: http://localhost:${PORT}`);
  console.log(
    "Failsafe temporary card cleanup cron job activated (every day at 3:00 AM)",
  );
});
