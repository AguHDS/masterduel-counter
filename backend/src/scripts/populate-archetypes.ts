import { YugiohDatabase } from "../db/database";

/** Populate the database with archetypes from YGOProdeck external API */
async function populateArchetypes() {
  console.log("🔄 Iniciando población de arquetipos...");

  const database = new YugiohDatabase();
  const db = database.getConnection();

  try {
    const response = await fetch(
      "https://db.ygoprodeck.com/api/v7/archetypes.php",
    );

    if (!response.ok) {
      throw new Error(`Error obtaining archetypes: ${response.status}`);
    }

    const archetypesData: Array<{ archetype_name: string }> =
      await response.json();
    const archetypeNames = archetypesData
      .map((item) => item.archetype_name)
      .filter((name) => name && name.trim() !== "");

    const insertStmt = db.prepare(`
      INSERT OR IGNORE INTO archetypes (name, registered) 
      VALUES (?, FALSE)
    `);

    db.transaction(() => {
      for (const name of archetypeNames) {
        insertStmt.run(name);
      }
    })();

    const countStmt = db.prepare("SELECT COUNT(*) as count FROM archetypes");
    const result = countStmt.get() as { count: number };

    console.log(`archetypes in the database: ${result.count}`);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  } finally {
    database.close();
  }
}

populateArchetypes();
