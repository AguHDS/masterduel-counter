import { useParams, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useQuery } from "@tanstack/react-query";
import { Flag, Edit } from "lucide-react";
import { Navbar } from "@/layouts/Navbar";
import { Footer } from "@/layouts/Footer";
import { FullScreenGuidesModal } from "../components/UserInstancesList";
import { profileApi } from "../api/profileApi";
import { useProfileEditor } from "../hooks/useProfileEditor";
import { useSession } from "@/lib/auth-client";
import { FeatureErrorBoundary } from "@/shared/components";
import { ReportModal } from "@/features/report/components/ReportModal";
import { useRef, useState, useCallback } from "react";
import { instanceApi } from "@/lib/http/instanceApi";
import background_button from "@/assets/MDC-button-background.webp";
import background_profile from "@/assets/MDC-profile_background.webp";
import border_profile from "@/assets/MDC-border.webp";

type TabType = "perfil" | "decks" | "guides" | "favoritos";

export const ProfilePage = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { data: session } = useSession();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>("perfil");
  const [showFullGuides, setShowFullGuides] = useState(false);

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

  const profile = profileData?.profile;
  const displayPhotoUrl = previewUrl || profile?.profilePictureUrl;

  const counterDecks = [
    {
      id: 1,
      name: "Anti-Branded",
      img: "https://images.pexels.com/photos/956981/milky-way-starry-sky-night-sky-star-956981.jpeg?auto=compress&cs=tinysrgb&w=100",
    },
    {
      id: 2,
      name: "Anti-Mitsurugi",
      img: "https://images.pexels.com/photos/1103970/pexels-photo-1103970.jpeg?auto=compress&cs=tinysrgb&w=100",
    },
    {
      id: 3,
      name: "Anti-Yummy",
      img: "https://images.pexels.com/photos/2156881/pexels-photo-2156881.jpeg?auto=compress&cs=tinysrgb&w=100",
    },
  ];

  const favoriteCards = [
    "https://images.pexels.com/photos/39853/woman-girl-freedom-happy-39853.jpeg?auto=compress&cs=tinysrgb&w=200",
  ];

  const favoriteDecks = [
    {
      id: 1,
      name: "Mathmech",
      img: "https://images.pexels.com/photos/956981/milky-way-starry-sky-night-sky-star-956981.jpeg?auto=compress&cs=tinysrgb&w=200",
    },
    {
      id: 2,
      name: "Endimion",
      img: "https://images.pexels.com/photos/1103970/pexels-photo-1103970.jpeg?auto=compress&cs=tinysrgb&w=200",
    },
    {
      id: 3,
      name: "Tearlament",
      img: "https://images.pexels.com/photos/2156881/pexels-photo-2156881.jpeg?auto=compress&cs=tinysrgb&w=200",
    },
  ];

  return (
    <>
      <Helmet>
        <title>{profile?.userName || "User"} - Profile</title>
      </Helmet>

      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-purple-950/20 to-slate-950 flex flex-col">
        <Navbar />

        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-8">
          <FeatureErrorBoundary featureName="Profile">
            <div className="max-w-[1600px] mx-auto">
              <div className="flex gap-6 items-stretch">
                {/* Left Sidebar - con fondo background_profile - altura fija */}
                <aside className="w-[350px] flex-shrink-0 sticky top-8">
                  <div className="relative overflow-hidden rounded-lg border-2 border-yellow-600/40 h-[800px]">
                    <img
                      src={background_profile}
                      alt=""
                      aria-hidden="true"
                      className="absolute inset-0 w-full h-full object-cover opacity-70"
                    />
                    <div className="relative z-10 bg-gradient-to-br from-purple-950/40 to-slate-900/60 backdrop-blur-sm p-12 pt-6 space-y-6 h-full overflow-y-auto">
                      {/* Nombre de usuario arriba de la foto */}
                      <div className="text-center mb-2">
                        <h1 className="text-2xl font-bold text-yellow-400">
                          {profile?.userName || userId}
                        </h1>
                      </div>

                      <div className="relative">
                        <div className="absolute -inset-2 bg-gradient-to-br from-yellow-600/20 to-amber-600/20 rounded-lg blur-sm"></div>
                        <div
                          className="relative rounded-lg overflow-hidden bg-slate-900/80"
                          style={{
                            borderImage: `url(${border_profile}) 20 stretch`,
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

                      <div className="border-t border-yellow-600/30 pt-4">
                        <div className="flex items-baseline gap-2">
                          <span className="text-amber-200 font-semibold">
                            Likes:
                          </span>
                          <span className="text-1xl font-bold text-green-500">
                            {profile?.totalLikes ?? 0}
                          </span>
                        </div>
                        <div className="flex items-baseline gap-2">
                          <span className="text-amber-200 font-semibold">
                            Guide Views:
                          </span>
                          <span className="text-1xl font-semibold text-amber-400">
                            12,44
                          </span>
                        </div>
                        <div className="flex items-baseline gap-2">
                          <span className="text-amber-200 font-semibold">
                            Role:
                          </span>

                          <span
                            className={`text-1xl font-bold ${
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

                <div className="flex-1">
                  <div className="flex items-center justify-between gap-4 mb-4">
                    {!isOwner && session && (
                      <button
                        onClick={() => setIsReportModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-red-950/60 hover:bg-red-950/90 text-white rounded transition-colors"
                      >
                        <Flag className="w-4 h-4" />
                        <span>Report</span>
                      </button>
                    )}
                  </div>

                  {/* Botones de pestañas - alineados a los extremos */}
                  <div className="flex justify-between items-center">
                    {/* Botones izquierdos */}
                    <div className="flex gap-2">
                      {[
                        { id: "perfil", label: "Profile" },
                        { id: "decks", label: "My decks" },
                        { id: "guides", label: "Guides" },
                        { id: "favoritos", label: "Favorites" },
                      ].map((tab) => (
                        <button
                          key={tab.id}
                          onClick={() => setActiveTab(tab.id as TabType)}
                          className={`px-8 py-[11px] text-md font-bold transition-all relative overflow-hidden rounded border-2 ${
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

                    {/* Edit Profile Button */}
                    {isOwner && (
                      <button
                        onClick={() =>
                          !isEditMode && toggleEditMode(profile?.bio || "")
                        }
                        className="flex items-center gap-2 py-[11px] px-5 bg-yellow-600/80 hover:bg-yellow-600 text-white rounded transition-colors border border-yellow-500"
                      >
                        <Edit className="w-4 h-4" />
                        <span>Edit Profile</span>
                      </button>
                    )}
                  </div>

                  {/* Contenedor principal - altura fija para igualar con los sidebars */}
                  <div className="bg-gradient-to-br relative mt-1 from-purple-950/40 to-slate-900/60 backdrop-blur-sm rounded-lg border-2 border-yellow-600/40 overflow-hidden h-[730px]">
                    <img
                      src={background_profile}
                      alt=""
                      aria-hidden="true"
                      className="absolute inset-0 w-full h-full object-cover opacity-30 -z-10"
                    />
                    <div className="p-8 h-full overflow-y-auto relative z-10">
                      {activeTab === "perfil" && (
                        <div className="space-y-12">
                          <div className="flex gap-8">
                            {/* Bio*/}
                            <div className="flex-1">
                              <h2 className="text-yellow-500 font-bold text-lg mb-1">
                                Bio
                              </h2>
                              <div className="relative bg-purple-950/40 overflow-hidden  rounded-lg border border-yellow-600/30">
                                <div className="relative z-10 p-6">
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
                                      <div className="flex gap-3">
                                        <button
                                          onClick={handleSaveChanges}
                                          disabled={isSaving}
                                          className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded transition-colors disabled:opacity-50"
                                        >
                                          {isSaving ? "Saving..." : "Save"}
                                        </button>
                                        <button
                                          onClick={cancelEdit}
                                          disabled={isSaving}
                                          className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded transition-colors disabled:opacity-50"
                                        >
                                          Cancel
                                        </button>
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="min-h-[200px]">
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

                            <div className="w-auto">
                              <h2 className="text-yellow-500 text-center font-bold text-lg mb-4">
                                Favorite Card
                              </h2>
                              {favoriteCards.map((card, idx) => (
                                <div
                                  key={idx}
                                  className="relative group cursor-pointer"
                                >
                                  <div className="absolute -inset-1 bg-gradient-to-br from-yellow-600/30 to-amber-600/30 rounded blur opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                  <div
                                    className="relative rounded overflow-hidden"
                                    style={{
                                      borderImage: `url(${border_profile}) 20 stretch`,
                                      borderWidth: "10px",
                                    }}
                                  >
                                    <img
                                      src={card}
                                      alt="Favorite card"
                                      className="w-40 h-56 object-cover"
                                    />
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {!isEditMode && (
                            <>
                              <div>
                                <h2 className="text-yellow-500 font-bold text-lg mb-4">
                                  Favorite Decks
                                </h2>
                                <div className="flex gap-24">
                                  {favoriteDecks.map((deck) => (
                                    <div
                                      key={deck.id}
                                      className="relative group cursor-pointer"
                                    >
                                      <div className="absolute -inset-1 bg-gradient-to-br from-yellow-600/30 to-amber-600/30 rounded blur opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                      <div
                                        className="relative rounded-lg overflow-hidden"
                                        style={{
                                          borderImage: `url(${border_profile}) 20 stretch`,
                                          borderWidth: "10px",
                                        }}
                                      >
                                        <img
                                          src={deck.img}
                                          alt={deck.name}
                                          className="w-48 h-32 object-cover"
                                        />
                                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
                                          <p className="text-white font-bold text-center text-lg">
                                            {deck.name}
                                          </p>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                      )}

                      {activeTab === "decks" && (
                        <div className="text-center text-gray-400 py-20">
                          <p className="text-lg">
                            Deck management coming soon...
                          </p>
                        </div>
                      )}

                      {activeTab === "guides" && (
                        <div className="text-center text-gray-400 py-20">
                          <p className="text-lg">Guides coming soon...</p>
                        </div>
                      )}

                      {activeTab === "favoritos" && (
                        <div className="text-center text-gray-400 py-20">
                          <p className="text-lg">
                            Favorites management coming soon...
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Sidebar - con fondo background_profile - altura fija */}
                <aside className="w-[320px] flex-shrink-0 sticky top-8">
                  <div className="relative overflow-hidden rounded-lg border-2 border-yellow-600/40 h-[800px]">
                    <img
                      src={background_profile}
                      alt=""
                      aria-hidden="true"
                      className="absolute inset-0 w-full h-full object-cover opacity-70"
                    />
                    <div className="relative z-10 bg-gradient-to-br from-purple-950/40 to-slate-900/60 backdrop-blur-sm p-6 space-y-6 h-full overflow-y-auto">
                      <div className="space-y-3">
                        <h3 className="text-yellow-500 font-bold text-sm flex items-center gap-2 mt-1">
                          <span className="text-lg">♦</span> Favorite Guides
                        </h3>
                        <div className="space-y-2">
                          {counterDecks.map((deck) => (
                            <div
                              key={deck.id}
                              className="flex items-center gap-3 p-2 bg-purple-950/30 rounded hover:bg-purple-950/50 transition-colors cursor-pointer"
                            >
                              <img
                                src={deck.img}
                                alt={deck.name}
                                className="w-10 h-10 rounded object-cover border border-yellow-600/30"
                              />
                              <span className="text-amber-200 text-sm">
                                {deck.name}
                              </span>
                            </div>
                          ))}
                        </div>

                        <button className="w-full hover:text-yellow-400 text-yellow-500 font-semibold rounded transition-colors">
                          View all ({counterDecks.length})
                        </button>
                      </div>
                      <div>
                        <h3 className="text-yellow-500 font-bold mb-3  border-t border-yellow-600/30 pt-6">
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
                              <img
                                src="https://images.pexels.com/photos/956981/milky-way-starry-sky-night-sky-star-956981.jpeg?auto=compress&cs=tinysrgb&w=50"
                                alt=""
                                className="w-8 h-8 rounded object-cover border border-yellow-600/30"
                              />
                              <span className="text-amber-200 text-sm flex-1 truncate">
                                {guide.archetypeName}
                              </span>
                            </div>
                          ))}
                        </div>
                        {userGuides && userGuides.length > 0 && (
                          <button
                            onClick={() => setShowFullGuides(true)}
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

      {showFullGuides && (
        <FullScreenGuidesModal
          userId={userId}
          onClose={() => setShowFullGuides(false)}
          onSelectArchetype={handleSelectArchetype}
        />
      )}

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
