import { useParams, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useQuery } from "@tanstack/react-query";
import { Flag, Edit, Eye, Crown, Trophy, ThumbsUp } from "lucide-react";
import { Navbar } from "@/layouts/Navbar";
import { Footer } from "@/layouts/Footer";
import { FavoriteCardEditor } from "../components/FavoriteCardEditor";
import { FavoriteDecksEditor } from "../components/FavoriteDecksEditor";
import { FavoritedGuidesList } from "../components/FavoritedGuidesList";
import { CustomDecksList } from "../components/CustomDecksList";
import { PersonalDecks } from "../components/PersonalDecks";
import type { TabType } from "../types/profileTypes";
import { profileApi } from "../api/profileApi";
import { useProfileEditor } from "../hooks/useProfileEditor";
import { useFavoriteCardAndDecks } from "../hooks/useFavoriteCardAndDecks";
import { useCustomDecks } from "../hooks/useCustomDecks";
import { useSession } from "@/lib/auth-client";
import { FeatureErrorBoundary } from "@/shared/components";
import { ReportModal } from "@/features/report/components/ReportModal";
import { useRef, useState, useCallback } from "react";
import { instanceApi } from "@/lib/http/instanceApi";
import { type Card } from "@/features/guide-editor/api/cardApi";
import background_profile from "@/assets/MDC-profile_background.webp";
import { formatCompactNumber } from "@/shared/utils/formatNumber";

