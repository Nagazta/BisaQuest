import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Button from "../../components/Button";
import DialogueBox from "../../components/instructions/DialogueBox";
import AssetManifest from "../../services/AssetManifest";
import PondQuestModal from "../../game/components/PondQuestModal";
import {
  NPC_IMAGES,
  POND_ITEMS,
  INTRO_DIALOGUE,
  buildPondDialogue,
} from "./data/pondData";
import {
  getPlayerId,
  saveNPCProgress,
  shouldAwardForestFragment,
  awardLibroPage,
  getLibroPageCount,
  getLibroPageCountForEnv,
  getNPCWords,
} from "../../utils/playerStorage";
import BookCollectModal from "../../game/components/BookCollectModal";
import ForestTransitionModal from "../../game/components/ForestTransitionModal";
import "./ForestPondPage.css";

const ForestPondPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const npcId = location.state?.npcId || "forest_npc_1";
  const npcName = location.state?.npcName || "Lunti";
  const returnTo = location.state?.returnTo || "/student/forest";
  const playerId = getPlayerId();

  const NpcImage = NPC_IMAGES[npcId] || AssetManifest.forest.npcs.forest_guardian;

  // ── State ─────────────────────────────────────────────────────────────────
  const [introStep, setIntroStep] = useState(0); // null = intro done
  const [activeItem, setActiveItem] = useState(null);
  const [dialogueStep, setDialogueStep] = useState(0);
  const [questItem, setQuestItem] = useState(null);
  const [completedItems, setCompletedItems] = useState(new Set());

  // ── Fragment modal ────────────────────────────────────────────────────────
  const [showPageModal, setShowPageModal] = useState(false);
  const [collectedPage, setCollectedPage] = useState(null);
  const [showTransition, setShowTransition] = useState(false);
  const [milestonesAwarded, setMilestonesAwarded] = useState(0);

  // pendingQuest holds the region we want to open a quest for
  const pendingQuestRef = useRef(null);

  useEffect(() => {
    if (pendingQuestRef.current && !activeItem) {
      setQuestItem(pendingQuestRef.current);
      pendingQuestRef.current = null;
    }
  }, [activeItem]);

  // ── Load progress on mount ────────────────────────────────────────────────
  useEffect(() => {
    const savedWords = getNPCWords("forest", npcId);
    if (savedWords.length > 0) {
      const restored = new Set();
      POND_ITEMS.forEach(region => {
        const word = `${region.labelBisaya} (${region.labelEnglish})`;
        if (savedWords.includes(word)) {
          restored.add(region.id);
        }
      });
      if (restored.size > 0) setCompletedItems(restored);
    }
  }, [npcId]);

  // ── Derived ───────────────────────────────────────────────────────────────
  const introDone = introStep === null;
  const introLine = !introDone ? INTRO_DIALOGUE[introStep] : null;
  const currentLine =
    introDone && activeItem ? buildPondDialogue(activeItem)[dialogueStep] : null;

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleBack = () => navigate(returnTo);

  const handleIntroNext = () => {
    if (introStep < INTRO_DIALOGUE.length - 1) {
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
    const lines = buildPondDialogue(activeItem);

    if (dialogueStep < lines.length - 1) {
      setDialogueStep((s) => s + 1);
    } else {
      pendingQuestRef.current = activeItem;
      setActiveItem(null);
      setDialogueStep(0);
    }
  };

  // Award both books at once only after completing all 6 quests
  const MILESTONES = [6];

  const handleQuestComplete = (region) => {
    setQuestItem(null);
    setCompletedItems((prev) => {
      const next = new Set([...prev, region.id]);
      const milestone = MILESTONES[milestonesAwarded]; // next target

      // Save this word
      const word = `${region.labelBisaya} (${region.labelEnglish})`;
      saveNPCProgress("forest", npcId, next.size, next.size >= 6, 6, [word]);

      if (milestone && next.size >= milestone) {
        // Award both fragments at once
        const page1Key = `${npcId}_page1`;
        const page2Key = `${npcId}_page2`;
        
        const awarded1 = awardLibroPage("forest", page1Key);
        const awarded2 = awardLibroPage("forest", page2Key);

        if (awarded1 || awarded2) {
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

  const handleQuestClose = () => {
    setQuestItem(null);
  };

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
    <div className="pond-container">
      {/* Background image */}
      <img
        src={AssetManifest.forest.scenarios.pond}
        alt="Forest Pond"
        className="pond-background"
        draggable={false}
      />

      <Button variant="back" className="pond-back" onClick={handleBack}>
        ← Back
      </Button>

      <div className="pond-scene-label">
        {!introDone ? "Story Introduction" : "Explore the Pond 🌿"}
      </div>

      {/* ── Hover / clickable regions ─────────────────────────────────────── */}
      {introDone &&
        POND_ITEMS.map((region) => {
          const isDone = completedItems.has(region.id);
          return (
            <div
              key={region.id}
              className={[
                "pond-hover-region",
                activeItem?.id === region.id ? "pond-hover-region--active" : "",
                isDone ? "pond-hover-region--done" : "",
              ]
                .filter(Boolean)
                .join(" ")}
              style={{
                left: `${region.x}%`,
                top: `${region.y}%`,
                width: `${region.w}%`,
                height: `${region.h}%`,
                cursor: "pointer",
              }}
              onClick={() => handleItemClick(region)}
            >

              {/* Pulsing dot */}
              {!activeItem && !questItem && (
                <span
                  className={`pond-item-dot ${isDone ? "pond-item-dot--done" : ""}`}
                />
              )}

              {/* Tooltip on hover */}
              {!activeItem && !questItem && (
                <div className="pond-hover-tooltip">
                  <span className="pond-hover-tooltip-bisaya">
                    {region.labelBisaya}
                  </span>
                  <span className="pond-hover-tooltip-english">
                    {region.labelEnglish}
                  </span>
                  {isDone && (
                    <span className="pond-hover-tooltip-done">
                      ✓ Nahuman na!
                    </span>
                  )}
                </div>
              )}
            </div>
          );
        })}

      {/* ── NPC sprite ────────────────────────────────────────────────────── */}
      <div className="pond-npc-wrap">
        <img
          src={NpcImage}
          alt={npcName}
          className={[
            "pond-npc-image",
            introLine || currentLine ? "pond-npc-image--talking" : "",
          ]
            .filter(Boolean)
            .join(" ")}
          draggable={false}
        />
      </div>

      {/* ── Intro DialogueBox ─────────────────────────────────────────────── */}
      {introLine && (
        <DialogueBox
          title={introLine.speaker}
          text={
            <span className="house-bilingual">
              <span className="house-bilingual-bisaya">
                {introLine.bisayaText}
              </span>
              <span className="house-bilingual-english">
                {introLine.englishText}
              </span>
            </span>
          }
          isNarration={false}
          isPlayer={false}
          showNextButton={true}
          onNext={handleIntroNext}
        />
      )}

      {/* ── Item description DialogueBox ──────────────────────────────────── */}
      {introDone && currentLine && (
        <DialogueBox
          title={currentLine.speaker}
          text={
            <span className="house-bilingual">
              <span className="house-bilingual-bisaya">
                {currentLine.bisayaText}
              </span>
              <span className="house-bilingual-english">
                {currentLine.englishText}
              </span>
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
        <div className="pond-idle-hint">
          <span className="pond-idle-hint-bisaya">
            💬 I-click ang bisan unsang hayop para matabangan sila!
          </span>
          <span className="pond-idle-hint-english">
            Click on any animal group to help them!
          </span>
        </div>
      )}

      {/* ── Pond Quest Modal ──────────────────────────────────────────────── */}
      {questItem && (
        <PondQuestModal
          item={questItem}
          npcName={npcName}
          npcImage={NpcImage}
          onClose={handleQuestClose}
          onComplete={handleQuestComplete}
        />
      )}

      {/* ── Forest Fragment collect modal ─────────────────────────────────── */}
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
        sceneName="the Pond"
        onStay={handleStay}
        onGoBack={handleGoBack}
      />
    </div>
  );
};

export default ForestPondPage;
