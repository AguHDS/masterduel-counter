import Database from "better-sqlite3";
import bcrypt from "bcrypt";
import path from "path";
import { fileURLToPath } from "url";
import readline from "readline";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const question = (query: string): Promise<string> => {
  return new Promise((resolve) => {
    rl.question(query, resolve);
  });
};

async function createAdmin() {
  try {
    console.log("=== Create Admin User ===\n");

    const username = await question("Enter admin username: ");
    if (!username || username.trim().length === 0) {
      console.error("❌ Username cannot be empty");
      rl.close();
      return;
    }

    const password = await question("Enter admin password: ");
    if (!password || password.trim().length === 0) {
      console.error("❌ Password cannot be empty");
      rl.close();
      return;
    }

    const dbPath = path.join(__dirname, "../data/database.db");
    const db = new Database(dbPath);

    // Initialize tables if they don't exist
    db.exec(`
      CREATE TABLE IF NOT EXISTS admins (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Check if user already exists
    const existingUser = db
      .prepare("SELECT * FROM admins WHERE username = ?")
      .get(username);

    if (existingUser) {
      console.error(`❌ Admin user "${username}" already exists`);
      db.close();
      rl.close();
      return;
    }

    // Hash password
    const saltRounds = 10;
    const password_hash = await bcrypt.hash(password, saltRounds);

    // Insert admin
    const stmt = db.prepare(`
      INSERT INTO admins (username, password_hash)
      VALUES (?, ?)
    `);

    stmt.run(username, password_hash);

    console.log(`\n✅ Admin user "${username}" created successfully!`);

    db.close();
    rl.close();
  } catch (error) {
    console.error("❌ Error creating admin:", error);
    rl.close();
    process.exit(1);
  }
}

createAdmin();
