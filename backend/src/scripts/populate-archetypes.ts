import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/** Populate the database with archetypes from YGOProdeck external API */
async function populateArchetypes() {
  console.log("🔄 Iniciando población de arquetipos...");

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

    let insertedCount = 0;
    let skippedCount = 0;

    for (const name of archetypeNames) {
      try {
        await prisma.archetype.create({
          data: {
            name,
          },
        });
        insertedCount++;
      } catch {
        skippedCount++;
      }
    }

    console.log(`Inserted: ${insertedCount} archetypes`);
    console.log(`Skipped (already existed): ${skippedCount} archetypes`);

    const sampleResults = await prisma.archetype.findMany({
      where: {
        name: {
          contains: "Blue",
        },
      },
      take: 3,
    });

    if (sampleResults.length > 0) {
      console.log("\n Example of inserted data:");
      sampleResults.forEach((row) => {
        console.log(`  - ${row.name}: registered=${row.registered}`);
      });
    }
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

populateArchetypes();
