-- AlterTable: Add image_offset_y column to tier_list_entries
ALTER TABLE "tier_list_entries" ADD COLUMN "image_offset_y" INTEGER NOT NULL DEFAULT 0;
