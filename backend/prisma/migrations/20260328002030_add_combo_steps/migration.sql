-- CreateTable
CREATE TABLE "combo_steps" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "initial_hand_id" INTEGER NOT NULL,
    "step_order" INTEGER NOT NULL,
    "description" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "combo_steps_initial_hand_id_fkey" FOREIGN KEY ("initial_hand_id") REFERENCES "initial_hands" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "combo_step_main_cards" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "step_id" INTEGER NOT NULL,
    "card_id" INTEGER NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "combo_step_main_cards_step_id_fkey" FOREIGN KEY ("step_id") REFERENCES "combo_steps" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "combo_step_main_cards_card_id_fkey" FOREIGN KEY ("card_id") REFERENCES "cards" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "combo_step_sub_cards" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "step_id" INTEGER NOT NULL,
    "card_id" INTEGER NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "combo_step_sub_cards_step_id_fkey" FOREIGN KEY ("step_id") REFERENCES "combo_steps" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "combo_step_sub_cards_card_id_fkey" FOREIGN KEY ("card_id") REFERENCES "cards" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "combo_steps_initial_hand_id_idx" ON "combo_steps"("initial_hand_id");

-- CreateIndex
CREATE INDEX "combo_step_main_cards_step_id_idx" ON "combo_step_main_cards"("step_id");

-- CreateIndex
CREATE INDEX "combo_step_sub_cards_step_id_idx" ON "combo_step_sub_cards"("step_id");
