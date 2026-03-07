import React from "react";
import Button from "./Button";
import "./QuestStartModal.css";

const QuestStartModal = ({
  // Village NPC props
  npcName,
  npcImage,
  npcId,
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

  // NPC specific instructions
const getInstructions = (npcId) => {
  switch (npcId) {

    // =====================
    // VILLAGE NPCS
    // =====================
    case "village_npc_1":
      return "Vicente Blabla";

    case "village_npc_2":
      return "Ligaya Blabla";

    case "village_npc_3":
      return "Nando Blabla";

    // =====================
    // FOREST NPCS
    // =====================
    case "forest_npc_1":
      return "*to edit (forest npc 1)";

    case "forest_npc_2":
      return "*to edit (forest npc 2)";

    case "forest_npc_3":
      return "*to edit (forest npc 3)";

    // =====================
    // CASTLE NPCS
    // =====================
    case "castle_npc_1":
      return "*to edit (castle npc 1)";

    case "castle_npc_2":
      return "*to edit (castle npc 2)";

    case "castle_npc_3":
      return "*to edit (castle npc 3)";

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
            {getInstructions(npcId)}
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
