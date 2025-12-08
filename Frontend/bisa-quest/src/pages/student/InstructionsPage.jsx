import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import ProgressBar from "../../components/ProgressBar";
import NPCCharacter from "../../components/NPCCharacter";
import Oldman from "../../assets/images/characters/oldman.png";
import DialogueBox from "../../components/instructions/DialogueBox";
import Button from "../../components/Button";
import ParticleEffects from "../../components/ParticleEffects";
import "../student/styles/InstructionsPage.css";

const InstructionsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentStep, setCurrentStep] = useState(0);
  const [language, setLanguage] = useState("en");
  const [loading, setLoading] = useState(true);

  // Get context from navigation state
  const npcId = location.state?.npcId || null;
  const questId = location.state?.questId || 1;
  const returnTo = location.state?.returnTo || "/student/languageSelection";

  // Load language preference
  useEffect(() => {
    const loadLanguage = async () => {
      try {
        // First try localStorage (fastest)
        const cachedLanguage = localStorage.getItem(`quest_${questId}_language`);
        if (cachedLanguage) {
          setLanguage(cachedLanguage);
          setLoading(false);
          return;
        }

        // If not in cache, fetch from API
        const sessionData = JSON.parse(localStorage.getItem("session"));
        if (!sessionData?.user?.id) {
          setLanguage("en");
          setLoading(false);
          return;
        }

        const studentResponse = await fetch(
          `${import.meta.env.VITE_API_URL}/api/student/by-user/${sessionData.user.id}`
        );

        if (!studentResponse.ok) {
          setLanguage("en");
          setLoading(false);
          return;
        }

        const studentData = await studentResponse.json();
        const student_id = studentData.data.student_id;

        // Fetch language preference
        const langResponse = await fetch(
          `${import.meta.env.VITE_API_URL}/api/language-preferences?student_id=${student_id}&quest_id=${questId}`
        );

        if (langResponse.ok) {
          const langData = await langResponse.json();
          const preferredLanguage = langData.data?.language_code || "en";
          setLanguage(preferredLanguage);
          localStorage.setItem(`quest_${questId}_language`, preferredLanguage);
        } else {
          setLanguage("en");
        }
      } catch (error) {
        setLanguage("en");
      } finally {
        setLoading(false);
      }
    };

    loadLanguage();
  }, [questId]);

  // Default instructions with multi-language support
  const defaultInstructions = {
    en: [
      {
        text: "Welcome, brave adventurer! Your quest begins here in the village. Complete each challenge to unlock new areas and grow stronger.",
        progress: 50,
      },
      {
        text: "Listen carefully to the instructions. Each module will test your knowledge and skills. Don't worry, I'll guide you every step of the way!",
        progress: 100,
      },
    ],
    ceb: [
      {
        text: "Maayong pag-abot, maisugon nga adventurer! Magsugod ang imong quest dinhi sa baryo. Kompleto ang matag hagit aron mabuksan ang bag-ong mga lugar ug molig-on.",
        progress: 50,
      },
      {
        text: "Paminaw pag-ayo sa mga instruksyon. Ang matag module mosulay sa imong kahibalo ug kahanas. Ayaw kabalaka, giyahan ko ikaw sa matag lakang!",
        progress: 100,
      },
    ],
  };

  // NPC-specific configurations (if needed in the future)
  const npcConfigs = {
    // Add NPC-specific instructions here if needed
    // nando: { ... },
    // ligaya: { ... },
    // vicente: { ... },
  };

  // Get the appropriate configuration
  const config = npcId && npcConfigs[npcId]
    ? npcConfigs[npcId]
    : {
        character: Oldman,
        name: language === "ceb" ? "Ang Giya" : "The Guide",
        instructions: defaultInstructions[language] || defaultInstructions.en,
        nextRoute: "/student/village",
      };

  const handleNext = () => {
    if (currentStep < config.instructions.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Navigate based on configuration
      if (npcId && config.nextRoute) {
        navigate(config.nextRoute, {
          state: {
            npcId: npcId,
            questId: questId,
            language: language,
            returnTo: returnTo,
          },
        });
      } else {
        navigate("/student/village", {
          state: {
            questId: questId,
            language: language,
          },
        });
      }
    }
  };

  const handleBack = () => {
    if (npcId) {
      navigate(returnTo, {
        state: {
          questId: questId,
        },
      });
    } else {
      navigate("/student/languageSelection", {
        state: {
          questId: questId,
        },
      });
    }
  };

  if (loading) {
    return (
      <div className="instructions-page loading">
        <ParticleEffects enableMouseTrail={false} />
        <div className="loading-text">Loading...</div>
      </div>
    );
  }

  return (
    <div className="instructions-page">
      <ParticleEffects enableMouseTrail={false} />

      <ProgressBar
        progress={config.instructions[currentStep].progress}
        variant="instruction"
        showLabel={true}
      />

      <Button
        variant="back"
        className="back-button-instructions"
        onClick={handleBack}
      >
        ← {language === "ceb" ? "Balik" : "Back"}
      </Button>

      {/* Using NPCCharacter with instruction variant */}
      <NPCCharacter
        characterImage={config.character}
        variant="instruction"
        alt={config.name}
      />

      <DialogueBox
        title={config.name}
        text={config.instructions[currentStep].text}
        language={language}
        onNext={handleNext}
        showNextButton={true}
      />

      <div className="decorative-clouds">
        <div className="cloud cloud-1"></div>
        <div className="cloud cloud-2"></div>
        <div className="cloud cloud-3"></div>
      </div>
    </div>
  );
};

export default InstructionsPage;