import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import LanguageSelectionCard from "../../components/language/LanguageSelectionCard";
import Notification from "../../components/Notification";
import IllustrationPanel from "../../components/language/IllustrationPanel";
import Button from "../../components/Button";
import ParticleEffects from "../../components/ParticleEffects";
import "../student/styles/LanguageSelectionPage.css";

const LanguageSelectionPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Get quest_id from navigation state or default to 1 (Vocabulary Quest)
  const questId = location.state?.questId || 1;

  // Load existing language preference if any
  useEffect(() => {
    const loadExistingPreference = async () => {
      try {
        const sessionData = JSON.parse(localStorage.getItem("session"));
        if (!sessionData?.user?.id) return;

        const studentResponse = await fetch(
          `${import.meta.env.VITE_API_URL}/api/student/by-user/${sessionData.user.id}`
        );
        
        if (!studentResponse.ok) return;

        const studentData = await studentResponse.json();
        const student_id = studentData.data.student_id;

        // Check if there's already a language preference for this quest
        const prefResponse = await fetch(
          `${import.meta.env.VITE_API_URL}/api/language-preferences?student_id=${student_id}&quest_id=${questId}`
        );

        if (prefResponse.ok) {
          const prefData = await prefResponse.json();
          if (prefData.success && prefData.data && prefData.data.language_code) {
            setSelectedLanguage(prefData.data.language_code);
          }
        }
      } catch (err) {
        // Silently fail - will use default language
      }
    };

    loadExistingPreference();
  }, [questId]);

  const handleBack = () => {
    navigate("/dashboard");
  };

  const handleNext = async () => {
    setLoading(true);
    try {
      const sessionData = JSON.parse(localStorage.getItem("session"));

      if (!sessionData || !sessionData.user || !sessionData.user.id) {
        throw new Error("Student not logged in");
      }

      const studentResponse = await fetch(
        `${import.meta.env.VITE_API_URL}/api/student/by-user/${sessionData.user.id}`
      );

      if (!studentResponse.ok) {
        throw new Error("Failed to fetch student data");
      }

      const studentData = await studentResponse.json();
      const student_id = studentData.data.student_id;

      // Save to NEW language_preferences table
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/language-preferences`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            student_id: student_id,
            quest_id: questId,
            language_code: selectedLanguage, // "en" or "ceb"
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to save language preference");
      }

      // Store in localStorage for quick access
      localStorage.setItem(`quest_${questId}_language`, selectedLanguage);

      // Navigate to instructions
      navigate("/student/instructions", {
        state: {
          questId: questId,
          language: selectedLanguage
        }
      });

    } catch (err) {
      // Fallback to localStorage only
      localStorage.setItem(`quest_${questId}_language`, selectedLanguage);
      setError(
        "Your language preference could not be saved. A session default will be used temporarily."
      );
      
      // Still navigate even if save fails
      setTimeout(() => {
        navigate("/student/instructions", {
          state: {
            questId: questId,
            language: selectedLanguage
          }
        });
      }, 2000);
    } finally {
      setLoading(false);
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
            disabled={loading}
          >
            ← Back
          </Button>
        </div>

        <div className="content-container">
          <LanguageSelectionCard
            selectedLanguage={selectedLanguage}
            onLanguageChange={setSelectedLanguage}
            onNext={handleNext}
            disabled={loading}
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