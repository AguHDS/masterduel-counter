import React from "react";
import { Link } from "react-router-dom";
import logoImg from "../../../assets/NavbarLogo-optimized.webp";

export const NavbarLogo: React.FC = () => {

  return (
    <div className="absolute ml-1 left-0 top-1/2 -translate-y-1/2 pl-4 sm:pl-6 min-[1100px]:pl-8">
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
      </Link>
    </div>
  );
};
