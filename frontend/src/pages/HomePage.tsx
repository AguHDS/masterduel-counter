import { Navbar } from "../layouts/Navbar";
import { Footer } from "../layouts/Footer";
import { ArchetypeAnalyzerContainer } from "../features/ArchetypeAnalyzer/components/ArchetypeAnalyzerContainer";

export const HomePage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 to-blue-950 flex flex-col">
      <Navbar />

      <main className="flex-1 w-full mx-auto px-4 sm:px-6 lg:px-8 py-8" style={{ maxWidth: '87.5rem' }}>
        <ArchetypeAnalyzerContainer />
      </main>

      <Footer />
    </div>
  );
};
