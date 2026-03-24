import { useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Button from "../../components/Button";
import DialogueBox from "../../components/instructions/DialogueBox";
import AssetManifest from "../../services/AssetManifest";
import DiwataQuestModal from "../../game/components/DiwataQuestModal";
import {
  DIWATA_NPC_IMAGES,
  GLOW_ITEMS,
  DIWATA_INTRO_DIALOGUE,
  buildGlowDialogue,
} from "./data/diwataData";
import {
  getPlayerId,
  saveNPCProgress,
  awardLibroPage,
  getLibroPageCount,
  getLibroPageCountForEnv,
} from "../../utils/playerStorage";
import BookCollectModal from "../../game/components/BookCollectModal";
import ForestTransitionModal from "../../game/components/ForestTransitionModal";
import "./ForestGlowPage.css";

const ForestGlowPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const npcId = location.state?.npcId || "forest_npc_3";
  const npcName = location.state?.npcName || "Diwata";
  const returnTo = location.state?.returnTo || "/student/forest";
  const playerId = getPlayerId();

  const NpcImage = DIWATA_NPC_IMAGES[npcId] || AssetManifest.forest.npcs.diwata;

  // ── State ───────────────────────────────────────────────────────────────────
  const [introStep, setIntroStep] = useState(0);  // null = intro done
  const [activeItem, setActiveItem] = useState(null);
  const [dialogueStep, setDialogueStep] = useState(0);
  const [questItem, setQuestItem] = useState(null);
  const [completedItems, setCompletedItems] = useState(new Set());

  // ── Book-collect modal ───────────────────────────────────────────────────────
  const [showPageModal, setShowPageModal] = useState(false);
  const [collectedPage, setCollectedPage] = useState(null);
  const [showTransition, setShowTransition] = useState(false);
  const [progressSaved, setProgressSaved] = useState(false);

  // Pending quest ref (same pattern as ForestPondPage)
  const pendingQuestRef = useRef(null);

  // Fire pending quest after activeItem is cleared
  const checkPending = () => {
    if (pendingQuestRef.current) {
      setQuestItem(pendingQuestRef.current);
      pendingQuestRef.current = null;
    }
  };

  // ── Derived ─────────────────────────────────────────────────────────────────
  const introDone = introStep === null;
  const introLine = !introDone ? DIWATA_INTRO_DIALOGUE[introStep] : null;
  const currentLine = introDone && activeItem
    ? buildGlowDialogue(activeItem)[dialogueStep]
    : null;

  // ── Handlers ─────────────────────────────────────────────────────────────────
  const handleBack = () => navigate(returnTo);

  const handleIntroNext = () => {
    if (introStep < DIWATA_INTRO_DIALOGUE.length - 1) {
      setIntroStep((s) => s + 1);
    } else {
      setIntroStep(null);
    }
  };

  const handleItemClick = (region) => {
    if (!introDone) return;
    setActiveItem(region);
    setDialogueStep(0);
  };

  const handleDialogueNext = () => {
    if (!activeItem) return;
    const lines = buildGlowDialogue(activeItem);
    if (dialogueStep < lines.length - 1) {
      setDialogueStep((s) => s + 1);
    } else {
      pendingQuestRef.current = activeItem;
      setActiveItem(null);
      setDialogueStep(0);
      // Give React one tick to clear activeItem, then open quest
      setTimeout(checkPending, 0);
    }
  };

  const COMPLETE_THRESHOLD = 3;

  const handleQuestComplete = (region) => {
    setQuestItem(null);
    setCompletedItems((prev) => {
      const next = new Set([...prev, region.id]);

      // Save this word
      const word = `${region.labelBisaya} (${region.labelEnglish})`;
      saveNPCProgress("forest", npcId, GLOW_ITEMS.length, true, 3, [word]);

      // Save progress & award fragment after 3 unique items (matching Village pattern)
      if (next.size >= 3 && !progressSaved) {
        setProgressSaved(true);

        const isNewPage = awardLibroPage("forest", npcId);
        if (isNewPage) {
          const pageNumber = getLibroPageCountForEnv("forest");
          const totalCollected = getLibroPageCount();
          setCollectedPage({ pageNumber, totalCollected });
          setShowPageModal(true);
        } else {
          // Already awarded previously — just show the transition modal
          setShowTransition(true);
        }
      }

      return next;
    });
  };

  const handleQuestClose = () => setQuestItem(null);

  // BookCollectModal closes → show the stay/go-back choice
  const handleFragmentModalClose = () => {
    setShowPageModal(false);
    setCollectedPage(null);
    setShowTransition(true);
  };

  // ForestTransitionModal handlers
  const handleStay = () => {
    setShowTransition(false);
  };

  const handleGoBack = () => {
    setShowTransition(false);
    navigate(returnTo, { state: { completed: true } });
  };

  return (
    <div className="glow-container">
      {/* Background — incomplete until ≥3 minigames cleared, then complete */}
      <img
        src={
          completedItems.size >= COMPLETE_THRESHOLD
            ? AssetManifest.forest.scenarios.glowComplete
            : AssetManifest.forest.scenarios.glowIncomplete
        }
        alt="Forest Glow"
        className="glow-background"
        draggable={false}
      />

      <Button variant="back" className="glow-back" onClick={handleBack}>
        ← Back
      </Button>

      <div className="glow-scene-label">
        {!introDone ? "Story Introduction" : "Explore the Forest ✨"}
      </div>

      {/* ── Clickable dot regions ─────────────────────────────────────────── */}
      {introDone &&
        GLOW_ITEMS.map((region) => {
          const isDone = completedItems.has(region.id);
          return (
            <div
              key={region.id}
              className={[
                "glow-hover-region",
                activeItem?.id === region.id ? "glow-hover-region--active" : "",
              ].filter(Boolean).join(" ")}
              style={{
                left: `${region.x}%`,
                top: `${region.y}%`,
                width: `${region.w}%`,
                height: `${region.h}%`,
              }}
              onClick={() => handleItemClick(region)}
            >
              {/* Pulsing dot — no emoji */}
              {!activeItem && !questItem && (
                <span className={`glow-item-dot ${isDone ? "glow-item-dot--done" : ""}`} />
              )}

              {/* Tooltip */}
              {!activeItem && !questItem && (
                <div className="glow-hover-tooltip">
                  <span className="glow-hover-tooltip-bisaya">{region.labelBisaya}</span>
                  <span className="glow-hover-tooltip-english">{region.labelEnglish}</span>
                  {isDone && (
                    <span className="glow-hover-tooltip-done">✓ Nahuman na!</span>
                  )}
                </div>
              )}
            </div>
          );
        })}

      {/* ── NPC sprite ────────────────────────────────────────────────────── */}
      <div className="glow-npc-wrap">
        <img
          src={NpcImage}
          alt={npcName}
          className={[
            "glow-npc-image",
            introLine || currentLine ? "glow-npc-image--talking" : "",
          ].filter(Boolean).join(" ")}
          draggable={false}
        />
      </div>

      {/* ── Intro DialogueBox ────────────────────────────────────────────── */}
      {introLine && (
        <DialogueBox
          title={introLine.speaker}
          text={
            <span className="house-bilingual">
              <span className="house-bilingual-bisaya">{introLine.bisayaText}</span>
              <span className="house-bilingual-english">{introLine.englishText}</span>
            </span>
          }
          isNarration={false}
          isPlayer={false}
          showNextButton={true}
          onNext={handleIntroNext}
        />
      )}

      {/* ── Item dialogue ─────────────────────────────────────────────────── */}
      {introDone && currentLine && (
        <DialogueBox
          title={currentLine.speaker}
          text={
            <span className="house-bilingual">
              <span className="house-bilingual-bisaya">{currentLine.bisayaText}</span>
              <span className="house-bilingual-english">{currentLine.englishText}</span>
            </span>
          }
          isNarration={false}
          isPlayer={false}
          showNextButton={true}
          onNext={handleDialogueNext}
        />
      )}

      {/* ── Idle hint ─────────────────────────────────────────────────────── */}
      {introDone && !activeItem && !questItem && (
        <div className="glow-idle-hint">
          <span className="glow-idle-hint-bisaya">💬 I-click ang mga bahin sa palibot aron makatabang!</span>
          <span className="glow-idle-hint-english">Click the areas around you to help!</span>
        </div>
      )}

      {/* ── Diwata Quest Modal ────────────────────────────────────────────── */}
      {questItem && (
        <DiwataQuestModal
          item={questItem}
          npcName={npcName}
          npcImage={NpcImage}
          onClose={handleQuestClose}
          onComplete={handleQuestComplete}
        />
      )}

      {/* ── Book collect modal ────────────────────────────────────────────── */}
      <BookCollectModal
        isOpen={showPageModal}
        npcName={npcName}
        pageNumber={collectedPage?.pageNumber}
        totalPages={collectedPage?.totalCollected}
        environment="forest"
        onClose={handleFragmentModalClose}
      />

      {/* ── Stay / Go Back transition modal ────────────────────────────────── */}
      <ForestTransitionModal
        isOpen={showTransition}
        sceneName="the Glow"
        onStay={handleStay}
        onGoBack={handleGoBack}
      />
    </div>
  );
};

export default ForestGlowPage;
