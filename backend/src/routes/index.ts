import searchArchetype from "./searchArchetype";
import logout from "./auth/logout";
import searchCards from "./cards/searchCards";
import selectCard from "./cards/selectCard";
import confirmCards from "./cards/confirmCards";
import registerArchetype from "./registerArchetype";
import registeredArchetypes from "./registeredArchetypes";
import deleteGuide from "./guides/deleteGuide";
import guideLikes from "./guides/guideLikes";
import recommendedDeck from "./recommendedDeck";
import getCardDetails from "./cards/getCardDetails";
import admin from "./admin";
import reports from "./reports";
import { createGetArchetypeInstancesRoute } from "./getArchetypeInstances";
import { createGetUserGuidesRoute } from "./profile/getUserGuides";
import { createOrUpdateGuideRoute } from "./guides/createOrUpdateGuide";
import { createGetGuideByIdRoute } from "./guides/getGuideById";

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
  recommendedDeck,
  getCardDetails,
  admin,
  reports,
  createGetArchetypeInstancesRoute,
  createGetUserGuidesRoute,
  createOrUpdateGuideRoute,
  createGetGuideByIdRoute,
};
