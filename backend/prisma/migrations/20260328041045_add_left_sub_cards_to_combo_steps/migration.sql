-- CreateTable
CREATE TABLE "combo_step_left_sub_cards" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "step_id" INTEGER NOT NULL,
    "card_id" INTEGER NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "combo_step_left_sub_cards_step_id_fkey" FOREIGN KEY ("step_id") REFERENCES "combo_steps" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "combo_step_left_sub_cards_card_id_fkey" FOREIGN KEY ("card_id") REFERENCES "cards" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "combo_step_left_sub_cards_step_id_idx" ON "combo_step_left_sub_cards"("step_id");
