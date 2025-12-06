import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import ProgressBar from "../../components/ProgressBar";
import NPCCharacter from "../../components/NPCCharacter";
import Oldman from "../../assets/images/characters/oldman.png";
import NandoCharacter from "../../assets/images/characters/vocabulary/Village_Quest_NPC_1.png";
import LigayaCharacter from "../../assets/images/characters/vocabulary/Village_Quest_NPC_2.png";
import VicenteCharacter from "../../assets/images/characters/vocabulary/Village_Quest_NPC_3.png";
import DialogueBox from "../../components/instructions/DialogueBox";
import Button from "../../components/Button";
import ParticleEffects from "../../components/ParticleEffects";
import "../student/styles/InstructionsPage.css";

const InstructionsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentStep, setCurrentStep] = useState(0);
  const [language] = useState("en");

  // Get NPC context from navigation state
  const npcId = location.state?.npcId || null;
  const returnTo = location.state?.returnTo || "/student/quest";

  // NPC configurations
  const npcConfigs = {
    nando: {
      character: NandoCharacter,
      name: "Nando",
      instructions: [
        {
          text: "Welcome, young learner! I am the village elder, and I'm delighted to guide you through our beautiful village today.",
        },
        {
          text: "Our village is a place of learning and discovery. Here, you'll meet friendly villagers who will help you master new skills and vocabulary.",
        },
        {
          text: "Let's start with a word matching challenge! Match each word with its correct definition.",
        },
      ],
      nextRoute: "/student/wordMatching",
    },
    ligaya: {
      character: LigayaCharacter,
      name: "Ligaya",
      instructions: [
        {
          text: "Hello there! I'm the village farmer. I tend to the crops and animals around here.",
        },
        {
          text: "Would you like to help me with some tasks? I have vocabulary challenges about nature and farming!",
        },
        {
          text: "Let's start with picture associations! Look at each image and choose the correct word that describes it.",
        },
      ],
      nextRoute: "/student/pictureAssociation",
    },
    vicente: {
      character: VicenteCharacter,
      name: "Vicente",
      instructions: [
        {
          text: "Greetings! I'm the village merchant. I travel far and wide to bring goods to our village.",
        },
        {
          text: "I have exciting vocabulary challenges about trading, items, and adventures!",
        },
        {
          text: "Good luck on your learning journey!",
        },
      ],
      nextRoute: "/student/sentenceCompletion",
    },
  };

  // Default instructions (original guide)
  const defaultInstructions = [
    {
      text: "Welcome, brave adventurer! Your quest begins here in the village. Complete each challenge to unlock new areas and grow stronger.",
    },
    {
      text: "Listen carefully to the instructions. Each module will test your knowledge and skills. Don't worry, I'll guide you every step of the way!",
    },
  ];

  // Get the appropriate configuration
  const config =
    npcId && npcConfigs[npcId]
      ? npcConfigs[npcId]
      : {
          character: Oldman,
          name: "The Guide",
          instructions: defaultInstructions,
          nextRoute: "/dashboard",
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
            returnTo: returnTo,
          },
        });
      } else {
        navigate("/student/village");
      }
    }
  };

  const handleBack = () => {
    if (npcId) {
      navigate(returnTo);
    } else {
      navigate("/student/languageSelection");
    }
  };

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
        ← Back
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
