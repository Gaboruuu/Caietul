import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import MatchHomePage from "./pages/MatchHomePage";
import StatisticsPage from "./pages/StatisticsPage";
import TiltMeterPage from "./pages/TiltMeterPage";
import TiltMeterMatchPage from "./pages/TiltMeterMatchPage";
import MatchDetailPage from "./pages/MatchDetailPage";
import MatchFormPage from "./pages/MatchFormPage";
import DeleteConfirmPage from "./pages/DeleteConfirmPage";
import CookieConsent from "./components/CookieConsent";
import AppLayout from "./components/AppLayout";
import { usePageTracking } from "./hooks/useTracking";

export default function App() {
  usePageTracking("App");

  return (
    <BrowserRouter>
      <CookieConsent />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/" element={<LandingPage />} />
        <Route element={<AppLayout />}>
          <Route path="/matches" element={<MatchHomePage />} />
          <Route path="/statistics" element={<StatisticsPage />} />
          <Route path="/tilt-meter" element={<TiltMeterPage />} />
          <Route path="/tilt-meter/:id" element={<TiltMeterMatchPage />} />
          <Route path="/matches/:id" element={<MatchDetailPage />} />
          <Route path="/matches/new" element={<MatchFormPage />} />
          <Route path="/matches/:id/edit" element={<MatchFormPage />} />
          <Route path="/matches/:id/delete" element={<DeleteConfirmPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
