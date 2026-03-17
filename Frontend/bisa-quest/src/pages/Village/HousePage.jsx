// ─────────────────────────────────────────────────────────────────────────────
//  HousePage.jsx
// ─────────────────────────────────────────────────────────────────────────────
import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Button from "../../components/Button";
import DialogueBox from "../../components/instructions/DialogueBox";
import AssetManifest from "../../services/AssetManifest";
import HouseDebugTools from "./components/HouseDebugTools";
import BilingualText from "./components/BilingualText";
import ItemQuestModal from "../../game/components/ItemQuestModal";
import { NPC_IMAGES, LIVING_ROOM_LABELS, INTRO_DIALOGUE, buildDialogue } from "./data/houseData";
import "./HousePage.css";

const HousePage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const npcId = location.state?.npcId || "village_npc_2";
  const npcName = location.state?.npcName || "Ligaya";
  const returnTo = location.state?.returnTo || "/student/village";

  const NpcImage = NPC_IMAGES[npcId] || AssetManifest.village.npcs.ligaya;

  // ── State ─────────────────────────────────────────────────────────────────
  const [debugMode, setDebugMode] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [introStep, setIntroStep] = useState(0);       // null = intro done
  const [activeItem, setActiveItem] = useState(null);
  const [dialogueStep, setDialogueStep] = useState(0);
  const [questItem, setQuestItem] = useState(null);
  const [completedItems, setCompletedItems] = useState(new Set());

  // pendingQuest holds the region we want to open a quest for
  // after activeItem has been cleared in the same render cycle
  const pendingQuestRef = useRef(null);

  // ── useEffect: open quest once activeItem is null and pendingQuest is set ──
  useEffect(() => {
    if (pendingQuestRef.current && !activeItem) {
      setQuestItem(pendingQuestRef.current);
      pendingQuestRef.current = null;
    }
  }, [activeItem]);

  // ── Derived ───────────────────────────────────────────────────────────────
  const introDone = introStep === null;
  const introLine = !introDone ? INTRO_DIALOGUE[introStep] : null;
  const currentLine = introDone && activeItem
    ? buildDialogue(activeItem)[dialogueStep]
    : null;
  const isLastDialogueLine = activeItem
    ? dialogueStep === buildDialogue(activeItem).length - 1
    : false;

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleBack = () => navigate(returnTo);

  const handleIntroNext = () => {
    if (introStep < INTRO_DIALOGUE.length - 1) {
      setIntroStep(s => s + 1);
    } else {
      setIntroStep(null);
    }
  };

  const handleItemClick = (region) => {
    if (!introDone) return;
    if (debugMode) {
      setSelectedRegion(selectedRegion?.id === region.id ? null : region);
      return;
    }
    setActiveItem(region);
    setDialogueStep(0);
  };

  const handleDialogueNext = () => {
    if (!activeItem) return;
    const lines = buildDialogue(activeItem);

    if (dialogueStep < lines.length - 1) {
      setDialogueStep(s => s + 1);
    } else {
      // Store the region in ref BEFORE clearing activeItem
      // useEffect above will pick it up once activeItem becomes null
      pendingQuestRef.current = activeItem;
      setActiveItem(null);
      setDialogueStep(0);
    }
  };

  const handleQuestComplete = (region) => {
    setQuestItem(null);
    setCompletedItems(prev => new Set([...prev, region.id]));
  };

  const handleQuestClose = () => {
    setQuestItem(null);
  };

  return (
    <div className="house-container">

      <img
        src={AssetManifest.village.scenarios.house}
        alt="Living Room"
        className="house-background"
        draggable={false}
      />

      <Button variant="back" className="house-back" onClick={handleBack}>
        ← Back
      </Button>

      <div className="house-scene-label">
        {!introDone ? "Story Introduction" : "Explore the Room"}
      </div>

      <HouseDebugTools
        debugMode={debugMode}
        setDebugMode={setDebugMode}
        selectedRegion={selectedRegion}
        setSelectedRegion={setSelectedRegion}
      />

      {/* ── Hover / clickable regions ─────────────────────────────────────── */}
      {introDone && LIVING_ROOM_LABELS.map(region => {
        const isDone = completedItems.has(region.id);
        return (
          <div
            key={region.id}
            className={[
              "house-hover-region",
              debugMode ? "house-hover-region--debug" : "",
              debugMode && selectedRegion?.id === region.id ? "house-hover-region--selected" : "",
              !debugMode && activeItem?.id === region.id ? "house-hover-region--active" : "",
              !debugMode && isDone ? "house-hover-region--done" : "",
            ].filter(Boolean).join(" ")}
            style={{
              left: `${region.x}%`,
              top: `${region.y}%`,
              width: `${region.w}%`,
              height: `${region.h}%`,
              cursor: debugMode ? "crosshair" : "pointer",
            }}
            onClick={() => handleItemClick(region)}
          >
            {debugMode && (
              <span className="house-debug-badge">{region.id}</span>
            )}

            {!debugMode && !activeItem && !questItem && (
              <span className={`house-item-dot ${isDone ? "house-item-dot--done" : ""}`} />
            )}

            {!debugMode && !activeItem && !questItem && (
              <div className="house-hover-tooltip">
                <span className="house-hover-tooltip-bisaya">{region.labelBisaya}</span>
                <span className="house-hover-tooltip-english">{region.labelEnglish}</span>
                {isDone && (
                  <span className="house-hover-tooltip-done">✓ Nahuman na!</span>
                )}
              </div>
            )}
          </div>
        );
      })}

      {/* ── NPC sprite ────────────────────────────────────────────────────── */}
      <div className="house-npc-wrap">
        <img
          src={NpcImage}
          alt={npcName}
          className={[
            "house-npc-image",
            (introLine || currentLine) ? "house-npc-image--talking" : "",
          ].filter(Boolean).join(" ")}
          draggable={false}
        />
      </div>

      {/* ── Intro DialogueBox ─────────────────────────────────────────────── */}
      {introLine && (
        <DialogueBox
          title={introLine.speaker}
          text={<BilingualText line={introLine} />}
          isNarration={false}
          isPlayer={false}
          showNextButton={true}
          onNext={handleIntroNext}
        />
      )}

      {/* ── Item description DialogueBox ──────────────────────────────────── */}
      {/* ── Item description DialogueBox ──────────────────────────────────── */}
      {introDone && currentLine && (
        <DialogueBox
          title={currentLine.speaker}
          text={
            <span className="house-bilingual">
              <span className="house-bilingual-bisaya">{currentLine.bisayaText}</span>
              <span className="house-bilingual-english">{currentLine.englishText}</span>
              {isLastDialogueLine && (
                <span className="house-quest-incoming-inline">
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
      {introDone && !activeItem && !questItem && !debugMode && (
        <div className="house-idle-hint">
          <span className="house-idle-hint-bisaya">
            💬 I-click ang bisan unsang butang para makat-on!
          </span>
          <span className="house-idle-hint-english">
            Click on any item to learn more!
          </span>
        </div>
      )}

      {/* ── Item Quest Modal ──────────────────────────────────────────────── */}
      {questItem && (
        <ItemQuestModal
          item={questItem}
          npcName={npcName}
          npcImage={NpcImage}
          onClose={handleQuestClose}
          onComplete={handleQuestComplete}
        />
      )}

    </div>
  );
};

export default HousePage;
