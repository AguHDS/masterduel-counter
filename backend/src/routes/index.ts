import searchArchetype from "./archetypes/searchArchetype";
import logout from "./auth/logout";
import searchCards from "./cards/searchCards";
import selectCard from "./cards/selectCard";
import confirmCards from "./cards/confirmCards";
import registerArchetype from "./archetypes/registerArchetype";
import registeredArchetypes from "./archetypes/registeredArchetypes";
import deleteGuide from "./guides/deleteGuide";
import guideLikes from "./guides/guideLikes";
import guideFavorites from "./guides/guideFavorites";
import recommendedDeck from "./guides/recommendedDeck";
import getCardDetails from "./cards/getCardDetails";
import admin from "./admin";
import report from "./report";
import comments from "./comments/comments";
import { createGetArchetypeGuidesRoute } from "./guides/getArchetypeGuides";
import { createGetUserGuidesRoute } from "./profile/getUserGuides";
import { createOrUpdateGuideRoute } from "./guides/createOrUpdateGuide";
import { createGetGuideByIdRoute } from "./guides/getGuideById";
import { createSearchArchetypeGuidesRoute } from "./guides/searchArchetypeGuides";
import { createSearchUserGuidesRoute } from "./profile/searchUserGuides";

export {
  searchArchetype,
  logout,
  searchCards,
  selectCard,
  confirmCards,
  registerArchetype,
  registeredArchetypes,
  deleteGuide,
  guideLikes,
  guideFavorites,
  recommendedDeck,
  getCardDetails,
  admin,
  report,
  comments,
  createGetArchetypeGuidesRoute,
  createGetUserGuidesRoute,
  createOrUpdateGuideRoute,
  createGetGuideByIdRoute,
  createSearchArchetypeGuidesRoute,
  createSearchUserGuidesRoute,
};
