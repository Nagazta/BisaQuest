import { Routes, Route, Navigate } from "react-router-dom";
import HomePage from "./components/HeroSection";
import Login from "./pages/Login";
import Register from "./pages/Register";
import StudentDashboard from "./pages/student/StudentDashboard";
import CharacterSelection from "./pages/student/CharacterSelectionPage";
import LanguageSelectionPage from "./pages/student/LanguageSelectionPage";
import InstructionsPage from "./pages/student/InstructionsPage";
import VillagePage from "./pages/vocabulary/VillagePage";

//Vocabulary Game
import WordMatchingPage from "./pages/vocabulary/WordMatchingPage";
import PictureAssociationPage from "./pages/vocabulary/PictureAssociationPage";
import SentenceCompletionPage from "./pages/vocabulary/SentenceCompletionPage";

import TeacherDashboard from "./pages/teacher/TeacherDashboard";
import { useAuth } from "./context/AuthContext";
import "./App.css";

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route
        path="/student/characterSelection"
        element={<CharacterSelection />}
      />
      <Route
        path="/student/languageSelection"
        element={<LanguageSelectionPage />}
      />
      <Route path="/student/instructions" element={<InstructionsPage />} />
      <Route path="/student/village" element={<VillagePage />} />

      <Route path="/student/wordMatching" element={<WordMatchingPage />} />
      <Route
        path="/student/pictureAssociation"
        element={<PictureAssociationPage />}
      />
      <Route
        path="/student/sentenceCompletion"
        element={<SentenceCompletionPage />}
      />

      <Route
        path="/dashboard"
        element={
          user?.role === "student" ? (
            <StudentDashboard />
          ) : (
            <Navigate to="/login" />
          )
        }
      />
      <Route
        path="/teacher-dashboard"
        element={
          user?.role === "teacher" ? (
            <TeacherDashboard />
          ) : (
            <Navigate to="/login" />
          )
        }
      />
    </Routes>
  );
}

export default App;
