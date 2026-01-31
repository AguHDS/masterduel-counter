import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./features/auth";
import { HomePage } from "./pages/HomePage";
import { SignInPage } from "./pages/SignInPage";
import { SignUpPage } from "./pages/SignUpPage";
import { ProfilePage } from "./features/profile/pages/ProfilePage";
import { ArchetypeInstancesPage } from "./features/archetypeInstances";
import { InstanceEditorPage } from "./features/ArchetypeAnalyzer";
import { VerifyEmailPage } from "./pages/VerifyEmailPage";
import { ResetPasswordPage } from "./pages/ResetPasswordPage";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/archetype/:archetypeId" element={<ArchetypeInstancesPage />} />
          <Route path="/archetype/:archetypeId/instance/:instanceId" element={<InstanceEditorPage />} />
          <Route path="/profile/:userId" element={<ProfilePage />} />
          <Route path="/signin" element={<SignInPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/verify-email" element={<VerifyEmailPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
