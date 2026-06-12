import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env.test BEFORE any other code runs
// This ensures DATABASE_URL points to test.db, not the production database
dotenv.config({ path: path.resolve(__dirname, "../.env.test"), override: true });
