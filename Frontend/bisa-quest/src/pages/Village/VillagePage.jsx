import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useCharacterPreference } from "../../hooks/useCharacterPreference";
import EnvironmentPage from "../../components/EnvironmentPage";
import Button from "../../components/Button";
import ParticleEffects from "../../components/ParticleEffects";
import {
    getPlayerId,
    getProgress,
    getLearnedWords,
    hasCutsceneSeen,
    markCompleteDismissed,
    isCompleteDismissed,
    getLibroPageCountForEnv,
} from "../../utils/playerStorage";
import AssetManifest from "../../services/AssetManifest";
import "./VillagePage.css";
import ProgressBar from "../../components/ProgressBar";
import EnvironmentCompleteModal from "../../components/EnvironmentCompleteModal";
import FogTransition from "../../components/FogTransition";
import bgMusic from "../../assets/music/bg-music.mp3";
import QuestStartModal from "../../components/QuestStartModal";

const NPC_DB_ID = {
    ligaya: "village_npc_2",
};

// ── DEBUG: Hardcode a quest_id to skip random selection ───────────────────
// Set the value to a quest_id number (e.g. 42) to force that quest.
// Set to null to use the normal random logic.
const DEBUG_QUEST_OVERRIDE = {
    village_npc_2: null,   // Ligaya
};

const randomPick = (arr) => {
    if (!arr || arr.length === 0) return null;
    return arr[Math.floor(Math.random() * arr.length)];
};

