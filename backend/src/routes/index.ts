import searchArchetype from "./searchArchetype";
import logout from "./auth/logout";
import searchCards from "./searchCards";
import selectCard from "./selectCard";
import confirmCards from "./confirmCards";
import registerArchetype from "./registerArchetype";
import registeredArchetypes from "./registeredArchetypes";
import deleteGuide from "./guides/deleteGuide";
import guideLikes from "./guides/guideLikes";
import recommendedDeck from "./recommendedDeck";
import getCardDetails from "./getCardDetails";
import admin from "./admin";
import reports from "./reports";
import { createGetArchetypeInstancesRoute } from "./getArchetypeInstances";
import { createGetUserInstancesRoute } from "./getUserInstances";
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
  createGetUserInstancesRoute,
  createOrUpdateGuideRoute,
  createGetGuideByIdRoute,
};
