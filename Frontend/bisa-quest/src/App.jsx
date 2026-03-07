import { Routes, Route, Navigate } from "react-router-dom";
import HomePage from "./components/HeroSection";
import Login from "./pages/Login";
import StudentDashboard from "./pages/student/PlayerLobby";
import CharacterSelection from "./pages/student/CharacterSelectionPage";
import StoryCutscene from "./pages/student/StoryCutscene";
import ItemAssociation from "./game/ItemAssociation";
import VillagePage from "./pages/Village/VillagePage";
import ForestPage from "./pages/Forest/ForestPage";
import CastlePage from "./pages/Castle/CastlePage";
//Village environment pages
import HousePage from "./pages/Village/HousePage";
import MarketStallPage from "./pages/Village/MarketStallPage";
import FarmPage from "./pages/Village/FarmPage";
//Forest environment pages
import ForestScenePage from "./pages/Forest/ForestScenePage";

//Castle environment pages
import CastleScenePage from "./pages/Castle/CastleScenePage";
import GardenFountainPage from "./pages/Castle/GardenFountainPage";

import { useAuth } from "./context/AuthContext";
import DragAndDrop from "./game/DragAndDrop";

import "./App.css";

function App() {
    const { player, loading } = useAuth();

    if (loading) return <div>Loading...</div>;

    return (
        <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<Login />} />

            {/* ── Player setup flow ──────────────────────────────────────── */}
            <Route path="/student/characterSelection" element={<CharacterSelection />} />

            {/* Old route kept as alias — explicitly passes type="story" */}
            <Route path="/student/cutscene" element={<StoryCutscene type="story" />} />

            {/* All cutscenes go through here: /cutscene/story, /cutscene/village_entry, etc. */}
            <Route path="/cutscene/:type" element={<StoryCutscene />} />

            {/* ── Environment pages ──────────────────────────────────────── */}
            <Route path="/student/village" element={<VillagePage />} />
            <Route path="/student/forest"  element={<ForestPage />} />
            <Route path="/student/castle"  element={<CastlePage />} />

            {/* ── Game / challenge pages ─────────────────────────────────── */}
            <Route path="/student/house" element={<HousePage />} />
            <Route path="/forest/scene" element={<ForestScenePage />} />
            <Route path="/castle/scene" element={<CastleScenePage />} />
            <Route path="/student/library" element={<CastleScenePage />} />
            <Route path="/student/garden-fountain" element={<GardenFountainPage />} />

            <Route path="/student/dragAndDrop"       element={<DragAndDrop />} />
            <Route path="/student/item-association"  element={<ItemAssociation />} />
            <Route path="/student/market"            element={<MarketStallPage />} />
            <Route path="/student/farm"              element={<FarmPage />} />

            {/* ── Dashboard ─────────────────────────────────────────────── */}
            <Route
                path="/dashboard"
                element={player ? <StudentDashboard /> : <Navigate to="/login" replace />}
            />
        </Routes>
    );
}

export default App;