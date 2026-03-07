import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useCharacterPreference } from "../../hooks/useCharacterPreference";
import EnvironmentPage from "../../components/EnvironmentPage";
import Button from "../../components/Button";
import ParticleEffects from "../../components/ParticleEffects";
import { getPlayerId, getProgress, getLearnedWords, hasCutsceneSeen } from "../../utils/playerStorage";
import VillageBackground from "../../assets/images/environments/Vocabulary/village-bg.png";
import LigayaCharacter from "../../assets/images/characters/vocabulary/Village_Quest_NPC_2.png";
import BoyCharacter from "../../assets/images/characters/Boy.png";
import GirlCharacter from "../../assets/images/characters/Girl.png";
import bgMusic from "../../assets/music/bg-music.mp3";
import QuestStartModal from "../../components/QuestStartModal";
import NandoCharacter from "../../assets/images/characters/vocabulary/Village_Quest_NPC_3.png";
import VicenteCharacter from "../../assets/images/characters/vocabulary/Village_Quest_NPC_1.png";
import "./VillagePage.css";
import ProgressBar from "../../components/ProgressBar";
import EnvironmentCompleteModal from "../../components/EnvironmentCompleteModal";
import FogTransition from "../../components/FogTransition";

const VILLAGE_NPC_META = [
    { npcId: "village_npc_2", npcName: "Ligaya",  words: ["WALIS","BROOM","TRAPO","RAG","MOP","TIMBA","BUCKET"] },
    { npcId: "village_npc_3", npcName: "Nando",   words: ["PALA","SHOVEL","REGADERA","WATERING CAN"] },
    { npcId: "village_npc_1", npcName: "Vicente", words: ["MANGGA","MANGO","SAGING","BANANA"] },
];

const NPC_DB_ID = {
    ligaya:  "village_npc_2",
    nando:   "village_npc_3",
    vicente: "village_npc_1",
};

const randomPick = (arr) => {
    if (!arr || arr.length === 0) return null;
    return arr[Math.floor(Math.random() * arr.length)];
};

