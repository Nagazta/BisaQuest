import { useState, useEffect } from 'react';
import ProgressBar from './ProgressBar';
import './styles/EnvironmentPage.css';

const EnvironmentPage = ({ 
  environmentType = 'village',
  backgroundImage,
  npcs = [], // Array of NPC objects with position, character image, name, dialogues
  onNPCClick,
  playerCharacter // Path to player character image
}) => {
  const [playerPosition, setPlayerPosition] = useState({ x: 50, y: 50 }); // Starting position in percentage
  const [keysPressed, setKeysPressed] = useState({});
  const [selectedNPC, setSelectedNPC] = useState(null);
  const [dialogueStep, setDialogueStep] = useState(0);

  // Handle keyboard input
  useEffect(() => {
    const handleKeyDown = (e) => {
      const key = e.key.toLowerCase();
      if (['w', 'a', 's', 'd'].includes(key)) {
        e.preventDefault();
        setKeysPressed(prev => ({ ...prev, [key]: true }));
      }
    };

    const handleKeyUp = (e) => {
      const key = e.key.toLowerCase();
      if (['w', 'a', 's', 'd'].includes(key)) {
        setKeysPressed(prev => ({ ...prev, [key]: false }));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Update player position based on keys pressed
  useEffect(() => {
    const moveSpeed = 0.5; // Speed in percentage per frame
    let animationFrameId;

    const updatePosition = () => {
      setPlayerPosition(prev => {
        let newX = prev.x;
        let newY = prev.y;

        if (keysPressed['w']) newY = Math.max(5, prev.y - moveSpeed);
        if (keysPressed['s']) newY = Math.min(85, prev.y + moveSpeed);
        if (keysPressed['a']) newX = Math.max(5, prev.x - moveSpeed);
        if (keysPressed['d']) newX = Math.min(90, prev.x + moveSpeed);

        return { x: newX, y: newY };
      });

      animationFrameId = requestAnimationFrame(updatePosition);
    };

    if (Object.values(keysPressed).some(pressed => pressed)) {
      animationFrameId = requestAnimationFrame(updatePosition);
    }

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [keysPressed]);

  const handleNPCClick = (npc, index) => {
    setSelectedNPC({ ...npc, index });
    setDialogueStep(0);
    if (onNPCClick) {
      onNPCClick(npc, index);
    }
  };

  const handleNext = () => {
    if (selectedNPC && dialogueStep < selectedNPC.dialogues.length - 1) {
      setDialogueStep(dialogueStep + 1);
    } else {
      setSelectedNPC(null);
      setDialogueStep(0);
    }
  };

  const handleCloseDialogue = () => {
    setSelectedNPC(null);
    setDialogueStep(0);
  };

  return (
    <div className={`environment-page ${environmentType}`}>
      {/* Background Image */}
      <div 
        className="environment-background"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      />

      {/* NPCs on the map */}
      {npcs.map((npc, index) => (
        <div
          key={index}
          className="npc-on-map"
          style={{
            left: `${npc.x}%`,
            top: `${npc.y}%`,
          }}
          onClick={() => handleNPCClick(npc, index)}
        >
          <img 
            src={npc.character} 
            alt={npc.name}
            className="npc-image"
          />
          {npc.showName && (
            <div className="npc-name-tag">{npc.name}</div>
          )}
        </div>
      ))}

      {/* Player Character */}
      <div 
        className="player-character"
        style={{
          left: `${playerPosition.x}%`,
          top: `${playerPosition.y}%`,
        }}
      >
        {playerCharacter ? (
          <img 
            src={playerCharacter} 
            alt="Player"
            className="player-image"
          />
        ) : (
          <div className="player-placeholder">👤</div>
        )}
      </div>

      {/* Progress Bar */}
      <ProgressBar 
        progress={0} 
        variant="environment"
        showLabel={true}
      />


      {/* Controls Hint */}
      <div className="controls-hint">
        Use W, A, S, D to move
      </div>

      {/* Dialogue Box */}
      {selectedNPC && (
        <div className="dialogue-overlay">
          <div className="dialogue-box-container">
            <div className="dialogue-box">
              <div className="dialogue-header">
                <h3 className="dialogue-title">{selectedNPC.name}</h3>
                <button 
                  className="dialogue-close"
                  onClick={handleCloseDialogue}
                >
                  ✕
                </button>
              </div>
              <div className="dialogue-content">
                <p>{selectedNPC.dialogues[dialogueStep]}</p>
              </div>
                <button 
                className="dialogue-next-button"
                onClick={handleCloseDialogue}
                >
                Close
                </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnvironmentPage;