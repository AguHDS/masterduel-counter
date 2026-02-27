import { useParams, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useQuery } from "@tanstack/react-query";
import { Flag, Edit } from "lucide-react";
import { Navbar } from "@/layouts/Navbar";
import { Footer } from "@/layouts/Footer";
import { UserInstancesList } from "../components/UserInstancesList";
import { FavoriteCardEditor } from "../components/FavoriteCardEditor";
import { FavoriteDecksEditor } from "../components/FavoriteDecksEditor";
import { FavoritedGuidesList } from "../components/FavoritedGuidesList";
import { CustomDecksList } from "../components/CustomDecksList";
import type { TabType } from "../types/profileTypes";
import { profileApi } from "../api/profileApi";
import { useProfileEditor } from "../hooks/useProfileEditor";
import { useFavoriteCardAndDecks } from "../hooks/useFavoriteCardAndDecks";
import { useSession } from "@/lib/auth-client";
import { FeatureErrorBoundary } from "@/shared/components";
import { ReportModal } from "@/features/report/components/ReportModal";
import { useRef, useState, useCallback } from "react";
import { instanceApi } from "@/lib/http/instanceApi";
import { type Card } from "@/features/ArchetypeAnalyzer/api/cardApi";
import background_button from "@/assets/MDC-button-background.webp";
import background_profile from "@/assets/MDC-profile_background.webp";
import border_profile from "@/assets/MDC-border.webp";

