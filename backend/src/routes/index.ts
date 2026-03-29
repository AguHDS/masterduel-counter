import searchArchetype from "./archetypes/searchArchetype.js";
import logout from "./auth/logout.js";
import searchCards from "./cards/searchCards.js";
import selectCard from "./cards/selectCard.js";
import confirmCards from "./cards/confirmCards.js";
import archetypeGuide from "./archetypes/archetypeGuide.js";
import registeredArchetypes from "./archetypes/registeredArchetypes.js";
import deleteGuide from "./guides/deleteGuide.js";
import guideLikes from "./guides/guideLikes.js";
import guideFavorites from "./guides/guideFavorites.js";
import guideViews from "./guides/guideViews.js";
import recommendedDeck from "./guides/recommendedDeck.js";
import initialHands from "./guides/initialHands.js";
import comboSteps from "./guides/comboSteps.js";
import getCardDetails from "./cards/getCardDetails.js";
import admin from "./admin.js";
import report from "./report.js";
import comments from "./comments/comments.js";
import ranking from "./ranking.js";
import { createGetArchetypeGuidesRoute } from "./guides/getArchetypeGuides.js";
import { createGetUserGuidesRoute } from "./profile/getUserGuides.js";
import { createOrUpdateGuideRoute } from "./guides/createOrUpdateGuide.js";
import { createGetGuideByIdRoute } from "./guides/getGuideById.js";
import { createSearchArchetypeGuidesRoute } from "./guides/searchArchetypeGuides.js";
import { createSearchUserGuidesRoute } from "./profile/searchUserGuides.js";
import { createNotificationsRoute } from "./notifications/notifications.js";
import { createGetLatestGuidesRoute } from "./guides/getLatestGuides.js";
import { createGetGeneralStatsRoute } from "./archetypes/getGuidesGeneralStats.js";

export {
  searchArchetype,
  logout,
  searchCards,
  selectCard,
  confirmCards,
  archetypeGuide,
  registeredArchetypes,
  deleteGuide,
  guideLikes,
  guideFavorites,
  guideViews,
  recommendedDeck,
  initialHands,
  comboSteps,
  getCardDetails,
  admin,
  report,
  comments,
  ranking,
  createGetArchetypeGuidesRoute,
  createGetUserGuidesRoute,
  createOrUpdateGuideRoute,
  createGetGuideByIdRoute,
  createSearchArchetypeGuidesRoute,
  createSearchUserGuidesRoute,
  createNotificationsRoute,
  createGetLatestGuidesRoute,
  createGetGeneralStatsRoute,
};
