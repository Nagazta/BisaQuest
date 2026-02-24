import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useLanguagePreference } from "../../hooks/useLanguagePreference";
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
import "./VillagePage.css";

// Maps the NPC's npc_id (as stored in the DB) to their DB identifier.
// This is what gets sent to GET /api/challenge/npc/:npcId/quest
// to look up which quest_id belongs to this NPC.
const NPC_DB_ID = {
    ligaya: "village_npc_2",
};

const VillagePage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const audioRef = useRef(null);
    const playerId = getPlayerId();

    const API = import.meta.env.VITE_API_URL || "";

    const { language, loading: langLoading } = useLanguagePreference();
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

    // ── Music ─────────────────────────────────────────────────────────────────
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

    // ── Init ──────────────────────────────────────────────────────────────────
    useEffect(() => { initializeVillage(); }, [refreshKey]);

    const initializeVillage = async () => {
        if (!playerId) return;
        setVillageNPCs([
            {
                npcId:     "ligaya",
                dbNpcId:   "village_npc_2",   // ← matches npcs.npc_id in Supabase
                name:      "Ligaya",
                x:         40,
                y:         41,
                character: LigayaCharacter,
                showName:  true,
                quest:     "word_association",
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

    // ── Handlers ──────────────────────────────────────────────────────────────
    const handleNPCClick   = (npc) => { setSelectedNPC(npc); setShowModal(true); };
    const handleCloseModal = ()    => { setShowModal(false); setSelectedNPC(null); };
    const handleBackClick  = ()    => setShowExitConfirm(true);
    const handleConfirmExit = ()   => { setShowExitConfirm(false); navigate("/dashboard"); };
    const handleCancelExit  = ()   => setShowExitConfirm(false);

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

    // ── Start quest — fetches real questId from DB before navigating ──────────
    const handleStartQuest = async () => {
        if (!selectedNPC || !playerId) return;

        setQuestLoading(true);

        // Use the DB npc_id to fetch the real quest_id for this NPC
        const dbNpcId = selectedNPC.dbNpcId || NPC_DB_ID[selectedNPC.npcId] || selectedNPC.npcId;

        let resolvedQuestId = null;
        try {
            const res = await fetch(`${API}/api/challenge/npc/${dbNpcId}/quest`);
            if (res.ok) {
                const body = await res.json();
                console.log("[VillagePage] quest list response", body);
                let { data } = body;

                // shuffle the quest list so each click starts with a random entry.
                // Fisher–Yates shuffle in-place.
                if (Array.isArray(data) && data.length > 1) {
                    for (let i = data.length - 1; i > 0; i--) {
                        const j = Math.floor(Math.random() * (i + 1));
                        [data[i], data[j]] = [data[j], data[i]];
                    }
                }

                // find the first quest that actually has dialogue rows (otherwise the
                // game will show an empty screen).  this is a defensive measure so
                // the Village UI doesn’t hand the user a blank page when the DB is
                // missing content.
                if (Array.isArray(data) && data.length) {
                    for (let q of data) {
                        // only check the first few quests to avoid long delays
                        const check = await fetch(`${API}/api/challenge/quest/${q.quest_id}/dialogues`);
                        if (check.ok) {
                            const json = await check.json();
                            if (Array.isArray(json.data) && json.data.length > 0) {
                                resolvedQuestId = q.quest_id;
                                break;
                            }
                        }
                    }

                    // if we still didn’t find any, fall back to the first entry and
                    // warn the developer so they can seed the database.
                    if (!resolvedQuestId) {
                        resolvedQuestId = data[0].quest_id;
                        console.warn('[VillagePage] no quests with dialogues; using', resolvedQuestId);
                    }
                }
            } else {
                console.warn("[VillagePage] quest fetch failed", res.status);
            }
        } catch (err) {
            console.error("[VillagePage] Could not fetch questId:", err);
        }

        setQuestLoading(false);

        const state = {
            questId:  resolvedQuestId,   // ← real DB quest_id, not hardcoded 1
            npcId:    dbNpcId,           // ← "village_npc_2", matches DB
            npcName:  selectedNPC.name,
            returnTo: "/student/village",
        };

        if      (selectedNPC.quest === "word_matching")       navigate("/student/wordMatching",       { state });
        else if (selectedNPC.quest === "sentence_completion") navigate("/student/sentenceCompletion", { state });
        else if (selectedNPC.quest === "word_association")    navigate("/house",                      { state });
    };

    if (langLoading || charLoading) return (
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