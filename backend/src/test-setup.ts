import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env.test BEFORE any other code runs
// This ensures DATABASE_URL points to test.db, not the production database
dotenv.config({ path: path.resolve(__dirname, "../.env.test"), override: true, quiet: true });

// Suppress noisy console output during tests
// Turnstile: key is intentionally empty to bypass CAPTCHA in tests
// Brevo: SMTP credentials are empty in test mode, so email sending fails safely
const originalWarn = console.warn;
const originalError = console.error;

console.warn = ((...args: unknown[]) => {
  const msg = typeof args[0] === "string" ? args[0] : "";
  if (msg.includes("TURNSTILE_SECRET_KEY")) return;
  if (msg.includes("BREVO_API_KEY")) return;
  originalWarn.apply(console, args);
}) as typeof console.warn;

console.error = ((...args: unknown[]) => {
  const msg = typeof args[0] === "string" ? args[0] : "";
  if (msg.includes("Failed to send email") || msg.includes("Failed to send verification email")) return;
  originalError.apply(console, args);
}) as typeof console.error;
