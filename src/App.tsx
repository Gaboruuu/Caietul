import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import MatchHomePage from "./pages/MatchHomePage";
import MatchDetailPage from "./pages/MatchDetailPage";
import MatchFormPage from "./pages/MatchFormPage";
import DeleteConfirmPage from "./pages/DeleteConfirmPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/matches" element={<MatchHomePage />} />
        <Route path="/matches/:id" element={<MatchDetailPage />} />
        <Route path="/matches/new" element={<MatchFormPage />} />
        <Route path="/matches/:id/edit" element={<MatchFormPage />} />
        <Route path="/matches/:id/delete" element={<DeleteConfirmPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
