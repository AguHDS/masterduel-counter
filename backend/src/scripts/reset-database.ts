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
  const folderPath = "masterduel-counter";

  try {
    console.log(`Deleting Cloudinary resources in: ${folderPath}`);

    // Delete all resources in the folder (cards and profile pictures)
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
    // First, delete junction tables that reference card pairs
    try {
      await prisma.cardPairTop.deleteMany({});
      console.log("✓ Deleted all card pair tops");
    } catch (e) {
      console.log("ℹ Table card_pair_top doesn't exist yet (will be created after db push)");
    }
    
    try {
      await prisma.cardPairBottom.deleteMany({});
      console.log("✓ Deleted all card pair bottoms");
    } catch (e) {
      console.log("ℹ Table card_pair_bottom doesn't exist yet (will be created after db push)");
    }
    
    try {
      await prisma.archetypeCardPair.deleteMany({});
      console.log("✓ Deleted all archetype card pairs");
    } catch (e) {
      console.log("ℹ Table archetype_card_pairs doesn't exist yet (will be created after db push)");
    }
    
    try {
      await prisma.instanceLike.deleteMany({});
      console.log("✓ Deleted all instance likes");
    } catch (e) {
      console.log("ℹ Table instance_likes doesn't exist yet (will be created after db push)");
    }
    
    try {
      await prisma.archetypeInstance.deleteMany({});
      console.log("✓ Deleted all archetype instances");
    } catch (e) {
      console.log("ℹ Table archetype_instances doesn't exist yet (will be created after db push)");
    }
    
    try {
      await prisma.card.deleteMany({});
      console.log("✓ Deleted all cards");
    } catch (e) {
      console.log("ℹ Table cards doesn't exist yet (will be created after db push)");
    }
    
    try {
      await prisma.archetype.deleteMany({});
      console.log("✓ Deleted all archetypes");
    } catch (e) {
      console.log("ℹ Table archetypes doesn't exist yet (will be created after db push)");
    }
    
    try {
      await prisma.profile.deleteMany({});
      console.log("✓ Deleted all profiles");
    } catch (e) {
      console.log("ℹ Table profiles doesn't exist yet (will be created after db push)");
    }
    
    try {
      await prisma.verification.deleteMany({});
      console.log("✓ Deleted all verifications");
    } catch (e) {
      console.log("ℹ Table verification doesn't exist yet (will be created after db push)");
    }
    
    try {
      await prisma.session.deleteMany({});
      console.log("✓ Deleted all sessions");
    } catch (e) {
      console.log("ℹ Table session doesn't exist yet (will be created after db push)");
    }
    
    try {
      await prisma.account.deleteMany({});
      console.log("✓ Deleted all accounts");
    } catch (e) {
      console.log("ℹ Table account doesn't exist yet (will be created after db push)");
    }
    
    try {
      await prisma.user.deleteMany({});
      console.log("✓ Deleted all users");
    } catch (e) {
      console.log("ℹ Table user doesn't exist yet (will be created after db push)");
    }

    console.log("\n✅ Database reset completed successfully!");
    console.log("\n📋 Next steps:");
    console.log("1. Run: npx prisma db push (to create/update database tables)");
    console.log("2. Run: npx prisma generate (to generate Prisma Client)");
    console.log("3. Run: npm run populate-archetypes (to populate archetype data)");
    console.log("4. Run: npm run dev (to start the server)");
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

resetDatabase();
