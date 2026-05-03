import { Request, Response, NextFunction } from "express";
import { Dependencies } from "@/compositionRoot.js";

type RedirectCacheEntry = {
  path: string;
  expiresAt: number;
};

const REDIRECT_CACHE_TTL_MS = 1000 * 60 * 30;
const REDIRECT_CACHE_MAX_SIZE = 1000;

const slugifySegment = (value: string): string => {
  // Character mapping for Cyrillic transliteration
  const cyrillicMap: Record<string, string> = {
    'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo', 
    'ж': 'zh', 'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm',
    'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u',
    'ф': 'f', 'х': 'kh', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'shch',
    'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya',
    'А': 'A', 'Б': 'B', 'В': 'V', 'Г': 'G', 'Д': 'D', 'Е': 'E', 'Ё': 'Yo',
    'Ж': 'Zh', 'З': 'Z', 'И': 'I', 'Й': 'Y', 'К': 'K', 'Л': 'L', 'М': 'M',
    'Н': 'N', 'О': 'O', 'П': 'P', 'Р': 'R', 'С': 'S', 'Т': 'T', 'У': 'U',
    'Ф': 'F', 'Х': 'Kh', 'Ц': 'Ts', 'Ч': 'Ch', 'Ш': 'Sh', 'Щ': 'Shch',
    'Ъ': '', 'Ы': 'Y', 'Ь': '', 'Э': 'E', 'Ю': 'Yu', 'Я': 'Ya'
  };

  const greekMap: Record<string, string> = {
    'α': 'a', 'β': 'b', 'γ': 'g', 'δ': 'd', 'ε': 'e', 'ζ': 'z', 'η': 'i',
    'θ': 'th', 'ι': 'i', 'κ': 'k', 'λ': 'l', 'μ': 'm', 'ν': 'n', 'ξ': 'x',
    'ο': 'o', 'π': 'p', 'ρ': 'r', 'σ': 's', 'ς': 's', 'τ': 't', 'υ': 'y',
    'φ': 'f', 'χ': 'ch', 'ψ': 'ps', 'ω': 'o',
    'Α': 'A', 'Β': 'B', 'Γ': 'G', 'Δ': 'D', 'Ε': 'E', 'Ζ': 'Z', 'Η': 'I',
    'Θ': 'Th', 'Ι': 'I', 'Κ': 'K', 'Λ': 'L', 'Μ': 'M', 'Ν': 'N', 'Ξ': 'X',
    'Ο': 'O', 'Π': 'P', 'Ρ': 'R', 'Σ': 'S', 'Τ': 'T', 'Υ': 'Y', 'Φ': 'F',
    'Χ': 'Ch', 'Ψ': 'Ps', 'Ω': 'O'
  };

  // Transliterate Cyrillic and Greek characters
  let transliterated = value.split('').map(char => {
    return cyrillicMap[char] || greekMap[char] || char;
  }).join('');

  // Normalize accented characters (for languages like Spanish, French, etc.)
  const normalized = transliterated
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

/** Build the canonical archetype path */
const buildCanonicalArchetypePath = ({
  archetypeId,
  archetypeName,
  guideType,
}: {
  archetypeId: number;
  archetypeName: string;
  guideType?: string;
}) => {
  const typeSegment = guideType
    ? `/${String(guideType).toLowerCase() === "deck" ? "deck-guides" : "counter-guides"}`
    : "";
  return `/archetype/${slugifySegment(archetypeName || String(archetypeId))}${typeSegment}`;
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

  /** Redirect legacy archetype list URLs to their canonical paths */
  const redirectLegacyArchetypeListUrl = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    const rawArchetypeId = Array.isArray(req.params.archetypeId)
      ? req.params.archetypeId[0]
      : req.params.archetypeId;
    const rawGuideType = Array.isArray(req.query.type)
      ? req.query.type[0]
      : req.query.type;

    if (!rawArchetypeId) {
      return next();
    }

    const normalizedTypeQuery = typeof rawGuideType === "string" && rawGuideType.trim()
      ? `?type=${rawGuideType.trim().toLowerCase()}`
      : "";
    const currentPath = `${normalizePathname(req.path)}${normalizedTypeQuery}`;
    const cacheKey = `archetype:${rawArchetypeId}:${rawGuideType ?? ""}`;
    const cachedPath = getCachedRedirectPath(cacheKey);

    if (cachedPath) {
      if (currentPath !== cachedPath) {
        return res.redirect(301, cachedPath);
      }

      return next();
    }

    try {
      let archetype = null;
      const parsedArchetypeId = Number.parseInt(rawArchetypeId, 10);

      if (!Number.isNaN(parsedArchetypeId) && parsedArchetypeId > 0) {
        archetype = await prisma.archetype.findUnique({
          where: { id: parsedArchetypeId },
          select: { id: true, name: true },
        });
      }

      if (!archetype) {
        const allArchetypes = await prisma.archetype.findMany({
          select: { id: true, name: true },
        });

        archetype = allArchetypes.find(
          (candidate) =>
            slugifySegment(candidate.name) === slugifySegment(rawArchetypeId),
        ) ?? null;
      }

      if (!archetype) {
        return next();
      }

      const canonicalPath = buildCanonicalArchetypePath({
        archetypeId: archetype.id,
        archetypeName: archetype.name,
        guideType: typeof rawGuideType === "string" ? rawGuideType : undefined,
      });

      setCachedRedirectPath(cacheKey, canonicalPath);

      if (currentPath !== canonicalPath) {
        return res.redirect(301, canonicalPath);
      }
    } catch (error) {
      console.error("Error redirecting archetype list URL:", error);
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

      // Extract userId from the end of the slug (format: username-slug-userId)
      // The userId is always after the last hyphen
      const lastHyphenIndex = rawUserId.lastIndexOf("-");
      
      if (lastHyphenIndex > 0) {
        const potentialUserId = rawUserId.substring(lastHyphenIndex + 1);
        
        // Verify this looks like a valid userId (alphanumeric, reasonable length)
        // This prevents matching profile IDs or other patterns
        if (potentialUserId.length >= 20 && /^[a-zA-Z0-9]+$/.test(potentialUserId)) {
          // Try to find user by the extracted ID
          const user = await prisma.user.findUnique({
            where: { id: potentialUserId },
            select: {
              id: true,
              name: true,
            },
          });

          if (user) {
            resolvedUserId = user.id;
            userName = user.name || undefined;
          }
        }
      }

      // If we couldn't extract userId, check if rawUserId is a profile ID (numeric)
      if (!userName) {
        const publicProfileId = rawUserId.match(/^\d+$/)?.[0];
        
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
        }
      }

      // Last resort: try to use rawUserId as direct userId
      if (!userName) {
        const user = await prisma.user.findUnique({
          where: { id: rawUserId },
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

  /** Redirect legacy global guides list URLs with query params to path-based URLs */
  const redirectLegacyGuidesListUrl = (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    const rawGuideType = Array.isArray(req.query.type)
      ? req.query.type[0]
      : req.query.type;

    // Only redirect if there's a type query param
    if (typeof rawGuideType !== "string" || !rawGuideType.trim()) {
      return next();
    }

    const normalizedType = rawGuideType.trim().toLowerCase();
    const typeSegment = normalizedType === "deck" ? "deck-guides" : "counter-guides";
    const canonicalPath = `/guides/${typeSegment}`;

    // Redirect if not already on the canonical path
    if (normalizePathname(req.path) !== normalizePathname(canonicalPath)) {
      return res.redirect(301, canonicalPath);
    }

    return next();
  };

  return {
    redirectLegacyArchetypeListUrl,
    redirectLegacyGuideUrl,
    redirectLegacyProfileUrl,
    redirectLegacyGuidesListUrl,
  };
}
