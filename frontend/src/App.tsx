import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./features/AdminAuth";
import { HomePage } from "./pages/HomePage";
import { SignAsAdminPage } from "./pages/SignAsAdminPage";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/signAsAdmin" element={<SignAsAdminPage />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
