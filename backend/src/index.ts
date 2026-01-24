import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
dotenv.config();
const app = express();
const PORT = process.env.PORT ?? 3001;
const NODE_ENV = process.env.NODE_ENV ?? "development";
const CORS_ORIGIN = process.env.CORS_ORIGIN ?? "*";
import { searchArchetype, signAsAdmin, verifyAuth, logout } from "./routes/index";

app.use(
  cors({
    origin: NODE_ENV === "development" ? true : CORS_ORIGIN.split(","),
    credentials: true,
  }),
);
app.use(cookieParser());
app.use(express.json());

app.use("/api/searchArchetype", searchArchetype);

// Admin
app.use("/api/signAsAdmin", signAsAdmin);
app.use("/api/verifyAuth", verifyAuth);
app.use("/api/logout", logout);

app.listen(PORT, () => {
  console.log(`Listening to: http://localhost:${PORT}`);
});
