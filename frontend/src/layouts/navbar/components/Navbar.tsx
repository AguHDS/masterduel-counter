import { useAuth } from "../../../features/auth";
import { Menu, X } from "lucide-react";
import { useNavbarLayout } from "../hooks/useNavbarLayout";
import { useNavbarRanking } from "../hooks/useNavbarRanking";
import { useNavbarRequests } from "../hooks/useNavbarRequests";
import { NavbarLogo } from "./NavbarLogo";
import { NavbarDesktopNav } from "./NavbarDesktopNav";
import { NavbarTabletNav } from "./NavbarTabletNav";
import { NavbarMobileMenu } from "./NavbarMobileMenu";
import { NavbarModals } from "./NavbarModals";
import logoImg from "../../../assets/NavbarLogo.webp";

export const Navbar = () => {
  const { isAuthenticated, user, logout, isLoading } = useAuth();
  const { isMenuOpen, setIsMenuOpen, isTabletView } = useNavbarLayout();
  const ranking = useNavbarRanking();
  const requests = useNavbarRequests();

  const isAdmin = user?.role === "admin";

  const handleLogout = async () => {
    await logout();
    setIsMenuOpen(false);
  };

  // Cross-hook wired handlers — each toggle closes the other popover
  const handleToggleRanking = (e: React.MouseEvent) => {
    requests.setIsOpen(false);
    ranking.toggle(e);
  };

  const handleToggleRequests = (e: React.MouseEvent) => {
    ranking.setIsOpen(false);
    requests.toggle(e);
  };

  const handleUserClick = (username: string, userId: string) => {
    setIsMenuOpen(false);
    ranking.handleUserClick(username, userId);
  };

  const handleViewFullRanking = () => {
    setIsMenuOpen(false);
    ranking.handleViewFull();
  };

  return (
    <header className="relative top-0 z-[350] bg-[#18121a]/90 border-b-4 border-[#c2901c] shadow-[0_10px_50px_-5px_rgba(0,0,0,0.7)]">
      <nav className="px-4 sm:px-6 lg:px-8 py-4" aria-label="Main navigation">
        <NavbarLogo />

        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            {/* Invisible spacer that mirrors the logo size to keep flex layout balanced */}
            <div className="invisible" aria-hidden="true">
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="h-8 sm:h-9 md:h-10 w-auto opacity-0" />
              </div>
            </div>

            <NavbarDesktopNav
              isLoading={isLoading}
              isAuthenticated={isAuthenticated}
              user={user ?? null}
              isAdmin={!!isAdmin}
              ranking={{
                isOpen: ranking.isOpen,
                onToggle: handleToggleRanking,
                onClose: () => ranking.setIsOpen(false),
                users: ranking.users,
                isLoading: ranking.isLoading,
                onUserClick: handleUserClick,
                onViewFull: handleViewFullRanking,
              }}
              requests={{
                isOpen: requests.isOpen,
                onToggle: handleToggleRequests,
                onClose: () => requests.setIsOpen(false),
                showBadge: requests.showBadge,
                openCount: requests.counts?.OPEN ?? 0,
                showHint: requests.showHint,
                hintExiting: requests.hintExiting,
                onOpenFullModal: () => {
                  requests.setIsOpen(false);
                  requests.setShowFullModal(true);
                },
                onOpenCreate: () => {
                  requests.setIsOpen(false);
                  requests.setShowCreateModal(true);
                },
              }}
              onClosePopovers={() => {
                ranking.setIsOpen(false);
                requests.setIsOpen(false);
              }}
            />

            <NavbarTabletNav
              isLoading={isLoading}
              isAuthenticated={isAuthenticated}
              user={user ?? null}
              isAdmin={!!isAdmin}
              ranking={{
                isOpen: ranking.isOpen,
                onToggle: handleToggleRanking,
                onClose: () => ranking.setIsOpen(false),
                users: ranking.users,
                isLoading: ranking.isLoading,
                onUserClick: handleUserClick,
                onViewFull: handleViewFullRanking,
                alignRight: isTabletView,
              }}
              requests={{
                isOpen: requests.isOpen,
                onToggle: handleToggleRequests,
                onClose: () => requests.setIsOpen(false),
                showBadge: requests.showBadge,
                openCount: requests.counts?.OPEN ?? 0,
                onOpenFullModal: () => {
                  requests.setIsOpen(false);
                  requests.setShowFullModal(true);
                },
                onOpenCreate: () => {
                  requests.setIsOpen(false);
                  requests.setShowCreateModal(true);
                },
              }}
              onClosePopovers={() => {
                ranking.setIsOpen(false);
                requests.setIsOpen(false);
              }}
            />

            {/* Mobile menu toggle */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="sm:hidden p-2 text-[#c2901c] hover:text-[#d4a534] transition-colors"
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </nav>

      <NavbarMobileMenu
        isOpen={isMenuOpen}
        isLoading={isLoading}
        isAuthenticated={isAuthenticated}
        user={user ?? null}
        isAdmin={!!isAdmin}
        onClose={() => setIsMenuOpen(false)}
        onLogout={handleLogout}
        rankingUsers={ranking.users}
        rankingGuides={ranking.guides}
        isLoadingRanking={ranking.isLoading}
        isLoadingGuideRanking={ranking.isGuidesLoading}
        isMobileRankingOpen={ranking.isMobileOpen}
        mobileRankingTab={ranking.mobileTab}
        onToggleMobileRanking={ranking.toggleMobile}
        onSetMobileRankingTab={ranking.setMobileTab}
        onUserClick={handleUserClick}
        onViewFullRanking={handleViewFullRanking}
        getRankStyles={ranking.getRankStyles}
        isMobileRequestsOpen={requests.isMobileOpen}
        onToggleMobileRequests={requests.toggleMobile}
        onOpenCreate={() => {
          requests.setShowCreateModal(true);
          setIsMenuOpen(false);
        }}
        onOpenFullModal={() => {
          requests.setShowFullModal(true);
          setIsMenuOpen(false);
        }}
      />

      <NavbarModals
        isRankingModalOpen={ranking.isModalOpen}
        onCloseRankingModal={() => ranking.setIsModalOpen(false)}
        onRankingUserClick={handleUserClick}
        isFullModalOpen={requests.showFullModal}
        onCloseFullModal={() => requests.setShowFullModal(false)}
        currentUser={user ?? null}
        isCreateModalOpen={requests.showCreateModal}
        onCloseCreateModal={() => requests.setShowCreateModal(false)}
      />
    </header>
  );
};
