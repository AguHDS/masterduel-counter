-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "namedb" TEXT NOT NULL,
    "emaildb" TEXT NOT NULL,
    "email_verified" BOOLEAN NOT NULL DEFAULT false,
    "image" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'user',
    "last_username_change" DATETIME,
    "last_active_at" DATETIME,
    "banned" BOOLEAN DEFAULT false,
    "ban_reason" TEXT,
    "ban_expires" DATETIME
);

-- CreateTable
CREATE TABLE "profiles" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "user_id" TEXT NOT NULL,
    "bio" TEXT,
    "profile_picture_url" TEXT,
    "cloudinary_public_id" TEXT,
    "favorite_card_id" INTEGER,
    "favorite_card_cropped" BOOLEAN NOT NULL DEFAULT false,
    "favorite_decks" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "session" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "expires_at" DATETIME NOT NULL,
    "token" TEXT NOT NULL,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "user_id" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "impersonated_by" TEXT,
    CONSTRAINT "session_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "account" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "account_id" TEXT NOT NULL,
    "provider_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "access_token" TEXT,
    "refresh_token" TEXT,
    "id_token" TEXT,
    "expires_at" DATETIME,
    "password" TEXT,
    "access_token_expires_at" DATETIME,
    "refresh_token_expires_at" DATETIME,
    "scope" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "account_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "verification" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "identifier" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expires_at" DATETIME NOT NULL,
    "created_at" DATETIME,
    "updated_at" DATETIME,
    "user_id" TEXT,
    CONSTRAINT "verification_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "archetypes" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "registered" BOOLEAN NOT NULL DEFAULT false,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "archetype_instances" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "archetype_id" INTEGER NOT NULL,
    "user_id" TEXT NOT NULL,
    "title" TEXT NOT NULL DEFAULT 'Title',
    "header_card_id" INTEGER,
    "general_tip" TEXT,
    "guide_type" TEXT NOT NULL DEFAULT 'COUNTER',
    "is_draft" BOOLEAN NOT NULL DEFAULT false,
    "draft_expires_at" DATETIME,
    "guide_request_id" INTEGER,
    "likes" INTEGER NOT NULL DEFAULT 0,
    "favorites" INTEGER NOT NULL DEFAULT 0,
    "views" INTEGER NOT NULL DEFAULT 0,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "archetype_instances_archetype_id_fkey" FOREIGN KEY ("archetype_id") REFERENCES "archetypes" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "archetype_instances_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "archetype_instances_header_card_id_fkey" FOREIGN KEY ("header_card_id") REFERENCES "cards" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "archetype_instances_guide_request_id_fkey" FOREIGN KEY ("guide_request_id") REFERENCES "guide_requests" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

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
CREATE TABLE "guide_view_tracking" (
    "instance_id" INTEGER NOT NULL,
    "viewer_fingerprint" TEXT NOT NULL,
    "last_viewed_at" DATETIME NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY ("instance_id", "viewer_fingerprint")
);

