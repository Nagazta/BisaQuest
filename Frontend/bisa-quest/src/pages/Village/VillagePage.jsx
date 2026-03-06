import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useCharacterPreference } from "../../hooks/useCharacterPreference";
import EnvironmentPage from "../../components/EnvironmentPage";
import Button from "../../components/Button";
import ParticleEffects from "../../components/ParticleEffects";
import { getPlayerId } from "../../utils/playerStorage";
import VillageBackground from "../../assets/images/environments/Vocabulary/village-bg.png";
import LigayaCharacter from "../../assets/images/characters/vocabulary/Village_Quest_NPC_2.png";
import BoyCharacter from "../../assets/images/characters/Boy.png";
import GirlCharacter from "../../assets/images/characters/Girl.png";
import bgMusic from "../../assets/music/bg-music.mp3";
import QuestStartModal from "../../components/QuestStartModal";
import NandoCharacter from "../../assets/images/characters/vocabulary/Village_Quest_NPC_3.png";
import VicenteCharacter from "../../assets/images/characters/vocabulary/Village_Quest_NPC_1.png";
import "./VillagePage.css";

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
    const navigate = useNavigate();
    const location = useLocation();
    const audioRef = useRef(null);
    const playerId = getPlayerId();

    const API = import.meta.env.VITE_API_URL || "";

    const language = "en";
    const { character, loading: charLoading } = useCharacterPreference();

    const [villageNPCs,       setVillageNPCs]       = useState([]);
    const [refreshKey,        setRefreshKey]         = useState(0);
    const [selectedNPC,       setSelectedNPC]        = useState(null);
    const [showModal,         setShowModal]          = useState(false);
    const [showExitConfirm,   setShowExitConfirm]    = useState(false);
    const [showSummaryButton, setShowSummaryButton]  = useState(false);
    const [isMuted,           setIsMuted]            = useState(false);
    const [questLoading,      setQuestLoading]       = useState(false);

    const PlayerCharacter = character === "roberta" ? GirlCharacter : BoyCharacter;

    useEffect(() => {
        const play = () => { if (audioRef.current) { audioRef.current.volume = 0.3; audioRef.current.play().catch(() => {}); } };
        play();
        const onInteract = () => { play(); document.removeEventListener("click", onInteract); document.removeEventListener("keydown", onInteract); };
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

    useEffect(() => { initializeVillage(); }, [refreshKey]);

    const initializeVillage = async () => {
        if (!playerId) return;
        setVillageNPCs([
            {
                npcId:     "ligaya",
                dbNpcId:   "village_npc_2",
                name:      "Ligaya",
                x:         40,
                y:         41,
                character: LigayaCharacter,
                showName:  true,
                quest:     "word_association",   // → /student/house
            },
            {
                npcId:     "nando",
                dbNpcId:   "village_npc_3",
                name:      "Nando",
                x:         80,
                y:         41,
                character: NandoCharacter,
                showName:  true,
                quest:     "farm",               // → /student/farm
            },
            {
                npcId:     "vicente",
                dbNpcId:   "village_npc_1",
                name:      "Vicente",
                x:         20,
                y:         60,
                character: VicenteCharacter,
                showName:  true,
                quest:     "market_stall",       // → /student/market
            },
        ]);
        try {
            await checkEnvironmentProgress();
        } catch (err) { console.error("Error initializing village:", err); }
    };

    const checkEnvironmentProgress = async () => {
        if (!playerId) return;
        try {
            const res    = await fetch(`${API}/api/npc/environment-progress?environmentType=village&playerId=${playerId}`);
            const result = await res.json();
            if (result.success) {
                const progress = result.data.progress ?? 0;
                if (progress >= 75) setShowSummaryButton(true);
            }
        } catch (e) { console.error(e); }
    };

    const checkAndShowSummary = async () => {
        if (!playerId) return;
        try {
            const res    = await fetch(`${API}/api/npc/environment-progress?environmentType=village&playerId=${playerId}`);
            const result = await res.json();
            if (result.success && (result.data.progress ?? 0) >= 100) {
                navigate("/student/viewCompletion", {
                    state: {
                        showSummary:         true,
                        environmentProgress: result.data.progress,
                        summaryData:         result.data,
                        returnTo:            "/student/village",
                    },
                });
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
            const res    = await fetch(`${API}/api/npc/environment-progress?environmentType=village&playerId=${playerId}`);
            const result = await res.json();
            if (result.success) navigate("/student/summary", {
                state: {
                    showSummary:         true,
                    environmentProgress: result.data.progress,
                    summaryData:         result.data,
                    returnTo:            "/student/village",
                },
            });
        } catch (e) { console.error(e); }
    };

    const handleStartQuest = async () => {
        if (!selectedNPC || !playerId) return;

        setQuestLoading(true);

        const dbNpcId = selectedNPC.dbNpcId || NPC_DB_ID[selectedNPC.npcId] || selectedNPC.npcId;

        let resolvedQuestId          = null;
        let resolvedKitchenQuestId   = null;
        let resolvedBedroomQuestId   = null;
        let resolvedIaLivingQuestId  = null;
        let resolvedIaKitchenQuestId = null;
        let resolvedIaBedroomQuestId = null;

        // Vicente uses market_stall; Nando uses farm
        const isMarket = selectedNPC.quest === "market_stall";
        const isFarm   = selectedNPC.quest === "farm";

        try {
            const res = await fetch(`${API}/api/challenge/npc/${dbNpcId}/quest`);
            if (res.ok) {
                const { data } = await res.json();

                if (Array.isArray(data) && data.length) {
                    if (isMarket) {
                        const marketDDs = data.filter(q =>
                            q.game_mechanic === "drag_drop" && q.scene_type === "market_stall"
                        );
                        resolvedQuestId = randomPick(marketDDs)?.quest_id ?? null;
                        console.log("[VillagePage] market_stall drag_drop →", resolvedQuestId, `(pool: ${marketDDs.length})`);
                    } else if (isFarm) {
                        const farmDDs = data.filter(q =>
                            q.game_mechanic === "drag_drop" && q.scene_type === "farm"
                        );
                        resolvedQuestId = randomPick(farmDDs)?.quest_id ?? null;
                        console.log("[VillagePage] farm drag_drop →", resolvedQuestId, `(pool: ${farmDDs.length})`);
                    } else {
                        const livingRoomDDs = data.filter(q => q.game_mechanic === "drag_drop"        && q.scene_type === "living_room");
                        const kitchenDDs    = data.filter(q => q.game_mechanic === "drag_drop"        && q.scene_type === "kitchen");
                        const bedroomDDs    = data.filter(q => q.game_mechanic === "drag_drop"        && q.scene_type === "bedroom");
                        const iaLivings     = data.filter(q => q.game_mechanic === "item_association" && q.scene_type === "living_room");
                        const iaKitchens    = data.filter(q => q.game_mechanic === "item_association" && q.scene_type === "kitchen");
                        const iaBedroooms   = data.filter(q => q.game_mechanic === "item_association" && q.scene_type === "bedroom");

                        resolvedQuestId          = randomPick(livingRoomDDs)?.quest_id ?? null;
                        resolvedKitchenQuestId   = randomPick(kitchenDDs)?.quest_id    ?? null;
                        resolvedBedroomQuestId   = randomPick(bedroomDDs)?.quest_id    ?? null;
                        resolvedIaLivingQuestId  = randomPick(iaLivings)?.quest_id     ?? null;
                        resolvedIaKitchenQuestId = randomPick(iaKitchens)?.quest_id    ?? null;
                        resolvedIaBedroomQuestId = randomPick(iaBedroooms)?.quest_id   ?? null;
                    }
                }
            } else {
                console.warn("[VillagePage] Quest fetch failed:", res.status);
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
            sequenceIndex:         0,
        };

        if      (selectedNPC.quest === "word_matching")       navigate("/student/wordMatching",       { state });
        else if (selectedNPC.quest === "sentence_completion") navigate("/student/sentenceCompletion", { state });
        else if (selectedNPC.quest === "market_stall")        navigate("/student/market",             { state });
        else if (selectedNPC.quest === "farm")                navigate("/student/farm",               { state });
        else if (selectedNPC.quest === "word_association")    navigate("/student/house",              { state });
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
            <button className="music-toggle-button" onClick={toggleMute}>
                {isMuted ? "🔇" : "🔊"}
            </button>

            <Button variant="back" className="back-button-village-overlay" onClick={handleBackClick}>
                ← {language === "ceb" ? "Balik" : "Back"}
            </Button>

            {showSummaryButton && (
                <Button variant="primary" className="view-summary-button" onClick={handleViewSummary}>
                    {language === "ceb" ? "Tan-awa ang Summary" : "View Summary"}
                </Button>
            )}

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
                                <Button onClick={handleCancelExit} variant="secondary">
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