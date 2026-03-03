import { Helmet } from "react-helmet-async";
import { Navbar } from "../layouts/Navbar";
import { Footer } from "../layouts/Footer";

export const SupportPage = () => {
  return (
    <>
      <Helmet>
        <title>Support Masterduel Counter - Donate via PayPal</title>
        <meta
          name="description"
          content="Support Masterduel Counter development. Donate via PayPal to help keep the project alive and get exclusive benefits like the Support role."
        />
      </Helmet>
      <div className="min-h-screen bg-gradient-to-b flex flex-col">
        <Navbar />

        <main className="flex-1 w-full mx-auto px-4 sm:px-6 lg:px-8 pb-8 pt-3"></main>

        <Footer />
      </div>
    </>
  );
};
