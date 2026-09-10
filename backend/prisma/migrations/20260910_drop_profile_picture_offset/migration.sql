-- DropColumns: Remove profile picture offset columns from profiles
ALTER TABLE "profiles" DROP COLUMN "profile_picture_offset_x";
ALTER TABLE "profiles" DROP COLUMN "profile_picture_offset_y";
