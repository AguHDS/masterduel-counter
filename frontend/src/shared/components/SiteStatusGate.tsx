import type { ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "@/features/auth";
import {
  useSiteStatus,
  isSiteInMaintenance,
} from "@/features/admin-panel/hooks/useServerManagement";
import { MaintenanceScreen } from "./MaintenanceScreen";
import { Wrench } from "lucide-react";

// Routes that must stay reachable during maintenance so an admin can sign in
const AUTH_ROUTES = ["/signin", "/signup", "/verify-email", "/reset-password"];

interface SiteStatusGateProps {
  children: ReactNode;
}

/**
 * App-wide gate: shows a maintenance screen to regular users while the backend
 * maintenance flag is on. Admins bypass it (with a banner) so they can keep
 * managing the site.
 */
export const SiteStatusGate = ({ children }: SiteStatusGateProps) => {
  const { data: status } = useSiteStatus();
  const { user } = useAuth();
  const { pathname } = useLocation();

  const inMaintenance = isSiteInMaintenance(status);
  const isAdmin = user?.role === "admin";
  const isAuthRoute = AUTH_ROUTES.some((route) => pathname.startsWith(route));

  // On error/unknown (e.g backend restarting) treat as normal, never lock users out
  if (!inMaintenance || status === undefined) {
    return <>{children}</>;
  }

  if (!isAdmin && !isAuthRoute) {
    return <MaintenanceScreen message={status.message} />;
  }

  return (
    <>
      {isAdmin && inMaintenance && (
        <div className="sticky top-0 z-[60] w-full bg-amber-600/90 text-white text-center text-sm font-semibold py-2 px-4">
          <span className="inline-flex items-center gap-2">
            <Wrench className="w-4 h-4" />
            Maintenance mode is active. Regular users see a maintenance screen.
          </span>
        </div>
      )}
      {children}
    </>
  );
};