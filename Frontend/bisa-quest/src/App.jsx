import { Routes, Route, Navigate } from "react-router-dom";
import HomePage from "./components/HeroSection";
import Login from "./pages/Login";
import Register from "./pages/Register";
import StudentDashboard from "./pages/student/StudentDashboard";
import CharacterSelection from "./pages/student/CharacterSelectionPage";
import LanguageSelectionPage from "./pages/student/LanguageSelectionPage";
import InstructionsPage from "./pages/student/InstructionsPage";
import VillagePage from "./pages/vocabulary/VillagePage";
import WordMatchingPage from "./pages/vocabulary/WordMatchingPage";
import HousePage from "./pages/vocabulary/HousePage";
import SentenceCompletionPage from "./pages/vocabulary/SentenceCompletionPage";
import ViewCompletionPage from "./pages/student/ViewCompletionPage";
import { useAuth } from "./context/AuthContext";
import "./App.css";

function App() {
    const { player, loading } = useAuth(); // ← was 'user', now 'player'

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <Routes>
            <Route path="/"        element={<HomePage />} />
            <Route path="/login"   element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Public student flow routes — no auth needed */}
            <Route path="/student/characterSelection" element={<CharacterSelection />} />
            <Route path="/student/languageSelection"  element={<LanguageSelectionPage />} />
            <Route path="/student/instructions"       element={<InstructionsPage />} />
            <Route path="/student/village"            element={<VillagePage />} />
            <Route path="/student/wordMatching"       element={<WordMatchingPage />} />
            <Route path="/student/sentenceCompletion" element={<SentenceCompletionPage />} />
            <Route path="/student/summary"            element={<ViewCompletionPage />} />
            <Route path="/house"                      element={<HousePage />} />

            {/* Dashboard — requires player in context */}
            <Route
                path="/dashboard"
                element={
                    player
                        ? <StudentDashboard />
                        : <Navigate to="/login" replace />
                }
            />

          
        </Routes>
    );
}

export default App;