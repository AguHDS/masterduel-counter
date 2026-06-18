import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./features/auth";
import { NotificationProvider } from "./features/notifications";
import { HomePage } from "./pages/HomePage";
import { SignInPage } from "./pages/SignInPage";
import { SignUpPage } from "./pages/SignUpPage";
import { ProfilePage } from "./features/profile/pages/ProfilePage";
import { AllGuidesListPage } from "./features/guides-instances";
import { GuideContainerPage } from "./features/guide-editor";
import { VerifyEmailPage } from "./pages/VerifyEmailPage";
import { ResetPasswordPage } from "./pages/ResetPasswordPage";
import { AdminPanelPage } from "./features/admin-panel/pages/AdminPanelPage";
import { ConfigurationPage } from "./features/configuration";
import { ProtectedRoute } from "./shared/components/ProtectedRoute";
import NotFound from "./shared/components/NotFound";
import { LegacyArchetypeRedirect } from "./shared/components/LegacyArchetypeRedirect";
import { SupportPage } from "./pages/SupportPage";
import { useAnalyticsPageTracking } from "./shared/hooks/useAnalyticsPageTracking";
import { CardsPage } from "./features/cards";
import { TierListPage } from "./features/tier-list/components/TierListPage";

/**
 * Component that renders all routes and tracks automatically
 * page views when the route changes (production only)
 */
function AppRoutes() {
  // Hook that automatically tracks every route change
  useAnalyticsPageTracking();

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/tierlist" element={<TierListPage />} />
      <Route path="/support" element={<SupportPage />} />
      <Route path="/cards" element={<CardsPage />} />
      {/** Global guide lists with specific types */}
      <Route path="/guides/counter-guides" element={<AllGuidesListPage />} />
      <Route path="/guides/deck-guides" element={<AllGuidesListPage />} />
      {/** Legacy global guides route (for backward compatibility and old URLs) */}
      <Route path="/guides" element={<AllGuidesListPage />} />
      {/** Legacy ID-based archetype routes -> redirect to SEO friendly name-based URLS */}
      <Route
        path="/archetype/:archetypeId/counter-guides"
        element={<LegacyArchetypeRedirect />}
      />
      <Route
        path="/archetype/:archetypeId/deck-guides"
        element={<LegacyArchetypeRedirect />}
      />
      {/** Internal id-based route kept for guide creation, direct editor access, and SPA compatibility */}
      {/** IMPORTANT: This must come BEFORE the generic /archetype/:archetypeId route */}
      <Route
        path="/archetype/:archetypeId/instance/:instanceId"
        element={<GuideContainerPage />}
      />
      {/** Legacy archetype guide list route -> redirect to SEO-friendly */}
      <Route
        path="/archetype/:archetypeId"
        element={<LegacyArchetypeRedirect />}
      />
      {/** Guide route */}
      <Route
        path="/archetypes/:archetypeSlug/:authorSlug/:guideSlug"
        element={<GuideContainerPage />}
      />
      <Route path="/profile/:userId" element={<ProfilePage />} />
      <Route path="/profile/:userId/:tab" element={<ProfilePage />} />
      <Route path="/signin" element={<SignInPage />} />
      <Route path="/signup" element={<SignUpPage />} />
      <Route path="/verify-email" element={<VerifyEmailPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route
        path="/configuration"
        element={
          <ProtectedRoute>
            <ConfigurationPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <ProtectedRoute requiredRole="admin">
            <AdminPanelPage />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <Router>
          <AppRoutes />
        </Router>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;
