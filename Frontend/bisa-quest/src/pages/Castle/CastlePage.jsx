import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation, Navigate } from "react-router-dom";
import { useCharacterPreference } from "../../hooks/useCharacterPreference";
import EnvironmentPage from "../../components/EnvironmentPage";
import Button from "../../components/Button";
import ProgressBar from "../../components/ProgressBar";
import ParticleEffects from "../../components/ParticleEffects";
import { getPlayerId, getProgress, getLearnedWords, markCompleteDismissed, isCompleteDismissed, hasCutsceneSeen, getLibroPageCountForEnv, hasLibroPage } from "../../utils/playerStorage";
import EnvironmentCompleteModal from "../../components/EnvironmentCompleteModal";
import FogTransition from "../../components/FogTransition";
import AssetManifest from "../../services/AssetManifest";
import bgMusic from "../../assets/music/bg-music.mp3";
import QuestStartModal from "../../components/QuestStartModal";
import "./CastlePage.css";
import "../../pages/Village/HousePage.css";

const API = import.meta.env.VITE_API_URL !== undefined ? import.meta.env.VITE_API_URL : (import.meta.env.PROD ? '' : 'http://localhost:5000');
const CASTLE_NPCS = [
    { npcId: "castle_npc_1", name: "Princess Hara", x: 20, y: 65, character: AssetManifest.castle.npcs.princess_hara, showName: true, quest: "compound_words", scenePath: "/castle/gate" },
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
    const [showCompleteModal, setShowCompleteModal] = useState(false);
    const [learnedWords, setLearnedWords] = useState([]);
    const [fogActive, setFogActive] = useState(false);
    const [castleProgress, setCastleProgress] = useState(getProgress().castle_progress || 0);
    const [showScenePicker, setShowScenePicker] = useState(false);
    const [questLoading, setQuestLoading] = useState(false);

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

    const PlayerCharacter = character === "roberta" ? AssetManifest.characters.girl : AssetManifest.characters.boy;

    // ── Music ─────────────────────────────────────────────────────────────────
    useEffect(() => {
        const play = () => { if (audioRef.current) { audioRef.current.volume = 0.3; audioRef.current.play().catch(() => { }); } };
        play();
        const onInteract = () => {
    play();
    document.removeEventListener("click", onInteract);
    document.removeEventListener("keydown", onInteract);
};
document.addEventListener("click", onInteract);
document.addEventListener("keydown", onInteract);
        return () => {
            if (audioRef.current) { audioRef.current.pause(); audioRef.current.currentTime = 0; }
            document.removeEventListener("click", onInteract);
document.removeEventListener("keydown", onInteract);
        };
    }, []);

    const toggleMute = () => { if (audioRef.current) { audioRef.current.muted = !isMuted; setIsMuted(p => !p); } };

    // ── Init ──────────────────────────────────────────────────────────────────
    useEffect(() => { initializeCastle(); }, [refreshKey]);

    const loadCastleProgress = async () => {
        try {
            const res = await fetch(`${API}/api/castle/${playerId}`);
            const result = await res.json();
            if (result.success) {
                const pct = result.data.castle_progress || 0;
                setCastleProgress(pct);
                if (pct >= 100 && !isCompleteDismissed("castle")) {
                    const words = getLearnedWords("castle");
                    setLearnedWords(words);
                    setShowCompleteModal(true);
                }
                return;
            }
        } catch (err) {
            console.error("[CastlePage] Failed to load progress from API, falling back to localStorage:", err);
        }

        // Fallback to localStorage
        const progress = getProgress();
        const pct = progress.castle_progress || 0;
        const castlePages = getLibroPageCountForEnv("castle");
        const effectivePct = Math.max(pct, Math.min(Math.round((castlePages / 3) * 100), 100));
        setCastleProgress(effectivePct);
        if (effectivePct >= 100 && !isCompleteDismissed("castle")) {
            const words = getLearnedWords("castle");
            setLearnedWords(words);
            setShowCompleteModal(true);
        }
    };

    const initializeCastle = async () => {
        if (!playerId) return;
        setCastleNPCs(CASTLE_NPCS);
        await loadCastleProgress();
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
    const handleCloseScenePicker = () => { setShowScenePicker(false); };
    const handleBackClick = () => setShowExitConfirm(true);
    const handleConfirmExit = () => { setShowExitConfirm(false); navigate("/dashboard"); };
    const handleCancelExit = () => setShowExitConfirm(false);

    // ── "Adto sa Dashboard!" button handler ──────────────────────────────────
    const handleGoToDashboard = () => {
        markCompleteDismissed("castle");
        setShowCompleteModal(false);
        setFogActive(true);
    };

    const handleFogDone = () => {
        if (!hasCutsceneSeen("castle_complete")) {
            navigate("/cutscene/castle_complete", { replace: true });
        } else {
            navigate("/dashboard", { replace: true });
        }
    };

    const handleViewSummary = async () => {
        if (!playerId) return;
        try {
            const res = await fetch(`${API}/api/npc/environment-progress?environmentType=castle&playerId=${playerId}`);
            const result = await res.json();
            if (result.success) navigate("/student/summary", { state: { showSummary: true, environmentProgress: result.data.progress, summaryData: result.data, returnTo: "/student/castle", questId } });
        } catch (e) { console.error(e); }
    };

    // ── Scene picker — determine which scenes are unlocked ─────────────────
    const gateUnlocked = true;
    const courtyardUnlocked = hasLibroPage("castle", "castle_gate");
    const libraryUnlocked = hasLibroPage("castle", "castle_courtyard");

    const handleStartQuest = () => {
        setShowModal(false);
        setShowScenePicker(true);
    };

    const handleGoToScene = async (route) => {
    setShowScenePicker(false);
    const API = import.meta.env.VITE_API_URL !== undefined ? import.meta.env.VITE_API_URL : (import.meta.env.PROD ? '' : 'http://localhost:5000');
    let questId = null;
    try {
        const npcId = selectedNPC?.npcId || 'castle_npc_1';
        const res = await fetch(`${API}/api/challenge/npc/${npcId}/quest`);
        if (res.ok) {
            const { data } = await res.json();
            if (Array.isArray(data) && data.length > 0) {
                questId = data[0].quest_id;
            }
        }
    } catch (err) {
        console.error("[CastlePage] Failed to resolve questId:", err);
    }
    setSelectedNPC(null);
    navigate(route, { state: { returnTo: "/student/castle", questId } });
};

    if (!hasCutsceneSeen("castle_entry")) return <Navigate to="/cutscene/castle_entry" replace />;
    if (charLoading) return <div className="castle-page-wrapper"><div className="loading-message">Loading...</div></div>;

    return (
        <div className="castle-page-wrapper">
            <audio ref={audioRef} loop><source src={bgMusic} type="audio/mpeg" /></audio>
            <ParticleEffects enableMouseTrail={false} />
            <div className="village-progress-bar-wrap">
                <ProgressBar progress={castleProgress} variant="castle" showLabel={true} />
            </div>
            <button className="music-toggle-button" onClick={toggleMute}>{isMuted ? "🔇" : "🔊"}</button>

            <Button variant="back" className="back-button-castle-overlay" onClick={handleBackClick}>← Back</Button>
            {showSummaryButton && <Button variant="primary" className="view-summary-button" onClick={handleViewSummary}>View Summary</Button>}

            <FogTransition active={fogActive} onDone={handleFogDone} label="✨ Quest Complete..." />

            <EnvironmentCompleteModal
                isOpen={showCompleteModal}
                environment="castle"
                learnedWords={learnedWords}
                nextEnv="Dashboard"
                onStay={() => { markCompleteDismissed("castle"); setShowCompleteModal(false); }}
                onAdvance={handleGoToDashboard}
            />

            <EnvironmentPage
                key={refreshKey}
                environmentType="castle"
                backgroundImage={AssetManifest.castle.background}
                npcs={castleNPCs}
                onNPCClick={handleNPCClick}
                playerCharacter={PlayerCharacter}
                characterType={character === "roberta" ? "girl" : "boy"}
                debugMode={false}
                playerId={playerId}
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
                <QuestStartModal
                    npcName={selectedNPC.name}
                    npcImage={selectedNPC.character}
                    npcId={selectedNPC.npcId}
                    questType={selectedNPC.quest}
                    onStart={handleStartQuest}
                    onClose={handleCloseModal}
                    loading={questLoading}
                />
            )}

            {showScenePicker && (
                <div className="house-door-overlay" onClick={handleCloseScenePicker}>
                    <div className="house-door-modal" onClick={e => e.stopPropagation()}>
                        <button className="house-door-close" onClick={handleCloseScenePicker}>✕</button>

                        <div className="house-door-header">
                            <div className="house-door-title">Asa ka moadto? 🏰</div>
                        </div>

                        <div className="house-door-body">
                            <div className="house-door-grid">

                                {/* Gate — always unlocked */}
                                <button
                                    className="house-door-btn"
                                    onClick={() => handleGoToScene("/castle/gate")}
                                >
                                    <span className="house-door-btn-icon">🚪</span>
                                    <div className="house-door-btn-name">Gate</div>
                                    <div className="house-door-btn-sub">
                                        {hasLibroPage("castle", "castle_gate") ? "✅ Nahuman na!" : "Sugdi diri!"}
                                    </div>
                                </button>

                                {/* Courtyard */}
                                <button
                                    className={`house-door-btn ${!courtyardUnlocked ? "house-door-btn--locked" : ""}`}
                                    onClick={() => courtyardUnlocked && handleGoToScene("/castle/courtyard")}
                                    style={!courtyardUnlocked ? { opacity: 0.5, cursor: "not-allowed" } : {}}
                                >
                                    <span className="house-door-btn-icon">{courtyardUnlocked ? "🌳" : "🔒"}</span>
                                    <div className="house-door-btn-name">Courtyard</div>
                                    <div className="house-door-btn-sub">
                                        {!courtyardUnlocked
                                            ? "Complete the Gate first!"
                                            : hasLibroPage("castle", "castle_courtyard") ? "✅ Nahuman na!" : "Explore!"}
                                    </div>
                                </button>

                                {/* Library */}
                                <button
                                    className={`house-door-btn ${!libraryUnlocked ? "house-door-btn--locked" : ""}`}
                                    onClick={() => libraryUnlocked && handleGoToScene("/castle/library")}
                                    style={!libraryUnlocked ? { opacity: 0.5, cursor: "not-allowed" } : {}}
                                >
                                    <span className="house-door-btn-icon">{libraryUnlocked ? "📚" : "🔒"}</span>
                                    <div className="house-door-btn-name">Library</div>
                                    <div className="house-door-btn-sub">
                                        {!libraryUnlocked
                                            ? "Complete the Courtyard first!"
                                            : hasLibroPage("castle", "castle_library") ? "✅ Nahuman na!" : "Explore!"}
                                    </div>
                                </button>

                            </div>
                        </div>
                    </div>
                </div>
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