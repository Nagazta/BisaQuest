import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Button from "../../components/Button";
import DialogueBox from "../../components/instructions/DialogueBox";
import AssetManifest from "../../services/AssetManifest";
import HouseDebugTools from "./components/HouseDebugTools";
import BilingualText from "./components/BilingualText";
import ItemQuestModal from "../../game/components/ItemQuestModal";
import { NPC_IMAGES, KITCHEN_LABELS, INTRO_DIALOGUE, buildDialogue } from "./data/kitchenData";
import BookCollectModal from "../../game/components/BookCollectModal";
import VillageTransitionModal from "../../game/components/VillageTransitionModal";
import VillageSummaryModal from "../../game/components/VillageSummaryModal";
import { awardLibroPage, getLibroPageCount } from "../../utils/playerStorage";
import "./HousePage.css"; // Reuse house CSS for now as the layout is identical

const KitchenPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const npcId = location.state?.npcId || "village_npc_2";
  const npcName = location.state?.npcName || "Ligaya";
  const returnTo = location.state?.returnTo || "/student/village";

  const NpcImage = NPC_IMAGES[npcId] || AssetManifest.village.npcs.ligaya;

  const [debugMode, setDebugMode] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [introStep, setIntroStep] = useState(0);
  const [activeItem, setActiveItem] = useState(null);
  const [dialogueStep, setDialogueStep] = useState(0);
  const [questItem, setQuestItem] = useState(null);
  const [completedItems, setCompletedItems] = useState(new Set());
  const [showDoorChoice, setShowDoorChoice] = useState(false);
  const [showPageModal, setShowPageModal] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [collectedPage, setCollectedPage] = useState(null);

  const pendingQuestRef = useRef(null);

  useEffect(() => {
    if (pendingQuestRef.current && !activeItem) {
      setQuestItem(pendingQuestRef.current);
      pendingQuestRef.current = null;
    }
  }, [activeItem]);

  const introDone = introStep === null;
  const introLine = !introDone ? INTRO_DIALOGUE[introStep] : null;
  const currentLine = introDone && activeItem
    ? buildDialogue(activeItem)[dialogueStep]
    : null;
  const isLastDialogueLine = activeItem
    ? dialogueStep === buildDialogue(activeItem).length - 1
    : false;

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
      if (activeItem.id === "door_back_kitchen") {
        setShowDoorChoice(true);
      } else {
        pendingQuestRef.current = activeItem;
      }
      setActiveItem(null);
      setDialogueStep(0);
    }
  };

  const handleQuestComplete = (region) => {
    setQuestItem(null);
    setCompletedItems(prev => {
      const next = new Set([...prev, region.id]);
      if (next.size >= 3) {
        const isNew = awardLibroPage('village', 'village_kitchen');
        if (isNew) {
          setCollectedPage({
            npcName: npcName,
            pageNumber: getLibroPageCount(),
          });
          setShowPageModal(true);
        }
      }
      return next;
    });
  };

  const handleQuestClose = () => {
    setQuestItem(null);
  };

  return (
    <div className="house-container">

      <img
        src={AssetManifest.village.scenarios.kitchen}
        alt="Kitchen"
        className="house-background"
        draggable={false}
      />

      <Button variant="back" className="house-back" onClick={handleBack}>
        ← Back
      </Button>

      <div className="house-scene-label">
        {!introDone ? "Story Introduction" : "Explore the Kitchen"}
      </div>

      <HouseDebugTools
        debugMode={debugMode}
        setDebugMode={setDebugMode}
        selectedRegion={selectedRegion}
        setSelectedRegion={setSelectedRegion}
      />

      {introDone && KITCHEN_LABELS.map(region => {
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

      {introDone && currentLine && (
        <DialogueBox
          title={currentLine.speaker}
          text={
            <span className="house-bilingual" style={{ display: 'flex', alignItems: 'center', gap: '40px' }}>
              <span style={{ flex: 'none' }}>
                <span className="house-bilingual-bisaya">{currentLine.bisayaText}</span>
                <span className="house-bilingual-english">{currentLine.englishText}</span>
              </span>
              {isLastDialogueLine && activeItem?.id !== "door_back_kitchen"}
            </span>
          }
          introItem={
            dialogueStep === 0
              ? {
                label: activeItem.labelBisaya,
                imageKey: activeItem.imageKey || activeItem.id,
              }
              : null
          }
          isNarration={false}
          isPlayer={false}
          showNextButton={true}
          onNext={handleDialogueNext}
        />
      )}

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

      {questItem && (
        <ItemQuestModal
          item={questItem}
          npcName={npcName}
          npcImage={NpcImage}
          onClose={handleQuestClose}
          onComplete={handleQuestComplete}
        />
      )}

      {/* ── Book Collect Modal ────────────────────────────────────────────── */}
      <BookCollectModal
        isOpen={showPageModal}
        npcName={collectedPage?.npcName}
        pageNumber={collectedPage?.pageNumber}
        totalPages={getLibroPageCount()}
        environment="kusina"
        onClose={() => {
          setShowPageModal(false);
          setShowDoorChoice(true);
        }}
      />

      {/* ── Door Choice & Summary Modals ────────────────────────────────── */}
      <VillageTransitionModal
        isOpen={showDoorChoice}
        currentRoom="kitchen"
        onClose={() => setShowDoorChoice(false)}
        onProceedToForest={() => {
            setShowDoorChoice(false);
            setShowSummary(true);
        }}
      />
      
      <VillageSummaryModal
        isOpen={showSummary}
        onClose={() => setShowSummary(false)}
      />

    </div>
  );
};

export default KitchenPage;
