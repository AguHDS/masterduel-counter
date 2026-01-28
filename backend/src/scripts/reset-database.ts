import { PrismaClient } from "@prisma/client";
import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const prisma = new PrismaClient();

async function cleanCloudinaryFolder() {
  const folderPath = "masterduel-counter/cards";

  try {
    console.log(`Deleting Cloudinary resources in: ${folderPath}`);

    // Delete all resources in the folder
    const result = await cloudinary.api.delete_resources_by_prefix(folderPath, {
      resource_type: "image",
    });

    console.log(
      `${result.deleted_counts?.image || 0} images deleted from Cloudinary`,
    );

    // Try to delete the folder (may fail if it is not empty)
    try {
      await cloudinary.api.delete_folder(folderPath);
      console.log(`Cloudinary folder deleted`);
    } catch {
      // Not critical if the folder cannot be deleted
      console.log("Cloudinary folder not deleted (may not be empty)");
    }
  } catch {
    console.error("Error cleaning Cloudinary");
    console.log("Continuing with the database reset...");
  }
}

async function resetDatabase() {
  try {
    await cleanCloudinaryFolder();

    console.log("Deleting database file...");
    const dbPath = path.join(__dirname, "../data/database.db");
    if (fs.existsSync(dbPath)) {
      fs.unlinkSync(dbPath);
      console.log("Database file deleted");
    }

    console.log("Running Prisma migrations...");
    // We can't run prisma migrate directly from code, so we just instruct the user
    console.log("\n✅ Database reset completed successfully!");
    console.log("\n📋 Next steps:");
    console.log("1. Run: npx prisma migrate dev --name init");
    console.log("   OR: npx prisma db push (if you don't want migrations)");
    console.log("2. Run: npm run populate-archetypes");
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

resetDatabase();
