import { useState } from "react";
import LoadingBoy from "../../assets/images/characters/loading_screen_boy.png";
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
      message: "Are you sure you want to start a new game? Your current progress will be lost."
    },
    switchPlayer: {
      title: "Switch Player?",
      message: "This will log you out and let someone else play. Your progress is saved!"
    }
  };

  return (
    <>
      <div className="modal-overlay" onClick={onClose}>
        <div className="save-progress-modal" onClick={(e) => e.stopPropagation()}>
          <div className="modal-scroll-border">
            <div className="modal-content-progess">
              <h2 className="modal-title">
                {mode === "exit" ? "Leaving already?" : "Save Progress Detected"}
              </h2>

              <div className="modal-character-container">
                <img src={LoadingBoy} alt="Your Character" className="modal-character-image" />
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