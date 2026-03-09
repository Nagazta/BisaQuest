import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useCharacterPreference } from "../../hooks/useCharacterPreference";
import EnvironmentPage from "../../components/EnvironmentPage";
import Button from "../../components/Button";
import ParticleEffects from "../../components/ParticleEffects";
import { environmentApi } from "../../services/environmentServices.js";
import { getPlayerId } from "../../utils/playerStorage";
import CastleBackground from "../../assets/images/environments/castle.png";
import BoyCharacter from "../../assets/images/characters/Boy.png";
import GirlCharacter from "../../assets/images/characters/Girl.png";
import ManongKwillImg from "../../assets/images/characters/castle-manong-kwill.png";
import GuloImg from "../../assets/images/characters/gulo.png";
import PrincessHaraImg from "../../assets/images/characters/castle-princess-hara.png";
import bgMusic from "../../assets/music/bg-music.mp3";
import QuestStartModal from "../../components/QuestStartModal";
import "./CastlePage.css";

const API = import.meta.env.VITE_API_URL !== undefined ? import.meta.env.VITE_API_URL : (import.meta.env.PROD ? '' : 'http://localhost:5000');
const CASTLE_HINT = "Enter the Castle! Complete all tasks to master compound words";

const CASTLE_NPCS = [
    { npcId: "castle_npc_3", name: "Gulo", x: 28, y: 60, character: GuloImg, showName: true, quest: "compound_words", scenePath: "/student/library" },
    { npcId: "castle_npc_1", name: "Princess Hara", x: 50, y: 45, character: PrincessHaraImg, showName: true, quest: "compound_words", scenePath: "/student/library" },
    { npcId: "castle_npc_2", name: "Manong Kwill", x: 72, y: 55, character: ManongKwillImg, showName: true, quest: "compound_words", scenePath: "/student/library" },
];

