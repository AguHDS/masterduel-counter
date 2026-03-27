/*
  Warnings:

  - You are about to drop the column `pending_requests` on the `archetypes` table. All the data in the column will be lost.
  - You are about to drop the column `cloudinary_public_id` on the `cards` table. All the data in the column will be lost.
  - You are about to drop the column `cloudinary_public_id_cropped` on the `cards` table. All the data in the column will be lost.
  - You are about to drop the column `cloudinary_public_id_small` on the `cards` table. All the data in the column will be lost.
  - You are about to drop the column `is_temporary` on the `cards` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "profiles" ADD COLUMN "favorite_card_id" INTEGER;
ALTER TABLE "profiles" ADD COLUMN "favorite_decks" TEXT;

-- CreateTable
CREATE TABLE "comments" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "content" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "instance_id" INTEGER NOT NULL,
    "author_id" TEXT NOT NULL,
    "parent_comment_id" INTEGER,
    CONSTRAINT "comments_instance_id_fkey" FOREIGN KEY ("instance_id") REFERENCES "archetype_instances" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "comments_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "comments_parent_comment_id_fkey" FOREIGN KEY ("parent_comment_id") REFERENCES "comments" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "initial_hands" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "instance_id" INTEGER NOT NULL,
    "card_ids" TEXT NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "initial_hands_instance_id_fkey" FOREIGN KEY ("instance_id") REFERENCES "archetype_instances" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "instance_favorites" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "instance_id" INTEGER NOT NULL,
    "user_id" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "instance_favorites_instance_id_fkey" FOREIGN KEY ("instance_id") REFERENCES "archetype_instances" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "instance_favorites_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "recommended_decks" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "instance_id" INTEGER NOT NULL,
    "title" TEXT DEFAULT 'Recommended Deck',
    "main_deck_cards" TEXT NOT NULL,
    "extra_deck_cards" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "recommended_decks_instance_id_fkey" FOREIGN KEY ("instance_id") REFERENCES "archetype_instances" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "custom_decks" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "user_id" TEXT NOT NULL,
    "title" TEXT NOT NULL DEFAULT 'Custom Deck',
    "main_deck_cards" TEXT NOT NULL,
    "extra_deck_cards" TEXT NOT NULL,
    "is_public" BOOLEAN NOT NULL DEFAULT false,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "custom_decks_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "reports" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "reporter_id" TEXT NOT NULL,
    "reported_user_id" TEXT,
    "reported_instance_id" INTEGER,
    "reason" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "reports_reporter_id_fkey" FOREIGN KEY ("reporter_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "reports_reported_user_id_fkey" FOREIGN KEY ("reported_user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "reports_reported_instance_id_fkey" FOREIGN KEY ("reported_instance_id") REFERENCES "archetype_instances" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "user_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "count" INTEGER NOT NULL DEFAULT 1,
    "instance_id" INTEGER,
    "comment_id" INTEGER,
    "actor_id" TEXT,
    "actor_name" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "notifications_instance_id_fkey" FOREIGN KEY ("instance_id") REFERENCES "archetype_instances" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "notifications_comment_id_fkey" FOREIGN KEY ("comment_id") REFERENCES "comments" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_archetype_instances" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "archetype_id" INTEGER NOT NULL,
    "user_id" TEXT NOT NULL,
    "title" TEXT NOT NULL DEFAULT 'Title',
    "header_card_id" INTEGER,
    "general_tip" TEXT,
    "guide_type" TEXT NOT NULL DEFAULT 'COUNTER',
    "likes" INTEGER NOT NULL DEFAULT 0,
    "favorites" INTEGER NOT NULL DEFAULT 0,
    "views" INTEGER NOT NULL DEFAULT 0,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "archetype_instances_archetype_id_fkey" FOREIGN KEY ("archetype_id") REFERENCES "archetypes" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "archetype_instances_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "archetype_instances_header_card_id_fkey" FOREIGN KEY ("header_card_id") REFERENCES "cards" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_archetype_instances" ("archetype_id", "created_at", "general_tip", "header_card_id", "id", "likes", "title", "updated_at", "user_id") SELECT "archetype_id", "created_at", "general_tip", "header_card_id", "id", "likes", "title", "updated_at", "user_id" FROM "archetype_instances";
DROP TABLE "archetype_instances";
ALTER TABLE "new_archetype_instances" RENAME TO "archetype_instances";
CREATE INDEX "archetype_instances_user_id_idx" ON "archetype_instances"("user_id");
CREATE INDEX "archetype_instances_archetype_id_idx" ON "archetype_instances"("archetype_id");
CREATE INDEX "archetype_instances_guide_type_idx" ON "archetype_instances"("guide_type");
CREATE TABLE "new_archetypes" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "registered" BOOLEAN NOT NULL DEFAULT false,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_archetypes" ("created_at", "id", "name", "registered", "updated_at") SELECT "created_at", "id", "name", "registered", "updated_at" FROM "archetypes";
DROP TABLE "archetypes";
ALTER TABLE "new_archetypes" RENAME TO "archetypes";
CREATE UNIQUE INDEX "archetypes_name_key" ON "archetypes"("name");
CREATE TABLE "new_cards" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "image_url" TEXT NOT NULL,
    "image_url_small" TEXT NOT NULL,
    "image_url_cropped" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_cards" ("created_at", "id", "image_url", "image_url_cropped", "image_url_small", "name") SELECT "created_at", "id", "image_url", "image_url_cropped", "image_url_small", "name" FROM "cards";
DROP TABLE "cards";
ALTER TABLE "new_cards" RENAME TO "cards";
CREATE INDEX "cards_name_idx" ON "cards"("name");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "comments_instance_id_idx" ON "comments"("instance_id");

-- CreateIndex
CREATE INDEX "comments_author_id_idx" ON "comments"("author_id");

-- CreateIndex
CREATE INDEX "comments_parent_comment_id_idx" ON "comments"("parent_comment_id");

-- CreateIndex
CREATE INDEX "comments_created_at_idx" ON "comments"("created_at");

-- CreateIndex
CREATE INDEX "initial_hands_instance_id_idx" ON "initial_hands"("instance_id");

-- CreateIndex
CREATE INDEX "instance_favorites_instance_id_idx" ON "instance_favorites"("instance_id");

-- CreateIndex
CREATE INDEX "instance_favorites_user_id_idx" ON "instance_favorites"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "instance_favorites_instance_id_user_id_key" ON "instance_favorites"("instance_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "recommended_decks_instance_id_key" ON "recommended_decks"("instance_id");

-- CreateIndex
CREATE INDEX "custom_decks_user_id_idx" ON "custom_decks"("user_id");

-- CreateIndex
CREATE INDEX "reports_reporter_id_idx" ON "reports"("reporter_id");

-- CreateIndex
CREATE INDEX "reports_reported_user_id_idx" ON "reports"("reported_user_id");

-- CreateIndex
CREATE INDEX "reports_reported_instance_id_idx" ON "reports"("reported_instance_id");

-- CreateIndex
CREATE INDEX "reports_status_idx" ON "reports"("status");

-- CreateIndex
CREATE INDEX "notifications_user_id_read_idx" ON "notifications"("user_id", "read");

-- CreateIndex
CREATE INDEX "notifications_user_id_instance_id_type_idx" ON "notifications"("user_id", "instance_id", "type");