-- CreateTable
CREATE TABLE "cards" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "type" TEXT,
    "desc" TEXT,
    "race" TEXT,
    "attribute" TEXT,
    "atk" INTEGER,
    "def" INTEGER,
    "level" INTEGER,
    "scale" INTEGER,
    "linkval" INTEGER,
    "linkmarkers" TEXT,
    "archetype" TEXT,
    "image_url" TEXT NOT NULL,
    "image_url_small" TEXT NOT NULL,
    "image_url_cropped" TEXT NOT NULL,
    "frame_type" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "archetype_card_pairs" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "instance_id" INTEGER NOT NULL,
    "pair_order" INTEGER NOT NULL,
    "pair_section" TEXT,
    "comment" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "archetype_card_pairs_instance_id_fkey" FOREIGN KEY ("instance_id") REFERENCES "archetype_instances" ("id") ON DELETE CASCADE ON UPDATE CASCADE
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
    "effectiveness" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "card_pair_bottom_pair_id_fkey" FOREIGN KEY ("pair_id") REFERENCES "archetype_card_pairs" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "card_pair_bottom_card_id_fkey" FOREIGN KEY ("card_id") REFERENCES "cards" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "initial_hands" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "instance_id" INTEGER NOT NULL,
    "card_ids" TEXT NOT NULL,
    "description" TEXT,
    "final_board_state" TEXT,
    "position" INTEGER NOT NULL DEFAULT 0,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "initial_hands_instance_id_fkey" FOREIGN KEY ("instance_id") REFERENCES "archetype_instances" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "combo_steps" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "initial_hand_id" INTEGER NOT NULL,
    "step_order" INTEGER NOT NULL,
    "description" TEXT,
    "parent_canceled_step_id" INTEGER,
    "step_type" TEXT,
    "left_scale_value" INTEGER,
    "right_scale_value" INTEGER,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "combo_steps_initial_hand_id_fkey" FOREIGN KEY ("initial_hand_id") REFERENCES "initial_hands" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "combo_steps_parent_canceled_step_id_fkey" FOREIGN KEY ("parent_canceled_step_id") REFERENCES "combo_steps" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "combo_step_main_cards" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "step_id" INTEGER NOT NULL,
    "card_id" INTEGER NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,
    "chain_number" INTEGER,
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
    "chain_number" INTEGER,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "combo_step_sub_cards_step_id_fkey" FOREIGN KEY ("step_id") REFERENCES "combo_steps" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "combo_step_sub_cards_card_id_fkey" FOREIGN KEY ("card_id") REFERENCES "cards" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "combo_step_left_sub_cards" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "step_id" INTEGER NOT NULL,
    "card_id" INTEGER NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,
    "chain_number" INTEGER,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "combo_step_left_sub_cards_step_id_fkey" FOREIGN KEY ("step_id") REFERENCES "combo_steps" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "combo_step_left_sub_cards_card_id_fkey" FOREIGN KEY ("card_id") REFERENCES "cards" ("id") ON DELETE CASCADE ON UPDATE CASCADE
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
    "side_deck_cards" TEXT NOT NULL DEFAULT '[]',
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
    "side_deck_cards" TEXT NOT NULL DEFAULT '[]',
    "header_card_id" INTEGER,
    "is_public" BOOLEAN NOT NULL DEFAULT false,
    "display_order" INTEGER NOT NULL DEFAULT 0,
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

-- CreateTable
CREATE TABLE "guide_requests" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "archetype_id" INTEGER NOT NULL,
    "guide_type" TEXT NOT NULL DEFAULT 'COUNTER',
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "requester_id" TEXT,
    "requester_alias" TEXT NOT NULL,
    "fulfilled_by_id" TEXT,
    "fulfilled_instance_id" INTEGER,
    "taken_by_id" TEXT,
    "taken_at" DATETIME,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "guide_requests_archetype_id_fkey" FOREIGN KEY ("archetype_id") REFERENCES "archetypes" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "guide_requests_requester_id_fkey" FOREIGN KEY ("requester_id") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "guide_requests_fulfilled_by_id_fkey" FOREIGN KEY ("fulfilled_by_id") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "guide_requests_taken_by_id_fkey" FOREIGN KEY ("taken_by_id") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "monthly_guide_rankings" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "guide_id" INTEGER NOT NULL,
    "month" TEXT NOT NULL,
    "rank" INTEGER NOT NULL,
    "score" REAL NOT NULL,
    "likes" INTEGER NOT NULL,
    "views" INTEGER NOT NULL,
    "favorites" INTEGER NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "monthly_user_rankings" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "user_id" TEXT NOT NULL,
    "month" TEXT NOT NULL,
    "rank" INTEGER NOT NULL,
    "score" REAL NOT NULL,
    "total_likes" INTEGER NOT NULL,
    "total_views" INTEGER NOT NULL,
    "fulfilled_requests" INTEGER NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "latest_updates" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "author_id" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "latest_updates_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "tier_list_entries" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "deck_name" TEXT NOT NULL,
    "display_name" TEXT,
    "tier" INTEGER NOT NULL,
    "format" TEXT NOT NULL DEFAULT 'masterduel',
    "position" INTEGER NOT NULL DEFAULT 0,
    "image_url" TEXT,
    "image_manually_set" BOOLEAN NOT NULL DEFAULT false,
    "source" TEXT NOT NULL DEFAULT 'scraped',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "linked_archetype_id" INTEGER,
    "linked_archetype_name" TEXT,
    "scraped_at" DATETIME,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "tier_list_config" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "format" TEXT NOT NULL,
    "scraping_enabled" BOOLEAN NOT NULL DEFAULT true,
    "last_scraped_at" DATETIME,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "guide_monthly_views" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "guide_id" INTEGER NOT NULL,
    "month" TEXT NOT NULL,
    "total_views" INTEGER NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "users_emaildb_key" ON "users"("emaildb");

-- CreateIndex
CREATE UNIQUE INDEX "profiles_user_id_key" ON "profiles"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "session_token_key" ON "session"("token");

-- CreateIndex
CREATE UNIQUE INDEX "archetypes_name_key" ON "archetypes"("name");

-- CreateIndex
CREATE INDEX "archetype_instances_user_id_idx" ON "archetype_instances"("user_id");

