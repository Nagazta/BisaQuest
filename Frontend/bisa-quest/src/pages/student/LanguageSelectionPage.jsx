import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import LanguageSelectionCard from "../../components/language/LanguageSelectionCard";
import Notification from "../../components/Notification";
import IllustrationPanel from "../../components/language/IllustrationPanel";
import SaveProgressModal from "../../components/progress/SaveProgressModal";
import Button from "../../components/Button";
import ParticleEffects from "../../components/ParticleEffects";
import "../student/styles/LanguageSelectionPage.css";

const LanguageSelectionPage = () => {
  const navigate = useNavigate();
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const [error, setError] = useState(null);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [savedProgress, setSavedProgress] = useState(null);

  useEffect(() => {
    console.log("=== LanguageSelectionPage mounted ===");
    checkForSavedProgress();
  }, []);

  const checkForSavedProgress = async () => {
    console.log("=== CHECKING FOR SAVED PROGRESS ===");
    try {
      // Get student_id
      const sessionData = JSON.parse(localStorage.getItem("session"));
      console.log("Session data:", sessionData);

      if (!sessionData?.user?.id) {
        console.log("❌ No user ID in session, aborting");
        return;
      }
      console.log("✅ User ID found, fetching student data...");

      const studentResponse = await fetch(
        `http://localhost:5000/api/student/by-user/${sessionData.user.id}`
      );
      console.log("Student response status:", studentResponse.status);

      if (!studentResponse.ok) {
        console.log("❌ Student fetch failed");
        return;
      }

      const studentData = await studentResponse.json();
      const student_id = studentData.data.student_id;
      console.log("✅ Student ID:", student_id);

      // Check for saved progress
      console.log(
        "Checking progress at:",
        `http://localhost:5000/api/progress/${student_id}/1`
      );
      const progressResponse = await fetch(
        `http://localhost:5000/api/progress/${student_id}/1`
      );
      console.log("Progress response status:", progressResponse.status);

      if (!progressResponse.ok) {
        console.log("No saved progress found");
        return;
      }

      const progressData = await progressResponse.json();
      console.log("Progress data received:", progressData);

      // If progress exists, show modal
      if (progressData.hasProgress && progressData.data) {
        setSavedProgress(progressData.data);
        setShowSaveModal(true);
        console.log(
          "✅ Saved progress found, showing modal:",
          progressData.data
        );
      }
    } catch (err) {
      console.error("Error checking progress:", err);
    }
  };

  const handleBack = () => {
    navigate("/dashboard");
  };

  const handleNext = async () => {
    try {
      // Get user from AuthContext
      const sessionData = JSON.parse(localStorage.getItem("session"));

      if (!sessionData || !sessionData.user || !sessionData.user.id) {
        throw new Error("Student not logged in");
      }

      // The session stores Users.user_id, but we need Student.student_id
      // We'll query Student table to get student_id using the user_id
      const studentResponse = await fetch(
        `http://localhost:5000/api/student/by-user/${sessionData.user.id}`
      );

      if (!studentResponse.ok) {
        throw new Error("Failed to fetch student data");
      }

      const studentData = await studentResponse.json();
      const student_id = studentData.data.student_id;

      // Now save the language preference
      const response = await fetch(
        "http://localhost:5000/api/preferences/language",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            student_id: student_id,
            quest_id: 1, // Vocabulary Quest
            language_preference: selectedLanguage === "en" ? "en" : "ceb",
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to save language preference");
      }

      const data = await response.json();
      console.log("Language saved successfully:", data);

      // Navigate to instructions page
      navigate("/student/instructions");
    } catch (err) {
      setError(
        "Your language preference could not be saved. A session default will be used temporarily."
      );
      console.error("Error saving language:", err);
    }
  };

  const handleContinue = () => {
    console.log("Continuing with saved progress:", savedProgress);
    setShowSaveModal(false);
    // Navigate to the saved module/section
    navigate("/student/instructions");
  };

  const handleNewGame = async () => {
    try {
      // Get student_id
      const sessionData = JSON.parse(localStorage.getItem("session"));
      const studentResponse = await fetch(
        `http://localhost:5000/api/student/by-user/${sessionData.user.id}`
      );
      const studentData = await studentResponse.json();
      const student_id = studentData.data.student_id;

      // Reset progress in backend
      await fetch("http://localhost:5000/api/progress/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          student_id: student_id,
          quest_id: 1,
        }),
      });

      console.log("Progress reset successfully");
      setSavedProgress(null);
      setShowSaveModal(false);
    } catch (err) {
      console.error("Error resetting progress:", err);
    }
  };

  return (
    <>
      <div className="language-selection-page">
        <ParticleEffects enableMouseTrail={false} />
        <div className="back-button">
          <Button
            onClick={handleBack}
            variant="back"
            className="back-button language"
          >
            ← Back
          </Button>
        </div>

        <div className="content-container">
          <LanguageSelectionCard
            selectedLanguage={selectedLanguage}
            onLanguageChange={setSelectedLanguage}
            onNext={handleNext}
          />
          <IllustrationPanel />
        </div>

        <Notification
          type="error"
          title="Unable to Save Language"
          message={error}
          onClose={() => setError(null)}
        />
      </div>
      <SaveProgressModal
        isOpen={showSaveModal}
        onContinue={handleContinue}
        onNewGame={handleNewGame}
        characterImage={savedProgress?.characterImage}
        savedProgress={savedProgress}
      />

      <div className="decorative-clouds">
        <div className="cloud cloud-1"></div>
        <div className="cloud cloud-2"></div>
        <div className="cloud cloud-3"></div>
      </div>
    </>
  );
};

export default LanguageSelectionPage;