export const ProfilePage = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { data: session } = useSession();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>("profile");

  const { data: profileData } = useQuery({
    queryKey: ["profile", userId],
    queryFn: () => profileApi.getProfile(userId!),
    enabled: !!userId,
  });

  const { data: userGuides } = useQuery({
    queryKey: ["userInstances", userId],
    queryFn: () => instanceApi.getInstancesByUserId(userId!, "likes"),
    enabled: !!userId,
  });

  const { data: favoritedGuidesData, refetch: refetchFavoritedGuides } =
    useQuery({
      queryKey: ["favoritedGuides", userId],
      queryFn: () => profileApi.getFavoritedGuides(userId!),
      enabled: !!userId,
    });

  const {
    isEditMode,
    bioValue,
    previewUrl,
    isSaving,
    isDeletingPhoto,
    handleFileSelect,
    handleBioChange,
    handleSaveChanges,
    handleDeletePhoto,
    toggleEditMode,
    cancelEdit,
  } = useProfileEditor(userId!);

  // Get profile data
  const profile = profileData?.profile;

  // Use favoriteCardAndDecks hook
  const {
    favoriteCardId,
    favoriteDecks,
    setFavoriteCardId,
    setFavoriteDecks,
    saveFavoriteCardAndDecks,
    isSaving: isSavingFavorites,
  } = useFavoriteCardAndDecks(userId!, profile);

  const handleSelectArchetype = useCallback(
    (archetypeId: number, instanceId: number) => {
      navigate(`/archetype/${archetypeId}/instance/${instanceId}`);
    },
    [navigate],
  );

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleViewAllGuides = () => {
    setActiveTab("guides");
  };

  const handleFavoriteCardSelect = (card: Card) => {
    setFavoriteCardId(card.id);
  };

  const handleFavoriteDecksUpdate = (decks: typeof favoriteDecks) => {
    setFavoriteDecks(decks);
  };

  const handleRemoveFavorite = async (guideId: number, archetypeId: number) => {
    try {
      await instanceApi.toggleInstanceFavorite(archetypeId, guideId);
      await refetchFavoritedGuides();
    } catch (error) {
      console.error("Error removing favorite:", error);
      alert("Failed to remove favorite. Please try again.");
    }
  };

  const handleCancelEdit = useCallback(() => {
    cancelEdit();
    // Reset favorites to original values
    if (profile) {
      setFavoriteCardId(profile.favoriteCardId || null);
      if (profile.favoriteDecks) {
        try {
          const decks = JSON.parse(
            profile.favoriteDecks,
          ) as typeof favoriteDecks;
          setFavoriteDecks(decks);
        } catch {
          setFavoriteDecks([]);
        }
      } else {
        setFavoriteDecks([]);
      }
    }
  }, [cancelEdit, profile, setFavoriteCardId, setFavoriteDecks]);

  const handleSaveProfile = async () => {
    try {
      // Save favorites and bio/photo in parallel
      await Promise.all([saveFavoriteCardAndDecks(), handleSaveChanges()]);
    } catch (error) {
      console.error("Error saving profile:", error);
    }
  };

  const isOwner = session?.user?.id === userId;

  if (!userId) {
    return (
      <>
        <Helmet>
          <title>Profile - Masterduel Counter</title>
        </Helmet>
        <div className="min-h-screen bg-gradient-to-b from-slate-950 to-blue-950 flex flex-col">
          <Navbar />
          <main className="flex-1 flex items-center justify-center">
            <div className="text-red-400 text-xl">User ID not provided</div>
          </main>
          <Footer />
        </div>
      </>
    );
  }

  const displayPhotoUrl = previewUrl || profile?.profilePictureUrl;

  return (
    <>
      <Helmet>
        <title>{profile?.userName || "User"} - Profile</title>
      </Helmet>

      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-purple-950/20 to-slate-950 flex flex-col">
        <Navbar />

        <main className="flex-1 px-2 sm:px-4 lg:px-8 py-4 sm:py-8">
          <FeatureErrorBoundary featureName="Profile">
            <div className="max-w-[1600px] mx-auto">
              <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 items-stretch">
                {/* Left Sidebar */}
                <aside className="w-full lg:w-[280px] xl:w-[350px] flex-shrink-0 lg:sticky lg:top-8">
                  <div className="relative overflow-hidden rounded-lg border-2 border-yellow-600/40 h-auto lg:h-[800px]">
                    <img
                      src={background_profile}
                      alt=""
                      aria-hidden="true"
                      className="absolute inset-0 w-full h-full object-cover opacity-70"
                    />
                    <div className="relative z-10 bg-gradient-to-br from-purple-950/40 to-slate-900/60 backdrop-blur-sm p-4 sm:p-6 lg:p-12 lg:pt-6 space-y-4 lg:space-y-6 h-full">
                      {/* User name */}
                      <div className="text-center mb-2">
                        <h1 className="text-xl sm:text-2xl font-bold text-yellow-400">
                          {profile?.userName || userId}
                        </h1>
                      </div>

                      <div className="relative mx-auto max-w-[280px] lg:max-w-none">
                        <div className="absolute -inset-2 bg-gradient-to-br from-yellow-600/20 to-amber-600/20 rounded-lg blur-sm"></div>
                        <div
                          className="relative rounded-lg overflow-hidden bg-slate-900/80"
                          style={{
                            borderImage: `url(${border_profile}) 18 stretch`,
                            borderWidth: "10px",
                          }}
                        >
                          {displayPhotoUrl ? (
                            <img
                              src={displayPhotoUrl}
                              alt={`${profile?.userName}'s profile`}
                              className="w-full aspect-[4/5] object-cover"
                            />
                          ) : (
                            <div className="w-full aspect-[4/5] flex items-center justify-center text-blue-300 text-5xl font-bold bg-gradient-to-br from-slate-800 to-slate-900">
                              {profile?.userName?.charAt(0).toUpperCase() ||
                                "U"}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="border-t border-yellow-600/30 pt-4 space-y-1">
                        <div className="flex items-baseline gap-2">
                          <span className="text-amber-200 font-semibold text-sm sm:text-base">
                            Ranking:
                          </span>
                          <span className="text-lg sm:text-[17px] font-semibold text-amber-500/90">
                            #2
                          </span>
                        </div>
                        <div className="flex items-baseline gap-2">
                          <span className="text-amber-200 font-semibold text-sm sm:text-base">
                            Likes:
                          </span>
                          <span className="text-lg sm:text-[17px] font-semibold text-green-500">
                            {profile?.totalLikes ?? 0}
                          </span>
                        </div>
                        <div className="flex items-baseline gap-2">
                          <span className="text-amber-200 font-semibold text-sm sm:text-base">
                            Guide Views:
                          </span>
                          <span className="text-lg sm:text-[17px] font-semibold text-amber-400">
                            -
                          </span>
                        </div>
                        <div className="flex items-baseline gap-2">
                          <span className="text-amber-200 font-semibold text-sm sm:text-base">
                            Role:
                          </span>
                          <span
                            className={`text-lg sm:text-[17px] font-semibold ${
                              profile?.role === "admin"
                                ? "text-red-500/90"
                                : profile?.role === "user"
                                  ? "text-green-500"
                                  : "text-blue-500"
                            }`}
                          >
                            {profile?.role}
                          </span>
                        </div>
                      </div>

                      {isEditMode && isOwner && (
                        <div className="space-y-2">
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleFileInputChange}
                            className="hidden"
                          />
                          <button
                            onClick={() => fileInputRef.current?.click()}
                            className="w-full px-4 py-2 bg-blue-600/80 hover:bg-blue-700 text-white text-sm rounded transition-colors"
                            disabled={isSaving}
                          >
                            Change Photo
                          </button>
                          {profile?.profilePictureUrl && (
                            <button
                              onClick={handleDeletePhoto}
                              disabled={isDeletingPhoto || isSaving}
                              className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm rounded transition-colors disabled:opacity-50"
                            >
                              {isDeletingPhoto ? "Deleting..." : "Delete Photo"}
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </aside>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 mb-1">
                    <div className="flex flex-col sm:flex-row gap-2 pb-2 sm:pb-0">
                      {[
                        { id: "profile", label: "Profile" },
                        { id: "decks", label: "My decks" },
                        { id: "guides", label: "Guides" },
                        { id: "favorites", label: "Favorites" },
                      ].map((tab) => (
                        <button
                          key={tab.id}
                          onClick={() => setActiveTab(tab.id as TabType)}
                          className={`px-3 sm:px-4 lg:px-6 xl:px-8 py-[11px] text-xs sm:text-sm lg:text-md font-bold transition-all relative overflow-hidden rounded border-2 whitespace-nowrap ${
                            activeTab === tab.id
                              ? "text-yellow-400 border-amber-700"
                              : "text-gray-400 hover:text-yellow-300 border-amber-600/50"
                          }`}
                        >
                          <img
                            src={background_button}
                            alt=""
                            aria-hidden="true"
                            className="absolute inset-0 w-full h-full opacity-60"
                          />
                          <span className="relative z-10 block">
                            {tab.label}
                          </span>
                          {activeTab === tab.id && (
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-r from-yellow-500 to-amber-500"></div>
                          )}
                        </button>
                      ))}
                    </div>
                    <div className="w-full sm:w-auto">
                      {!isOwner && session && (
                        <button
                          onClick={() => setIsReportModalOpen(true)}
                          className="hover:text-red-700/80 text-white transition-colors"
                        >
                          <Flag className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                    {/* Edit Profile / Save Cancel Buttons */}
                    {isOwner && (
                      <div className="flex gap-2 flex-shrink-0">
                        {!isEditMode ? (
                          <button
                            onClick={() => toggleEditMode(profile?.bio || "")}
                            className="flex items-center gap-2 py-[11px] px-3 sm:px-4 lg:px-5 bg-yellow-600/80 hover:bg-yellow-600 text-white rounded transition-colors border border-yellow-500 text-xs sm:text-sm lg:text-base"
                          >
                            <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
                            <span>Edit Profile</span>
                          </button>
                        ) : (
                          <>
                            <button
                              onClick={handleSaveProfile}
                              disabled={isSaving || isSavingFavorites}
                              className="px-3 sm:px-4 lg:px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded transition-colors disabled:opacity-50 font-semibold text-xs sm:text-sm lg:text-base"
                            >
                              {isSaving || isSavingFavorites
                                ? "Saving..."
                                : "Save"}
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              disabled={isSaving || isSavingFavorites}
                              className="px-3 sm:px-4 lg:px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded transition-colors disabled:opacity-50 font-semibold text-xs sm:text-sm lg:text-base"
                            >
                              Cancel
                            </button>
                          </>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Main Content Container */}
                  <div className="bg-gradient-to-br relative mt-1 from-purple-950/40 to-slate-900/60 backdrop-blur-sm rounded-lg border-2 border-yellow-600/40 overflow-hidden min-h-[500px] lg:h-[730px]">
                    <img
                      src={background_profile}
                      alt=""
                      aria-hidden="true"
                      className="absolute inset-0 w-full h-full object-cover opacity-30 -z-10"
                    />
                    <div className="p-4 sm:p-6 lg:p-8 h-full overflow-auto scrollbar-cardpair relative z-10">
                      {activeTab === "profile" && (
                        <div className="space-y-8 sm:space-y-12">
                          <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
                            {/* Bio */}
                            <div className="flex-1 min-w-0">
                              <h2 className="text-yellow-500 font-bold text-lg mb-1">
                                Bio
                              </h2>
                              <div className="relative bg-purple-950/40 overflow-hidden rounded-lg border border-yellow-600/30">
                                <div className="relative z-10 p-4 sm:p-6">
                                  {isEditMode && isOwner ? (
                                    <div className="space-y-2">
                                      <textarea
                                        value={bioValue}
                                        onChange={(e) =>
                                          handleBioChange(e.target.value)
                                        }
                                        placeholder="Tell us about yourself... (Max 1000 characters)"
                                        className="w-full px-4 py-3 bg-slate-900/50 text-white rounded border border-purple-700/50 focus:border-yellow-500 focus:outline-none resize-none"
                                        rows={4}
                                        maxLength={1000}
                                      />
                                      <div className="text-sm text-gray-400">
                                        {bioValue.length}/1000 characters
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="min-h-[150px] sm:min-h-[200px]">
                                      <p className="text-gray-300 whitespace-pre-wrap">
                                        {profile?.bio ||
                                          (isOwner
                                            ? "No bio available. Click 'Edit Profile' to add one."
                                            : "No bio yet.")}
                                      </p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Favorite Card */}
                            <FavoriteCardEditor
                              cardId={favoriteCardId}
                              isEditMode={isEditMode && isOwner}
                              onCardSelect={handleFavoriteCardSelect}
                            />
                          </div>

                          {/* Favorite Decks */}
                          <FavoriteDecksEditor
                            favoriteDecks={favoriteDecks}
                            isEditMode={isEditMode && isOwner}
                            onDecksUpdate={handleFavoriteDecksUpdate}
                          />
                        </div>
                      )}

                      {activeTab === "decks" && (
                        <CustomDecksList userId={userId} isOwner={isOwner} />
                      )}

                      {activeTab === "guides" && (
                        <div>
                          {userGuides && userGuides.length > 0 ? (
                            <UserInstancesList
                              userId={userId}
                              onSelectArchetype={handleSelectArchetype}
                            />
                          ) : (
                            <div className="text-center text-gray-400 py-20">
                              <p className="text-lg">No guides yet...</p>
                            </div>
                          )}
                        </div>
                      )}

                      {activeTab === "favorites" && (
                        <FavoritedGuidesList
                          guides={favoritedGuidesData?.guides || []}
                          onRemoveFavorite={
                            session?.user?.id === userId
                              ? handleRemoveFavorite
                              : undefined
                          }
                        />
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Sidebar */}
                <aside className="w-full lg:w-[280px] xl:w-[320px] flex-shrink-0 lg:sticky lg:top-8">
                  <div className="relative overflow-hidden rounded-lg border-2 border-yellow-600/40 h-auto lg:h-[800px]">
                    <img
                      src={background_profile}
                      alt=""
                      aria-hidden="true"
                      className="absolute inset-0 w-full h-full object-cover opacity-70"
                    />
                    <div className="relative z-10 bg-gradient-to-br from-purple-950/40 to-slate-900/60 backdrop-blur-sm p-4 sm:p-6 space-y-4 sm:space-y-6 h-full">
                      <div className="space-y-3">
                        <h3 className="text-yellow-500 font-bold text-sm flex items-center gap-2 mt-1">
                          <span className="text-lg">♦</span> Favorite Guides
                        </h3>
                        {favoritedGuidesData?.guides &&
                        favoritedGuidesData.guides.length > 0 ? (
                          <>
                            <div className="space-y-2 mb-4">
                              {favoritedGuidesData.guides
                                .slice(0, 3)
                                .map((guide) => (
                                  <div
                                    key={guide.id}
                                    className="flex items-center gap-3 p-2 bg-purple-950/30 rounded hover:bg-purple-950/50 transition-colors cursor-pointer"
                                    onClick={() =>
                                      handleSelectArchetype(
                                        guide.archetypeId,
                                        guide.id,
                                      )
                                    }
                                  >
                                    {guide.headerCardImageUrl ? (
                                      <img
                                        src={guide.headerCardImageUrl}
                                        alt={
                                          guide.headerCardName || "Header card"
                                        }
                                        className="h-[50px] w-[50px] border-2 border-yellow-500/80 shadow-sm object-cover flex-shrink-0"
                                      />
                                    ) : (
                                      <div className="w-[50px] h-[50px] bg-slate-700 rounded border border-slate-600 flex items-center justify-center flex-shrink-0">
                                        <span className="text-slate-400 text-xs">
                                          -
                                        </span>
                                      </div>
                                    )}
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center justify-between gap-2">
                                        <p className="text-white text-sm font-semibold truncate flex-1">
                                          {guide.title}
                                        </p>
                                        <span className="text-green-400 text-xs font-semibold flex-shrink-0">
                                          ↑ {guide.likes}
                                        </span>
                                      </div>
                                      <p className="text-amber-200/70 text-xs truncate">
                                        {guide.archetypeName}
                                      </p>
                                    </div>
                                  </div>
                                ))}
                            </div>
                            <button
                              onClick={() => setActiveTab("favorites")}
                              className="w-full px-4 hover:text-yellow-400 text-yellow-500 font-semibold rounded transition-colors"
                            >
                              View all ({favoritedGuidesData.guides.length})
                            </button>
                          </>
                        ) : (
                          <div className="text-center text-gray-400 py-4">
                            <p className="text-sm">No favorites yet</p>
                          </div>
                        )}
                      </div>

                      <div>
                        <h3 className="text-yellow-500 font-bold mb-3 border-t border-yellow-600/30 pt-6">
                          ♦ Best Guides
                        </h3>
                        <div className="space-y-2 mb-4">
                          {userGuides?.slice(0, 3).map((guide) => (
                            <div
                              key={guide.id}
                              className="flex items-center gap-3 p-2 bg-purple-950/30 rounded hover:bg-purple-950/50 transition-colors cursor-pointer"
                              onClick={() =>
                                handleSelectArchetype(
                                  guide.archetypeId,
                                  guide.id,
                                )
                              }
                            >
                              {guide.headerCardImageUrl ? (
                                <img
                                  src={guide.headerCardImageUrl}
                                  alt={guide.headerCardName || "Header card"}
                                  className="h-[50px] w-[50px] border-2 border-yellow-500/80 shadow-sm object-cover flex-shrink-0"
                                />
                              ) : (
                                <div className="w-[50px] h-[50px] bg-slate-700 rounded border border-slate-600 flex items-center justify-center flex-shrink-0">
                                  <span className="text-slate-400 text-xs">
                                    -
                                  </span>
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-2">
                                  <p className="text-white text-sm font-semibold truncate flex-1">
                                    {guide.title}
                                  </p>
                                  <span className="text-green-400 text-xs font-semibold flex-shrink-0">
                                    ↑ {guide.likes}
                                  </span>
                                </div>
                                <p className="text-amber-200/70 text-xs truncate">
                                  {guide.archetypeName}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                        {userGuides && userGuides.length > 0 && (
                          <button
                            onClick={handleViewAllGuides}
                            className="w-full px-4 hover:text-yellow-400 text-yellow-500 font-semibold rounded transition-colors"
                          >
                            View all ({userGuides.length})
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </aside>
              </div>
            </div>
          </FeatureErrorBoundary>
        </main>

        <Footer />
      </div>

      {isReportModalOpen && (
        <ReportModal
          isOpen={isReportModalOpen}
          onClose={() => setIsReportModalOpen(false)}
          targetType="user"
          targetId={userId}
          targetName={profile?.userName || userId}
        />
      )}
    </>
  );
};
