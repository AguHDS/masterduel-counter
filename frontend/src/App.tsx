import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { HomePage } from "./pages/HomePage";
import { SignAsAdminPage } from "./pages/SignAsAdminPage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/signAsAdmin" element={<SignAsAdminPage />} />
      </Routes>
    </Router>
  );
}

export default App;
