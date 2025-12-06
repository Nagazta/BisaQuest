import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import LanguageSelectionCard from "../../components/language/LanguageSelectionCard";
import Notification from "../../components/Notification";
import IllustrationPanel from "../../components/language/IllustrationPanel";
import Button from "../../components/Button";
import ParticleEffects from "../../components/ParticleEffects";
import "../student/styles/LanguageSelectionPage.css";

const LanguageSelectionPage = () => {
  const navigate = useNavigate();
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log("=== LanguageSelectionPage mounted ===");
  }, []);

  const handleBack = () => {
    navigate("/dashboard");
  };

  const handleNext = async () => {
    try {
      const sessionData = JSON.parse(localStorage.getItem("session"));

      if (!sessionData || !sessionData.user || !sessionData.user.id) {
        throw new Error("Student not logged in");
      }

      const studentResponse = await fetch(
        `${import.meta.env.VITE_API_URL}/api/student/by-user/${
          sessionData.user.id
        }`
      );

      if (!studentResponse.ok) {
        throw new Error("Failed to fetch student data");
      }

      const studentData = await studentResponse.json();
      const student_id = studentData.data.student_id;

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/preferences/language`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            student_id: student_id,
            quest_id: 1,
            language_preference: selectedLanguage === "en" ? "en" : "ceb",
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to save language preference");
      }

      const data = await response.json();
      console.log("Language saved successfully:", data);

      navigate("/student/instructions");
    } catch (err) {
      setError(
        "Your language preference could not be saved. A session default will be used temporarily."
      );
      console.error("Error saving language:", err);
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

      <div className="decorative-clouds">
        <div className="cloud cloud-1"></div>
        <div className="cloud cloud-2"></div>
        <div className="cloud cloud-3"></div>
      </div>
    </>
  );
};

export default LanguageSelectionPage;
