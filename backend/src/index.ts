import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import cron from "node-cron";
import dotenv from "dotenv";
import { getDependencies } from "./compositionRoot";
dotenv.config();
const app = express();
const PORT = process.env.PORT_BACKEND ?? 3001;
const NODE_ENV = process.env.NODE_ENV ?? "dev";
const CORS_ORIGIN = process.env.CORS_ORIGIN ?? "*";
import {
  searchArchetype,
  logout,
  searchCards,
  selectCard,
  confirmCards,
  registerArchetype,
  registeredArchetypes,
  deleteUserInstance,
  instanceLikes,
  createGetArchetypeInstancesRoute,
  createGetUserInstancesRoute,
  createCreateOrUpdateInstanceRoute,
  createGetUserInstanceRoute,
} from "./routes/index";
import auth from "./routes/auth";
import getInstanceCardPairs from "./routes/getInstanceCardPairs";

app.use(
  cors({
    origin: NODE_ENV === "dev" ? true : CORS_ORIGIN.split(","),
    credentials: true,
  }),
);
app.use(cookieParser());
app.use(express.json());

// BetterAuth routes (handles /api/auth/*)
app.use("/api/auth", auth);
app.use("/api/logout", logout);

// Archetypes & Instances
app.use("/api/archetypes", registerArchetype);
app.use("/api/archetypes", registeredArchetypes);
app.use("/api", deleteUserInstance);
app.use("/api", instanceLikes);
app.use("/api", createGetArchetypeInstancesRoute(getDependencies()));
app.use("/api", createGetUserInstancesRoute(getDependencies()));
app.use("/api", createCreateOrUpdateInstanceRoute(getDependencies()));
app.use("/api", createGetUserInstanceRoute(getDependencies()));
app.use("/api", getInstanceCardPairs);
app.use("/api/searchArchetype", searchArchetype);

// Cards
app.use("/api/cards/search", searchCards);
app.use("/api/cards/select", selectCard);
app.use("/api/cards/confirm", confirmCards);

// Cron job: Cleaning temporary cards every 24 hours (at 3:00 AM)
cron.schedule("0 3 * * *", async () => {
  console.log("[Cron] Starting cleanup of temporary cards...");
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
    "Temporary card cleaning cron job activated (every day at 3:00 AM)",
  );
});
