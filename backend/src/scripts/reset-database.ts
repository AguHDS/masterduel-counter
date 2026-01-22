import { YugiohDatabase } from "../db/database";

function resetDatabase() {
  const database = new YugiohDatabase();
  const db = database.getConnection();

  try {
    db.exec(`DROP TABLE IF EXISTS archetypes`);

    database.initializeAllTables();
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    database.close();
  }
}

resetDatabase();
