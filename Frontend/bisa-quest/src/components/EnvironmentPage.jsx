import { useState, useEffect, useMemo, useCallback } from "react";
import ProgressBar from "./ProgressBar";
import CollisionDebugger from "../config/CollisionDebugger";
import { getCollisionZones, checkCollisionWithZones } from "../config/environmentCollisions";
import "./EnvironmentPage.css";

const EnvironmentPage = ({
  environmentType = "village",
  backgroundImage,
  npcs = [],
  onNPCClick,
  playerCharacter,
  debugMode = false, // Set to true to enable debug overlay
}) => {
  const [playerPosition, setPlayerPosition] = useState({ x: 50, y: 50 });
  const [keysPressed, setKeysPressed] = useState({});
  const [environmentProgress, setEnvironmentProgress] = useState(0);
  const [npcCompletionStatus, setNpcCompletionStatus] = useState({});
  const [nearbyNPC, setNearbyNPC] = useState(null);
  const [interactionRange] = useState(8); // Distance in % to trigger interaction

  // Get collision configuration for this environment
  const collisionConfig = useMemo(() => {
    return getCollisionZones(environmentType);
  }, [environmentType]);

  // Calculate distance between player and NPC
  const calculateDistance = useCallback((npc) => {
    const dx = playerPosition.x - npc.x;
    const dy = playerPosition.y - npc.y;
    return Math.sqrt(dx * dx + dy * dy);
  }, [playerPosition]);

  // Check for nearby NPCs
  useEffect(() => {
    let closestNPC = null;
    let closestDistance = Infinity;

    npcs.forEach((npc) => {
      const distance = calculateDistance(npc);
      if (distance < interactionRange && distance < closestDistance) {
        closestDistance = distance;
        closestNPC = npc;
      }
    });

    setNearbyNPC(closestNPC);
  }, [playerPosition, npcs, calculateDistance, interactionRange]);

  // Handle E key press for interaction
  useEffect(() => {
    const handleInteraction = (e) => {
      if (e.key.toLowerCase() === 'e' && nearbyNPC) {
        e.preventDefault();
        onNPCClick?.(nearbyNPC);
      }
    };

    window.addEventListener('keydown', handleInteraction);
    return () => window.removeEventListener('keydown', handleInteraction);
  }, [nearbyNPC, onNPCClick]);

  // Check if position collides
  const checkCollision = (newX, newY) => {
    // Check static zones from config
    if (checkCollisionWithZones(
      newX,
      newY,
      collisionConfig.zones,
      collisionConfig.playerSize,
      collisionConfig.boundaries
    )) {
      return true;
    }

    // Check NPC collision (can't walk through NPCs)
    const playerSize = collisionConfig.playerSize;
    for (const npc of npcs) {
      const npcSize = 5;
      if (
        newX < npc.x + npcSize &&
        newX + playerSize > npc.x &&
        newY < npc.y + npcSize &&
        newY + playerSize > npc.y
      ) {
        return true;
      }
    }

    return false;
  };

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
      }
    } catch (error) {
      // Error handled
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
        
        // Calculate new position
        if (keysPressed["w"]) newY = prev.y - moveSpeed;
        if (keysPressed["s"]) newY = prev.y + moveSpeed;
        if (keysPressed["a"]) newX = prev.x - moveSpeed;
        if (keysPressed["d"]) newX = prev.x + moveSpeed;
        
        // Check collision before moving
        if (checkCollision(newX, newY)) {
          // If collision, try moving only on one axis
          if (checkCollision(newX, prev.y)) {
            newX = prev.x; // Can't move horizontally
          }
          if (checkCollision(prev.x, newY)) {
            newY = prev.y; // Can't move vertically
          }
          // If still colliding, don't move at all
          if (checkCollision(newX, newY)) {
            return prev;
          }
        }
        
        return { x: newX, y: newY };
      });
      animationFrameId = requestAnimationFrame(updatePosition);
    };

    if (Object.values(keysPressed).some(Boolean)) {
      animationFrameId = requestAnimationFrame(updatePosition);
    }

    return () => cancelAnimationFrame(animationFrameId);
  }, [keysPressed, npcs, collisionConfig]);

  // Handle NPC click - only if in range
  const handleNPCClick = (npc) => {
    const distance = calculateDistance(npc);
    if (distance < interactionRange) {
      onNPCClick?.(npc);
    }
  };

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
          const isNearby = nearbyNPC?.npcId === npc.npcId;

          return (
            <div
              key={npc.npcId || index}
              className={`npc-on-map ${isCompleted ? "completed" : ""} ${isNearby ? "nearby" : ""}`}
              style={{ left: `${npc.x}%`, top: `${npc.y}%` }}
              onClick={() => handleNPCClick(npc)}
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
              {/* Interaction indicator when nearby */}
              {isNearby && (
                <div className="interaction-prompt">
                  Press E to interact
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

      {/* Progress Bar */}
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
      <div className="controls-hint">
        Use W, A, S, D to move • Press E to interact with NPCs
      </div>

      {/* Debug Overlay */}
      {debugMode && (
        <CollisionDebugger
          collisionZones={collisionConfig.zones}
          playerPosition={playerPosition}
          environmentType={environmentType}
        />
      )}
    </div>
  );
};

export default EnvironmentPage;