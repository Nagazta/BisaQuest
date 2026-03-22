// ─────────────────────────────────────────────────────────────────────────────
//  CastleGatePage.jsx  —  Scene 1 of 3: Castle Gate
//  Compound words: drawbridge, doorway, staircase, padlock, keyhole,
//                  pathway, treetop, waterway, grassland, stonework
// ─────────────────────────────────────────────────────────────────────────────
import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Button from "../../components/Button";
import DialogueBox from "../../components/instructions/DialogueBox";
import HouseDebugTools from "../Village/components/HouseDebugTools";
import BilingualText from "../Village/components/BilingualText";
import CastleImageCombineModal from "./components/CastleImageCombineModal";
import CastleApplyModal from "./components/CastleApplyModal";
import BookCollectModal from "../../game/components/BookCollectModal";
import CastleTransitionModal from "../../game/components/CastleTransitionModal";
import { CASTLE_NPC_IMAGES, getQuestData, buildCastleDialogue } from "./data/castleRoomData";
import {
  saveNPCProgress,
  awardLibroPage,
  getLibroPageCount,
  getLibroPageCountForEnv,
} from "../../utils/playerStorage";
import AssetManifest from "../../services/AssetManifest";
import "./CastleGatePage.css";

const QUEST_INDEX = 0;
const NPC_ID      = "castle_npc_1";
const NPC_NAME    = "Princess Hara";
const TOTAL_SCENES = 3;
const REQUIRED_QUESTS = 3;

const CastleGatePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const returnTo = location.state?.returnTo || "/student/castle";

  const NpcImage = CASTLE_NPC_IMAGES[NPC_ID];
  const quest    = getQuestData(NPC_ID, QUEST_INDEX);

  // ── State ───────────────────────────────────────────────────────────────────
  const [debugMode, setDebugMode]           = useState(false);
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [introStep, setIntroStep]           = useState(0);
  const [activeItem, setActiveItem]         = useState(null);
  const [dialogueStep, setDialogueStep]     = useState(0);
  const [questItem, setQuestItem]           = useState(null);
  const [completedItems, setCompletedItems] = useState(new Set());

  // Book & transition modals
  const [showPageModal, setShowPageModal]   = useState(false);
  const [collectedPage, setCollectedPage]   = useState(null);
  const [showTransition, setShowTransition] = useState(false);
  const [progressSaved, setProgressSaved]   = useState(false);

  const pendingQuestRef = useRef(null);

  // ── Open mini-game once activeItem clears ───────────────────────────────────
  useEffect(() => {
    if (pendingQuestRef.current && !activeItem) {
      setQuestItem(pendingQuestRef.current);
      pendingQuestRef.current = null;
    }
  }, [activeItem]);

  // ── Derived ─────────────────────────────────────────────────────────────────
  const introDone    = introStep === null;
  const introDialogue = quest?.introDialogue ?? [];
  const introLine    = !introDone ? introDialogue[introStep] : null;

  const currentLine = introDone && activeItem
    ? buildCastleDialogue(activeItem, NPC_NAME)[dialogueStep]
    : null;

  const isLastDialogueLine = activeItem
    ? dialogueStep === buildCastleDialogue(activeItem, NPC_NAME).length - 1
    : false;

  // ── Handlers ────────────────────────────────────────────────────────────────
  const handleBack = () => navigate(returnTo);

  const handleIntroNext = () => {
    if (introStep < introDialogue.length - 1) setIntroStep((s) => s + 1);
    else setIntroStep(null);
  };

  const handleItemClick = (region) => {
    if (!introDone) return;
    if (debugMode) { setSelectedRegion(selectedRegion?.id === region.id ? null : region); return; }
    setActiveItem(region);
    setDialogueStep(0);
  };

  const handleDialogueNext = () => {
    if (!activeItem) return;
    const lines = buildCastleDialogue(activeItem, NPC_NAME);
    if (dialogueStep < lines.length - 1) {
      setDialogueStep((s) => s + 1);
    } else {
      pendingQuestRef.current = activeItem;
      setActiveItem(null);
      setDialogueStep(0);
    }
  };

  const handleQuestComplete = (region) => {
    setQuestItem(null);
    setCompletedItems((prev) => {
      const next = new Set([...prev, region.id]);

      if (next.size >= REQUIRED_QUESTS && !progressSaved) {
        setProgressSaved(true);
        saveNPCProgress("castle", NPC_ID, quest.items.length, true, 3);

        const isNewPage = awardLibroPage("castle", "castle_gate");
        if (isNewPage) {
          const pageNumber = getLibroPageCountForEnv("castle");
          const totalCollected = getLibroPageCount();
          setCollectedPage({ pageNumber, totalCollected });
          setShowPageModal(true);
        } else {
          setShowTransition(true);
        }
      }

      return next;
    });
  };

  const handleQuestClose = () => setQuestItem(null);

  // BookCollectModal closes → show transition
  const handleFragmentModalClose = () => {
    setShowPageModal(false);
    setCollectedPage(null);
    setShowTransition(true);
  };

  // CastleTransitionModal handlers
  const handleStay = () => setShowTransition(false);
  const handleGoBack = () => {
    setShowTransition(false);
    navigate(returnTo, { state: { completed: true } });
  };
  const handleNextScene = () => {
    setShowTransition(false);
    navigate("/castle/courtyard", { state: { returnTo } });
  };

  // ── Guard ───────────────────────────────────────────────────────────────────
  if (!quest) return (
    <div className="croom-container">
      <div style={{ color: "#fff", padding: 40, fontFamily: "monospace" }}>Quest data not found.</div>
      <Button variant="back" className="croom-back" onClick={handleBack}>← Back</Button>
    </div>
  );

  return (
    <div className="croom-container">

      {/* Background */}
      <img src={quest.background} alt={quest.sceneName} className="croom-background" draggable={false} />

      {/* Back */}
      <Button variant="back" className="croom-back" onClick={handleBack}>← Back</Button>

      {/* Scene label */}
      <div className="croom-scene-label">
        {!introDone ? "Story Introduction" : `${quest.sceneName} · Scene 1 / ${TOTAL_SCENES}`}
      </div>

      {/* Progress dots */}
      <div className="croom-quest-dots">
        {Array.from({ length: TOTAL_SCENES }).map((_, i) => (
          <span key={i} className={[
            "croom-quest-dot",
            i < QUEST_INDEX  ? "croom-quest-dot--done"   : "",
            i === QUEST_INDEX ? "croom-quest-dot--active" : "",
          ].filter(Boolean).join(" ")} />
        ))}
      </div>

      {/* Debug tools */}
      <HouseDebugTools
        debugMode={debugMode} setDebugMode={setDebugMode}
        selectedRegion={selectedRegion} setSelectedRegion={setSelectedRegion}
      />

      {/* Clickable regions */}
      {introDone && quest.items.map((region) => {
        const isDone = completedItems.has(region.id);
        return (
          <div
            key={region.id}
            className={[
              "croom-hover-region",
              debugMode ? "croom-hover-region--debug" : "",
              debugMode && selectedRegion?.id === region.id ? "croom-hover-region--selected" : "",
              !debugMode && activeItem?.id === region.id ? "croom-hover-region--active" : "",
              !debugMode && isDone ? "croom-hover-region--done" : "",
            ].filter(Boolean).join(" ")}
            data-region={region.id}
            style={{ left: `${region.x}%`, top: `${region.y}%`, width: `${region.w}%`, height: `${region.h}%`, cursor: debugMode ? "crosshair" : "pointer" }}
            onClick={() => handleItemClick(region)}
          >
            {debugMode && <span className="croom-debug-badge">{region.id}</span>}
            {!debugMode && !activeItem && !questItem && (
              <span className={`croom-item-dot ${isDone ? "croom-item-dot--done" : ""}`} />
            )}
            {!debugMode && !activeItem && !questItem && (
              <div className="croom-hover-tooltip">
                <span className="croom-hover-tooltip-bisaya">{region.labelBisaya}</span>
                <span className="croom-hover-tooltip-english">{region.labelEnglish}</span>
                {isDone && <span className="croom-hover-tooltip-done">✓ Nahuman na!</span>}
              </div>
            )}
          </div>
        );
      })}

      {/* NPC */}
      <div className="croom-npc-wrap">
        <img
          src={NpcImage} alt={NPC_NAME} draggable={false}
          className={["croom-npc-image", introLine || currentLine ? "croom-npc-image--talking" : ""].filter(Boolean).join(" ")}
        />
      </div>

      {/* Intro dialogue */}
      {introLine && (
        <DialogueBox
          title={introLine.speaker}
          text={<BilingualText line={introLine} />}
          isNarration={false} isPlayer={false}
          showNextButton={true} onNext={handleIntroNext}
        />
      )}

      {/* Item dialogue */}
      {introDone && currentLine && (
        <DialogueBox
          title={currentLine.speaker}
          text={
            <span className="croom-bilingual">
              <span className="croom-bilingual-bisaya">{currentLine.bisayaText}</span>
              <span className="croom-bilingual-english">{currentLine.englishText}</span>
              {isLastDialogueLine && (
                <span className="croom-quest-incoming-inline">🎮 Mini-game sunod! · Mini-game coming up!</span>
              )}
            </span>
          }
          introItem={dialogueStep === 0 ? { label: activeItem.labelBisaya, imageKey: activeItem.id } : null}
          isNarration={false} isPlayer={false}
          showNextButton={true} onNext={handleDialogueNext}
        />
      )}

      {/* Idle hint */}
      {introDone && !activeItem && !questItem && !debugMode && (
        <div className="croom-idle-hint">
          <span className="croom-idle-hint-bisaya">💬 I-click ang bisan unsang butang para makat-on og Compound Words!</span>
          <span className="croom-idle-hint-english">Click any item to learn about Compound Words!</span>
        </div>
      )}

      {/* Mini-game modal */}
      {questItem && (
        questItem.applyGame
          ? <CastleApplyModal
              item={questItem} npcName={NPC_NAME} npcImage={NpcImage}
              onClose={handleQuestClose} onComplete={handleQuestComplete}
            />
          : <CastleImageCombineModal
              item={questItem} npcName={NPC_NAME} npcImage={NpcImage}
              sceneBg={quest.background}
              onClose={handleQuestClose} onComplete={handleQuestComplete}
            />
      )}

      {/* ── Book Collect Modal ────────────────────────────────────────────── */}
      <BookCollectModal
        isOpen={showPageModal}
        npcName={NPC_NAME}
        pageNumber={collectedPage?.pageNumber}
        totalPages={collectedPage?.totalCollected}
        environment="castle"
        onClose={handleFragmentModalClose}
      />

      {/* ── Stay / Go Back transition modal ────────────────────────────────── */}
      <CastleTransitionModal
        isOpen={showTransition}
        sceneName="the Gate"
        onStay={handleStay}
        onGoBack={handleGoBack}
        onNextScene={handleNextScene}
        nextSceneName="Courtyard"
      />

    </div>
  );
};

export default CastleGatePage;
