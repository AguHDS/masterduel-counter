import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/layouts/navbar/components/Navbar";
import { Footer } from "@/layouts/Footer";
import { FavoriteDecksEditor } from "../components/FavoriteDecksEditor";
import { ProfileGuideList } from "../components/ProfileGuideList";
import { PersonalDeckList } from "../components/PersonalDeckList";
import { ProfileLeftSidebar } from "../components/ProfileLeftSidebar";
import { ProfilePictureCropperModal } from "../components/ProfilePictureCropperModal";
import { ProfileTabBar } from "../components/ProfileTabBar";
import { ProfileRightSidebar } from "../components/ProfileRightSidebar";
import { profileApi } from "../api/profileApi";
import { useProfileEditor } from "../hooks/useProfileEditor";
import {
  normalizeFavoriteDeckSlots,
  useFavoriteCardAndDecks,
} from "../hooks/useFavoriteCardAndDecks";
import { useCustomDecks } from "../hooks/useCustomDecks";
import { useSession } from "@/lib/auth-client";
import { useUserTrendingAchievements } from "@/features/ranking/hooks/useRanking";
import { FeatureErrorBoundary } from "@/shared/components";
import { ReportModal } from "@/features/report/components/ReportModal";
import { useState, useCallback, useEffect } from "react";
import {
  guideInstancesApi,
  type GuideListItem,
} from "@/lib/http/guideInstancesApi";
import { buildGuidePath, buildProfilePath } from "@/lib/config/urlHelpers";
import profile_background from "@/assets/Profile_Backgroundnew.webp";
import { useCanonicalPathRedirect } from "@/shared/hooks/useCanonicalPathRedirect";
import type { TabType } from "../types/profileTypes";
import type { Card } from "@/features/archetypes/types";

