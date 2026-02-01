import type { MouseEvent } from "react";
import { ChevronLeft, ChevronRight, ArrowUp } from "lucide-react";
import { type ArchetypeInstanceWithDetails } from "@/lib/http/instanceApi";
import { useAuth } from "@/features/auth";
import { useNavigate } from "react-router-dom";
import instanceItemBg from "@/assets/background_instanceitem.webp";
import instanceItemPlaneBg from "@/assets/background_instanceitem_plane.webp";
import styles from "./InstancesTable.module.css";

interface InstancesTableProps {
  instances: ArchetypeInstanceWithDetails[];
  currentPage: number;
  itemsPerPage: number;
  onSelectInstance: (instanceId: number, archetypeId: number) => void;
  onPageChange: (page: number) => void;
  showArchetypeName?: boolean;
  isProfilePage?: boolean;
  disableTabletResponsive?: boolean;
}

// Configuración base (para páginas normales)
const BASE_CONFIG = {
  maxCharsTitle: 52,
  maxCharsTitleTablet: 30,
  createdByHeaderLeft: "left-56",
  idPositionClass: "right-2",
};

// Configuración para perfil
const PROFILE_CONFIG = {
  maxCharsTitle: 42,
  maxCharsTitleTablet: 30,
  createdByHeaderLeft: "left-48",
  idPositionClass: "right-3",
};

