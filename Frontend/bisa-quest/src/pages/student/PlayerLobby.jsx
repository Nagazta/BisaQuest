import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import HamburgerMenu from "../../components/HamburgerMenu";
import InteractiveMap from "../../components/InteractiveMap";
import Village from "../../assets/images/cardsImage/village.png";
import Forest from "../../assets/images/cardsImage/forest.png";
import Kingdom from "../../assets/images/cardsImage/kingdom.png";
import "./StudentDashboard.css";
import QuestStartModal from "../../components/QuestStartModal";
import SaveProgressModal from "../../components/progress/SaveProgressModal";
import Notification from "../../components/Notification";
import ParticleEffects from "../../components/ParticleEffects";
import { getPlayerId } from "../../utils/playerStorage";

// Quest ID → route map
const QUEST_ROUTES = {
    1: "/student/village",
    2: "/student/forest",
    3: "/student/castle",
};

const PlayerLobby = () => {
    const { player, logout } = useAuth();
    const navigate = useNavigate();

    const [showQuestModal,  setShowQuestModal]  = React.useState(false);
    const [showSaveModal,   setShowSaveModal]   = React.useState(false);
    const [savedProgress,   setSavedProgress]   = React.useState(null);
    const [selectedQuest,   setSelectedQuest]   = React.useState(null);
    const [notification,    setNotification]    = React.useState(null);
    const [moduleProgress,  setModuleProgress]  = React.useState({});

    // ── 🛠️ DEV MODE — unlocks all quests ─────────────────────────────────────
    const [devMode, setDevMode] = React.useState(false);

    // ── Guard ─────────────────────────────────────────────────────────────────
    useEffect(() => {
        if (!player) navigate('/');
    }, [player, navigate]);

    // ── Fetch progress ────────────────────────────────────────────────────────
    useEffect(() => {
        if (player?.player_id) fetchModuleProgress();
    }, [player]);

    const fetchModuleProgress = async () => {
        try {
            const playerId = getPlayerId();
            if (!playerId) return;
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/completion/player/${playerId}`);
            if (!response.ok) return;
            const result = await response.json();
            if (result.success && result.data) {
                const progressMap = {};
                result.data.forEach(c => { progressMap[c.module_id] = c.completion_percentage; });
                setModuleProgress(progressMap);
            }
        } catch (error) { console.error('❌ Error fetching progress:', error); }
    };

    // ── Notification for completed module ─────────────────────────────────────
    useEffect(() => {
        if (location.state?.moduleCompleted) {
            setNotification({ type: "success", title: "Quest Complete!", message: `You've completed the quest!` });
            navigate(location.pathname, { replace: true, state: {} });
        }
    }, [location.state, navigate, location.pathname]);

    const handleLogout = async () => { await logout(); navigate("/"); };

    const quests = [
        { id: 1, title: "Vocabulary Quest",           subtitle: "Village Theme", description: "Explore the village and learn new words",      progress: moduleProgress[1] || 0, image: Village },
        { id: 2, title: "Synonyms & Antonyms Quest",  subtitle: "Forest Theme",  description: "Journey through the magical forest",           progress: moduleProgress[2] || 0, image: Forest  },
        { id: 3, title: "Compound Quest",             subtitle: "Castle Theme",  description: "Master word building in the Castle",           progress: moduleProgress[3] || 0, image: Kingdom },
    ];

    // ── Quest lock logic — bypassed in dev mode ───────────────────────────────
    const isQuestUnlocked = (questId) => {
        if (devMode) return true;
        if (questId === 1) return true;
        if (questId === 2) return (moduleProgress[1] || 0) >= 100;
        if (questId === 3) return (moduleProgress[1] || 0) >= 100 && (moduleProgress[2] || 0) >= 100;
        return false;
    };

    const handleStartQuest = async (questId) => {
        setNotification(null);

        if (!isQuestUnlocked(questId)) {
            setNotification({ type: "error", title: "Quest Locked", message: "Complete the previous quest first!" });
            return;
        }

        const quest = quests.find(q => q.id === questId);
        setSelectedQuest(quest);
        await checkForSavedProgress(questId);
    };

    const checkForSavedProgress = async (questId) => {
        try {
            const playerId = getPlayerId();
            if (!playerId) { setShowQuestModal(true); return; }

            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/progress/${playerId}/${questId}`);
            if (!response.ok) { setShowQuestModal(true); return; }

            const progressData = await response.json();
            if (progressData.hasProgress && progressData.data) {
                setSavedProgress(progressData.data);
                setShowSaveModal(true);
            } else {
                setShowQuestModal(true);
            }
        } catch (err) { setShowQuestModal(true); }
    };

    const handleContinue = () => {
        setShowSaveModal(false);
        navigate(QUEST_ROUTES[selectedQuest?.id] || "/student/village");
    };

    const handleNewGame = async () => {
        try {
            const playerId = getPlayerId();
            if (!playerId) return;
            await fetch(`${import.meta.env.VITE_API_URL}/api/progress/reset-all`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ player_id: playerId }),
            });
            setSavedProgress(null);
            setShowSaveModal(false);
            setShowQuestModal(true);
            fetchModuleProgress();
        } catch (err) { setShowSaveModal(false); setShowQuestModal(true); }
    };

    const handleConfirmQuest = () => {
        setShowQuestModal(false);
        navigate(QUEST_ROUTES[selectedQuest?.id] || "/student/village");
    };

    if (!player) return null;

    return (
        <div className="dashboard-container">
            <ParticleEffects enableMouseTrail={false} />
            <HamburgerMenu onLogout={handleLogout} />

            {/* 🛠️ DEV MODE TOGGLE — remove before production */}
            <button
                onClick={() => setDevMode(p => !p)}
                style={{
                    position: "fixed",
                    bottom: "20px",
                    right: "20px",
                    zIndex: 9999,
                    padding: "8px 16px",
                    background: devMode ? "#e74c3c" : "#2ecc71",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    fontWeight: "bold",
                    cursor: "pointer",
                    fontSize: "13px",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.4)",
                }}
            >
                {devMode ? "🔓 Dev Mode ON" : "🔒 Dev Mode OFF"}
            </button>

            {devMode && (
                <div style={{
                    position: "fixed",
                    bottom: "60px",
                    right: "20px",
                    zIndex: 9999,
                    background: "rgba(0,0,0,0.75)",
                    color: "#2ecc71",
                    padding: "6px 12px",
                    borderRadius: "6px",
                    fontSize: "12px",
                    fontFamily: "monospace",
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
        </div>
    );
};

export default PlayerLobby;