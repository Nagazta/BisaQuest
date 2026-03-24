import { useState } from "react";
import AssetManifest from "../../services/AssetManifest";
import ConfirmationDialog from "./ConfirmationDIalog";
import Button from "../Button";
import "./SaveProgressModal.css";

const SaveProgressModal = ({ 
  isOpen, 
  onContinue, 
  onNewGame, 
  onClose,
  // Exit mode props
  mode = "save",
  onBackToMenu,
  onSwitchPlayer
}) => {
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);

  if (!isOpen) return null;

  const handleNewGameClick = () => {
    setConfirmAction("newGame");
    setShowConfirmation(true);
  };

  const handleSwitchPlayerClick = () => {
    setConfirmAction("switchPlayer");
    setShowConfirmation(true);
  };

  const handleConfirm = () => {
    setShowConfirmation(false);
    if (confirmAction === "newGame") onNewGame?.();
    if (confirmAction === "switchPlayer") onSwitchPlayer?.();
  };

  const handleCancel = () => {
    setShowConfirmation(false);
    setConfirmAction(null);
  };

  const confirmMessages = {
    newGame: {
      title: "Start New Game?",
      message: "Mawad-an ang tanan nimo nga progress. Are you sure?"
    },
    switchPlayer: {
      title: "Switch Player?",
      message: "Mag-switch og player? Your progress is saved!"
    }
  };

  return (
    <>
      <div className="modal-overlay" onClick={onClose}>
        <div className="save-progress-modal" onClick={(e) => e.stopPropagation()}>
          <div className="modal-scroll-border">
            <div className="modal-content-progess">
              <h2 className="modal-title">
                {mode === "exit" ? "Leaving already?" : "Continue your quest?"}
              </h2>

              <div className="modal-character-container">
                <img src={AssetManifest.ui.loadingBoy} alt="Your Character" className="modal-character-image" />
              </div>

              <div className="modal-actions">
                {mode === "exit" ? (
                  <>
                    <Button variant="primary" className="modal-btn continue-btn" onClick={onBackToMenu}>
                      Back to Menu
                    </Button>
                    <Button variant="secondary" className="modal-btn new-game-btn" onClick={handleSwitchPlayerClick}>
                      Switch Player
                    </Button>
                    <Button variant="secondary" className="modal-btn cancel-btn" onClick={onClose}>
                      Cancel
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="primary" className="modal-btn continue-btn" onClick={onContinue}>
                      Continue
                    </Button>
                    <Button variant="secondary" className="modal-btn new-game-btn" onClick={handleNewGameClick}>
                      New game
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <ConfirmationDialog
        isOpen={showConfirmation}
        title={confirmMessages[confirmAction]?.title || "Are you sure?"}
        message={confirmMessages[confirmAction]?.message || "This action cannot be undone."}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </>
  );
};

export default SaveProgressModal;