-- CreateIndex
CREATE INDEX "archetype_instances_archetype_id_idx" ON "archetype_instances"("archetype_id");

-- CreateIndex
CREATE INDEX "archetype_instances_guide_type_idx" ON "archetype_instances"("guide_type");

-- CreateIndex
CREATE INDEX "comments_instance_id_idx" ON "comments"("instance_id");

-- CreateIndex
CREATE INDEX "comments_author_id_idx" ON "comments"("author_id");

-- CreateIndex
CREATE INDEX "comments_parent_comment_id_idx" ON "comments"("parent_comment_id");

-- CreateIndex
CREATE INDEX "comments_created_at_idx" ON "comments"("created_at");

-- CreateIndex
CREATE INDEX "guide_view_tracking_last_viewed_at_idx" ON "guide_view_tracking"("last_viewed_at");

-- CreateIndex
CREATE INDEX "cards_name_idx" ON "cards"("name");

-- CreateIndex
CREATE INDEX "archetype_card_pairs_instance_id_idx" ON "archetype_card_pairs"("instance_id");

-- CreateIndex
CREATE INDEX "card_pair_top_pair_id_idx" ON "card_pair_top"("pair_id");

-- CreateIndex
CREATE INDEX "card_pair_bottom_pair_id_idx" ON "card_pair_bottom"("pair_id");

-- CreateIndex
CREATE INDEX "initial_hands_instance_id_idx" ON "initial_hands"("instance_id");

-- CreateIndex
CREATE INDEX "combo_steps_initial_hand_id_idx" ON "combo_steps"("initial_hand_id");

-- CreateIndex
CREATE INDEX "combo_steps_parent_canceled_step_id_idx" ON "combo_steps"("parent_canceled_step_id");

-- CreateIndex
CREATE INDEX "combo_step_main_cards_step_id_idx" ON "combo_step_main_cards"("step_id");

-- CreateIndex
CREATE INDEX "combo_step_sub_cards_step_id_idx" ON "combo_step_sub_cards"("step_id");

-- CreateIndex
CREATE INDEX "combo_step_left_sub_cards_step_id_idx" ON "combo_step_left_sub_cards"("step_id");

-- CreateIndex
CREATE INDEX "instance_likes_instance_id_idx" ON "instance_likes"("instance_id");

-- CreateIndex
CREATE INDEX "instance_likes_user_id_idx" ON "instance_likes"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "instance_likes_instance_id_user_id_key" ON "instance_likes"("instance_id", "user_id");

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
CREATE INDEX "custom_decks_user_id_display_order_idx" ON "custom_decks"("user_id", "display_order");

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

-- CreateIndex
CREATE INDEX "guide_requests_status_idx" ON "guide_requests"("status");

-- CreateIndex
CREATE INDEX "guide_requests_archetype_id_idx" ON "guide_requests"("archetype_id");

-- CreateIndex
CREATE INDEX "guide_requests_requester_id_idx" ON "guide_requests"("requester_id");

-- CreateIndex
CREATE INDEX "guide_requests_fulfilled_by_id_idx" ON "guide_requests"("fulfilled_by_id");

-- CreateIndex
CREATE INDEX "guide_requests_taken_by_id_idx" ON "guide_requests"("taken_by_id");

-- CreateIndex
CREATE INDEX "monthly_guide_rankings_month_idx" ON "monthly_guide_rankings"("month");

-- CreateIndex
CREATE INDEX "monthly_guide_rankings_month_rank_idx" ON "monthly_guide_rankings"("month", "rank");

-- CreateIndex
CREATE UNIQUE INDEX "monthly_guide_rankings_guide_id_month_key" ON "monthly_guide_rankings"("guide_id", "month");

-- CreateIndex
CREATE INDEX "monthly_user_rankings_month_idx" ON "monthly_user_rankings"("month");

-- CreateIndex
CREATE INDEX "monthly_user_rankings_month_rank_idx" ON "monthly_user_rankings"("month", "rank");

-- CreateIndex
CREATE UNIQUE INDEX "monthly_user_rankings_user_id_month_key" ON "monthly_user_rankings"("user_id", "month");

-- CreateIndex
CREATE INDEX "latest_updates_author_id_idx" ON "latest_updates"("author_id");

-- CreateIndex
CREATE INDEX "latest_updates_created_at_idx" ON "latest_updates"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "tier_list_config_format_key" ON "tier_list_config"("format");

-- CreateIndex
CREATE INDEX "guide_monthly_views_month_idx" ON "guide_monthly_views"("month");

-- CreateIndex
CREATE UNIQUE INDEX "guide_monthly_views_guide_id_month_key" ON "guide_monthly_views"("guide_id", "month");

