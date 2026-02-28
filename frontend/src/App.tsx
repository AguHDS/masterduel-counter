import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./features/auth";
import { NotificationProvider } from "./features/notifications";
import { HomePage } from "./pages/HomePage";
import { SignInPage } from "./pages/SignInPage";
import { SignUpPage } from "./pages/SignUpPage";
import { ProfilePage } from "./features/profile/pages/ProfilePage";
import { ArchetypeInstancesPage } from "./features/archetypeInstances";
import { InstanceEditorPage } from "./features/ArchetypeAnalyzer";
import { VerifyEmailPage } from "./pages/VerifyEmailPage";
import { ResetPasswordPage } from "./pages/ResetPasswordPage";
import { AdminPanelPage } from "./features/admin-panel/pages/AdminPanelPage";
import { ConfigurationPage } from "./features/configuration";
import { ProtectedRoute } from "./shared/components/ProtectedRoute";
import NotFound from "./shared/components/NotFound";

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <Router>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route
              path="/archetype/:archetypeId"
              element={<ArchetypeInstancesPage />}
            />
            <Route
              path="/archetype/:archetypeId/instance/:instanceId"
              element={<InstanceEditorPage />}
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
        </Router>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;
