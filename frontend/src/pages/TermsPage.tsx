import { Helmet } from "react-helmet-async";
import { Navbar } from "../layouts/navbar/components/Navbar";
import { Footer } from "../layouts/Footer";
import { TermsContent } from "../shared/components/info";

export const TermsPage = () => {
  return (
    <>
      <Helmet>
        <title>Terms of Service - Masterduel Counter</title>
        <meta
          name="description"
          content="Terms of Service for Masterduel Counter, the community platform for creating and discovering Yu-Gi-Oh! archetype counter guides and deck guides."
        />
      </Helmet>
      <div className="min-h-screen bg-gradient-to-b flex flex-col">
        <Navbar />

        <main className="flex-1 w-full mx-auto px-4 sm:px-6 lg:px-8 pb-8 pt-6">
          <div className="max-w-4xl mx-auto bg-gradient-to-br from-slate-800 via-slate-900 to-blue-950 rounded-2xl shadow-2xl border-2 border-blue-500/40 p-6 sm:p-8">
            <TermsContent />
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};