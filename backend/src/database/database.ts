import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface DatabasePort {
  getConnection(): Database.Database;
  close(): void;
}

export class YugiohDatabase implements DatabasePort {
  private db: Database.Database;

  constructor() {
    const dbPath = path.join(__dirname, "../data/database.db");
    this.db = new Database(dbPath);
    this.initializeAllTables();
  }

  public initializeAllTables(): void {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS archetypes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE NOT NULL,
        registered BOOLEAN DEFAULT FALSE,
        pending_requests INTEGER DEFAULT 0,
        header_card_id INTEGER DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (header_card_id) REFERENCES cards(id) ON DELETE SET NULL
      )
    `);

    this.db.exec(`
      CREATE TABLE IF NOT EXISTS admins (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    this.db.exec(`
      CREATE TABLE IF NOT EXISTS cards (
        id INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        image_url TEXT NOT NULL,
        image_url_small TEXT NOT NULL,
        cloudinary_public_id TEXT NOT NULL,
        cloudinary_public_id_small TEXT NOT NULL,
        is_temporary INTEGER DEFAULT 1,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);

    this.db.exec(`
      CREATE INDEX IF NOT EXISTS idx_cards_name ON cards(name)
    `);

    this.db.exec(`
      CREATE INDEX IF NOT EXISTS idx_cards_temporary ON cards(is_temporary, created_at)
    `);

    this.db.exec(`
      CREATE TABLE IF NOT EXISTS archetype_card_pairs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        archetype_id INTEGER NOT NULL,
        top_card_id INTEGER NOT NULL,
        bottom_card_id INTEGER NOT NULL,
        pair_order INTEGER NOT NULL,
        effectiveness TEXT DEFAULT NULL,
        comment TEXT DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (archetype_id) REFERENCES archetypes(id) ON DELETE CASCADE,
        FOREIGN KEY (top_card_id) REFERENCES cards(id) ON DELETE CASCADE,
        FOREIGN KEY (bottom_card_id) REFERENCES cards(id) ON DELETE CASCADE
      )
    `);

    this.db.exec(`
      CREATE INDEX IF NOT EXISTS idx_archetype_pairs ON archetype_card_pairs(archetype_id)
    `);
  }

  public getConnection(): Database.Database {
    return this.db;
  }

  public close(): void {
    this.db.close();
  }
}

export const createYugiohDatabase = (): DatabasePort => {
  return new YugiohDatabase();
};

export type DatabaseConnection = Database.Database;
