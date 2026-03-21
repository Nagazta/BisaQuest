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
            <h2 className="quest-modal-title">Andam na ba ka?</h2>
            <div className="quest-modal-divider"></div>
            <p className="quest-modal-instructions">
              You're about to start the
            </p>
            <div className="quest-modal-quest-name">{questTitle}</div>
            <p className="quest-modal-encouragement">
              Tara na, magsugod na ta!
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="30"
                height="30"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="quest-modal-celebrate-svg"
              >
                <path d="M5.8 11.3 2 22l10.7-3.79" />
                <path d="M4 3h.01" />
                <path d="M22 8h.01" />
                <path d="M15 2h.01" />
                <path d="M22 20h.01" />
                <path d="m22 2-2.24.75a2.9 2.9 0 0 0-1.96 3.12v0c.1.86-.57 1.63-1.45 1.63h-.38c-.86 0-1.6.6-1.76 1.44L14 10" />
                <path d="m22 13-.82-.33c-.86-.34-1.82.2-1.98 1.11v0c-.11.7-.72 1.22-1.43 1.22H17" />
                <path d="m11 2 .33.82c.34.86-.2 1.82-1.11 1.98v0C9.52 4.9 9 5.52 9 6.23V7" />
                <path d="M11 13c1.93 1.93 2.83 4.17 2 5-.83.83-3.07-.07-5-2-1.93-1.93-2.83-4.17-2-5 .83-.83 3.07.07 5 2Z" />
              </svg>
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
      case "village_npc_2":
        return "Tabangi si Ligaya sa paglimpyo sa balay while learning Bisaya house words!";

      // =====================
      // FOREST NPCS
      // =====================
      case "forest_npc_1":
        return "Tabangi si Lunti para magkasinabot ang uban animals!";

      case "forest_npc_2":
        return "Naghimo siya ug istorya pero dili niya mahimo tungod sa lost words.";

      case "forest_npc_3":
        return "Ganahan siya ug riddles, pero wala na nagkadimao tungod sa kagubot.";

      case "forest_npc_4":
        return "This magical deer looks lost. Tabangi siya!";

      // =====================
      // CASTLE NPCS
      // =====================
      case "castle_npc_1":
        return "Kuyugi si Princess Hara para ma pares ang words sa iyang garden ug library";

      case "castle_npc_2":
        return "Tabangan si Manong Kwill sa gawas sa kastilyo para ma pares ang mga compound words";

      case "castle_npc_3":
        return "Sulod sa kwarto ni Gulo, tabangan siya para ma pares ang mga pulong nga iyang gikuha";

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
