import { Routes, Route, Navigate } from "react-router-dom";
import HomePage from "./components/HeroSection";
import Login from "./pages/Login";
import Register from "./pages/Register";
import StudentDashboard from "./pages/student/PlayerLobby";
import CharacterSelection from "./pages/student/CharacterSelectionPage";
import LanguageSelectionPage from "./pages/student/LanguageSelectionPage";
import InstructionsPage from "./pages/student/InstructionsPage";
import VillagePage from "./pages/Village/VillagePage";
import ForestPage from "./pages/Forest/ForestPage";
import CastlePage from "./pages/Castle/CastlePage";
import HousePage from "./pages/Village/HousePage";
import { useAuth } from "./context/AuthContext";
import "./App.css";

function App() {
    const { player, loading } = useAuth();

    if (loading) return <div>Loading...</div>;

    return (
        <Routes>
            <Route path="/"        element={<HomePage />} />
            <Route path="/login"   element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* ── Player setup flow (public) ─────────────────────────────── */}
            <Route path="/student/characterSelection" element={<CharacterSelection />} />
            <Route path="/student/languageSelection"  element={<LanguageSelectionPage />} />
            <Route path="/student/instructions"       element={<InstructionsPage />} />

            {/* ── Environment pages (public — player_id from localStorage) ─ */}
            <Route path="/student/village" element={<VillagePage />} />
            <Route path="/student/forest"  element={<ForestPage />} />
            <Route path="/student/castle"  element={<CastlePage />} />

            {/* ── Game / challenge pages ─────────────────────────────────── */}
          
            <Route path="/house"                      element={<HousePage />} />

            {/* ── Dashboard — requires player in context ─────────────────── */}
            <Route
                path="/dashboard"
                element={player ? <StudentDashboard /> : <Navigate to="/login" replace />}
            />

           
        </Routes>
    );
}

export default App;