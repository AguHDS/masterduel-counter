import { useState, useEffect, type Dispatch, type SetStateAction } from "react";

export interface NavbarLayoutState {
  isMenuOpen: boolean;
  setIsMenuOpen: Dispatch<SetStateAction<boolean>>;
  isTabletView: boolean;
}

/** Custom hook for managing navbar layout state */
export function useNavbarLayout(): NavbarLayoutState {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isTabletView, setIsTabletView] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setIsTabletView(width >= 640 && width < 1024);
      if (width >= 1024) setIsMenuOpen(false);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return { isMenuOpen, setIsMenuOpen, isTabletView };
}
