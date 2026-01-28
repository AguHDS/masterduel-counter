import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface DatabasePort {
  getConnection(): Database.Database;
  close(): void;
}

export class YugiohDatabase implements DatabasePort {
  private db: Database.Database;

  constructor() {
    const dbPath = path.join(__dirname, "../../prisma/src/data/database.db");
    const dbDir = path.dirname(dbPath);
    
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }
    
    this.db = new Database(dbPath);
    // No initialization needed - tables are managed by Prisma now
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
