import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Button from "../../components/Button";
import GuideDialogueBox from "../../components/GuideDialogueBox";
import LigayaCharacter from "../../assets/images/characters/vocabulary/Village_Quest_NPC_2.png";
import houseBackground from "../../assets/images/environments/scenario/house.jpg";
import arrowImage from "../../assets/images/signs/arrow.png";
import "./HousePage.css";

const instructionSteps = [
  "Hi! I was supposed to clean the living room before my mom comes home. Can you help me clean up?",
  "I'm using a broom and dustpan to sweep the floor, a mop to make it shiny, and rags to wipe the cabinet!",
  "Each tool has a name in Cebuano! I will show you pictures and you have to guess what each cleaning tool is called.",
  "Did you understand the task? Are you ready to start?",
];

const HousePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const questId = location.state?.questId || 1;
  const npcName = location.state?.npcName || "Ligaya";

  const [step, setStep] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);

  const isLastStep = step === instructionSteps.length - 1;

  const handleBack = () => {
    navigate("/student/village", { state: { questId } });
  };

  const handleNext = () => {
    if (!isLastStep) setStep(step + 1);
  };

  const handleYes = () => {
    setGameStarted(true);
    // TODO: navigate to actual game
  };

  const handleNo = () => {
    setStep(0); // Repeat instructions from beginning
  };

  return (
    <div className="house-container">
      <img src={houseBackground} alt="House" className="house-background" />

      <Button variant="back" onClick={handleBack}>
        ← Back
      </Button>

      {gameStarted ? (
        <div>
          {/* TODO: actual game content */}
        </div>
      ) : (
        <div className="house-npc-section">
          <img src={LigayaCharacter} alt="Ligaya" className="house-npc-image" />
          <div className="house-dialogue">
            <GuideDialogueBox name={npcName} text={instructionSteps[step]} />

            {/* Next arrow — all steps except last */}
            {!isLastStep && (
              <Button
                variant="arrow"
                className="dialogue-next-btn"
                onClick={handleNext}
              >
                <img src={arrowImage} alt="Next" className="dialogue-arrow-img" />
              </Button>
            )}

            {/* Yes / No — last step only */}
            {isLastStep && (
              <div className="dialogue-choices">
                <Button variant="primary" onClick={handleYes}>
                  ✓ Yes, I'm ready!
                </Button>
                <Button variant="danger" onClick={handleNo}>
                  ✗ Not yet
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default HousePage;