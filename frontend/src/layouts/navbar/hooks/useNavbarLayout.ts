import { useState, useEffect, type Dispatch, type SetStateAction } from "react";

export interface NavbarLayoutState {
  isMenuOpen: boolean;
  setIsMenuOpen: Dispatch<SetStateAction<boolean>>;
}

/** Custom hook for managing navbar layout state */
export function useNavbarLayout(): NavbarLayoutState {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width >= 1024) setIsMenuOpen(false);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return { isMenuOpen, setIsMenuOpen };
}
