import React, { useState } from "react";
import { Link } from "react-router-dom";
import logoImg from "../../../assets/NavbarLogo-optimized.webp";

export const NavbarLogo: React.FC = () => {
  const [showBetaTooltip, setShowBetaTooltip] = useState(false);

  return (
    <div className="absolute ml-1 left-0 top-1/2 -translate-y-1/2 pl-4 sm:pl-6 lg:pl-8">
      <Link
        to="/"
        className="flex items-center space-x-2 sm:space-x-3 hover:opacity-80 transition-opacity flex-shrink-0"
        aria-label="Masterduel Counter Home"
      >
        <img
          src={logoImg}
          alt="Masterduel Counter logo"
          className="h-8 sm:h-9 md:h-10 w-auto"
        />

        <div
          className="relative block"
          onMouseEnter={() => setShowBetaTooltip(true)}
          onMouseLeave={() => setShowBetaTooltip(false)}
        >
          <span className="max-[420px]:hidden min-[640px]:max-[787px]:hidden px-1.5 py-0.5 text-[0.6rem] sm:text-[0.65rem] font-bold bg-gradient-to-r from-blue-600 to-purple-600/70 text-white rounded-full border border-white/20 tracking-wider whitespace-nowrap">
            EARLY ACCESS
          </span>

          {showBetaTooltip && (
            <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 px-3 py-2 bg-[#1f1a24] border border-[#c2901c]/30 rounded-lg shadow-xl whitespace-nowrap z-50 text-xs text-gray-200">
              <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#1f1a24] border-t border-l border-[#c2901c]/30 transform rotate-45" />
              Website is currently in early access. Please report any issues on
              our Discord!
            </div>
          )}
        </div>
      </Link>
    </div>
  );
};
