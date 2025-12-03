import { useState } from 'react';
import NPCCharacter from '../NPCCharacter'; 
import LoadingBoy from '../../assets/images/characters/loading_screen_boy.png'
import ConfirmationDialog from '../progress/ConfirmationDIalog';
import Button from '../Button';
import '../progress/styles/SaveProgressModal.css';

const SaveProgressModal = ({ 
  isOpen, 
  onContinue, 
  onNewGame, 
  characterImage,
  savedProgress 
}) => {
  const [showConfirmation, setShowConfirmation] = useState(false);

  if (!isOpen) return null;

  const handleNewGameClick = () => {
    setShowConfirmation(true);
  };

  const handleConfirmNewGame = () => {
    setShowConfirmation(false);
    onNewGame();
  };

  const handleCancelNewGame = () => {
    setShowConfirmation(false);
  };

  return (
    <>
      <div className="modal-overlay">
        <div className="save-progress-modal">
          <div className="modal-scroll-border">
            <div className="modal-content-progess">
              <h2 className="modal-title">Save Progress Detected</h2>
              
              {/* Using NPCCharacter with modal variant */}
              <NPCCharacter 
                characterImage={LoadingBoy}
                variant="modal"
                alt="Your Character"
              />

            
              <div className="modal-actions">
                <Button 
                  variant="primary" 
                  className="modal-btn continue-btn"
                  onClick={onContinue}
                >
                  Continue
                </Button>
                <Button 
                  variant="secondary" 
                  className="modal-btn new-game-btn"
                  onClick={handleNewGameClick}
                >
                  New game
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ConfirmationDialog
        isOpen={showConfirmation}
        title="Start New Game?"
        message="Are you sure you want to start a new game? Your current progress will be lost."
        onConfirm={handleConfirmNewGame}
        onCancel={handleCancelNewGame}
      />
    </>
  );
};

export default SaveProgressModal;