// ─────────────────────────────────────────────────────────────────────────────
//  ForestPondPage.jsx — Lunti's exploration page (mirrors HousePage pattern)
// ─────────────────────────────────────────────────────────────────────────────
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
} from "../../utils/playerStorage";
import BookCollectModal from "../../game/components/BookCollectModal";
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

  // pendingQuest holds the region we want to open a quest for
  const pendingQuestRef = useRef(null);

  useEffect(() => {
    if (pendingQuestRef.current && !activeItem) {
      setQuestItem(pendingQuestRef.current);
      pendingQuestRef.current = null;
    }
  }, [activeItem]);

  // ── Derived ───────────────────────────────────────────────────────────────
  const introDone = introStep === null;
  const introLine = !introDone ? INTRO_DIALOGUE[introStep] : null;
  const currentLine =
    introDone && activeItem ? buildPondDialogue(activeItem)[dialogueStep] : null;
  const isLastDialogueLine = activeItem
    ? dialogueStep === buildPondDialogue(activeItem).length - 1
    : false;

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

  const handleQuestComplete = (region) => {
    setQuestItem(null);
    setCompletedItems((prev) => {
      const next = new Set([...prev, region.id]);
      // Check if all 5 items are done → save progress
      if (next.size >= POND_ITEMS.length) {
        submitProgress();
      }
      return next;
    });
  };

  const handleQuestClose = () => {
    setQuestItem(null);
  };

  // ── Progress submission ─────────────────────────────────────────────────
  const submitProgress = () => {
    if (!playerId) return;

    // npcCount for forest — currently 3 active NPCs (Lunti, Diwata, Deer)
    saveNPCProgress("forest", npcId, POND_ITEMS.length, true, 3);

    // Award a Forest Fragment if the player qualifies
    if (shouldAwardForestFragment(npcId)) {
      const isNewPage = awardLibroPage("forest", npcId);
      if (isNewPage) {
        const pageNumber = getLibroPageCountForEnv("forest");
        const totalCollected = getLibroPageCount();
        setCollectedPage({ pageNumber, totalCollected });
        setShowPageModal(true);
        return;
      }
    }

    navigate(returnTo, { state: { completed: true } });
  };

  const handleFragmentModalClose = () => {
    setShowPageModal(false);
    setCollectedPage(null);
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
              {/* Emoji visual for the item */}
              {!activeItem && !questItem && (
                <span className="pond-item-emoji">{region.emoji}</span>
              )}

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
              {isLastDialogueLine && (
                <span className="pond-quest-incoming-inline">
                  🎮 Mini-game sunod! · Mini-game coming up!
                </span>
              )}
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
    </div>
  );
};

export default ForestPondPage;
