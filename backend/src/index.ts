import express from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();
const app = express();
const PORT = process.env.PORT ?? 3001;
const NODE_ENV = process.env.NODE_ENV ?? "development";
const CORS_ORIGIN = process.env.CORS_ORIGIN ?? "*";
import { searchArchetype } from "./routes/index";

app.use(
  cors({
    origin: NODE_ENV === "development" ? true : CORS_ORIGIN.split(","),
    credentials: true,
  }),
);
app.use(express.json());

app.use("/api/searchArchetype", searchArchetype);

app.listen(PORT, () => {
  console.log(`Listening to: http://localhost:${PORT}`);
});