export const ProfilePage = () => {
  const { userId, tab } = useParams<{ userId: string; tab?: string }>();
  const navigate = useNavigate();
  const { data: session } = useSession();
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [autoSelectDeckId, setAutoSelectDeckId] = useState<number | null>(null);

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

  const profile = profileData?.profile;
  const resolvedUserId = profile?.userId ?? "";

  const canonicalPath =
    profile?.userName && resolvedUserId
      ? buildProfilePath({
          userName: profile.userName,
          userId: resolvedUserId,
          tab: tab && tab !== "profile" ? tab : undefined,
        })
      : null;

  useCanonicalPathRedirect(canonicalPath);

  const { data: userGuides } = useQuery({
    queryKey: ["userInstances", resolvedUserId],
    queryFn: () => profileApi.getGuidesByUserId(resolvedUserId, "likes"),
    enabled: !!resolvedUserId,
  });
  const { data: favoritedGuidesData, refetch: refetchFavoritedGuides } =
    useQuery({
      queryKey: ["favoritedGuides", resolvedUserId],
      queryFn: () => profileApi.getFavoritedGuides(resolvedUserId),
      enabled: !!resolvedUserId,
    });

  const {
    decks: customDecks,
    isLoading: isCustomDecksLoading,
    isFetched: isCustomDecksFetched,
  } = useCustomDecks(resolvedUserId);
  const {
    isEditMode,
    bioValue,
    previewUrl,
    selectedFile,
    fileError,
    isSaving,
    isDeletingPhoto,
    isCropperOpen,
    cropImageSrc,
    handleFileSelect,
    handleCropConfirm,
    handleCropCancel,
    handleBioChange,
    handleSaveChanges,
    handleDeletePhoto,
    toggleEditMode,
    cancelEdit,
  } = useProfileEditor(resolvedUserId);

  // Get profile data
  const totalViews = profileData?.totalViews ?? 0;
  const userRank = profileData?.rank;

  // Use favoriteCardAndDecks hook
  const {
    favoriteCardId,
    favoriteCardCropped,
    setFavoriteCardCropped,
    favoriteDecks,
    setFavoriteCardId,
    setFavoriteDecks,
    saveFavoriteCardAndDecks,
    isSaving: isSavingFavorites,
  } = useFavoriteCardAndDecks(resolvedUserId, profile);

  // Fetch trending achievements
  const { data: trendingAchievementsData } = useUserTrendingAchievements(resolvedUserId);
  const trendingAchievements = trendingAchievementsData?.achievements ?? [];

  const getProfilePath = useCallback(
    (nextTab?: string) => {
      return buildProfilePath({
        userName: profile?.userName,
        profileId: profile?.id,
        userId: resolvedUserId || userId,
        tab: nextTab,
      });
    },
    [profile?.id, profile?.userName, resolvedUserId, userId],
  );

  const handleSelectGuide = useCallback(
    (guide: GuideListItem) => {
      navigate(
        buildGuidePath({
          guideId: guide.id,
          archetypeId: guide.archetypeId,
          archetypeName: guide.archetypeName,
          userName: guide.userName,
          guideType: guide.guideType,
        }),
      );
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
    navigate(getProfilePath("guides"));
  };

  const handleFavoriteCardSelect = (card: Card) => {
    setFavoriteCardId(card.id);
  };

  const handleFavoriteDecksUpdate = (decks: typeof favoriteDecks) => {
    setFavoriteDecks(decks);
  };

  const handleRemoveFavorite = async (guideId: number, archetypeId: number) => {
    try {
      await guideInstancesApi.toggleFavoriteGuide(archetypeId, guideId);
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
      setFavoriteCardCropped(profile.favoriteCardCropped ?? false);
      if (profile.favoriteDecks) {
        try {
          const decks = JSON.parse(profile.favoriteDecks) as unknown;
          setFavoriteDecks(normalizeFavoriteDeckSlots(decks));
        } catch {
          setFavoriteDecks([null, null, null, null, null, null]);
        }
      } else {
        setFavoriteDecks([null, null, null, null, null, null]);
      }
    }
  }, [cancelEdit, profile, setFavoriteCardId, setFavoriteCardCropped, setFavoriteDecks]);

  const handleSaveProfile = async () => {
    try {
      // Save favorites and bio/photo in parallel
      await Promise.all([saveFavoriteCardAndDecks(), handleSaveChanges()]);
    } catch (error) {
      console.error("Error saving profile:", error);
    }
  };

  const handleTabClick = useCallback(
    (tabId: TabType) => {
      const tabToPath: Record<TabType, string | undefined> = {
        profile: undefined,
        decks: "my-decks",
        guides: "guides",
        favorites: "favorites",
      };
      navigate(getProfilePath(tabToPath[tabId]));
    },
    [navigate, getProfilePath],
  );

  const onGuideClick = useCallback(
    (guideId: number) => {
      const guide = userGuides?.find((g: GuideListItem) => g.id === guideId);
      if (guide) {
        navigate(
          buildGuidePath({
            guideId: guide.id,
            archetypeId: guide.archetypeId,
            archetypeName: guide.archetypeName,
            userName: guide.userName,
            guideType: guide.guideType,
          }),
        );
      }
    },
    [navigate, userGuides],
  );

  const isOwner = !!resolvedUserId && session?.user?.id === resolvedUserId;

  useEffect(() => {
    if (!userId) {
      document.title = "Profile - Masterduel Counter";
      return;
    }
    document.title = profile?.userName
      ? `${profile.userName} - Masterduel Counter`
      : "User - Masterduel Counter";
  }, [userId, profile?.userName]);

  if (!userId) {
    return (
      <div
          className="min-h-screen bg-gradient-to-b from-slate-950 to-blue-950 flex flex-col"
          style={{
            backgroundImage: `url(${profile_background})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundAttachment: "fixed",
          }}
        >
          <Navbar />
          <main className="flex-1 flex items-center justify-center">
            <div className="text-red-400 text-xl">User ID not provided</div>
          </main>
          <Footer />
        </div>
    );
  }

  const displayPhotoUrl = previewUrl || profile?.profilePictureUrl;
  const totalCreatedGuides = userGuides?.length ?? 0;
  const totalFavoritedGuides = favoritedGuidesData?.guides.length ?? 0;

  const tabs = [
    { id: "profile" as TabType, label: "Profile" },
    {
      id: "decks" as TabType,
      label: `My Decks (${customDecks?.length ?? 0})`,
    },
    {
      id: "guides" as TabType,
      label: `Guides (${totalCreatedGuides})`,
    },
    {
      id: "favorites" as TabType,
      label: `Favorites (${totalFavoritedGuides})`,
    },
  ];

  return (
    <>
      <div
        className="min-h-screen flex flex-col"
        style={{
          backgroundImage: `url(${profile_background})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed",
        }}
      >
        <Navbar />

        <main className="flex-1 px-2 sm:px-4 lg:px-8 py-4 sm:py-8">
          <FeatureErrorBoundary featureName="Profile">
            <div className="max-w-[1600px] mx-auto">
              <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 items-stretch">
                {/* Left Sidebar */}
                <ProfileLeftSidebar
                  profile={profile}
                  isEditMode={isEditMode}
                  isOwner={isOwner}
                  isSaving={isSaving}
                  isDeletingPhoto={isDeletingPhoto}
                  selectedFile={selectedFile}
                  fileError={fileError}
                  previewUrl={previewUrl}
                  displayPhotoUrl={displayPhotoUrl}
                  userRank={userRank}
                  totalViews={totalViews}
                  fulfilledRequestsCount={profileData?.fulfilledRequestsCount}
                  userGuides={userGuides}
                  onSelectGuide={handleSelectGuide}
                  onViewAllGuides={handleViewAllGuides}
                  onFileInputChange={handleFileInputChange}
                  onDeletePhoto={handleDeletePhoto}
                />

                <div className="flex-1 min-w-0">
                  {/* Main Content Container */}
                  <div
                    className="relative rounded-lg border-2 border-yellow-600/50 h-auto lg:h-[800px] flex flex-col overflow-hidden"
                    style={{ background: 'radial-gradient(ellipse at 50% 25%, #1a1235 0%, #08061a 65%)' }}
                  >
                    <div className="absolute top-0 left-0 w-5 h-5 border-t-2 border-l-2 border-yellow-500/50 rounded-tl-lg z-20 pointer-events-none" />
                    <div className="absolute top-0 right-0 w-5 h-5 border-t-2 border-r-2 border-yellow-500/50 rounded-tr-lg z-20 pointer-events-none" />
                    <div className="absolute bottom-0 left-0 w-5 h-5 border-b-2 border-l-2 border-yellow-500/50 rounded-bl-lg z-20 pointer-events-none" />
                    <div className="absolute bottom-0 right-0 w-5 h-5 border-b-2 border-r-2 border-yellow-500/50 rounded-br-lg z-20 pointer-events-none" />

                    <ProfileTabBar
                      tabs={tabs}
                      activeTab={activeTab}
                      onTabChange={handleTabClick}
                      isOwner={isOwner}
                      hasSession={!!session}
                      isEditMode={isEditMode}
                      isSaving={isSaving}
                      isSavingFavorites={isSavingFavorites}
                      fileError={fileError}
                      onEditClick={() => toggleEditMode(profile?.bio || "")}
                      onSave={handleSaveProfile}
                      onCancel={handleCancelEdit}
                      onReportClick={() => setIsReportModalOpen(true)}
                    />

                    <div className="flex-1 p-4 sm:p-6 overflow-auto scrollbar-cardpair relative">
                      {activeTab === "profile" && (
                        <div className="space-y-8 sm:space-y-12">
                          {/* Bio */}
                          <div>
                            <div
                              className="relative overflow-hidden rounded-lg border border-yellow-600/30"
                              style={{ background: 'radial-gradient(ellipse at 50% 0%, #1e1640 0%, #09071d 70%)' }}
                            >
                              {/* Bio header */}
                              <div className="px-5 pt-4 pb-3">
                                <div className="flex items-center gap-2">
                                  <div className="flex-1 h-px bg-gradient-to-r from-transparent to-yellow-600/40" />
                                  <span className="text-yellow-500/55 text-[9px]">◆</span>
                                  <h3 className="text-yellow-400 font-bold text-[11px] tracking-[0.22em] uppercase px-1">Bio</h3>
                                  <span className="text-yellow-500/55 text-[9px]">◆</span>
                                  <div className="flex-1 h-px bg-gradient-to-l from-transparent to-yellow-600/40" />
                                </div>
                              </div>
                              {/* Bio content */}
                              <div className="px-6 pb-5">
                                {isEditMode && isOwner ? (
                                  <div className="space-y-2">
                                    <textarea
                                      value={bioValue}
                                      onChange={(e) =>
                                        handleBioChange(e.target.value)
                                      }
                                      placeholder="Tell us about yourself... (Max 1000 characters)"
                                      className="w-full px-4 py-3 bg-[#06040f]/70 text-white/90 rounded border border-yellow-600/30 focus:border-yellow-500/60 focus:outline-none resize-none text-sm leading-relaxed placeholder:text-slate-600"
                                      rows={4}
                                      maxLength={1000}
                                    />
                                    <div className="text-right text-xs text-slate-500">
                                      {bioValue.length}/1000
                                    </div>
                                  </div>
                                ) : (
                                  <div className="overflow-y-auto scrollbar-cardpair min-h-[2.5rem] flex items-center justify-center">
                                    <p className="text-gray-300/80 whitespace-pre-wrap text-sm leading-relaxed text-center italic">
                                      {profile?.bio ||
                                        (isOwner
                                          ? "No bio available.."
                                          : "No bio yet.")}
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Favorite Decks */}
                          <FavoriteDecksEditor
                            favoriteDecks={favoriteDecks}
                            isEditMode={isEditMode && isOwner}
                            onDecksUpdate={handleFavoriteDecksUpdate}
                            customDecks={customDecks || []}
                            isCustomDecksLoaded={
                              isCustomDecksFetched && !isCustomDecksLoading
                            }
                            onNavigateToDecks={() => {
                              cancelEdit();
                              navigate(getProfilePath("my-decks"));
                            }}
                            onDeckClick={(deckId) => {
                              setAutoSelectDeckId(deckId);
                              navigate(getProfilePath("my-decks"));
                            }}
                          />
                        </div>
                      )}

                      {activeTab === "decks" && (
                        <PersonalDeckList
                          userId={resolvedUserId}
                          isOwner={isOwner}
                          userRole={profile?.role}
                          initialSelectedDeckId={autoSelectDeckId}
                          onDeckOpened={() => setAutoSelectDeckId(null)}
                        />
                      )}

                      {activeTab === "guides" && (
                        <ProfileGuideList
                          guides={userGuides || []}
                          showFavoriteButton={false}
                          title={`${profile?.userName || "User"}'s Guides (${totalCreatedGuides})`}
                          searchPlaceholder="Search guides..."
                        />
                      )}

                      {activeTab === "favorites" && (
                        <ProfileGuideList
                          guides={favoritedGuidesData?.guides || []}
                          onRemoveFavorite={
                            session?.user?.id === resolvedUserId
                              ? handleRemoveFavorite
                              : undefined
                          }
                          userRole={profile?.role}
                          title={`Favorite Guides (${totalFavoritedGuides})`}
                        />
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Sidebar */}
                <ProfileRightSidebar
                  favoriteCardId={favoriteCardId}
                  favoriteCardCropped={favoriteCardCropped}
                  isEditMode={isEditMode}
                  isOwner={isOwner}
                  onCardSelect={handleFavoriteCardSelect}
                  onCroppedToggle={() => setFavoriteCardCropped(!favoriteCardCropped)}
                  trendingAchievements={trendingAchievements}
                  profilePictureUrl={profile?.profilePictureUrl ?? undefined}
                  userName={profile?.userName}
                  onGuideClick={onGuideClick}
                />
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
          targetId={resolvedUserId || userId}
          targetName={profile?.userName || userId}
        />
      )}

      <ProfilePictureCropperModal
        open={isCropperOpen}
        imageSrc={cropImageSrc}
        onConfirm={handleCropConfirm}
        onCancel={handleCropCancel}
      />
    </>
  );
};
