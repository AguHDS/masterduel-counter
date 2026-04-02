-- AlterTable: Remove is_canceled column if it exists and add parent_canceled_step_id
-- This migration replaces the simple isCanceled boolean with a reference-based system

-- Add the new column
ALTER TABLE "combo_steps" ADD COLUMN "parent_canceled_step_id" INTEGER;

-- Create index for performance
CREATE INDEX IF NOT EXISTS "combo_steps_parent_canceled_step_id_idx" ON "combo_steps"("parent_canceled_step_id");

-- Note: If is_canceled column exists from previous attempts, you may need to drop it manually:
-- ALTER TABLE "combo_steps" DROP COLUMN IF EXISTS "is_canceled";
