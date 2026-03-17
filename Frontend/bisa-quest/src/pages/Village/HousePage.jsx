// ─────────────────────────────────────────────────────────────────────────────
//  HousePage.jsx  —  Living room with hover labels + bilingual NPC dialogue
// ─────────────────────────────────────────────────────────────────────────────
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Button from "../../components/Button";
import DialogueBox from "../../components/instructions/DialogueBox";
import AssetManifest from "../../services/AssetManifest";
import HouseDebugTools from "./components/HouseDebugTools";
import BilingualText from "./components/BilingualText";
import { NPC_IMAGES, LIVING_ROOM_LABELS, INTRO_DIALOGUE, buildDialogue } from "./data/houseData";
import "./HousePage.css";

const HousePage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [debugMode, setDebugMode] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [activeItem, setActiveItem] = useState(null);
  const [dialogueStep, setDialogueStep] = useState(0);
  const [introStep, setIntroStep] = useState(0); // null = intro done

  const npcId = location.state?.npcId || "village_npc_2";
  const npcName = location.state?.npcName || "Ligaya";
  const returnTo = location.state?.returnTo || "/student/village";

  const NpcImage = NPC_IMAGES[npcId] || AssetManifest.village.npcs.ligaya;
  const handleBack = () => navigate(returnTo);

  const introDone = introStep === null;

  // ── Intro next ────────────────────────────────────────────────────────────
  const handleIntroNext = () => {
    if (introStep < INTRO_DIALOGUE.length - 1) {
      setIntroStep(s => s + 1);
    } else {
      setIntroStep(null);
    }
  };

  // ── Item click ────────────────────────────────────────────────────────────
  const handleItemClick = (region) => {
    if (!introDone) return;
    if (debugMode) {
      setSelectedRegion(selectedRegion?.id === region.id ? null : region);
      return;
    }
    setActiveItem(region);
    setDialogueStep(0);
  };

  // ── Item dialogue next ────────────────────────────────────────────────────
  const handleDialogueNext = () => {
    const lines = buildDialogue(activeItem);
    if (dialogueStep < lines.length - 1) {
      setDialogueStep(s => s + 1);
    } else {
      setActiveItem(null);
      setDialogueStep(0);
    }
  };

  // ── Resolved current dialogue line ───────────────────────────────────────
  const introLine = !introDone ? INTRO_DIALOGUE[introStep] : null;
  const currentLine = introDone && activeItem
    ? buildDialogue(activeItem)[dialogueStep]
    : null;

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
      {introDone && LIVING_ROOM_LABELS.map(region => (
        <div
          key={region.id}
          className={[
            "house-hover-region",
            debugMode ? "house-hover-region--debug" : "",
            debugMode && selectedRegion?.id === region.id ? "house-hover-region--selected" : "",
            !debugMode && activeItem?.id === region.id ? "house-hover-region--active" : "",
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

          {!debugMode && !activeItem && (
            <span className="house-item-dot" />
          )}

          {!debugMode && !activeItem && (
            <div className="house-hover-tooltip">
              <span className="house-hover-tooltip-bisaya">{region.labelBisaya}</span>
              <span className="house-hover-tooltip-english">{region.labelEnglish}</span>

            </div>
          )}
        </div>
      ))}

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

      {/* ── Item DialogueBox ──────────────────────────────────────────────── */}
      {introDone && currentLine && (
        <DialogueBox
          title={currentLine.speaker}
          text={<BilingualText line={currentLine} />}
          isNarration={false}
          isPlayer={false}
          showNextButton={true}
          onNext={handleDialogueNext}
        />
      )}

      {/* ── Idle hint ─────────────────────────────────────────────────────── */}
      {introDone && !activeItem && !debugMode && (
        <div className="house-idle-hint">
          <span className="house-idle-hint-bisaya">
            💬 I-click ang bisan unsang butang para makat-on!
          </span>
          <span className="house-idle-hint-english">
            Click on any item to learn more!
          </span>
        </div>
      )}

    </div>
  );
};

export default HousePage;