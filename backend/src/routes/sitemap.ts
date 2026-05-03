import { Router } from "express";
import { getDependencies } from "@/compositionRoot.js";

const router = Router();

// Helper function to slugify text with transliteration support (same logic as legacyUrlRedirectMiddleware)
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

// Helper to format date as YYYY-MM-DD (required by sitemap spec)
const formatDateForSitemap = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

// Generate sitemap.xml
router.get("/sitemap.xml", async (req, res) => {
  try {
    // Get services (must be called inside route handler for proper initialization)
    const instanceService = getDependencies().getInstanceService();
    const archetypeRepository = getDependencies().getArchetypeRepository();
    
    // Get all published guides
    const guides = await instanceService.getAllGuides();
    
    // Get all archetypes (empty search matches all)
    const archetypes = await archetypeRepository.searchArchetypeByName("", 10000);

    // Base URL
    const baseUrl = "https://masterduelcounter.com";

    // Build sitemap entries
    const staticPages = [
      {
        loc: `${baseUrl}/`,
        changefreq: "daily",
        priority: "1.0",
      },
      {
        loc: `${baseUrl}/cards`,
        changefreq: "weekly",
        priority: "0.9",
      },      {
        loc: `${baseUrl}/guides/counter-guides`,
        changefreq: "daily",
        priority: "0.9",
      },
      {
        loc: `${baseUrl}/guides/deck-guides`,
        changefreq: "daily",
        priority: "0.9",
      },
    ];

    // Generate guide URLs
    const guideEntries = guides.map((guide) => {
      const typeSegment =
        guide.guideType === "DECK" ? "deck-guide" : "counter-guide";
      const archetypeSlug = slugifySegment(guide.archetypeName);
      const authorSlug = slugifySegment(guide.userName);
      const guideUrl = `${baseUrl}/archetypes/${archetypeSlug}/${authorSlug}/${typeSegment}-${guide.id}`;

      return {
        loc: guideUrl,
        lastmod: formatDateForSitemap(guide.updatedAt),
        changefreq: "weekly",
        priority: "0.8",
      };
    });

    // Generate archetype list page URLs (counter + deck for each archetype)
    const archetypeEntries = archetypes.flatMap((archetype: { name: string }) => {
      const archetypeSlug = slugifySegment(archetype.name);
      
      return [
        {
          loc: `${baseUrl}/archetype/${archetypeSlug}/counter-guides`,
          changefreq: "daily",
          priority: "0.8",
        },
        {
          loc: `${baseUrl}/archetype/${archetypeSlug}/deck-guides`,
          changefreq: "daily",
          priority: "0.8",
        },
      ];
    });

    // Build XML
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticPages
  .map(
    (page) => `  <url>
    <loc>${page.loc}</loc>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`,
  )
  .join("\n")}
${archetypeEntries
  .map(
    (entry: { loc: string; changefreq: string; priority: string }) => `  <url>
    <loc>${entry.loc}</loc>
    <changefreq>${entry.changefreq}</changefreq>
    <priority>${entry.priority}</priority>
  </url>`,
  )
  .join("\n")}
${guideEntries
  .map(
    (entry) => `  <url>
    <loc>${entry.loc}</loc>
    <lastmod>${entry.lastmod}</lastmod>
    <changefreq>${entry.changefreq}</changefreq>
    <priority>${entry.priority}</priority>
  </url>`,
  )
  .join("\n")}
</urlset>`;

    // Set proper headers
    res.header("Content-Type", "application/xml");
    res.header("Cache-Control", "public, max-age=3600"); // Cache for 1 hour
    res.send(xml);
  } catch (error) {
    console.error("Error generating sitemap:", error);
    res.status(500).send("Error generating sitemap");
  }
});

export default router;
