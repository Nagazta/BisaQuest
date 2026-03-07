import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import InteractiveMap from "../../components/InteractiveMap";
import Village from "../../assets/images/cardsImage/village.png";
import Forest from "../../assets/images/cardsImage/forest.png";
import Kingdom from "../../assets/images/cardsImage/kingdom.png";
import QuestStartModal from "../../components/QuestStartModal";
import SaveProgressModal from "../../components/progress/SaveProgressModal";
import Notification from "../../components/Notification";
import ParticleEffects from "../../components/ParticleEffects";
import {
    getPlayerId, getProgress, isEnvironmentUnlocked,
    hasCutsceneSeen, clearPlayerData,
} from "../../utils/playerStorage";
import Button from "../../components/Button";

// Quest ID → direct environment route (used on return visits)
const QUEST_ROUTES = {
    1: "/student/village",
    2: "/student/forest",
    3: "/student/castle",
};

// Quest ID → entry cutscene type (used on first visit)
const CUTSCENE_KEYS = {
    1: "village_entry",
    2: "forest_entry",
    3: "castle_entry",
};

// Quest ID → environment key (matches playerStorage keys)
const QUEST_ENV = {
    1: "village",
    2: "forest",
    3: "castle",
};

const PlayerLobby = () => {
    const { player, startNewGame } = useAuth();
    const navigate = useNavigate();

    const [showQuestModal,  setShowQuestModal]  = React.useState(false);
    const [showSaveModal,   setShowSaveModal]   = React.useState(false);
    const [savedProgress,   setSavedProgress]   = React.useState(null);
    const [selectedQuest,   setSelectedQuest]   = React.useState(null);
    const [notification,    setNotification]    = React.useState(null);
    const [moduleProgress,  setModuleProgress]  = React.useState({});
    const [showExitModal,   setShowExitModal]   = React.useState(false);

    // 🛠️ DEV MODE — unlocks all quests
    const [devMode, setDevMode] = React.useState(false);

    // ── Guard ─────────────────────────────────────────────────────────────────
    useEffect(() => {
        if (!player) navigate('/');
    }, [player, navigate]);

    // ── Load progress from localStorage ──────────────────────────────────────
    useEffect(() => {
        if (player?.player_id) fetchModuleProgress();
    }, [player]);

    const fetchModuleProgress = () => {
        const progress = getProgress();
        setModuleProgress({
            1: progress.village_progress || 0,
            2: progress.forest_progress  || 0,
            3: progress.castle_progress  || 0,
        });
    };

    // Refresh progress when returning from a quest
    useEffect(() => {
        if (location.state?.moduleCompleted) {
            fetchModuleProgress();
            setNotification({ type: "success", title: "Quest Complete!", message: "You've completed the quest!" });
            navigate(location.pathname, { replace: true, state: {} });
        }
    }, [location.state, navigate, location.pathname]);

    // ── ESC key to show exit modal ────────────────────────────────────────────
    useEffect(() => {
        const handleKeyDown = (e) => { if (e.key === "Escape") setShowExitModal(true); };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);

    const handleBackToMenu   = () => { setShowExitModal(false); navigate("/"); };
    const handleSwitchPlayer = () => { setShowExitModal(false); startNewGame(); navigate("/login"); };

    const quests = [
        { id: 1, title: "Vocabulary Quest",          subtitle: "Village Theme", description: "Explore the village and learn new words", progress: moduleProgress[1] || 0, image: Village },
        { id: 2, title: "Synonyms & Antonyms Quest", subtitle: "Forest Theme",  description: "Journey through the magical forest",      progress: moduleProgress[2] || 0, image: Forest  },
        { id: 3, title: "Compound Quest",            subtitle: "Castle Theme",  description: "Master word building in the Castle",      progress: moduleProgress[3] || 0, image: Kingdom },
    ];

    // ── Quest lock logic ──────────────────────────────────────────────────────
    const isQuestUnlocked = (questId) => {
        if (devMode) return true;
        return isEnvironmentUnlocked(QUEST_ENV[questId]);
    };

    const getLockMessage = (questId) => {
        if (questId === 2) return "Complete all 3 Village NPCs to unlock the Forest!";
        if (questId === 3) return "Complete the Forest to unlock the Castle!";
        return "Complete the previous quest first!";
    };

    // ── Start quest ───────────────────────────────────────────────────────────
    const handleStartQuest = (questId) => {
        setNotification(null);

        if (!isQuestUnlocked(questId)) {
            setNotification({ type: "error", title: "🔒 Quest Locked", message: getLockMessage(questId) });
            return;
        }

        const quest = quests.find(q => q.id === questId);
        setSelectedQuest(quest);
        checkForSavedProgress(questId);
    };

    // ── Check saved progress — localStorage only, no API ─────────────────────
    const checkForSavedProgress = (questId) => {
        const progress = getProgress();
        const envKey   = QUEST_ENV[questId];
        const pct      = progress[`${envKey}_progress`] || 0;

        if (pct > 0) {
            // Has existing progress — show Continue / New Game modal
            setSavedProgress({ progress: pct, environment: envKey });
            setShowSaveModal(true);
        } else {
            setShowQuestModal(true);
        }
    };

    // ── Continue existing save ────────────────────────────────────────────────
    const handleContinue = () => {
        setShowSaveModal(false);
        navigate(QUEST_ROUTES[selectedQuest?.id] || "/student/village");
    };

    // ── New game — wipe localStorage, no API needed ───────────────────────────
    const handleNewGame = () => {
        clearPlayerData();
        setSavedProgress(null);
        setShowSaveModal(false);
        setShowQuestModal(true);
        fetchModuleProgress();
    };

    // ── Confirm quest start ───────────────────────────────────────────────────
    const handleConfirmQuest = () => {
        setShowQuestModal(false);

        const id           = selectedQuest?.id;
        const cutsceneKey  = CUTSCENE_KEYS[id];

        // First visit → play entry cutscene; return visits → go direct
        if (cutsceneKey && !hasCutsceneSeen(cutsceneKey)) {
            navigate(`/cutscene/${cutsceneKey}`);
        } else {
            navigate(QUEST_ROUTES[id] || "/student/village");
        }
    };

    if (!player) return null;

    return (
        <div className="dashboard-container">
            <ParticleEffects enableMouseTrail={false} />

            {/* 🛠️ DEV MODE TOGGLE — remove before production */}
            <button
                onClick={() => setDevMode(p => !p)}
                style={{
                    position: "fixed", bottom: "20px", right: "20px", zIndex: 9999,
                    padding: "8px 16px",
                    background: devMode ? "#e74c3c" : "#2ecc71",
                    color: "white", border: "none", borderRadius: "8px",
                    fontWeight: "bold", cursor: "pointer", fontSize: "13px",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.4)",
                }}
            >
                {devMode ? "🔓 Dev Mode ON" : "🔒 Dev Mode OFF"}
            </button>

            {devMode && (
                <div style={{
                    position: "fixed", bottom: "60px", right: "20px", zIndex: 9999,
                    background: "rgba(0,0,0,0.75)", color: "#2ecc71",
                    padding: "6px 12px", borderRadius: "6px",
                    fontSize: "12px", fontFamily: "monospace",
                }}>
                    All quests unlocked
                </div>
            )}

            <InteractiveMap
                quests={quests}
                onQuestClick={handleStartQuest}
                moduleProgress={moduleProgress}
                devMode={devMode}
            />

            <div className="decorative-clouds">
                <div className="cloud cloud-1"></div>
                <div className="cloud cloud-2"></div>
                <div className="cloud cloud-3"></div>
            </div>

            <QuestStartModal
                isOpen={showQuestModal}
                questTitle={selectedQuest?.title}
                onConfirm={handleConfirmQuest}
                onClose={() => setShowQuestModal(false)}
            />

            <SaveProgressModal
                isOpen={showSaveModal}
                onContinue={handleContinue}
                onNewGame={handleNewGame}
                onClose={() => setShowSaveModal(false)}
                savedProgress={savedProgress}
            />

            {notification && (
                <Notification
                    type={notification.type}
                    title={notification.title}
                    message={notification.message}
                    onClose={() => setNotification(null)}
                />
            )}

            <SaveProgressModal
                isOpen={showExitModal}
                mode="exit"
                onBackToMenu={handleBackToMenu}
                onSwitchPlayer={handleSwitchPlayer}
                onClose={() => setShowExitModal(false)}
            />
        </div>
    );
};

export default PlayerLobby;