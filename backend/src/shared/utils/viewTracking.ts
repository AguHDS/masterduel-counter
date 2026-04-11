import { createHash, randomUUID } from "crypto";
import { Request } from "express";

export const VIEW_TRACKING_COOKIE_NAME = "mdc_viewer_id";

interface AnonymousViewerContext {
  fingerprints: string[];
  cookieValue: string;
  shouldSetCookie: boolean;
}

const hashValue = (value: string): string => {
  return createHash("sha256").update(value).digest("hex");
};

export const getAnonymousViewerContext = (req: Request): AnonymousViewerContext => {
  const existingCookie = typeof req.cookies?.[VIEW_TRACKING_COOKIE_NAME] === "string"
    ? req.cookies[VIEW_TRACKING_COOKIE_NAME]
    : null;

  const cookieValue = existingCookie && existingCookie.length > 0
    ? existingCookie
    : randomUUID();

  const fingerprints = [
    hashValue(`cookie:${cookieValue}`),
  ];

  return {
    fingerprints,
    cookieValue,
    shouldSetCookie: !existingCookie,
  };
};