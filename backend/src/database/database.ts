import Database from "better-sqlite3";
import path from "path";

// Interfaz abstracta para la base de datos (puerto)
export interface DatabasePort {
  getConnection(): Database.Database;
  close(): void;
}

// Implementación concreta de la base de datos (adaptador)
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
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
  }

  public getConnection(): Database.Database {
    return this.db;
  }

  public close(): void {
    this.db.close();
  }
}

// Función factory para crear la base de datos (opcional, para programación funcional)
export const createYugiohDatabase = (): DatabasePort => {
  return new YugiohDatabase();
};

// También podemos exportar solo la función si prefieres no usar la clase
export type DatabaseConnection = Database.Database;