const CastlePage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const questId = location.state?.questId || 3;
    const audioRef = useRef(null);
    const playerId = getPlayerId();

    const { character, loading: charLoading } = useCharacterPreference();

    const [castleNPCs, setCastleNPCs] = useState([]);
    const [refreshKey, setRefreshKey] = useState(0);
    const [selectedNPC, setSelectedNPC] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [showExitConfirm, setShowExitConfirm] = useState(false);
    const [showSummaryButton, setShowSummaryButton] = useState(false);
    const [isMuted, setIsMuted] = useState(false);

    // ── NPC position editor (dev tool) ────────────────────────────────────────
    const [npcEditMode, setNpcEditMode] = useState(false);
    const [npcEditIdx, setNpcEditIdx] = useState(0);
    const npcEditModeRef = useRef(false);
    const npcEditIdxRef = useRef(0);

    useEffect(() => { npcEditModeRef.current = npcEditMode; }, [npcEditMode]);
    useEffect(() => { npcEditIdxRef.current = npcEditIdx; }, [npcEditIdx]);

    useEffect(() => {
        const onKey = (e) => {
            // Backtick toggles editor on/off
            if (e.key === '`') {
                e.preventDefault();
                setNpcEditMode(p => !p);
                return;
            }
            if (!npcEditModeRef.current) return;

            const k = e.key.toLowerCase();
            if (!['w', 'a', 's', 'd', 'e'].includes(k)) return;
            e.preventDefault();
            e.stopPropagation(); // block EnvironmentPage player movement

            if (k === 'e') {
                setNpcEditIdx(i => {
                    const next = (i + 1) % CASTLE_NPCS.length;
                    npcEditIdxRef.current = next;
                    return next;
                });
                return;
            }

            setCastleNPCs(prev => prev.map((npc, i) => {
                if (i !== npcEditIdxRef.current) return npc;
                let { x, y } = npc;
                if (k === 'w') y = Math.max(0, y - 1);
                if (k === 's') y = Math.min(100, y + 1);
                if (k === 'a') x = Math.max(0, x - 1);
                if (k === 'd') x = Math.min(100, x + 1);
                console.log(`[NPC Pos] ${npc.name}: x=${x}, y=${y}`);
                return { ...npc, x, y };
            }));
        };

        // capture:true so we intercept before EnvironmentPage's bubble-phase listeners
        window.addEventListener('keydown', onKey, true);
        return () => window.removeEventListener('keydown', onKey, true);
    }, []);

    const PlayerCharacter = character === "roberta" ? GirlCharacter : BoyCharacter;

    // ── Music ─────────────────────────────────────────────────────────────────
    useEffect(() => {
        const play = () => { if (audioRef.current) { audioRef.current.volume = 0.3; audioRef.current.play().catch(() => { }); } };
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
    useEffect(() => { initializeCastle(); }, [refreshKey]);

    const initializeCastle = async () => {
        if (!playerId) return;
        setCastleNPCs(CASTLE_NPCS);
        try {
            await environmentApi.initializeEnvironment("castle", playerId);
            await checkEnvironmentProgress();
        } catch (err) { console.error("Error initializing castle:", err); }
    };

    const checkEnvironmentProgress = async () => {
        if (!playerId) return;
        try {
            const res = await fetch(`${API}/api/npc/environment-progress?environmentType=castle&playerId=${playerId}`);
            const result = await res.json();
            if (result.success && (result.data.progress ?? 0) >= 75) setShowSummaryButton(true);
        } catch (e) { console.error(e); }
    };

    const checkAndShowSummary = async () => {
        if (!playerId) return;
        try {
            const res = await fetch(`${API}/api/npc/environment-progress?environmentType=castle&playerId=${playerId}`);
            const result = await res.json();
            if (result.success && (result.data.progress ?? 0) >= 100) {
                navigate("/student/viewCompletion", { state: { showSummary: true, environmentProgress: result.data.progress, summaryData: result.data, returnTo: "/student/castle", questId } });
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

    const handleNPCClick = (npc) => { setSelectedNPC(npc); setShowModal(true); };
    const handleCloseModal = () => { setShowModal(false); setSelectedNPC(null); };
    const handleBackClick = () => setShowExitConfirm(true);
    const handleConfirmExit = () => { setShowExitConfirm(false); navigate("/dashboard"); };
    const handleCancelExit = () => setShowExitConfirm(false);

    const handleViewSummary = async () => {
        if (!playerId) return;
        try {
            const res = await fetch(`${API}/api/npc/environment-progress?environmentType=castle&playerId=${playerId}`);
            const result = await res.json();
            if (result.success) navigate("/student/summary", { state: { showSummary: true, environmentProgress: result.data.progress, summaryData: result.data, returnTo: "/student/castle", questId } });
        } catch (e) { console.error(e); }
    };

    const handleStartQuest = async () => {
        if (!selectedNPC || !playerId) return;
        try {
            await environmentApi.logNPCInteraction({ playerId, npcName: selectedNPC.name });
            await environmentApi.startNPCInteraction({ npcId: selectedNPC.npcId, challengeType: selectedNPC.quest, playerId });
        } catch (err) { console.error(err); }

        // Fetch the actual quest_id for this NPC from the DB
        let npcQuestId = questId;
        try {
            const res = await fetch(`${API}/api/challenge/npc/${selectedNPC.npcId}/quest`);
            const result = await res.json();
            if (result.data?.length) npcQuestId = result.data[0].quest_id;
        } catch (err) { console.warn("[CastlePage] quest lookup failed, using default:", err); }

        navigate(selectedNPC.scenePath, { state: { npcId: selectedNPC.npcId, npcName: selectedNPC.name, questId: npcQuestId, returnTo: "/student/castle" } });
    };

    if (charLoading) return <div className="castle-page-wrapper"><div className="loading-message">Loading...</div></div>;

    return (
        <div className="castle-page-wrapper">
            <audio ref={audioRef} loop><source src={bgMusic} type="audio/mpeg" /></audio>
            <ParticleEffects enableMouseTrail={false} />
            <button className="music-toggle-button" onClick={toggleMute}>{isMuted ? "🔇" : "🔊"}</button>

            <Button variant="back" className="back-button-castle-overlay" onClick={handleBackClick}>← Back</Button>
            {showSummaryButton && <Button variant="primary" className="view-summary-button" onClick={handleViewSummary}>View Summary</Button>}

            <EnvironmentPage
                key={refreshKey}
                environmentType="castle"
                backgroundImage={CastleBackground}
                npcs={castleNPCs}
                onNPCClick={handleNPCClick}
                playerCharacter={PlayerCharacter}
                debugMode={false}
                playerId={playerId}
                hintMessage={CASTLE_HINT}
            />

            {/* NPC position editor overlay */}
            {npcEditMode && (
                <div style={{
                    position: "fixed", top: 16, left: "50%", transform: "translateX(-50%)",
                    background: "rgba(0,0,0,0.82)", color: "#FCD765",
                    fontFamily: "'Pixelify Sans', sans-serif", fontSize: 14,
                    padding: "10px 20px", borderRadius: 12, border: "2px solid #FCD765",
                    zIndex: 999, textAlign: "center", lineHeight: 1.7, pointerEvents: "none",
                }}>
                    <div>NPC Editor ON — editing: <strong>{castleNPCs[npcEditIdx]?.name}</strong></div>
                    <div>x: {castleNPCs[npcEditIdx]?.x} &nbsp;|&nbsp; y: {castleNPCs[npcEditIdx]?.y}</div>
                    <div style={{ color: "#aaa", fontSize: 12 }}>WASD = move &nbsp;·&nbsp; E = next NPC &nbsp;·&nbsp; ` = exit</div>
                </div>
            )}

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
                            <h2 className="quest-modal-title">Exit Castle?</h2>
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

export default CastlePage;