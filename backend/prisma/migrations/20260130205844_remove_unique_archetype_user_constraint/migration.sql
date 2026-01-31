/*
  Warnings:

  - You are about to drop the column `bottom_card_id` on the `archetype_card_pairs` table. All the data in the column will be lost.
  - You are about to drop the column `top_card_id` on the `archetype_card_pairs` table. All the data in the column will be lost.
  - Added the required column `cloudinary_public_id_cropped` to the `cards` table without a default value. This is not possible if the table is not empty.
  - Added the required column `image_url_cropped` to the `cards` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "profiles" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "user_id" TEXT NOT NULL,
    "bio" TEXT,
    "profile_picture_url" TEXT,
    "cloudinary_public_id" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "card_pair_top" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "pair_id" INTEGER NOT NULL,
    "card_id" INTEGER NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "card_pair_top_pair_id_fkey" FOREIGN KEY ("pair_id") REFERENCES "archetype_card_pairs" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "card_pair_top_card_id_fkey" FOREIGN KEY ("card_id") REFERENCES "cards" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "card_pair_bottom" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "pair_id" INTEGER NOT NULL,
    "card_id" INTEGER NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "card_pair_bottom_pair_id_fkey" FOREIGN KEY ("pair_id") REFERENCES "archetype_card_pairs" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "card_pair_bottom_card_id_fkey" FOREIGN KEY ("card_id") REFERENCES "cards" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "instance_likes" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "instance_id" INTEGER NOT NULL,
    "user_id" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "instance_likes_instance_id_fkey" FOREIGN KEY ("instance_id") REFERENCES "archetype_instances" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "instance_likes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_archetype_card_pairs" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "instance_id" INTEGER NOT NULL,
    "pair_order" INTEGER NOT NULL,
    "effectiveness" TEXT,
    "comment" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "archetype_card_pairs_instance_id_fkey" FOREIGN KEY ("instance_id") REFERENCES "archetype_instances" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_archetype_card_pairs" ("comment", "created_at", "effectiveness", "id", "instance_id", "pair_order") SELECT "comment", "created_at", "effectiveness", "id", "instance_id", "pair_order" FROM "archetype_card_pairs";
DROP TABLE "archetype_card_pairs";
ALTER TABLE "new_archetype_card_pairs" RENAME TO "archetype_card_pairs";
CREATE INDEX "archetype_card_pairs_instance_id_idx" ON "archetype_card_pairs"("instance_id");
CREATE TABLE "new_archetype_instances" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "archetype_id" INTEGER NOT NULL,
    "user_id" TEXT NOT NULL,
    "title" TEXT NOT NULL DEFAULT 'Title',
    "header_card_id" INTEGER,
    "general_tip" TEXT,
    "likes" INTEGER NOT NULL DEFAULT 0,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "archetype_instances_archetype_id_fkey" FOREIGN KEY ("archetype_id") REFERENCES "archetypes" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "archetype_instances_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "archetype_instances_header_card_id_fkey" FOREIGN KEY ("header_card_id") REFERENCES "cards" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_archetype_instances" ("archetype_id", "created_at", "header_card_id", "id", "likes", "updated_at", "user_id") SELECT "archetype_id", "created_at", "header_card_id", "id", "likes", "updated_at", "user_id" FROM "archetype_instances";
DROP TABLE "archetype_instances";
ALTER TABLE "new_archetype_instances" RENAME TO "archetype_instances";
CREATE INDEX "archetype_instances_user_id_idx" ON "archetype_instances"("user_id");
CREATE INDEX "archetype_instances_archetype_id_idx" ON "archetype_instances"("archetype_id");
CREATE TABLE "new_cards" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "image_url" TEXT NOT NULL,
    "image_url_small" TEXT NOT NULL,
    "image_url_cropped" TEXT NOT NULL,
    "cloudinary_public_id" TEXT NOT NULL,
    "cloudinary_public_id_small" TEXT NOT NULL,
    "cloudinary_public_id_cropped" TEXT NOT NULL,
    "is_temporary" BOOLEAN NOT NULL DEFAULT true,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_cards" ("cloudinary_public_id", "cloudinary_public_id_small", "created_at", "id", "image_url", "image_url_small", "is_temporary", "name") SELECT "cloudinary_public_id", "cloudinary_public_id_small", "created_at", "id", "image_url", "image_url_small", "is_temporary", "name" FROM "cards";
DROP TABLE "cards";
ALTER TABLE "new_cards" RENAME TO "cards";
CREATE INDEX "cards_name_idx" ON "cards"("name");
CREATE INDEX "cards_is_temporary_created_at_idx" ON "cards"("is_temporary", "created_at");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "profiles_user_id_key" ON "profiles"("user_id");

-- CreateIndex
CREATE INDEX "card_pair_top_pair_id_idx" ON "card_pair_top"("pair_id");

-- CreateIndex
CREATE INDEX "card_pair_bottom_pair_id_idx" ON "card_pair_bottom"("pair_id");

-- CreateIndex
CREATE INDEX "instance_likes_instance_id_idx" ON "instance_likes"("instance_id");

-- CreateIndex
CREATE INDEX "instance_likes_user_id_idx" ON "instance_likes"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "instance_likes_instance_id_user_id_key" ON "instance_likes"("instance_id", "user_id");
