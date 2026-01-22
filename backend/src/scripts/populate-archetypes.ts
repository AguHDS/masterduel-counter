import { YugiohDatabase } from "../db/database";

/** Populate the database with archetypes from YGOProdeck external API */
async function populateArchetypes() {
  console.log("🔄 Iniciando población de arquetipos...");

  const database = new YugiohDatabase();
  const db = database.getConnection();

  try {
    console.log("📡 Obteniendo arquetipos de la API externa...");

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

    console.log(`📊 Se obtuvieron ${archetypeNames.length} arquetipos`);

    const insertStmt = db.prepare(`
      INSERT OR IGNORE INTO archetypes (name) 
      VALUES (?)
    `);

    db.transaction(() => {
      for (const name of archetypeNames) {
        insertStmt.run(name);
      }
    })();

    const sampleQuery = db.prepare(`
      SELECT name, registered, pending_requests 
      FROM archetypes 
      WHERE name LIKE '%Blue%' 
      LIMIT 3
    `);

    const sampleResults = sampleQuery.all() as Array<{
      name: string;
      registered: number;
      pending_requests: number;
    }>;

    if (sampleResults.length > 0) {
      console.log("\n🔍 Ejemplo de datos insertados:");
      sampleResults.forEach((row) => {
        console.log(
          `  - ${row.name}: registered=${row.registered === 1}, pending_requests=${row.pending_requests}`,
        );
      });
    }
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  } finally {
    database.close();
    console.log("🔒 Conexión a base de datos cerrada");
  }
}

populateArchetypes();
