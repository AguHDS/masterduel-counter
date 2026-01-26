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
import { searchArchetype, signAsAdmin, verifyAuth, logout, searchCards, selectCard, confirmCards } from "./routes/index";

app.use(
  cors({
    origin: NODE_ENV === "dev" ? true : CORS_ORIGIN.split(","),
    credentials: true,
  }),
);
app.use(cookieParser());
app.use(express.json());

app.use("/api/searchArchetype", searchArchetype);

// Cards
app.use("/api/cards/search", searchCards);
app.use("/api/cards/select", selectCard);
app.use("/api/cards/confirm", confirmCards);

// Admin
app.use("/api/signAsAdmin", signAsAdmin);
app.use("/api/verifyAuth", verifyAuth);
app.use("/api/logout", logout);

// Cron job: Cleaning temporary cards every 24 hours (at 3:00 AM)
cron.schedule("0 3 * * *", async () => {
  console.log("[Cron] Starting cleanup of temporary cards...");
  try {
    const cardService = getDependencies().getCardService();
    const deletedCount = await cardService.cleanupTemporaryCards();
    console.log(`[Cron] Cleanup completed: ${deletedCount} temporary card(s) deleted`);
  } catch (error) {
    console.error("[Cron] Error during cleanup:", error);
  }
});

app.listen(PORT, () => {
  console.log(`Listening to: http://localhost:${PORT}`);
  console.log("Temporary card cleaning cron job activated (every day at 3:00 AM)");
});
