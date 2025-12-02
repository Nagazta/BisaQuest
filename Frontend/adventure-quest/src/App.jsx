import { Routes, Route } from "react-router-dom";
import HomePage from "./components/HomeSection";
import Login from "./pages/Login";
import Register from "./pages/Register";
import StudentDashboard from "./pages/Student/StudentDashboard";
import CharacterSelection from "./pages/Student/CharacterSelectionPage";
import "./App.css";

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/dashboard" element={<StudentDashboard />} />
      <Route path="/student/characterSelection" element={<CharacterSelection/>}/>
    </Routes>
  );
}

export default App;