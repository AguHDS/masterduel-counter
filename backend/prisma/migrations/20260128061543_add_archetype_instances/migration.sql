/*
  Warnings:

  - You are about to drop the column `archetype_id` on the `archetype_card_pairs` table. All the data in the column will be lost.
  - You are about to drop the column `created_by_user_id` on the `archetypes` table. All the data in the column will be lost.
  - You are about to drop the column `header_card_id` on the `archetypes` table. All the data in the column will be lost.
  - Added the required column `instance_id` to the `archetype_card_pairs` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "archetype_instances" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "archetype_id" INTEGER NOT NULL,
    "user_id" TEXT NOT NULL,
    "header_card_id" INTEGER,
    "likes" INTEGER NOT NULL DEFAULT 0,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "archetype_instances_archetype_id_fkey" FOREIGN KEY ("archetype_id") REFERENCES "archetypes" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "archetype_instances_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "archetype_instances_header_card_id_fkey" FOREIGN KEY ("header_card_id") REFERENCES "cards" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_archetype_card_pairs" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "instance_id" INTEGER NOT NULL,
    "top_card_id" INTEGER NOT NULL,
    "bottom_card_id" INTEGER NOT NULL,
    "pair_order" INTEGER NOT NULL,
    "effectiveness" TEXT,
    "comment" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "archetype_card_pairs_instance_id_fkey" FOREIGN KEY ("instance_id") REFERENCES "archetype_instances" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "archetype_card_pairs_top_card_id_fkey" FOREIGN KEY ("top_card_id") REFERENCES "cards" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "archetype_card_pairs_bottom_card_id_fkey" FOREIGN KEY ("bottom_card_id") REFERENCES "cards" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_archetype_card_pairs" ("bottom_card_id", "comment", "created_at", "effectiveness", "id", "pair_order", "top_card_id") SELECT "bottom_card_id", "comment", "created_at", "effectiveness", "id", "pair_order", "top_card_id" FROM "archetype_card_pairs";
DROP TABLE "archetype_card_pairs";
ALTER TABLE "new_archetype_card_pairs" RENAME TO "archetype_card_pairs";
CREATE INDEX "archetype_card_pairs_instance_id_idx" ON "archetype_card_pairs"("instance_id");
CREATE TABLE "new_archetypes" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "registered" BOOLEAN NOT NULL DEFAULT false,
    "pending_requests" INTEGER NOT NULL DEFAULT 0,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_archetypes" ("created_at", "id", "name", "pending_requests", "registered", "updated_at") SELECT "created_at", "id", "name", "pending_requests", "registered", "updated_at" FROM "archetypes";
DROP TABLE "archetypes";
ALTER TABLE "new_archetypes" RENAME TO "archetypes";
CREATE UNIQUE INDEX "archetypes_name_key" ON "archetypes"("name");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "archetype_instances_user_id_idx" ON "archetype_instances"("user_id");

-- CreateIndex
CREATE INDEX "archetype_instances_archetype_id_idx" ON "archetype_instances"("archetype_id");

-- CreateIndex
CREATE UNIQUE INDEX "archetype_instances_archetype_id_user_id_key" ON "archetype_instances"("archetype_id", "user_id");
