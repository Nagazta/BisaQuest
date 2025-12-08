import React from "react";
import Button from "./Button";
import "./styles/QuestStartModal.css";

const QuestStartModal = ({
  // Village NPC props
  npcName,
  npcImage,
  questType,
  onStart,
  onClose,
  // Dashboard props
  isOpen,
  questTitle,
  onConfirm,
}) => {
  // Handle dashboard mode
  if (isOpen !== undefined) {
    if (!isOpen) return null;

    return (
      <div className="quest-modal-overlay" onClick={onClose}>
        <div
          className="quest-modal-scroll"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="scroll-content">
            <h2 className="quest-modal-title">Ready for Adventure?</h2>
            <div className="quest-modal-divider"></div>
            <p className="quest-modal-instructions">
              You're about to start the
            </p>
            <div className="quest-modal-quest-name">{questTitle}</div>
            <p className="quest-modal-encouragement">
              Let's go on an exciting journey!
            </p>
            <Button
              onClick={onConfirm}
              variant="primary"
              className="quest-modal-button"
            >
              Let's Go!
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Handle village NPC mode
  const getInstructions = (type) => {
    switch (type) {
      case "word_matching":
        return "Match the Bisaya words with their English translations. Click on pairs that have the same meaning!";
      case "word_association":
        return "Look at the pictures and choose the correct Bisaya word that matches each image!";
      case "sentence_completion":
        return "Complete the sentences by choosing the correct Bisaya word from the options given!";
      default:
        return "Complete the challenge to help the village!";
    }
  };

  return (
    <div className="quest-modal-overlay" onClick={onClose}>
      <div className="quest-modal-scroll" onClick={(e) => e.stopPropagation()}>
        <div className="scroll-top"></div>
        <div className="scroll-content">
          <div className="npc-modal-image-container">
            <img src={npcImage} alt={npcName} className="npc-modal-image" />
          </div>
          <h2 className="quest-modal-title">{npcName}</h2>
          <div className="quest-modal-divider"></div>
          <p className="quest-modal-instructions">
            {getInstructions(questType)}
          </p>
          <Button
            onClick={onStart}
            variant="primary"
            className="quest-modal-button"
          >
            Start Quest
          </Button>
        </div>
        <div className="scroll-bottom"></div>
      </div>
    </div>
  );
};

export default QuestStartModal;
