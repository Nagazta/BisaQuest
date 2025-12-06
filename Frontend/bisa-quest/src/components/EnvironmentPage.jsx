import { useState, useEffect } from "react";
import ProgressBar from "./ProgressBar";
import "./styles/EnvironmentPage.css";

const EnvironmentPage = ({
  environmentType = "village",
  backgroundImage,
  npcs = [],
  onNPCClick,
  playerCharacter,
}) => {
  const [playerPosition, setPlayerPosition] = useState({ x: 50, y: 50 });
  const [keysPressed, setKeysPressed] = useState({});
  const [environmentProgress, setEnvironmentProgress] = useState(0);
  const [npcCompletionStatus, setNpcCompletionStatus] = useState({});

  // Fetch environment progress
  useEffect(() => {
    fetchEnvironmentProgress();
  }, [environmentType]);

  const fetchEnvironmentProgress = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `${
          import.meta.env.VITE_API_URL
        }/api/npc/environment-progress?environmentType=${environmentType}`,

        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const result = await response.json();

      if (result.success) {
        setEnvironmentProgress(
          result.data.progress ?? result.data.progress_percentage ?? 0
        );

        // Create a map of NPC completion status
        const statusMap = {};
        result.data.npcProgress.forEach((npc) => {
          statusMap[npc.npcId] = {
            completed: npc.completed,
            encounters: npc.encounters,
            bestScore: npc.bestScore,
          };
        });
        setNpcCompletionStatus(statusMap);

        console.log("Environment Progress:", result.data);
      }
    } catch (error) {
      console.error("Error fetching environment progress:", error);
    }
  };

  // Keyboard movement
  useEffect(() => {
    const handleKeyDown = (e) => {
      const key = e.key.toLowerCase();
      if (["w", "a", "s", "d"].includes(key)) {
        e.preventDefault();
        setKeysPressed((prev) => ({ ...prev, [key]: true }));
      }
    };
    const handleKeyUp = (e) => {
      const key = e.key.toLowerCase();
      if (["w", "a", "s", "d"].includes(key)) {
        setKeysPressed((prev) => ({ ...prev, [key]: false }));
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  useEffect(() => {
    const moveSpeed = 0.5;
    let animationFrameId;

    const updatePosition = () => {
      setPlayerPosition((prev) => {
        let newX = prev.x;
        let newY = prev.y;
        if (keysPressed["w"]) newY = Math.max(0, prev.y - moveSpeed);
        if (keysPressed["s"]) newY = Math.min(90, prev.y + moveSpeed);
        if (keysPressed["a"]) newX = Math.max(0, prev.x - moveSpeed);
        if (keysPressed["d"]) newX = Math.min(90, prev.x + moveSpeed);
        return { x: newX, y: newY };
      });
      animationFrameId = requestAnimationFrame(updatePosition);
    };

    if (Object.values(keysPressed).some(Boolean)) {
      animationFrameId = requestAnimationFrame(updatePosition);
    }

    return () => cancelAnimationFrame(animationFrameId);
  }, [keysPressed]);

  return (
    <div className={`environment-page ${environmentType}`}>
      {/* Background */}
      <div
        className="environment-background"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      />

      {/* NPCs */}
      {npcs &&
        npcs.map((npc, index) => {
          const status = npcCompletionStatus[npc.npcId];
          const isCompleted = status?.completed || false;

          return (
            <div
              key={npc.npcId || index}
              className={`npc-on-map ${isCompleted ? "completed" : ""}`}
              style={{ left: `${npc.x}%`, top: `${npc.y}%` }}
              onClick={() => onNPCClick?.(npc)}
            >
              <img src={npc.character} alt={npc.name} className="npc-image" />
              {npc.showName && (
                <div className="npc-name-tag">
                  {npc.name}
                  {isCompleted && <span className="completion-badge">✓</span>}
                </div>
              )}
              {status && status.encounters > 0 && (
                <div className="npc-progress-indicator">
                  {status.encounters}/3
                </div>
              )}
            </div>
          );
        })}

      {/* Player */}
      <div
        className="player-character"
        style={{ left: `${playerPosition.x}%`, top: `${playerPosition.y}%` }}
      >
        {playerCharacter ? (
          <img src={playerCharacter} alt="Player" className="player-image" />
        ) : (
          <div className="player-placeholder">👤</div>
        )}
      </div>

      {/* Progress Bar - Now dynamic */}
      <ProgressBar
        progress={environmentProgress}
        variant="environment"
        showLabel={true}
      />

      {/* Progress Details */}
      <div className="environment-progress-info">
        <span>
          {Object.values(npcCompletionStatus).filter((s) => s.completed).length}
          /{npcs.length} Challenges Completed
        </span>
      </div>

      {/* Controls Hint */}
      <div className="controls-hint">Use W, A, S, D to move</div>
    </div>
  );
};

export default EnvironmentPage;
