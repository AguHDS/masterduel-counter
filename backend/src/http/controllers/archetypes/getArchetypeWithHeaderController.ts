import { Request, Response } from "express";
import { getDependencies } from "@/compositionRoot.js";

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

/** Fix for slugs like blue-eyes, red-eyes */
const buildLookupCandidates = (rawIdentifier: string): string[] => {
  const variants = new Set<string>([
    rawIdentifier,
    rawIdentifier.replace(/-/g, " "),
    rawIdentifier.replace(/-/g, "/"),
    rawIdentifier.replace(/-/g, "."),
    rawIdentifier.replace(/-/g, ""),
  ]);

  return Array.from(variants)
    .map((value) => value.trim())
    .filter((value) => value.length > 0);
};

/** Get archetype with its header card to display in list */
export const getArchetypeWithHeaderController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const rawIdentifier = Array.isArray(req.params.id)
      ? req.params.id[0]
      : req.params.id;

    if (!rawIdentifier || typeof rawIdentifier !== "string") {
      res.status(400).json({ success: false, error: "Invalid archetype ID" });
      return;
    }

    const archetypeRepository = getDependencies().getArchetypeRepository();
    let archetype = null;
    const archetypeId = Number.parseInt(rawIdentifier, 10);

    if (!Number.isNaN(archetypeId) && archetypeId > 0) {
      archetype = await archetypeRepository.findArchetypeById(archetypeId);
    }

    if (!archetype) {
      const slugTarget = slugifySegment(rawIdentifier);
      const lookupCandidates = buildLookupCandidates(rawIdentifier);
      const matchedCandidates = [];

      for (const candidate of lookupCandidates) {
        const matches = await archetypeRepository.searchArchetypeByName(
          candidate,
          100,
        );

        matchedCandidates.push(...matches);
      }

      archetype =
        matchedCandidates.find(
          (candidate) => slugifySegment(candidate.name) === slugTarget,
        ) ?? null;
    }

    if (!archetype) {
      res.status(404).json({ success: false, error: "Archetype not found" });
      return;
    }

    res.status(200).json({
      success: true,
      archetype,
    });
  } catch (error) {
    console.error("Error fetching archetype with header:", error);

    if (error instanceof Error) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    } else {
      res.status(500).json({
        success: false,
        error: "Internal server error",
      });
    }
  }
};
