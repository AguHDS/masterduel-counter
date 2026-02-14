import { useState } from "react";
import {
  InfoModal,
  AboutContent,
  TermsContent,
  ContactContent,
  SupportContent,
} from "@/shared/components/info";

type ModalType = "about" | "terms" | "contact" | "support" | null;

export const Footer = () => {
  const [openModal, setOpenModal] = useState<ModalType>(null);

  const handleOpenModal = (type: ModalType) => (e: React.MouseEvent) => {
    e.preventDefault();
    setOpenModal(type);
  };

  const handleCloseModal = () => {
    setOpenModal(null);
  };

  return (
    <>
      <footer
        className="mt-8 bg-[#18121a]/90 border-t-4 border-[#c2901c] shadow-[0_-2px_65px_-5px_rgba(0,0,0,0.7)]"
        role="contentinfo"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            <div className="flex items-center space-x-2">
              <span className="font-semibold text-lg text-white">
                Masterduel Counter
              </span>
            </div>

            <nav
              className="flex items-center space-x-6 text-sm"
              aria-label="Footer navigation"
            >
              <button
                onClick={handleOpenModal("about")}
                className="text-blue-400 hover:text-blue-300 transition-colors duration-200"
                aria-label="About Masterduel Counter"
              >
                About
              </button>

              <span className="text-blue-700" aria-hidden="true">
                •
              </span>

              <button
                onClick={handleOpenModal("terms")}
                className="text-blue-400 hover:text-blue-300 transition-colors duration-200"
                aria-label="Terms of Service"
              >
                Terms of Service
              </button>

              <span className="text-blue-700" aria-hidden="true">
                •
              </span>

              <button
                onClick={handleOpenModal("contact")}
                className="text-blue-400 hover:text-blue-300 transition-colors duration-200"
                aria-label="Contact us"
              >
                Contact
              </button>

              <span className="text-blue-700" aria-hidden="true">
                •
              </span>

              <button
                onClick={handleOpenModal("support")}
                className="text-blue-400 hover:text-blue-300 transition-colors duration-200 flex items-center gap-1"
                aria-label="Support us"
              >
                Support us
              </button>
            </nav>

            <p className="text-sm text-blue-500">
              © {new Date().getFullYear()} All rights reserved
            </p>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <InfoModal
        isOpen={openModal === "about"}
        onClose={handleCloseModal}
        title="About Masterduel Counter"
      >
        <AboutContent />
      </InfoModal>

      <InfoModal
        isOpen={openModal === "terms"}
        onClose={handleCloseModal}
        title="Terms of Service & Cookie Policy"
      >
        <TermsContent />
      </InfoModal>

      <InfoModal
        isOpen={openModal === "contact"}
        onClose={handleCloseModal}
        title="Contact Us"
      >
        <ContactContent />
      </InfoModal>

      <InfoModal
        isOpen={openModal === "support"}
        onClose={handleCloseModal}
        title="Support Masterduel Counter"
      >
        <SupportContent />
      </InfoModal>
    </>
  );
};
