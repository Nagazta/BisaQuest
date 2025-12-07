import React from "react";
import Button from "./Button";
import "./styles/ReplayConfirmModal.css";

const ReplayConfirmModal = ({
  isOpen,
  latestAttempt,
  encountersRemaining,
  onPlayAgain,
  onGoBack,
  backgroundImage,
}) => {
  if (!isOpen || !latestAttempt) return null;

  return (
    <div className="replay-page-wrapper">
      <div
        className="replay-background"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      />

      <div className="replay-confirmation-modal">
        <div className="replay-modal-content">
          <h2>Previous Attempt Found</h2>
          <div className="previous-score-info">
            <p>
              <strong>Previous Score:</strong> {latestAttempt.score}/
              {latestAttempt.totalQuestions}
            </p>
            <p>
              <strong>Time Spent:</strong> {latestAttempt.timeSpent}s
            </p>
            <p>
              <strong>Attempts Remaining:</strong> {encountersRemaining}
            </p>
          </div>
          <p className="replay-warning">
            Are you sure you want to play again? Your best score will be kept.
          </p>
          <div className="replay-modal-buttons">
            <Button onClick={onPlayAgain} className="btn-confirm">
              Yes, Play Again
            </Button>
            <Button onClick={onGoBack} className="btn-cancel">
              No, Go Back
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReplayConfirmModal;
