import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useCharacterPreference } from "../../hooks/useCharacterPreference";
import EnvironmentPage from "../../components/EnvironmentPage";
import Button from "../../components/Button";
import ParticleEffects from "../../components/ParticleEffects";
import { environmentApi } from "../../services/environmentServices.js";
import { getPlayerId } from "../../utils/playerStorage";
import ForestBackground from "../../assets/images/environments/forest.png";
import BoyCharacter from "../../assets/images/characters/Boy.png";
import GirlCharacter from "../../assets/images/characters/Girl.png";
import bgMusic from "../../assets/music/bg-music.mp3";
import QuestStartModal from "../../components/QuestStartModal";
import "./ForestPage.css";

const FOREST_NPCS = [
    { npcId: "forest_npc_1", name: "Kumo",       x: 25, y: 35, character: BoyCharacter,  showName: true, quest: "synonym_antonym" },
    { npcId: "forest_npc_2", name: "Mang Kanor",  x: 65, y: 45, character: BoyCharacter,  showName: true, quest: "synonym_antonym" },
    { npcId: "forest_npc_3", name: "Diwata",      x: 50, y: 70, character: GirlCharacter, showName: true, quest: "synonym_antonym" },
];

const ForestPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const questId  = location.state?.questId || 2;
    const audioRef = useRef(null);
    const playerId = getPlayerId();

    const { character, loading: charLoading } = useCharacterPreference();

    const [forestNPCs,        setForestNPCs]        = useState([]);
    const [refreshKey,        setRefreshKey]         = useState(0);
    const [selectedNPC,       setSelectedNPC]        = useState(null);
    const [showModal,         setShowModal]          = useState(false);
    const [showExitConfirm,   setShowExitConfirm]    = useState(false);
    const [showSummaryButton, setShowSummaryButton]  = useState(false);
    const [isMuted,           setIsMuted]            = useState(false);

    const PlayerCharacter = character === "roberta" ? GirlCharacter : BoyCharacter;

    // ── Music ─────────────────────────────────────────────────────────────────
    useEffect(() => {
        const play = () => { if (audioRef.current) { audioRef.current.volume = 0.3; audioRef.current.play().catch(() => {}); } };
        play();
        const onInteract = () => { play(); document.removeEventListener("click", onInteract); };
        document.addEventListener("click", onInteract);
        return () => {
            if (audioRef.current) { audioRef.current.pause(); audioRef.current.currentTime = 0; }
            document.removeEventListener("click", onInteract);
        };
    }, []);

    const toggleMute = () => { if (audioRef.current) { audioRef.current.muted = !isMuted; setIsMuted(p => !p); } };

    // ── Init ──────────────────────────────────────────────────────────────────
    useEffect(() => { initializeForest(); }, [refreshKey]);

    const initializeForest = async () => {
        if (!playerId) return;
        setForestNPCs(FOREST_NPCS);
        try {
            await environmentApi.initializeEnvironment("forest", playerId);
            await checkEnvironmentProgress();
        } catch (err) { console.error("Error initializing forest:", err); }
    };

    const checkEnvironmentProgress = async () => {
        if (!playerId) return;
        try {
            const res    = await fetch(`${import.meta.env.VITE_API_URL}/api/npc/environment-progress?environmentType=forest&playerId=${playerId}`);
            const result = await res.json();
            if (result.success && (result.data.progress ?? 0) >= 75) setShowSummaryButton(true);
        } catch (e) { console.error(e); }
    };

    const checkAndShowSummary = async () => {
        if (!playerId) return;
        try {
            const res    = await fetch(`${import.meta.env.VITE_API_URL}/api/npc/environment-progress?environmentType=forest&playerId=${playerId}`);
            const result = await res.json();
            if (result.success && (result.data.progress ?? 0) >= 100) {
                navigate("/student/viewCompletion", { state: { showSummary: true, environmentProgress: result.data.progress, summaryData: result.data, returnTo: "/student/forest", questId } });
            }
        } catch (e) { console.error(e); }
    };

    useEffect(() => {
        if (location.state?.completed) {
            setRefreshKey(p => p + 1);
            checkAndShowSummary();
            navigate(location.pathname, { replace: true, state: {} });
        }
    }, [location.state]);

    const handleNPCClick    = (npc) => { setSelectedNPC(npc); setShowModal(true); };
    const handleCloseModal  = ()    => { setShowModal(false); setSelectedNPC(null); };
    const handleBackClick   = ()    => setShowExitConfirm(true);
    const handleConfirmExit = ()    => { setShowExitConfirm(false); navigate("/dashboard"); };
    const handleCancelExit  = ()    => setShowExitConfirm(false);

    const handleViewSummary = async () => {
        if (!playerId) return;
        try {
            const res    = await fetch(`${import.meta.env.VITE_API_URL}/api/npc/environment-progress?environmentType=forest&playerId=${playerId}`);
            const result = await res.json();
            if (result.success) navigate("/student/summary", { state: { showSummary: true, environmentProgress: result.data.progress, summaryData: result.data, returnTo: "/student/forest", questId } });
        } catch (e) { console.error(e); }
    };

    const handleStartQuest = async () => {
        if (!selectedNPC || !playerId) return;
        try {
            await environmentApi.logNPCInteraction({ playerId, npcName: selectedNPC.name });
            await environmentApi.startNPCInteraction({ npcId: selectedNPC.npcId, challengeType: selectedNPC.quest, playerId });
        } catch (err) { console.error(err); }
        navigate("/student/synonymAntonym", { state: { npcId: selectedNPC.npcId, npcName: selectedNPC.name, questId, returnTo: "/student/forest" } });
    };

    if (charLoading) return <div className="forest-page-wrapper"><div className="loading-message">Loading...</div></div>;

    return (
        <div className="forest-page-wrapper">
            <audio ref={audioRef} loop><source src={bgMusic} type="audio/mpeg" /></audio>
            <ParticleEffects enableMouseTrail={false} />
            <button className="music-toggle-button" onClick={toggleMute}>{isMuted ? "🔇" : "🔊"}</button>

            <Button variant="back" className="back-button-forest-overlay" onClick={handleBackClick}>← Back</Button>
            {showSummaryButton && <Button variant="primary" className="view-summary-button" onClick={handleViewSummary}>View Summary</Button>}

            <EnvironmentPage
                key={refreshKey}
                environmentType="forest"
                backgroundImage={ForestBackground}
                npcs={forestNPCs}
                onNPCClick={handleNPCClick}
                playerCharacter={PlayerCharacter}
                debugMode={false}
                playerId={playerId}
            />

            <div className="decorative-clouds">
                <div className="cloud cloud-1"></div><div className="cloud cloud-2"></div><div className="cloud cloud-3"></div>
            </div>

            {showModal && selectedNPC && (
                <QuestStartModal npcName={selectedNPC.name} npcImage={selectedNPC.character} questType={selectedNPC.quest} onStart={handleStartQuest} onClose={handleCloseModal} />
            )}

            {showExitConfirm && (
                <div className="quest-modal-overlay" onClick={handleCancelExit}>
                    <div className="quest-modal-scroll" onClick={e => e.stopPropagation()}>
                        <div className="scroll-content">
                            <h2 className="quest-modal-title">Exit Forest?</h2>
                            <div className="quest-modal-divider"></div>
                            <p className="quest-modal-instructions">Your progress is saved.</p>
                            <div style={{ display: "flex", gap: "15px", justifyContent: "center", marginTop: "20px" }}>
                                <Button onClick={handleCancelExit} variant="secondary">Stay</Button>
                                <Button onClick={handleConfirmExit} variant="primary">Leave</Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ForestPage;