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
import bgMusic from "../../assets/music/bg-music.mp3";
import QuestStartModal from "../../components/QuestStartModal";
import ProgressBar from "../../components/ProgressBar";
import EnvironmentCompleteModal from "../../components/EnvironmentCompleteModal";
import FogTransition from "../../components/FogTransition";
import "./ForestPage.css";

const FOREST_NPCS = [
    { npcId: "forest_npc_1", name: "Lunti", x: 25, y: 35, character: AssetManifest.forest.npcs.forest_guardian, showName: true, quest: "synonym_antonym" },
    // { npcId: "forest_npc_2", name: "Ronaldo", x: 72, y: 35, character: AssetManifest.forest.npcs.wandering_bard, showName: true, quest: "synonym_antonym" }, // TODO: no quests yet
    { npcId: "forest_npc_3", name: "Diwata", x: 45, y: 45, character: AssetManifest.forest.npcs.diwata, showName: true, quest: "synonym_antonym" },
];

const shuffleFirst = (arr) => {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1));[a[i], a[j]] = [a[j], a[i]]; }
    return a[0];
};

const ForestPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const audioRef = useRef(null);
    const playerId = getPlayerId();
    const API = import.meta.env.VITE_API_URL || "";

    const { character, loading: charLoading } = useCharacterPreference();

    const [forestNPCs, setForestNPCs] = useState([]);
    const [refreshKey, setRefreshKey] = useState(0);
    const [selectedNPC, setSelectedNPC] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [showExitConfirm, setShowExitConfirm] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [questLoading, setQuestLoading] = useState(false);
    const [forestProgress, setForestProgress] = useState(0);
    const [showCompleteModal, setShowCompleteModal] = useState(false);
    const [fogActive, setFogActive] = useState(false);
    const [learnedWords, setLearnedWords] = useState([]);

    const PlayerCharacter = character === "roberta" ? AssetManifest.characters.girl : AssetManifest.characters.boy;

    // ── Background music ──────────────────────────────────────────────────────
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

    // ── Load forest progress (localStorage, mirrors VillagePage) ──────────────
    const loadForestProgress = () => {
        const progress = getProgress();
        const pct = progress.forest_progress || 0;
        const forestPages = getLibroPageCountForEnv("forest");

        // Show real page-based progress: each page = 33%
        const effectivePct = Math.max(pct, Math.min(Math.round((forestPages / 3) * 100), 100));
        setForestProgress(effectivePct);

        // Trigger completion when 3+ forest libro pages collected
        if (effectivePct >= 100 && !isCompleteDismissed("forest")) {
            const words = getLearnedWords("forest");
            setLearnedWords(words);
            setShowCompleteModal(true);
        }
    };

    // ── Initialize ────────────────────────────────────────────────────────────
    useEffect(() => { initializeForest(); }, [refreshKey]);

    const initializeForest = () => {
        setForestNPCs(FOREST_NPCS);
        loadForestProgress();
    };

    // ── Refresh on return from quest ──────────────────────────────────────────
    useEffect(() => {
        if (location.state?.completed) {
            setRefreshKey(p => p + 1);
            navigate(location.pathname, { replace: true, state: {} });
        }
    }, [location.state]);

    // ── "Adto sa Castle!" button handler ─────────────────────────────────────
    const handleGoToCastle = () => {
        markCompleteDismissed("forest");
        setShowCompleteModal(false);
        setFogActive(true);
    };

    const handleFogDone = () => {
        if (!hasCutsceneSeen("forest_complete")) {
            navigate("/cutscene/forest_complete", { replace: true });
        } else {
            navigate("/student/castle", { replace: true });
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

        let resolvedQuestId = null;
        try {
            const res = await fetch(`${API}/api/challenge/npc/${selectedNPC.npcId}/quest`);
            if (res.ok) {
                const { data: quests } = await res.json();
                if (Array.isArray(quests) && quests.length > 0)
                    resolvedQuestId = shuffleFirst(quests)?.quest_id ?? null;
            }
        } catch (err) { console.error("[ForestPage] Failed to resolve quest:", err); }

        setQuestLoading(false);
        const state = { questId: resolvedQuestId, npcId: selectedNPC.npcId, npcName: selectedNPC.name, returnTo: "/student/forest" };

        // Lunti → ForestPondPage, Diwata → ForestGlowPage, others → ForestScenePage
        if (selectedNPC.npcId === "forest_npc_1") {
            navigate("/student/forest-pond", { state });
        } else if (selectedNPC.npcId === "forest_npc_3") {
            navigate("/student/forest-glow", { state });
        } else {
            navigate("/forest/scene", { state });
        }
    };

    if (charLoading) return <div className="forest-page-wrapper"><div className="loading-message">Loading...</div></div>;

    return (
        <div className="forest-page-wrapper">
            <audio ref={audioRef} loop><source src={bgMusic} type="audio/mpeg" /></audio>
            <ParticleEffects enableMouseTrail={false} />

            <div className="village-progress-bar-wrap">
                <ProgressBar progress={forestProgress} variant="forest" showLabel={true} />
            </div>

            <EnvironmentCompleteModal
                isOpen={showCompleteModal}
                environment="forest"
                learnedWords={learnedWords}
                nextEnv="Castle"
                onStay={() => {
                    markCompleteDismissed("forest");
                    setShowCompleteModal(false);
                }}
                onAdvance={handleGoToCastle}
            />

            <FogTransition active={fogActive} onDone={handleFogDone} label="🏰 Entering the Castle..." />

            <button className="music-toggle-button" onClick={toggleMute}>{isMuted ? "🔇" : "🔊"}</button>

            <Button variant="back" className="back-button-forest-overlay" onClick={handleBackClick}>← Back</Button>

            <EnvironmentPage
                key={refreshKey}
                environmentType="forest"
                backgroundImage={AssetManifest.forest.background}
                npcs={forestNPCs}
                onNPCClick={handleNPCClick}
                playerCharacter={PlayerCharacter}
                characterType={character === "roberta" ? "girl" : "boy"}
                debugMode={false}
                playerId={playerId}
            />

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