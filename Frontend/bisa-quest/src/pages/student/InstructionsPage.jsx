import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ProgressBar from "../../components/ProgressBar";
import NPCCharacter from "../../components/NPCCharacter";
import Oldman from "../../assets/images/characters/oldman.png";
import DialogueBox from "../../components/instructions/DialogueBox";
import Button from "../../components/Button";
import "../student/styles/InstructionsPage.css";

const InstructionsPage = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [language] = useState("en");

  const instructions = [
    {
      text: "Welcome, brave adventurer! Your quest begins here in the village. Complete each challenge to unlock new areas and grow stronger.",
      progress: 0,
    },
    {
      text: "Listen carefully to the instructions. Each module will test your knowledge and skills. Don't worry, I'll guide you every step of the way!",
      progress: 50,
    },
  ];

  const handleNext = () => {
    if (currentStep < instructions.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      navigate("/student/quest");
    }
  };

  const handleBack = () => {
    navigate("/student/languageSelection");
  };

  return (
    <div className="instructions-page">
      <ProgressBar
        progress={instructions[currentStep].progress}
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
        characterImage={Oldman}
        variant="instruction"
        alt="The Guide"
      />

      <DialogueBox
        title="The Guide"
        text={instructions[currentStep].text}
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
