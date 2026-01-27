import { YugiohDatabase } from "../database/database";
import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function cleanCloudinaryFolder() {
  const folderPath = "masterduel-counter/cards";
  
  try {
    console.log(`Deleting Cloudinary resources in: ${folderPath}`);
    
    // Delete all resources in the folder
    const result = await cloudinary.api.delete_resources_by_prefix(folderPath, {
      resource_type: "image",
    });
    
    console.log(`${result.deleted_counts?.image || 0} images deleted from Cloudinary`);
    
    // Try to delete the folder (may fail if it is not empty)
    try {
      await cloudinary.api.delete_folder(folderPath);
      console.log(`Cloudinary folder deleted`);
    } catch (error) {
      // Not critical if the folder cannot be deleted
      console.log("Cloudinary folder not deleted (may not be empty)");
    }
  } catch (error) {
    console.error("Error cleaning Cloudinary:", error);
    console.log("Continuing with the database reset...");
  }
}

async function resetDatabase() {
  const database = new YugiohDatabase();
  const db = database.getConnection();

  try {
    await cleanCloudinaryFolder();
    
    // Delete tables in order (respecting foreign keys)
    db.exec(`DROP TABLE IF EXISTS archetype_card_pairs`);
    db.exec(`DROP TABLE IF EXISTS archetypes`);
    db.exec(`DROP TABLE IF EXISTS cards`);
    db.exec(`DROP TABLE IF EXISTS admins`);
    
    database.initializeAllTables();
    
    console.log("Database reset completed successfully!");
    console.log("\ Next steps:");
    console.log("1. Execute: npm run populate-archetypes");
    console.log("2. Execute: npm run create-admin");
  } catch (error) {
    console.error("Error:", error);
  } finally {
    database.close();
  }
}

resetDatabase();
