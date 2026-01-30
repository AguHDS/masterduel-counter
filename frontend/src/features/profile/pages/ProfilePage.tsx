import { useParams, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/layouts/Navbar";
import { Footer } from "@/layouts/Footer";
import { UserInstancesList } from "../components/UserInstancesList";
import { profileApi } from "../api/profileApi";
import { useProfileEditor } from "../hooks/useProfileEditor";
import { useSession } from "@/lib/auth-client";
import { useRef } from "react";

export const ProfilePage = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { data: session } = useSession();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: profileData } = useQuery({
    queryKey: ["profile", userId],
    queryFn: () => profileApi.getProfile(userId!),
    enabled: !!userId,
  });

  const {
    isEditMode,
    bioValue,
    selectedFile,
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

  const handleSelectArchetype = (archetypeId: number, instanceId: number) => {
    navigate(`/archetype/${archetypeId}/instance/${instanceId}`);
  };

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

  return (
    <>
      <Helmet>
        <title>User Profile - Masterduel Counter</title>
      </Helmet>
      <div className="min-h-screen bg-gradient-to-b from-slate-950 to-blue-950 flex flex-col">
        <Navbar />
        <main className="flex-1 w-full mx-auto px-4 sm:px-6 lg:px-8 py-8" style={{ maxWidth: '87.5rem' }} role="main" aria-label="Main content">
          <section className="w-full relative flex justify-center">
            <div className="relative w-full max-w-[1120px] rounded-[28px] p-[3px] bg-gradient-to-br from-[#ffa94d] via-[#ff7e29] to-[#ffce6d] shadow-[0_-20px_40px_-20px_rgba(0,0,0,0.5),0_20px_40px_-20px_rgba(0,0,0,0.5)]">
              <div className="relative flex flex-col w-full min-h-[600px] rounded-[24px] overflow-hidden bg-gradient-to-br from-[#030717] via-[#0a0f2c] to-[#1a1743] py-10 sm:py-12 px-4 sm:px-6 lg:px-10">
                {/* Profile Section */}
                <div className="pb-8 border-b border-blue-700/50">
              <div className="flex items-start gap-8">
                {/* Profile Picture */}
                <div className="flex-shrink-0">
                  <div className="relative">
                    <div className="w-48 h-52 overflow-hidden bg-slate-800 border-2 border-[#4d77ff] rounded">
                      {displayPhotoUrl ? (
                        <img 
                          src={displayPhotoUrl} 
                          alt={`${userId}'s profile`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-blue-300 text-5xl font-bold">
                          {userId.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    {isEditMode && isOwner && (
                      <div className="mt-4 space-y-2">
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleFileInputChange}
                          className="hidden"
                        />
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="w-full px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors"
                          disabled={isSaving}
                        >
                          Choose Photo
                        </button>
                        {profile?.profilePictureUrl && (
                          <button
                            onClick={handleDeletePhoto}
                            disabled={isDeletingPhoto || isSaving}
                            className="w-full px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-sm rounded transition-colors disabled:opacity-50"
                          >
                            {isDeletingPhoto ? "Deleting..." : "Delete"}
                          </button>
                        )}
                        {selectedFile && (
                          <div className="text-xs text-gray-400 text-center">
                            Max 3MB
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* User Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-4">
                    <h1 className="text-3xl font-bold text-white">{profile?.userName || userId}</h1>
                    {isOwner && !isEditMode && (
                      <button
                        onClick={() => toggleEditMode(profile?.bio || "")}
                        className="text-blue-400 hover:text-blue-300 font-medium transition-colors text-sm ml-4 flex-shrink-0"
                      >
                        Edit Profile
                      </button>
                    )}
                    {isOwner && isEditMode && (
                      <div className="flex gap-3 ml-4 flex-shrink-0">
                        <button
                          onClick={handleSaveChanges}
                          disabled={isSaving}
                          className="text-blue-400 hover:text-blue-300 font-medium transition-colors disabled:opacity-50"
                        >
                          {isSaving ? "Saving..." : "Save"}
                        </button>
                        <button
                          onClick={cancelEdit}
                          disabled={isSaving}
                          className="text-blue-400 hover:text-blue-300 font-medium transition-colors disabled:opacity-50"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Bio Section */}
                  <div className="mt-4">
                    <label className="text-blue-400 font-semibold text-sm mb-2 block">Bio</label>
                    {isEditMode && isOwner ? (
                      <div className="space-y-2">
                        <textarea
                          value={bioValue}
                          onChange={(e) => handleBioChange(e.target.value)}
                          placeholder="Tell us about yourself... (Max 1000 characters)"
                          className="w-full px-4 py-3 bg-slate-800 text-white rounded border border-blue-700/50 focus:border-blue-500 focus:outline-none resize-none"
                          rows={4}
                          maxLength={1000}
                        />
                        <div className="text-sm text-gray-400">
                          {bioValue.length}/1000 characters
                        </div>
                      </div>
                    ) : (
                      <div className="border-l-2 border-r-2 border-blue-700/30 bg-slate-700/40 px-4 py-3 rounded overflow-hidden">
                        <p className="text-gray-300 whitespace-pre-wrap break-words word-wrap" style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}>
                          {profile?.bio || (isOwner ? "No bio available" : "No bio yet.")}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                </div>
              </div>

              {/* Archetype Instances Section */}
              <div className="pt-8">
                <UserInstancesList userId={userId} onSelectArchetype={handleSelectArchetype} />
              </div>
            </div>
          </div>
        </section>
        </main>
        <Footer />
      </div>
    </>
  );
};
