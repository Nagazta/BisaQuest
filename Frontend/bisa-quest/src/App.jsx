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

import { useAuth } from "./context/AuthContext";
import DragAndDrop from "./game/DragAndDrop";
import ProtectedRoute from "./components/ProtectedRoute";
import ResourceLoadingScreen from "./pages/ResourceLoadingScreen";
import { ResourceLoaderProvider } from "./context/ResourceLoaderContext";

import "./App.css";

function App() {
    const { player, loading } = useAuth();

    if (loading) return <div>Loading...</div>;

    return (
        <ResourceLoaderProvider>
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<Login />} />
                <Route path="/loading" element={<ResourceLoadingScreen />} />

                {/* ── Player setup flow (public) ───────────────────────────── */}
                <Route path="/student/characterSelection" element={<CharacterSelection />} />
                <Route path="/student/cutscene" element={<StoryCutscene type="story" />} />
                <Route path="/cutscene/:type" element={<StoryCutscene />} />

                {/* ── Protected routes ─────────────────────────────────────── */}
                <Route path="/student/village" element={<ProtectedRoute><VillagePage /></ProtectedRoute>} />
                <Route path="/student/forest" element={<ProtectedRoute><ForestPage /></ProtectedRoute>} />
                <Route path="/student/castle" element={<ProtectedRoute><CastlePage /></ProtectedRoute>} />

                <Route path="/student/house" element={<ProtectedRoute><HousePage /></ProtectedRoute>} />
                <Route path="/forest/scene" element={<ProtectedRoute><ForestScenePage /></ProtectedRoute>} />
                <Route path="/castle/scene" element={<ProtectedRoute><CastleScenePage /></ProtectedRoute>} />
                <Route path="/student/library" element={<ProtectedRoute><CastleScenePage /></ProtectedRoute>} />

                <Route path="/student/dragAndDrop" element={<ProtectedRoute><DragAndDrop /></ProtectedRoute>} />
                <Route path="/student/item-association" element={<ProtectedRoute><ItemAssociation /></ProtectedRoute>} />
                <Route path="/student/market" element={<ProtectedRoute><MarketStallPage /></ProtectedRoute>} />
                <Route path="/student/farm" element={<ProtectedRoute><FarmPage /></ProtectedRoute>} />

                {/* ── Dashboard ────────────────────────────────────────────── */}
                <Route
                    path="/dashboard"
                    element={player ? <StudentDashboard /> : <Navigate to="/login" replace />}
                />
            </Routes>
        </ResourceLoaderProvider>
    );
}

export default App;