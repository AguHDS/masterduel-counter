import searchArchetype from "./searchArchetype";
import logout from "./auth/logout";
import searchCards from "./searchCards";
import selectCard from "./selectCard";
import confirmCards from "./confirmCards";
import registerArchetype from "./registerArchetype";
import registeredArchetypes from "./registeredArchetypes";
import deleteGuide from "./guides/deleteGuide";
import instanceLikes from "./instanceLikes";
import recommendedDeck from "./recommendedDeck";
import getCardDetails from "./getCardDetails";
import admin from "./admin";
import reports from "./reports";
import { createGetArchetypeInstancesRoute } from "./getArchetypeInstances";
import { createGetUserInstancesRoute } from "./getUserInstances";
import { createCreateOrUpdateInstanceRoute } from "./createOrUpdateInstance";
import { createGetUserInstanceRoute } from "./getUserInstance";
import { createGetInstanceByIdRoute } from "./getInstanceById";

export {
  searchArchetype,
  logout,
  searchCards,
  selectCard,
  confirmCards,
  registerArchetype,
  registeredArchetypes,
  deleteGuide,
  instanceLikes,
  recommendedDeck,
  getCardDetails,
  admin,
  reports,
  createGetArchetypeInstancesRoute,
  createGetUserInstancesRoute,
  createCreateOrUpdateInstanceRoute,
  createGetUserInstanceRoute,
  createGetInstanceByIdRoute,
};