const VillagePage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const audioRef = useRef(null);
    const playerId = getPlayerId();
    const API = import.meta.env.VITE_API_URL || "";
    const language = "en";

    const { character, loading: charLoading } = useCharacterPreference();

    const [villageNPCs, setVillageNPCs] = useState([]);
    const [refreshKey, setRefreshKey] = useState(0);
    const [selectedNPC, setSelectedNPC] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [showExitConfirm, setShowExitConfirm] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [questLoading, setQuestLoading] = useState(false);
    const [villageProgress, setVillageProgress] = useState(0);
    const [showCompleteModal, setShowCompleteModal] = useState(false);
    const [fogActive, setFogActive] = useState(false);
    const [learnedWords, setLearnedWords] = useState([]);

    const PlayerCharacter = character === "roberta" ? AssetManifest.characters.girl : AssetManifest.characters.boy;

    // ── Background music ──────────────────────────────────────────────────────
    useEffect(() => {
        const play = () => {
            if (audioRef.current) {
                audioRef.current.volume = 0.3;
                audioRef.current.play().catch(() => { });
            }
        };
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

    const toggleMute = () => {
        if (audioRef.current) { audioRef.current.muted = !isMuted; setIsMuted(p => !p); }
    };

    // ── Load village progress ─────────────────────────────────────────────────
    const loadVillageProgress = () => {
        const books = getLibroPageCountForEnv('village');
        const pct = Math.round((books / 3) * 100);
        setVillageProgress(pct);

        // Only show the modal if at 100% AND the player hasn't dismissed it yet
        if (pct >= 100 && !isCompleteDismissed("village")) {
            const words = getLearnedWords("village");
            setLearnedWords(words);
            setShowCompleteModal(true);
        }
    };

    // ── Initialize ────────────────────────────────────────────────────────────
    useEffect(() => { initializeVillage(); }, [refreshKey]);

    const initializeVillage = () => {
        setVillageNPCs([
            { npcId: "ligaya", dbNpcId: "village_npc_2", name: "Ligaya", x: 35, y: 30, character: AssetManifest.village.npcs.ligaya, showName: true, quest: "word_association" },
        ]);
        loadVillageProgress();
    };

    // ── Refresh on return from quest ──────────────────────────────────────────
    useEffect(() => {
        if (location.state?.completed) {
            setRefreshKey(p => p + 1);
            navigate(location.pathname, { replace: true, state: {} });
        }
    }, [location.state]);

    // ── "Adto sa Forest!" button handler ─────────────────────────────────────
    const handleGoToForest = () => {
        markCompleteDismissed("village");
        setShowCompleteModal(false);
        setFogActive(true);
    };

    const handleFogDone = () => {
        if (!hasCutsceneSeen("village_complete")) {
            navigate("/cutscene/village_complete", { replace: true });
        } else {
            navigate("/student/forest", { replace: true });
        }
    };

    const handleEdgeWalk = (direction) => {
        if (direction === 'right' && villageProgress >= 100 && !fogActive) {
            handleGoToForest();
        }
    };

    // ── NPC / modal handlers ──────────────────────────────────────────────────
    const handleNPCClick = (npc) => { setSelectedNPC(npc); setShowModal(true); };
    const handleCloseModal = () => { setShowModal(false); setSelectedNPC(null); };
    const handleBackClick = () => setShowExitConfirm(true);
    const handleConfirmExit = () => { setShowExitConfirm(false); navigate("/dashboard"); };
    const handleCancelExit = () => setShowExitConfirm(false);

    // ── Start quest ───────────────────────────────────────────────────────────
    const handleStartQuest = async () => {
        if (!selectedNPC || !playerId) return;
        setQuestLoading(true);

        const dbNpcId = selectedNPC.dbNpcId || NPC_DB_ID[selectedNPC.npcId] || selectedNPC.npcId;


        let resolvedQuestId = null;
        let resolvedKitchenQuestId = null;
        let resolvedBedroomQuestId = null;
        let resolvedIaLivingQuestId = null;
        let resolvedIaKitchenQuestId = null;
        let resolvedIaBedroomQuestId = null;

        // ── DEBUG override: skip random selection if a quest_id is hardcoded ──
        const debugOverride = DEBUG_QUEST_OVERRIDE[dbNpcId] ?? null;
        if (debugOverride) {
            console.warn(`[Village] ⚠️ DEBUG OVERRIDE: forcing quest_id=${debugOverride} for ${selectedNPC.name}`);
            resolvedQuestId = debugOverride;
            setQuestLoading(false);
        }

        if (!debugOverride) try {
            const res = await fetch(`${API}/api/challenge/npc/${dbNpcId}/quest`);
            if (res.ok) {
                const { data } = await res.json();
                if (Array.isArray(data) && data.length) {

                    // ── DEBUG: Log all quests for this NPC ──
                    console.group(`[Village] 📋 ${selectedNPC.name} (${dbNpcId}) — ${data.length} quest(s)`);
                    data.forEach((q, i) => {
                        console.log(
                            `  Quest #${i + 1}: id=${q.quest_id}, title="${q.title}", ` +
                            `scene_type="${q.scene_type}", mechanic="${q.game_mechanic}", ` +
                            `content_type="${q.content_type}"`
                        );
                    });
                    console.groupEnd();

                    {
                        const livingPool = data.filter(q =>
                            q.game_mechanic === "drag_drop" &&
                            (q.scene_type === "living_room" || q.scene_type === "living_room_dirty" || q.scene_type === "living_room_spill")
                        );
                        const kitchenPool = data.filter(q => q.game_mechanic === "drag_drop" && q.scene_type === "kitchen");
                        const bedroomPool = data.filter(q => q.game_mechanic === "drag_drop" && q.scene_type === "bedroom");
                        const iaLivingPool = data.filter(q =>
                            q.game_mechanic === "item_association" &&
                            (q.scene_type === "living_room" || q.scene_type === "living_room_dirty" || q.scene_type === "living_room_spill")
                        );
                        const iaKitchenPool = data.filter(q => q.game_mechanic === "item_association" && q.scene_type === "kitchen");
                        const iaBedroomPool = data.filter(q => q.game_mechanic === "item_association" && q.scene_type === "bedroom");

                        resolvedQuestId = randomPick(livingPool)?.quest_id ?? null;
                        resolvedKitchenQuestId = randomPick(kitchenPool)?.quest_id ?? null;
                        resolvedBedroomQuestId = randomPick(bedroomPool)?.quest_id ?? null;
                        resolvedIaLivingQuestId = randomPick(iaLivingPool)?.quest_id ?? null;
                        resolvedIaKitchenQuestId = randomPick(iaKitchenPool)?.quest_id ?? null;
                        resolvedIaBedroomQuestId = randomPick(iaBedroomPool)?.quest_id ?? null;

                        console.log(`[Village] 🎯 ${selectedNPC.name} (house) — DD: living=${resolvedQuestId}, kitchen=${resolvedKitchenQuestId}, bedroom=${resolvedBedroomQuestId}`);
                        console.log(`[Village] 🎯 ${selectedNPC.name} (house) — IA: living=${resolvedIaLivingQuestId}, kitchen=${resolvedIaKitchenQuestId}, bedroom=${resolvedIaBedroomQuestId}`);
                    }
                }
            }
        } catch (err) {
            console.error("[VillagePage] Could not fetch questId:", err);
        } finally {
            setQuestLoading(false);
        }

        const state = {
            questId: resolvedQuestId,
            kitchenQuestId: resolvedKitchenQuestId,
            bedroomQuestId: resolvedBedroomQuestId,
            iaQuestId: resolvedIaLivingQuestId,
            iaKitchenQuestId: resolvedIaKitchenQuestId,
            iaBedroomQuestId: resolvedIaBedroomQuestId,
            npcId: dbNpcId,
            npcName: selectedNPC.name,
            returnTo: "/student/village",
            sceneType: "living_room",
            questSequence: [
                resolvedQuestId && { type: "drag_drop", sceneType: "living_room", questId: resolvedQuestId },
                resolvedIaLivingQuestId && { type: "item_association", sceneType: "living_room", questId: resolvedIaLivingQuestId },
            ].filter(Boolean),
            sequenceIndex: 0,
        };

        console.log(`[Village] 🚀 Navigating for ${selectedNPC.name} →`, state);

        if (selectedNPC.quest === "word_association") navigate("/student/house", { state });
    };

    if (charLoading) return (
        <div className="village-page-wrapper">
            <div className="loading-message">Loading...</div>
        </div>
    );

    return (
        <div className="village-page-wrapper">
            <audio ref={audioRef} loop><source src={bgMusic} type="audio/mpeg" /></audio>
            <ParticleEffects enableMouseTrail={false} />

            <div className="village-progress-bar-wrap">
                <ProgressBar progress={villageProgress} variant="village" showLabel={true} />
            </div>

            <EnvironmentCompleteModal
                isOpen={showCompleteModal}
                environment="village"
                learnedWords={learnedWords}
                nextEnv="Forest"
                onStay={() => {
                    markCompleteDismissed("village");
                    setShowCompleteModal(false);
                }}
                onAdvance={handleGoToForest}
            />

            <FogTransition active={fogActive} onDone={handleFogDone} label="🌲 Entering the Forest..." />

            <button className="music-toggle-button" onClick={toggleMute}>
                {isMuted ? "🔇" : "🔊"}
            </button>

            <Button variant="back" className="back-button-village-overlay" onClick={handleBackClick}>
                ← {language === "ceb" ? "Balik" : "Back"}
            </Button>

            {villageProgress >= 100 && (
                <Button
                    variant="primary"
                    className="proceed-forest-btn"
                    onClick={handleGoToForest}
                    style={{ marginLeft: "20px" }}
                >
                    🌲 Proceed to Forest
                </Button>
            )}

            <EnvironmentPage
                key={refreshKey}
                environmentType="village"
                backgroundImage={AssetManifest.village.background}
                npcs={villageNPCs}
                onNPCClick={handleNPCClick}
                playerCharacter={PlayerCharacter}
                characterType={character === "roberta" ? "girl" : "boy"}
                debugMode={false}
                playerId={playerId}
                onEdgeWalk={handleEdgeWalk}
            />

            <div className="decorative-clouds">
                <div className="cloud cloud-1"></div>
                <div className="cloud cloud-2"></div>
                <div className="cloud cloud-3"></div>
            </div>

            {showModal && selectedNPC && (
                <QuestStartModal
                    npcName={selectedNPC.name}
                    npcImage={selectedNPC.character}
                    npcId={selectedNPC.dbNpcId}
                    questType={selectedNPC.quest}
                    onStart={handleStartQuest}
                    onClose={handleCloseModal}
                    loading={questLoading}
                />
            )}

            {showExitConfirm && (
                <div className="quest-modal-overlay" onClick={handleCancelExit}>
                    <div className="quest-modal-scroll" onClick={e => e.stopPropagation()}>
                        <div className="scroll-content">
                            <h2 className="quest-modal-title">
                                {language === "ceb" ? "Mubiya sa Baryo?" : "Exit Village?"}
                            </h2>
                            <div className="quest-modal-divider"></div>
                            <p className="quest-modal-instructions">
                                {language === "ceb" ? "Ang imong progreso natipigan." : "Your progress is saved."}
                            </p>
                            <div style={{ display: "flex", gap: "15px", justifyContent: "center", marginTop: "20px" }}>
                                <Button
                                    onClick={handleCancelExit}
                                    variant="secondary"
                                    style={{ background: "linear-gradient(180deg, #5a3e2b, #3b2414)", border: "3px solid #78350f", color: "#f5d89a", fontFamily: "'Pixelify Sans', sans-serif", fontWeight: "bold" }}
                                >
                                    {language === "ceb" ? "Magpabilin" : "Stay"}
                                </Button>
                                <Button onClick={handleConfirmExit} variant="primary">
                                    {language === "ceb" ? "Mubiya" : "Leave"}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VillagePage;