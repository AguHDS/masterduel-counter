import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./features/auth";
import { HomePage } from "./pages/HomePage";
import { SignInPage } from "./pages/SignInPage";
import { SignUpPage } from "./pages/SignUpPage";
import { ProfilePage } from "./features/profile/pages/ProfilePage";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/archetype/:archetypeId" element={<HomePage />} />
          <Route path="/archetype/:archetypeId/instance/:instanceUserId" element={<HomePage />} />
          <Route path="/profile/:userId" element={<ProfilePage />} />
          <Route path="/signin" element={<SignInPage />} />
          <Route path="/signup" element={<SignUpPage />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
