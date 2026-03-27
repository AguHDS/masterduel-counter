import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./features/auth";
import { NotificationProvider } from "./features/notifications";
import { HomePage } from "./pages/HomePage";
import { SignInPage } from "./pages/SignInPage";
import { SignUpPage } from "./pages/SignUpPage";
import { ProfilePage } from "./features/profile/pages/ProfilePage";
import { ArchetypeGuideListPage } from "./features/guides-instances";
import { GuideContainerPage } from "./features/guide-editor";
import { VerifyEmailPage } from "./pages/VerifyEmailPage";
import { ResetPasswordPage } from "./pages/ResetPasswordPage";
import { AdminPanelPage } from "./features/admin-panel/pages/AdminPanelPage";
import { ConfigurationPage } from "./features/configuration";
import { ProtectedRoute } from "./shared/components/ProtectedRoute";
import NotFound from "./shared/components/NotFound";
import { SupportPage } from "./pages/SupportPage";
import { useAnalyticsPageTracking } from "./shared/hooks/useAnalyticsPageTracking";
import { RegisteredArchetypesPage } from "./features/registered-archetypes/pages/RegisteredArchetypesPage";

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
      <Route path="/support" element={<SupportPage />} />
      <Route path="/archetypes" element={<RegisteredArchetypesPage />} />
      {/** Guide list of selected archetype */}
      <Route
        path="/archetype/:archetypeId"
        element={<ArchetypeGuideListPage />}
      />
      {/** Guide creation instance page */}
      <Route
        path="/archetype/:archetypeId/instance/:instanceId"
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
