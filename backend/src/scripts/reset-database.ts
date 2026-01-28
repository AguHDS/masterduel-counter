import { PrismaClient } from "@prisma/client";
import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";

dotenv.config();

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

    console.log("Cleaning database tables...");
    
    // Delete all records in the correct order (respecting foreign keys)
    await prisma.archetypeCardPair.deleteMany({});
    console.log("✓ Deleted all archetype card pairs");
    
    await prisma.archetypeInstance.deleteMany({});
    console.log("✓ Deleted all archetype instances");
    
    await prisma.card.deleteMany({});
    console.log("✓ Deleted all cards");
    
    await prisma.archetype.deleteMany({});
    console.log("✓ Deleted all archetypes");
    
    await prisma.verification.deleteMany({});
    console.log("✓ Deleted all verifications");
    
    await prisma.session.deleteMany({});
    console.log("✓ Deleted all sessions");
    
    await prisma.account.deleteMany({});
    console.log("✓ Deleted all accounts");
    
    await prisma.user.deleteMany({});
    console.log("✓ Deleted all users");

    console.log("\n✅ Database reset completed successfully!");
    console.log("\n📋 Next steps:");
    console.log("1. Run: npm run populate-archetypes (to populate archetype data)");
    console.log("2. Run: npm run dev (to start the server)");
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

resetDatabase();
