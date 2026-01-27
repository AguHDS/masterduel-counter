import { YugiohDatabase } from "../database/database";
import { v2 as cloudinary } from "cloudinary";

// Configurar Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function cleanCloudinaryFolder() {
  const folderPath = "masterduel-counter/cards";
  
  try {
    console.log(`🗑️  Eliminando recursos de Cloudinary en: ${folderPath}`);
    
    // Eliminar todos los recursos en la carpeta
    const result = await cloudinary.api.delete_resources_by_prefix(folderPath, {
      resource_type: "image",
    });
    
    console.log(`✅ ${result.deleted_counts?.image || 0} imágenes eliminadas de Cloudinary`);
    
    // Intentar eliminar la carpeta (puede fallar si no está vacía)
    try {
      await cloudinary.api.delete_folder(folderPath);
      console.log(`✅ Carpeta eliminada de Cloudinary`);
    } catch (error) {
      // No es crítico si no se puede eliminar la carpeta
      console.log("ℹ️  Carpeta de Cloudinary no eliminada (puede no estar vacía)");
    }
  } catch (error) {
    console.error("⚠️  Error al limpiar Cloudinary:", error);
    console.log("Continuando con el reset de la base de datos...");
  }
}

async function resetDatabase() {
  const database = new YugiohDatabase();
  const db = database.getConnection();

  try {
    console.log("🔄 Iniciando reset completo de la base de datos...");
    
    // Eliminar recursos de Cloudinary
    await cleanCloudinaryFolder();
    
    console.log("\n📊 Eliminando tablas de la base de datos...");
    
    // Eliminar tablas en orden (respetando foreign keys)
    db.exec(`DROP TABLE IF EXISTS archetype_card_pairs`);
    db.exec(`DROP TABLE IF EXISTS archetypes`);
    db.exec(`DROP TABLE IF EXISTS cards`);
    db.exec(`DROP TABLE IF EXISTS admins`);
    
    console.log("✅ Tablas eliminadas");
    console.log("\n🔨 Creando tablas nuevas...");

    database.initializeAllTables();
    
    console.log("✅ Base de datos reseteada correctamente");
    console.log("\n💡 Próximos pasos:");
    console.log("   1. Ejecuta: npm run populate-archetypes");
    console.log("   2. Ejecuta: npm run create-admin");
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    database.close();
  }
}

resetDatabase();