export const ProfilePage = () => {
  const { userId, tab } = useParams<{ userId: string; tab?: string }>();
  const navigate = useNavigate();
  const { data: session } = useSession();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  // Determine active tab from URL or default to "profile"
  const getActiveTab = (): TabType => {
    if (!tab) return "profile";
    if (tab === "my-decks") return "decks";
    if (tab === "guides" || tab === "favorites") return tab as TabType;
    return "profile";
  };

  const activeTab = getActiveTab();

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

  const { decks: customDecks } = useCustomDecks(userId!);

  const {
    isEditMode,
    bioValue,
    previewUrl,
    selectedFile,
    fileError,
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
  const totalViews = profileData?.totalViews ?? 0;
  const userRank = profileData?.rank;

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
    // Limpiar el input para permitir seleccionar el mismo archivo nuevamente
    e.target.value = "";
  };

  const handleViewAllGuides = () => {
    navigate(`/profile/${userId}/guides`);
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
                <aside className="w-full lg:w-[280px] xl:w-[320px] flex-shrink-0 lg:sticky lg:top-8">
                  <div className="relative overflow-hidden rounded-lg border-2 border-yellow-600/40 h-auto lg:h-[800px]">
                    <img
                      src={background_profile}
                      alt=""
                      aria-hidden="true"
                      className="absolute inset-0 w-full h-full object-cover opacity-70"
                    />
                    <div className="relative z-10 bg-gradient-to-br from-purple-950/40 to-slate-900/80 backdrop-blur-sm p-4 sm:p-5 space-y-4 h-full">
                      {/* Username and Profile Photo Square */}
                      <div className="flex flex-col items-center">
                        <h1 className="text-xl sm:text-2xl font-semibold text-yellow-400 mb-3">
                          {profile?.userName}
                        </h1>
                        <div className="relative w-32 h-32 sm:w-44 sm:h-44">
                          <div
                            className={`absolute inset-0 rounded-lg border-2 ${
                              fileError && previewUrl && !selectedFile
                                ? "border-red-500 shadow-red-500/30"
                                : "border-yellow-500/90 shadow-amber-500/30"
                            }`}
                          ></div>
                          <div
                            className={`absolute inset-1 overflow-hidden border-2 ${
                              fileError && previewUrl && !selectedFile
                                ? "border-red-400/40"
                                : "border-yellow-400/40"
                            } bg-slate-900`}
                          >
                            {displayPhotoUrl ? (
                              <img
                                src={displayPhotoUrl}
                                alt={`${profile?.userName}'s profile`}
                                className={`w-full h-full object-cover ${
                                  fileError && previewUrl && !selectedFile
                                    ? "opacity-50"
                                    : ""
                                }`}
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-blue-300 text-4xl font-semibold bg-gradient-to-br from-slate-800 to-slate-900">
                                {profile?.userName?.charAt(0).toUpperCase() ||
                                  "U"}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Error message directly below the photo */}
                        {isEditMode && isOwner && fileError && (
                          <div className="mt-3 w-full p-2 bg-red-900/50 border border-red-500 rounded text-xs text-red-200">
                            <p>{fileError}</p>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col">
                        {/* Stats with Icons */}
                        <div className="flex items-center justify-between px-3 py-2 bg-purple-950/30 rounded-lg border border-yellow-600/20">
                          <div className="flex items-center gap-2">
                            <Trophy className="w-5 h-5 text-yellow-400" />
                            <span className="text-amber-200 font-semibold text-sm">
                              Rank
                            </span>
                          </div>
                          <span className="text-base font-semibold text-yellow-400">
                            {userRank ? `#${userRank}` : "Unranked"}
                          </span>
                        </div>
                        <div className="flex items-center justify-between px-3 py-2 bg-purple-950/30 rounded-lg border border-yellow-600/20">
                          <div className="flex items-center gap-2">
                            <ThumbsUp className="w-5 h-5 text-green-500" />
                            <span className="text-amber-200 font-semibold text-sm">
                              Guide Likes
                            </span>
                          </div>
                          <span className="text-base font-semibold text-green-500">
                            {profile?.totalLikes ?? 0}
                          </span>
                        </div>
                        <div className="flex items-center justify-between px-3 py-2 bg-purple-950/30 rounded-lg border border-yellow-600/20">
                          <div className="flex items-center gap-2">
                            <Eye className="w-5 h-5 text-purple-400" />
                            <span className="text-amber-200 font-semibold text-sm">
                              Guide Views
                            </span>
                          </div>
                          <span className="text-base font-semibold text-purple-300">
                            {formatCompactNumber(totalViews)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between px-3 py-2 bg-purple-950/30 rounded-lg border border-yellow-600/20">
                          <div className="flex items-center gap-2">
                            <Crown className="w-5 h-5 text-yellow-400" />
                            <span className="text-amber-200 font-semibold text-sm">
                              Role
                            </span>
                          </div>
                          <span
                            className={`text-base font-semibold ${
                              profile?.role === "admin"
                                ? "text-red-600"
                                : profile?.role === "supporter"
                                  ? "text-pink-500"
                                  : "text-green-400"
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
                            className="w-full px-3 py-1.5 bg-blue-600/80 hover:bg-blue-700 text-white text-xs rounded transition-colors"
                            disabled={isSaving}
                          >
                            Change Photo
                          </button>

                          {profile?.profilePictureUrl && (
                            <button
                              onClick={handleDeletePhoto}
                              disabled={isDeletingPhoto || isSaving}
                              className="w-full px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs rounded transition-colors disabled:opacity-50"
                            >
                              {isDeletingPhoto ? "Deleting..." : "Delete Photo"}
                            </button>
                          )}
                        </div>
                      )}

                      {/* Personal Decks */}
                      <PersonalDecks
                        decks={customDecks || []}
                        onViewAll={() =>
                          navigate(`/profile/${userId}/my-decks`)
                        }
                        isOwner={isOwner}
                      />
                    </div>
                  </div>
                </aside>

                <div className="flex-1 min-w-0">
                  {/* Main Content Container */}
                  <div className="bg-gradient-to-br relative from-purple-950/40 to-slate-900/80 rounded-lg border-2 border-yellow-600/40 overflow-hidden h-auto lg:h-[800px] flex flex-col">
                    <img
                      src={background_profile}
                      alt=""
                      aria-hidden="true"
                      className="absolute inset-0 w-full h-full object-cover opacity-30 -z-10"
                    />
                    {/* Tabs inside container */}
                    <div className="relative z-10 border-b border-yellow-600/30 bg-slate-900/40 backdrop-blur-sm">
                      <div className="flex flex-col gap-2 sm:gap-3 p-3 lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex flex-wrap gap-2">
                          {[
                            { id: "profile", label: "Profile", path: "" },
                            {
                              id: "decks",
                              label: "My Decks",
                              path: "my-decks",
                            },
                            { id: "guides", label: "Guides", path: "guides" },
                            {
                              id: "favorites",
                              label: "Favorites",
                              path: "favorites",
                            },
                          ].map((tab) => (
                            <button
                              key={tab.id}
                              onClick={() =>
                                navigate(
                                  `/profile/${userId}${tab.path ? `/${tab.path}` : ""}`,
                                )
                              }
                              className={`px-4 py-2.5 text-sm font-bold transition-all relative overflow-hidden rounded border whitespace-nowrap ${
                                activeTab === tab.id
                                  ? "text-yellow-400 border-yellow-500/60 bg-yellow-600/10"
                                  : "text-gray-300 hover:text-yellow-300 border-yellow-600/30 hover:border-yellow-500/40 hover:bg-yellow-600/5"
                              }`}
                            >
                              {tab.label}
                            </button>
                          ))}
                        </div>
                        {/* Edit Profile / Report Buttons */}
                        <div className="flex gap-2 items-center flex-wrap sm:flex-nowrap">
                          {!isOwner && session && (
                            <button
                              onClick={() => setIsReportModalOpen(true)}
                              className="hover:text-red-700/80 text-white transition-colors p-2"
                            >
                              <Flag className="w-5 h-5" />
                            </button>
                          )}
                          {isOwner && (
                            <div className="flex gap-2 flex-shrink-0 flex-wrap sm:flex-nowrap">
                              {!isEditMode ? (
                                <button
                                  onClick={() =>
                                    toggleEditMode(profile?.bio || "")
                                  }
                                  className="flex items-center gap-2 py-2 px-4 bg-yellow-600/80 hover:bg-yellow-600 text-white rounded transition-colors border border-yellow-500 text-sm"
                                >
                                  <Edit className="w-4 h-4" />
                                  <span>Edit Profile</span>
                                </button>
                              ) : (
                                <>
                                  <button
                                    onClick={handleSaveProfile}
                                    disabled={
                                      isSaving ||
                                      isSavingFavorites ||
                                      !!fileError
                                    }
                                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded transition-colors disabled:opacity-50 font-semibold text-sm"
                                  >
                                    {isSaving || isSavingFavorites
                                      ? "Saving..."
                                      : "Save"}
                                  </button>
                                  <button
                                    onClick={handleCancelEdit}
                                    disabled={isSaving || isSavingFavorites}
                                    className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded transition-colors disabled:opacity-50 font-semibold text-sm"
                                  >
                                    Cancel
                                  </button>
                                </>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex-1 p-4 sm:p-6 overflow-auto scrollbar-cardpair relative z-10">
                      {activeTab === "profile" && (
                        <div className="space-y-8 sm:space-y-12">
                          <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
                            {/* Bio */}
                            <div className="flex-1 min-w-0">
                              <h2 className="text-yellow-400 font-semibold text-xl mb-3">
                                Bio
                              </h2>
                              <div className="relative min-h-fit bg-gradient-to-br from-slate-900/40 to-purple-900/40 overflow-hidden rounded-lg border-2 border-yellow-500/60 shadow-lg shadow-yellow-500/20">
                                <div className="relative z-10 p-4 sm:p-6">
                                  {isEditMode && isOwner ? (
                                    <div className="space-y-2">
                                      <textarea
                                        value={bioValue}
                                        onChange={(e) =>
                                          handleBioChange(e.target.value)
                                        }
                                        placeholder="Tell us about yourself... (Max 1000 characters)"
                                        className="w-full px-4 py-3 bg-slate-900/70 text-white rounded border border-yellow-600/40 focus:border-yellow-500 focus:outline-none resize-none"
                                        rows={6}
                                        maxLength={1000}
                                      />
                                      <div className="text-sm text-gray-400">
                                        {bioValue.length}/1000 characters
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="max-h-[200px] overflow-y-auto scrollbar-cardpair">
                                      <p className="text-gray-300 whitespace-pre-wrap text-sm leading-relaxed">
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
                        <CustomDecksList
                          userId={userId}
                          isOwner={isOwner}
                          userRole={profile?.role}
                        />
                      )}

                      {activeTab === "guides" && (
                        <FavoritedGuidesList
                          guides={userGuides || []}
                          showFavoriteButton={false}
                          title={`${profile?.userName || "User"}'s Guides`}
                        />
                      )}

                      {activeTab === "favorites" && (
                        <FavoritedGuidesList
                          guides={favoritedGuidesData?.guides || []}
                          onRemoveFavorite={
                            session?.user?.id === userId
                              ? handleRemoveFavorite
                              : undefined
                          }
                          userRole={profile?.role}
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
                    <div className="relative z-10 bg-gradient-to-br from-purple-950/40 to-slate-900/80 backdrop-blur-sm p-4 sm:p-6 space-y-4 sm:space-y-6 h-full">
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
                              onClick={() =>
                                navigate(`/profile/${userId}/favorites`)
                              }
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
