import { useEffect, useState } from "react";
import { useParams, Navigate } from "react-router-dom";
import { getArchetypeWithHeaderCard } from "@/features/archetypes/api/archetypesApi";
import { buildArchetypePath } from "@/lib/config/urlHelpers";
import { ArchetypeGuideListPage } from "@/features/guides-instances";

function inferGuideType(pathname: string): "COUNTER" | "DECK" {
  if (pathname.includes("/counter-guides")) return "COUNTER";
  return "DECK";
}

/**
 * Redirects numeric ID-based archetype URLs to SEO-friendly name-based URLs.
 * Non-numeric slugs (already SEO-friendly) render the normal page.
 * /archetype/42 -> /archetype/abyss-script/deck-guides
 * /archetype/42/counter-guides -> /archetype/abyss-script/counter-guides
 * /archetype/42/deck-guides -> /archetype/abyss-script/deck-guides
 * /archetype/abyss-script/deck-guides -> normal page (already SEO-friendly)
 */
export const LegacyArchetypeRedirect = () => {
  const { archetypeId } = useParams<{ archetypeId: string }>();
  const [targetPath, setTargetPath] = useState<string | null>(null);
  const [error, setError] = useState(false);
  
  const guideType = inferGuideType(location.pathname);
  const isNumericId = archetypeId ? /^\d+$/.test(archetypeId) : false;

  useEffect(() => {
    if (!archetypeId || !isNumericId) return;

    getArchetypeWithHeaderCard(archetypeId)
      .then((res) => {
        const path = buildArchetypePath({
          archetypeId: res.archetype.id,
          archetypeName: res.archetype.name,
          guideType,
        });
        setTargetPath(path);
      })
      .catch(() => setError(true));
  }, [archetypeId, guideType, isNumericId]);

  if (!isNumericId) return <ArchetypeGuideListPage />;

  if (targetPath) return <Navigate to={targetPath} replace />;

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900">
        <div className="text-center">
          <p className="text-slate-400 text-lg">Archetype not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-400" />
    </div>
  );
};