const VillagePage = () => {
    const navigate  = useNavigate();
    const location  = useLocation();
    const audioRef  = useRef(null);
    const playerId  = getPlayerId();
    const API       = import.meta.env.VITE_API_URL || "";
    const language  = "en";

    const { character, loading: charLoading } = useCharacterPreference();

    const [villageNPCs,       setVillageNPCs]       = useState([]);
    const [refreshKey,        setRefreshKey]         = useState(0);
    const [selectedNPC,       setSelectedNPC]        = useState(null);
    const [showModal,         setShowModal]          = useState(false);
    const [showExitConfirm,   setShowExitConfirm]    = useState(false);
    const [isMuted,           setIsMuted]            = useState(false);
    const [questLoading,      setQuestLoading]       = useState(false);
    const [villageProgress,   setVillageProgress]    = useState(0);
    const [showCompleteModal, setShowCompleteModal]  = useState(false);
    const [fogActive,         setFogActive]          = useState(false);
    const [learnedWords,      setLearnedWords]       = useState([]);

    const PlayerCharacter = character === "roberta" ? GirlCharacter : BoyCharacter;

    // ── Background music ──────────────────────────────────────────────────────
    useEffect(() => {
        const play = () => {
            if (audioRef.current) {
                audioRef.current.volume = 0.3;
                audioRef.current.play().catch(() => {});
            }
        };
        play();
        const onInteract = () => { play(); document.removeEventListener("click", onInteract); document.removeEventListener("keydown", onInteract); };
        document.addEventListener("click",   onInteract);
        document.addEventListener("keydown", onInteract);
        return () => {
            if (audioRef.current) { audioRef.current.pause(); audioRef.current.currentTime = 0; }
            document.removeEventListener("click",   onInteract);
            document.removeEventListener("keydown", onInteract);
        };
    }, []);

    const toggleMute = () => {
        if (audioRef.current) { audioRef.current.muted = !isMuted; setIsMuted(p => !p); }
    };

    // ── Load village progress ─────────────────────────────────────────────────
    const loadVillageProgress = () => {
        const progress = getProgress();
        const pct = progress.village_progress || 0;
        setVillageProgress(pct);
        if (pct >= 100) {
            const words = getLearnedWords("village", VILLAGE_NPC_META);
            setLearnedWords(words);
            setShowCompleteModal(true);
        }
    };

    // ── Initialize ────────────────────────────────────────────────────────────
    useEffect(() => { initializeVillage(); }, [refreshKey]);

    const initializeVillage = () => {
        setVillageNPCs([
            { npcId: "ligaya",  dbNpcId: "village_npc_2", name: "Ligaya",  x: 40, y: 41, character: LigayaCharacter,  showName: true, quest: "word_association" },
            { npcId: "nando",   dbNpcId: "village_npc_3", name: "Nando",   x: 80, y: 41, character: NandoCharacter,   showName: true, quest: "farm"             },
            { npcId: "vicente", dbNpcId: "village_npc_1", name: "Vicente", x: 20, y: 60, character: VicenteCharacter, showName: true, quest: "market_stall"     },
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
    //
    //  Flow (fog ALWAYS fires first):
    //    First time  → fog wipe → village_complete cutscene → /student/forest
    //    Already seen → fog wipe → /student/forest directly
    //
    const handleGoToForest = () => {
        setShowCompleteModal(false);
        setFogActive(true);   // fog always fires first
    };

    const handleFogDone = () => {
        if (!hasCutsceneSeen("village_complete")) {
            navigate("/cutscene/village_complete", { replace: true });
        } else {
            navigate("/student/forest", { replace: true });
        }
    };

    // ── NPC / modal handlers ──────────────────────────────────────────────────
    const handleNPCClick    = (npc) => { setSelectedNPC(npc); setShowModal(true); };
    const handleCloseModal  = ()    => { setShowModal(false); setSelectedNPC(null); };
    const handleBackClick   = ()    => setShowExitConfirm(true);
    const handleConfirmExit = ()    => { setShowExitConfirm(false); navigate("/dashboard"); };
    const handleCancelExit  = ()    => setShowExitConfirm(false);

    // ── Start quest ───────────────────────────────────────────────────────────
    const handleStartQuest = async () => {
        if (!selectedNPC || !playerId) return;
        setQuestLoading(true);

        const dbNpcId  = selectedNPC.dbNpcId || NPC_DB_ID[selectedNPC.npcId] || selectedNPC.npcId;
        const isMarket = selectedNPC.quest === "market_stall";
        const isFarm   = selectedNPC.quest === "farm";

        let resolvedQuestId          = null;
        let resolvedKitchenQuestId   = null;
        let resolvedBedroomQuestId   = null;
        let resolvedIaLivingQuestId  = null;
        let resolvedIaKitchenQuestId = null;
        let resolvedIaBedroomQuestId = null;

        try {
            const res = await fetch(`${API}/api/challenge/npc/${dbNpcId}/quest`);
            if (res.ok) {
                const { data } = await res.json();
                if (Array.isArray(data) && data.length) {
                    if (isMarket) {
                        const pool = data.filter(q => q.game_mechanic === "drag_drop" && q.scene_type === "market_stall");
                        resolvedQuestId = randomPick(pool)?.quest_id ?? null;
                    } else if (isFarm) {
                        const pool = data.filter(q => q.game_mechanic === "drag_drop" && q.scene_type === "farm");
                        resolvedQuestId = randomPick(pool)?.quest_id ?? null;
                    } else {
                        resolvedQuestId          = randomPick(data.filter(q => q.game_mechanic === "drag_drop"        && q.scene_type === "living_room"))?.quest_id ?? null;
                        resolvedKitchenQuestId   = randomPick(data.filter(q => q.game_mechanic === "drag_drop"        && q.scene_type === "kitchen"))?.quest_id    ?? null;
                        resolvedBedroomQuestId   = randomPick(data.filter(q => q.game_mechanic === "drag_drop"        && q.scene_type === "bedroom"))?.quest_id     ?? null;
                        resolvedIaLivingQuestId  = randomPick(data.filter(q => q.game_mechanic === "item_association" && q.scene_type === "living_room"))?.quest_id  ?? null;
                        resolvedIaKitchenQuestId = randomPick(data.filter(q => q.game_mechanic === "item_association" && q.scene_type === "kitchen"))?.quest_id      ?? null;
                        resolvedIaBedroomQuestId = randomPick(data.filter(q => q.game_mechanic === "item_association" && q.scene_type === "bedroom"))?.quest_id      ?? null;
                    }
                }
            }
        } catch (err) {
            console.error("[VillagePage] Could not fetch questId:", err);
        } finally {
            setQuestLoading(false);
        }

        const state = {
            questId:               resolvedQuestId,
            kitchenQuestId:        resolvedKitchenQuestId,
            bedroomQuestId:        resolvedBedroomQuestId,
            iaQuestId:             resolvedIaLivingQuestId,
            iaKitchenQuestId:      resolvedIaKitchenQuestId,
            iaBedroomQuestId:      resolvedIaBedroomQuestId,
            npcId:                 dbNpcId,
            npcName:               selectedNPC.name,
            returnTo:              "/student/village",
            sceneType:             isMarket ? "market_stall" : isFarm ? "farm" : "living_room",
            questSequence:         isMarket ? [{ type: "drag_drop", sceneType: "market_stall", questId: resolvedQuestId }]
                                 : isFarm   ? [{ type: "drag_drop", sceneType: "farm",         questId: resolvedQuestId }]
                                            : [
                                                { type: "drag_drop",        sceneType: "living_room", questId: resolvedQuestId        },
                                                { type: "item_association", sceneType: "living_room", questId: resolvedIaLivingQuestId },
                                              ],
            sequenceIndex: 0,
        };

        if      (selectedNPC.quest === "market_stall")     navigate("/student/market", { state });
        else if (selectedNPC.quest === "farm")             navigate("/student/farm",   { state });
        else if (selectedNPC.quest === "word_association") navigate("/student/house",  { state });
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
                onStay={() => setShowCompleteModal(false)}
                onAdvance={handleGoToForest}
            />

            <FogTransition active={fogActive} onDone={handleFogDone} label="🌲 Entering the Forest..." />

            <button className="music-toggle-button" onClick={toggleMute}>
                {isMuted ? "🔇" : "🔊"}
            </button>

            <Button variant="back" className="back-button-village-overlay" onClick={handleBackClick}>
                ← {language === "ceb" ? "Balik" : "Back"}
            </Button>

            <EnvironmentPage
                key={refreshKey}
                environmentType="village"
                backgroundImage={VillageBackground}
                npcs={villageNPCs}
                onNPCClick={handleNPCClick}
                playerCharacter={PlayerCharacter}
                debugMode={false}
                playerId={playerId}
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
                                <Button onClick={handleCancelExit} variant="secondary" style={{ background: "linear-gradient(180deg, #5a3e2b, #3b2414)", border: "3px solid #78350f", color: "#f5d89a", fontFamily: "'Pixelify Sans', sans-serif", fontWeight: "bold" }}>
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