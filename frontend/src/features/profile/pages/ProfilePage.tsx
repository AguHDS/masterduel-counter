import { useParams, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Navbar } from "@/layouts/Navbar";
import { Footer } from "@/layouts/Footer";
import { UserInstancesList } from "../components/UserInstancesList";

export const ProfilePage = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();

  const handleSelectArchetype = (archetypeId: number, userId: string | null) => {
    if (userId) {
      navigate(`/archetype/${archetypeId}/instance/${userId}`);
    } else {
      navigate(`/archetype/${archetypeId}`);
    }
  };

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

  return (
    <>
      <Helmet>
        <title>User Profile - Masterduel Counter</title>
      </Helmet>
      <div className="min-h-screen bg-gradient-to-b from-slate-950 to-blue-950 flex flex-col">
        <Navbar />
        <main className="flex-1 w-full mx-auto px-4 sm:px-6 lg:px-8 py-8" style={{ maxWidth: '87.5rem' }} role="main" aria-label="Main content">
          <div 
            className="bg-gradient-to-br from-blue-900 to-slate-900 shadow-2xl border-t border-b border-blue-700 overflow-hidden flex flex-col min-h-[600px] relative" 
            style={{ 
              boxShadow: '0 -20px 40px -20px rgba(0, 0, 0, 0.5), 0 20px 40px -20px rgba(0, 0, 0, 0.5)' 
            }}
          >
            <UserInstancesList userId={userId} onSelectArchetype={handleSelectArchetype} />
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
};
