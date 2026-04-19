import { Request, Response, NextFunction } from "express";
import { Dependencies } from "@/compositionRoot.js";

type RedirectCacheEntry = {
  path: string;
  expiresAt: number;
};

const REDIRECT_CACHE_TTL_MS = 1000 * 60 * 30;
const REDIRECT_CACHE_MAX_SIZE = 1000;

const slugifySegment = (value: string): string => {
  const normalized = value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");

  return normalized || "unknown";
};

const extractNumericIdFromSlug = (value?: string): number | undefined => {
  if (!value) {
    return undefined;
  }

  const match = value.match(/(\d+)$/);
  if (!match) {
    return undefined;
  }

  const parsedValue = Number.parseInt(match[1], 10);
  return Number.isNaN(parsedValue) ? undefined : parsedValue;
};

const buildCanonicalGuidePath = ({
  guideId,
  archetypeName,
  userName,
  guideType,
}: {
  guideId: number;
  archetypeName: string;
  userName: string;
  guideType?: string;
}) => {
  const typeSegment = String(guideType).toLowerCase() === "deck"
    ? "deck-guide"
    : "counter-guide";

  return `/archetypes/${slugifySegment(archetypeName)}/${slugifySegment(userName)}/${typeSegment}-${guideId}`;
};

const buildCanonicalProfilePath = ({
  userName,
  userId,
  tab,
}: {
  userName: string;
  userId: string;
  tab?: string;
}) => {
  const normalizedTab = tab && tab !== "profile" ? `/${tab}` : "";
  return `/profile/${slugifySegment(userName)}-${userId}${normalizedTab}`;
};

const normalizePathname = (path: string): string => {
  if (path.length > 1 && path.endsWith("/")) {
    return path.replace(/\/+$/, "");
  }

  return path || "/";
};

export function createLegacyUrlRedirectMiddleware(dependencies: Dependencies) {
  const redirectPathCache = new Map<string, RedirectCacheEntry>();
  const prisma = dependencies.getPrismaClient();

  const pruneRedirectCache = (): void => {
    const now = Date.now();

    for (const [key, entry] of redirectPathCache.entries()) {
      if (entry.expiresAt <= now) {
        redirectPathCache.delete(key);
      }
    }

    while (redirectPathCache.size >= REDIRECT_CACHE_MAX_SIZE) {
      const oldestKey = redirectPathCache.keys().next().value;

      if (!oldestKey) {
        break;
      }

      redirectPathCache.delete(oldestKey);
    }
  };

  const getCachedRedirectPath = (cacheKey: string): string | undefined => {
    const entry = redirectPathCache.get(cacheKey);

    if (!entry) {
      return undefined;
    }

    if (entry.expiresAt <= Date.now()) {
      redirectPathCache.delete(cacheKey);
      return undefined;
    }

    // Refresh insertion order so the cache behaves like a simple LRU.
    redirectPathCache.delete(cacheKey);
    redirectPathCache.set(cacheKey, entry);

    return entry.path;
  };

  const setCachedRedirectPath = (cacheKey: string, path: string): void => {
    // Keep redirect lookups cheap for crawlers repeatedly visiting old URLs.
    pruneRedirectCache();
    redirectPathCache.delete(cacheKey);
    redirectPathCache.set(cacheKey, {
      path,
      expiresAt: Date.now() + REDIRECT_CACHE_TTL_MS,
    });
  };

  const redirectLegacyGuideUrl = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    const rawInstanceId = Array.isArray(req.params.instanceId)
      ? req.params.instanceId[0]
      : req.params.instanceId;
    const rawGuideSlug = Array.isArray(req.params.guideSlug)
      ? req.params.guideSlug[0]
      : req.params.guideSlug;

    const guideId = rawInstanceId
      ? Number.parseInt(rawInstanceId, 10)
      : extractNumericIdFromSlug(rawGuideSlug);

    if (!guideId || Number.isNaN(guideId)) {
      return next();
    }

    const cacheKey = `guide:${guideId}`;
    const cachedPath = getCachedRedirectPath(cacheKey);

    if (cachedPath) {
      if (normalizePathname(req.path) !== normalizePathname(cachedPath)) {
        return res.redirect(301, cachedPath);
      }

      return next();
    }

    try {
      const instance = await prisma.archetypeInstance.findUnique({
        where: { id: guideId },
        select: {
          id: true,
          guideType: true,
          archetype: {
            select: {
              name: true,
            },
          },
          user: {
            select: {
              name: true,
            },
          },
        },
      });

      if (!instance) {
        return next();
      }

      const canonicalPath = buildCanonicalGuidePath({
        guideId: instance.id,
        archetypeName: instance.archetype?.name || "archetype",
        userName: instance.user?.name || "author",
        guideType: instance.guideType,
      });

      setCachedRedirectPath(cacheKey, canonicalPath);

      if (normalizePathname(req.path) !== normalizePathname(canonicalPath)) {
        return res.redirect(301, canonicalPath);
      }
    } catch (error) {
      console.error("Error redirecting legacy guide URL:", error);
    }

    return next();
  };

  const redirectLegacyProfileUrl = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    const rawUserId = Array.isArray(req.params.userId)
      ? req.params.userId[0]
      : req.params.userId;
    const rawTab = Array.isArray(req.params.tab)
      ? req.params.tab[0]
      : req.params.tab;

    if (!rawUserId) {
      return next();
    }

    const cacheKey = `profile:${rawUserId}:${rawTab ?? ""}`;
    const cachedPath = getCachedRedirectPath(cacheKey);

    if (cachedPath) {
      if (normalizePathname(req.path) !== normalizePathname(cachedPath)) {
        return res.redirect(301, cachedPath);
      }

      return next();
    }

    try {
      let resolvedUserId = rawUserId;
      let userName: string | undefined;
      const publicProfileId = rawUserId.match(/(\d+)$/)?.[1];

      if (publicProfileId) {
        const profileByPublicId = await prisma.profile.findUnique({
          where: { id: Number.parseInt(publicProfileId, 10) },
          select: {
            userId: true,
            user: {
              select: {
                name: true,
              },
            },
          },
        });

        if (profileByPublicId?.userId) {
          resolvedUserId = profileByPublicId.userId;
          userName = profileByPublicId.user?.name || undefined;
        }
      } else if (rawUserId.includes("-")) {
        resolvedUserId = rawUserId.split("-").pop() || rawUserId;
      }

      if (!userName) {
        const user = await prisma.user.findUnique({
          where: { id: resolvedUserId },
          select: {
            name: true,
          },
        });

        userName = user?.name || undefined;
      }

      if (!userName) {
        return next();
      }

      const canonicalPath = buildCanonicalProfilePath({
        userName,
        userId: resolvedUserId,
        tab: rawTab,
      });

      setCachedRedirectPath(cacheKey, canonicalPath);

      if (normalizePathname(req.path) !== normalizePathname(canonicalPath)) {
        return res.redirect(301, canonicalPath);
      }
    } catch (error) {
      console.error("Error redirecting legacy profile URL:", error);
    }

    return next();
  };

  return {
    redirectLegacyGuideUrl,
    redirectLegacyProfileUrl,
  };
}