export const InstancesTable = ({
  instances,
  currentPage,
  itemsPerPage,
  onSelectInstance,
  onPageChange,
  showArchetypeName = false,
  isProfilePage = false,
  disableTabletResponsive = false,
}: InstancesTableProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Seleccionar configuración basada en si es perfil o no
  const config = isProfilePage ? PROFILE_CONFIG : BASE_CONFIG;

  const totalPages = Math.ceil(instances.length / itemsPerPage);
  const startIndex = currentPage * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentInstances = instances.slice(startIndex, endIndex);

  const handlePreviousPage = () => {
    onPageChange(Math.max(0, currentPage - 1));
  };

  const handleNextPage = () => {
    onPageChange(Math.min(totalPages - 1, currentPage + 1));
  };

  const handleUserNameClick = (e: MouseEvent, userId: string) => {
    e.stopPropagation();
    navigate(`/profile/${userId}`);
  };

  // Determina qué background usar:
  // - En perfil: plane para mobile, normal para desktop
  // - NO en perfil: plane para mobile (<1024px), normal para desktop (≥1024px)
  const getBackgroundForView = () => {
    // Para mobile (<1024px) siempre usa plane, sin importar si es perfil o no
    const mobileBackground = instanceItemPlaneBg;
    
    // Para desktop (≥1024px)
    const desktopBackground = instanceItemBg;
    
    return { mobileBackground, desktopBackground };
  };

  const { mobileBackground, desktopBackground } = getBackgroundForView();

  return (
    <div
      className="w-full"
      role="table"
      aria-label={
        showArchetypeName
          ? "User archetype instances"
          : "Archetype instances list"
      }
    >
      {/* Desktop headers - mostrar SIEMPRE en ≥1024px */}
      <div
        className="hidden lg:grid grid-cols-[60px_48px_minmax(160px,1fr)_minmax(120px,1fr)_minmax(120px,0.8fr)_96px] gap-3 mb-6 pb-3 border-b border-blue-600 bg-black/60 rounded-t-lg"
        role="row"
      >
        <div
          className="text-blue-300 font-semibold text-lg relative left-10"
          role="columnheader"
        >
          ID
        </div>
        <div role="columnheader" aria-hidden="true" />
        <div
          className="text-blue-300 font-semibold text-lg relative left-16"
          role="columnheader"
        >
          Title
        </div>
        <div
          className={`text-blue-300 font-semibold text-lg relative ${config.createdByHeaderLeft}`}
          role="columnheader"
        >
          {showArchetypeName ? "Archetype" : "Created by"}
        </div>
        <div
          className="text-blue-300 font-semibold text-lg relative left-24"
          role="columnheader"
        >
          Last Updated
        </div>
        <div
          className="text-blue-300 font-semibold text-lg relative left-9"
          role="columnheader"
        >
          Likes
        </div>
      </div>

      <div className="flex flex-col gap-[0.25rem]">
        {currentInstances.map((instance, index) => {
          const isCurrentUser = user?.id === instance.userId;
          const positionLabel = startIndex + index + 1;
          const formattedDate = new Date(
            instance.updatedAt,
          ).toLocaleDateString();
          const truncatedTitle =
            instance.title.length > config.maxCharsTitle
              ? instance.title.slice(0, config.maxCharsTitle) + "…"
              : instance.title;
          const truncatedTitleTablet =
            instance.title.length > config.maxCharsTitleTablet
              ? instance.title.slice(0, config.maxCharsTitleTablet) + "…"
              : instance.title;

          return (
            <button
              key={instance.id}
              onClick={() =>
                onSelectInstance(instance.id, instance.archetypeId)
              }
              className="group relative w-full overflow-hidden rounded-xl border border-blue-500/40 bg-[#070B29]/80 transition-transform hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
            >
              {/* Background image - plane para mobile, normal para desktop */}
              <img
                src={desktopBackground}
                alt=""
                aria-hidden="true"
                className="absolute inset-0 h-full w-full pointer-events-none select-none hidden lg:block"
              />
              {/* Background plane para mobile (<1024px) - siempre se usa */}
              <img
                src={mobileBackground}
                alt=""
                aria-hidden="true"
                className="absolute inset-0 h-full w-full pointer-events-none select-none lg:hidden"
              />
              <div className="absolute inset-0 z-10 pointer-events-none mix-blend-normal transition-colors duration-200 group-hover:bg-[#0b1546]/80 group-active:bg-[#030512]/95" />

              <div className="relative z-10 flex flex-col gap-3 p-4 lg:p-0 lg:gap-0">
                {/* Mobile Layout - Column Format (hasta 1023px) */}
                <div className="flex relative flex-col gap-4 lg:hidden">
                  <div className="flex items-start gap-3 w-full">
                    {instance.headerCardImageUrl ? (
                      <img
                        src={instance.headerCardImageUrl}
                        alt={instance.headerCardName || "Header card"}
                        className="h-[70px] w-[70px] rounded border-none shadow-sm object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className="w-[70px] h-[70px] bg-slate-700 rounded border border-slate-600 flex items-center justify-center flex-shrink-0">
                        <span className="text-slate-400 text-sm">-</span>
                      </div>
                    )}
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="text-white text-lg font-bold leading-tight break-words">
                        {instance.title}
                      </h3>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-blue-500/30">
                    <div className="flex items-center gap-1 bg-blue-900/40 px-2 py-1 rounded">
                      <span className="text-blue-300 font-medium text-sm">ID:</span>
                      <span className="text-[#FFD700] font-bold">#{positionLabel}</span>
                    </div>

                    <div className="flex items-center gap-2 bg-blue-900/40 px-2 py-1 rounded flex-1 min-w-0">
                      <span className="text-blue-300 font-medium text-sm flex-shrink-0">
                        {showArchetypeName ? "Archetype:" : "Created:"}
                      </span>
                      <div className="flex items-center gap-1 flex-1 min-w-0">
                        {showArchetypeName ? (
                          <span className="text-white truncate text-sm">
                            {instance.archetypeName}
                          </span>
                        ) : (
                          <>
                            <span
                              onClick={(e) =>
                                handleUserNameClick(e, instance.userId)
                              }
                              className="text-white hover:text-blue-400 hover:underline transition-colors cursor-pointer truncate text-sm"
                            >
                              {instance.userName}
                            </span>
                            {isCurrentUser && (
                              <span className="text-[10px] font-bold uppercase tracking-wide text-green-400 px-1.5 py-0.5 bg-green-400/10 rounded flex-shrink-0">
                                You
                              </span>
                            )}
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1 bg-blue-900/40 px-2 py-1 rounded">
                      <span className="text-blue-300 font-medium text-sm">Updated:</span>
                      <span className="text-blue-100 text-sm whitespace-nowrap">
                        {formattedDate}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 bg-blue-900/40 px-2 py-1 rounded">
                      <ArrowUp
                        className="w-3.5 h-3.5 text-green-400"
                        aria-hidden="true"
                      />
                      <span className="text-green-400 font-semibold text-sm">
                        {instance.likes}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Desktop Layout (≥1024px) - ÚNICO layout para desktop */}
                <div 
                  className="hidden lg:grid grid-cols-[60px_48px_minmax(160px,1fr)_minmax(120px,1fr)_minmax(120px,0.8fr)_96px] gap-3 items-center px-6 py-5"
                >
                  {/* ID con ajustes responsivos solo para el ID */}
                  <div className={`text-[#ffbf1f] text-2xl font-bold drop-shadow-md ${isProfilePage ? styles.profileMode : styles.normalMode}`}>
                    {positionLabel}
                  </div>
                  
                  <div className="flex items-center justify-start h-full">
                    {instance.headerCardImageUrl ? (
                      <img
                        src={instance.headerCardImageUrl}
                        alt={instance.headerCardName || "Header card"}
                        className="h-[50px] w-[50px] rounded border-none shadow-sm object-cover"
                      />
                    ) : (
                      <div className="w-8 h-12 bg-slate-700 rounded border border-slate-600 flex items-center justify-center">
                        <span className="text-slate-400 text-xs">-</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="relative">
                    <div
                      className="text-white font-bold text-[17px] whitespace-nowrap text-ellipsis pr-2"
                      title={instance.title}
                    >
                      {truncatedTitle}
                    </div>
                  </div>
                  
                  <div className="text-white relative left-42 font-semibold text-lg flex items-center gap-2">
                    {showArchetypeName ? (
                      <span className="text-white whitespace-nowrap overflow-hidden text-ellipsis max-w-[140px]">
                        {instance.archetypeName}
                      </span>
                    ) : (
                      <>
                        <span
                          onClick={(e) =>
                            handleUserNameClick(e, instance.userId)
                          }
                          className="hover:text-blue-400 relative left-56 hover:underline transition-colors cursor-pointer whitespace-nowrap overflow-hidden text-ellipsis max-w-[120px]"
                        >
                          {instance.userName}
                        </span>
                        {isCurrentUser && (
                          <span className="text-[10px] font-bold relative left-56 uppercase tracking-wide text-green-400 px-2 py-0.5 rounded bg-green-400/10 flex-shrink-0">
                            You
                          </span>
                        )}
                      </>
                    )}
                  </div>
                  
                  <div className="text-blue-300 relative left-16 text-lg whitespace-nowrap">
                    {formattedDate}
                  </div>
                  
                  <div className="text-green-400 text-lg flex items-center gap-1 justify-end">
                    <ArrowUp className="w-4 h-4" aria-hidden="true" />
                    <span>{instance.likes}</span>
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {totalPages > 1 && (
        <nav
          className="flex items-center justify-center gap-4 mt-6"
          aria-label="Pagination navigation"
        >
          <button
            onClick={handlePreviousPage}
            disabled={currentPage === 0}
            className="p-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
            aria-label="Go to previous page"
          >
            <ChevronLeft className="w-5 h-5" aria-hidden="true" />
          </button>
          <span
            className="text-blue-300 text-sm font-medium"
            aria-current="page"
          >
            Page {currentPage + 1} of {totalPages}
          </span>
          <button
            onClick={handleNextPage}
            disabled={currentPage === totalPages - 1}
            className="p-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
            aria-label="Go to next page"
          >
            <ChevronRight className="w-5 h-5" aria-hidden="true" />
          </button>
        </nav>
      )}
    </div>
  );
};