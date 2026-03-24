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
import BedroomPage from "./pages/Village/BedroomPage";
import KitchenPage from "./pages/Village/KitchenPage";

//Forest environment pages
import ForestScenePage from "./pages/Forest/ForestScenePage";
import ForestPondPage from "./pages/Forest/ForestPondPage";
import ForestGlowPage from "./pages/Forest/ForestGlowPage";

//Castle environment pages
import CastleScenePage from "./pages/Castle/CastleScenePage";
import CastleRoomPage from "./pages/Castle/CastleRoomPage";
import CastleGatePage from "./pages/Castle/CastleGatePage";
import CastleCourtyardPage from "./pages/Castle/CastleCourtyardPage";
import CastleLibraryPage from "./pages/Castle/CastleLibraryPage";

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

                {/*  Player setup flow (public)  */}
                <Route path="/student/characterSelection" element={<CharacterSelection />} />
                <Route path="/student/cutscene" element={<StoryCutscene type="story" />} />
                <Route path="/cutscene/:type" element={<StoryCutscene />} />

                {/*  Protected routes  */}
                <Route path="/student/village" element={<ProtectedRoute><VillagePage /></ProtectedRoute>} />
                <Route path="/student/forest" element={<ProtectedRoute><ForestPage /></ProtectedRoute>} />
                <Route path="/student/castle" element={<ProtectedRoute><CastlePage /></ProtectedRoute>} />

                <Route path="/student/house" element={<ProtectedRoute><HousePage /></ProtectedRoute>} />
                <Route path="/student/bedroom" element={<ProtectedRoute><BedroomPage /></ProtectedRoute>} />
                <Route path="/student/kitchen" element={<ProtectedRoute><KitchenPage /></ProtectedRoute>} />
                <Route path="/forest/scene" element={<ProtectedRoute><ForestScenePage /></ProtectedRoute>} />
                <Route path="/student/forest-pond" element={<ProtectedRoute><ForestPondPage /></ProtectedRoute>} />
                <Route path="/student/forest-glow" element={<ProtectedRoute><ForestGlowPage /></ProtectedRoute>} />
                <Route path="/castle/scene" element={<ProtectedRoute><CastleScenePage /></ProtectedRoute>} />
                <Route path="/castle/room" element={<ProtectedRoute><CastleRoomPage /></ProtectedRoute>} />
                <Route path="/castle/gate" element={<ProtectedRoute><CastleGatePage /></ProtectedRoute>} />
                <Route path="/castle/courtyard" element={<ProtectedRoute><CastleCourtyardPage /></ProtectedRoute>} />
                <Route path="/castle/library" element={<ProtectedRoute><CastleLibraryPage /></ProtectedRoute>} />
                <Route path="/student/library" element={<ProtectedRoute><CastleScenePage /></ProtectedRoute>} />

                <Route path="/student/dragAndDrop" element={<ProtectedRoute><DragAndDrop /></ProtectedRoute>} />
                <Route path="/student/item-association" element={<ProtectedRoute><ItemAssociation /></ProtectedRoute>} />


                {/*  Dashboard  */}
                <Route
                    path="/dashboard"
                    element={player ? <StudentDashboard /> : <Navigate to="/login" replace />}
                />
            </Routes>
        </ResourceLoaderProvider>
    );
}

export default App;