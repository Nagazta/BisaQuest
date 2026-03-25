import { useState, useEffect, useMemo, useCallback } from "react";
import ChallengeCounter from "./ChallengeCounter";
import DialogueBox from "../components/instructions/DialogueBox";
import CollisionDebugger from "../config/CollisionDebugger";
import { getCollisionZones, checkCollisionWithZones } from "../config/environmentCollisions";
import { getProgress } from "../utils/playerStorage";
import { useWalkingAnimation } from "../hooks/useWalkingAnimation";
import LazyImage from "./LazyImage";
import "./EnvironmentPage.css";

const EnvironmentPage = ({
    environmentType = "village",
    backgroundImage,
    npcs = [],
    onNPCClick,
    playerCharacter,
    characterType,
    debugMode = false,
    playerId,
    hintMessage,
    onEdgeWalk,
}) => {
    const [playerPosition, setPlayerPosition] = useState({ x: 50, y: 50 });
    const [keysPressed, setKeysPressed] = useState({});
    const [npcCompletionStatus, setNpcCompletionStatus] = useState({});
    const [nearbyNPC, setNearbyNPC] = useState(null);
    const [interactionRange] = useState(8);
    const [hintVisible, setHintVisible] = useState(true);

    const collisionConfig = useMemo(() => getCollisionZones(environmentType), [environmentType]);

    // ── Walking animation sprite ──────────────────────────────────────────────
    const walkingSprite = useWalkingAnimation(characterType, keysPressed);

    const calculateDistance = useCallback((npc) => {
        const dx = playerPosition.x - npc.x;
        const dy = playerPosition.y - npc.y;
        return Math.sqrt(dx * dx + dy * dy);
    }, [playerPosition]);

    // ── NPC completion status — read from localStorage ────────────────────────
    // No API call needed — saveNPCProgress writes completed:true per NPC
    useEffect(() => {
        loadNpcStatus();
    }, [environmentType, playerId]);

    const loadNpcStatus = () => {
        const progress = getProgress();
        const npcKey = `${environmentType}_npcs`;
        const npcData = progress[npcKey] || {};

        const statusMap = {};
        Object.entries(npcData).forEach(([npcId, data]) => {
            statusMap[npcId] = {
                completed: data.completed || false,
                encounters: data.encounters || 0,
                bestScore: data.score || 0,
            };
        });
        setNpcCompletionStatus(statusMap);
    };

    // Re-read after returning from a quest (parent increments key, but also
    // listen for storage changes in case of same-tab updates)
    useEffect(() => {
        const onStorage = () => loadNpcStatus();
        window.addEventListener("storage", onStorage);
        return () => window.removeEventListener("storage", onStorage);
    }, [environmentType]);

    // ── Nearby NPC detection ──────────────────────────────────────────────────
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

    // ── E key interaction ─────────────────────────────────────────────────────
    useEffect(() => {
        const handleInteraction = (e) => {
            if (e.key.toLowerCase() === "e" && nearbyNPC) {
                e.preventDefault();
                onNPCClick?.(nearbyNPC);
            }
        };
        window.addEventListener("keydown", handleInteraction);
        return () => window.removeEventListener("keydown", handleInteraction);
    }, [nearbyNPC, onNPCClick]);

    // ── Collision ─────────────────────────────────────────────────────────────
    const checkCollision = (newX, newY) => {
        if (checkCollisionWithZones(newX, newY, collisionConfig.zones, collisionConfig.playerSize, collisionConfig.boundaries)) return true;
        const playerSize = collisionConfig.playerSize;
        for (const npc of npcs) {
            const npcSize = 5;
            if (newX < npc.x + npcSize && newX + playerSize > npc.x && newY < npc.y + npcSize && newY + playerSize > npc.y) return true;
        }
        return false;
    };

    // ── Keyboard controls ─────────────────────────────────────────────────────
    useEffect(() => {
       const handleKeyDown = (e) => {
            const key = e.key.toLowerCase();
            const arrowKeys = ["arrowup", "arrowdown", "arrowleft", "arrowright"];
            if (["w", "a", "s", "d"].includes(key) || arrowKeys.includes(key)) {
                e.preventDefault();
                setKeysPressed(prev => ({ ...prev, [e.key]: true, [key]: true }));
            }
        };
        const handleKeyUp = (e) => {
            const key = e.key.toLowerCase();
            const arrowKeys = ["arrowup", "arrowdown", "arrowleft", "arrowright"];
            if (["w", "a", "s", "d"].includes(key) || arrowKeys.includes(key)) {
                setKeysPressed(prev => ({ ...prev, [e.key]: false, [key]: false }));
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        window.addEventListener("keyup", handleKeyUp);
        return () => { window.removeEventListener("keydown", handleKeyDown); window.removeEventListener("keyup", handleKeyUp); };
    }, []);

    useEffect(() => {
        const moveSpeed = 0.5;
        let animationFrameId;
        const updatePosition = () => {
            setPlayerPosition((prev) => {
                let newX = prev.x;
                let newY = prev.y;
                if (keysPressed["w"] || keysPressed["ArrowUp"]) newY = prev.y - moveSpeed;
                if (keysPressed["s"] || keysPressed["ArrowDown"]) newY = prev.y + moveSpeed;
                if (keysPressed["a"] || keysPressed["ArrowLeft"]) newX = prev.x - moveSpeed;
                if (keysPressed["d"] || keysPressed["ArrowRight"]) newX = prev.x + moveSpeed;
                
                if (onEdgeWalk && newX > 98) {
                    onEdgeWalk('right');
                }

                if (checkCollision(newX, newY)) {
                    if (checkCollision(newX, prev.y)) newX = prev.x;
                    if (checkCollision(prev.x, newY)) newY = prev.y;
                    if (checkCollision(newX, newY)) return prev;
                }
                return { x: newX, y: newY };
            });
            animationFrameId = requestAnimationFrame(updatePosition);
        };
        if (Object.values(keysPressed).some(Boolean)) animationFrameId = requestAnimationFrame(updatePosition);
        return () => cancelAnimationFrame(animationFrameId);
    }, [keysPressed, npcs, collisionConfig]);

    const handleNPCClick = (npc) => {
        if (calculateDistance(npc) < interactionRange) onNPCClick?.(npc);
    };

    const completedCount = Object.values(npcCompletionStatus).filter(s => s.completed).length;

    return (
        <div className={`environment-page ${environmentType}`}>
            <div className="environment-background" style={{ backgroundImage: `url(${backgroundImage})` }} />

            {/* NPCs */}
            {npcs.map((npc, index) => {
                // Look up by dbNpcId first (what's stored in localStorage), fall back to npcId
                const statusKey = npc.dbNpcId || npc.npcId;
                const status = npcCompletionStatus[statusKey];
                const isCompleted = status?.completed || false;
                const isNearby = nearbyNPC?.npcId === npc.npcId;
                return (
                    <div
                        key={npc.npcId || index}
                        className={`npc-on-map ${isCompleted ? "completed" : ""} ${isNearby ? "nearby" : ""}`}
                        style={{ left: `${npc.x}%`, top: `${npc.y}%` }}
                        onClick={() => handleNPCClick(npc)}
                    >
                        <LazyImage src={npc.character} alt={npc.name} className="npc-image" />
                        {npc.showName && (
                            <div className="npc-name-tag">
                                {npc.name}
                                {isCompleted && <span className="completion-badge">✓</span>}
                            </div>
                        )}

                        {isNearby && <div className="interaction-prompt">Press E to interact</div>}
                    </div>
                );
            })}

            {/* Player */}
            <div className="player-character" style={{ left: `${playerPosition.x}%`, top: `${playerPosition.y}%` }}>
                {characterType
                    ? <LazyImage src={walkingSprite} alt="Player" className="player-image" showShimmer={false} />
                    : playerCharacter
                        ? <LazyImage src={playerCharacter} alt="Player" className="player-image" showShimmer={false} />
                        : <div className="player-placeholder">👤</div>
                }
            </div>

            {/* Challenge counter */}
            <ChallengeCounter completed={completedCount} total={npcs.length} label="Challenges" />

            {/* Hint dialogue box */}
            {hintMessage && hintVisible && (
                <DialogueBox
                    text={hintMessage}
                    onNext={() => setHintVisible(false)}
                    showNextButton={true}
                />
            )}

           <div className="controls-hint">Use W, A, S, D or Arrow Keys to move • Press E to interact with NPCs</div>

            {debugMode && (
                <CollisionDebugger collisionZones={collisionConfig.zones} playerPosition={playerPosition} environmentType={environmentType} />
            )}
        </div>
    );
};

export default EnvironmentPage;