import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Button from "../../components/Button";
import DialogueBox from "../../components/instructions/DialogueBox";
import HouseDebugTools from "../Village/components/HouseDebugTools";
import BilingualText from "../Village/components/BilingualText";
import CastleCompoundWordModal from "./components/CastleCompoundWordModal";
import CastleVisualDragModal from "./components/CastleVisualDragModal";
import {
  CASTLE_NPC_IMAGES,
  getQuestData,
  getTotalQuests,
  buildCastleDialogue,
} from "./data/castleRoomData";
import { saveNPCProgress, getNPCWords, getPlayerId } from "../../utils/playerStorage";
import { submitChallenge } from "../../services/playerServices";
import "./CastleRoomPage.css";

const CastleRoomPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const npcId = location.state?.npcId || "castle_npc_1";
  const npcName = location.state?.npcName || "Princess Hara";
  const returnTo = location.state?.returnTo || "/student/castle";
  const startIdx = location.state?.questIndex ?? 0;
  const playerId = getPlayerId();

  const NpcImage =
    CASTLE_NPC_IMAGES[npcId] || Object.values(CASTLE_NPC_IMAGES)[0];

  const totalQuests = getTotalQuests(npcId);

  // ── State ─────────────────────────────────────────────────────────────────
  const [questIndex] = useState(startIdx);
  const [debugMode, setDebugMode] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [introStep, setIntroStep] = useState(0);   // null = intro done
  const [activeItem, setActiveItem] = useState(null);
  const [dialogueStep, setDialogueStep] = useState(0);
  const [questItem, setQuestItem] = useState(null);
  const [completedItems, setCompletedItems] = useState(new Set());
  const [showRoomComplete, setShowRoomComplete] = useState(false);

  const pendingQuestRef = useRef(null);

  // ── Load quest data for current questIndex ────────────────────────────────
  const quest = getQuestData(npcId, questIndex);

  // ── Reset room state when moving to a new quest ───────────────────────────
  useEffect(() => {
    setIntroStep(0);
    setActiveItem(null);
    setDialogueStep(0);
    setQuestItem(null);
    setCompletedItems(new Set());
    setShowRoomComplete(false);
    setSelectedRegion(null);
  }, [questIndex, npcId]);

  // ── Open quest modal once activeItem clears ───────────────────────────────
  useEffect(() => {
    if (pendingQuestRef.current && !activeItem) {
      setQuestItem(pendingQuestRef.current);
      pendingQuestRef.current = null;
    }
  }, [activeItem]);

  // ── Load progress on room change ──────────────────────────────────────────
  useEffect(() => {
    const roomSuffixMap = { 0: "gate", 1: "courtyard", 2: "library" };
    const roomSuffix = roomSuffixMap[questIndex] || `room${questIndex}`;
    const saveNpcId = `${npcId}_${roomSuffix}`;

    const savedWords = getNPCWords("castle", saveNpcId);
    if (savedWords.length > 0) {
      const restored = new Set();
      quest.items.forEach(region => {
        const word = `${region.labelBisaya} (${region.labelEnglish})`;
        if (savedWords.includes(word)) {
          restored.add(region.id);
        }
      });
      setCompletedItems(restored);
    } else {
      setCompletedItems(new Set());
    }
  }, [npcId, questIndex, quest]);

  // ── Check if all items are done ───────────────────────────────────────────
  useEffect(() => {
    if (
      quest &&
      completedItems.size > 0 &&
      completedItems.size >= quest.items.length
    ) {
      // Short delay so the last success modal can close gracefully
      const t = setTimeout(() => setShowRoomComplete(true), 600);
      return () => clearTimeout(t);
    }
  }, [completedItems, quest]);

  // ── Derived ───────────────────────────────────────────────────────────────
  const introDone = introStep === null;
  const introDialogue = quest?.introDialogue ?? [];
  const introLine = !introDone ? introDialogue[introStep] : null;

  const currentLine =
    introDone && activeItem
      ? buildCastleDialogue(activeItem, npcName)[dialogueStep]
      : null;

  const isLastDialogueLine = activeItem
    ? dialogueStep === buildCastleDialogue(activeItem, npcName).length - 1
    : false;

  const isLastQuest = questIndex >= totalQuests - 1;

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleBack = () => navigate(returnTo);

  const handleIntroNext = () => {
    if (introStep < introDialogue.length - 1) {
      setIntroStep((s) => s + 1);
    } else {
      setIntroStep(null);
    }
  };

  const handleItemClick = (region) => {
    if (!introDone || activeItem) return;
    if (debugMode) {
      setSelectedRegion(selectedRegion?.id === region.id ? null : region);
      return;
    }
    if (showRoomComplete) return;
    setActiveItem(region);
    setDialogueStep(0);
  };

  const handleDialogueNext = () => {
    if (!activeItem) return;
    const lines = buildCastleDialogue(activeItem, npcName);
    if (dialogueStep < lines.length - 1) {
      setDialogueStep((s) => s + 1);
    } else {
      pendingQuestRef.current = activeItem;
      setActiveItem(null);
      setDialogueStep(0);
    }
  };

  const handleQuestComplete = async (region) => {
    setQuestItem(null);
    const next = new Set([...completedItems, region.id]);
    setCompletedItems(next);

    const word = `${region.labelBisaya} (${region.labelEnglish})`;
    const roomSuffixMap = { 0: "gate", 1: "courtyard", 2: "library" };
    const roomSuffix = roomSuffixMap[questIndex] || `room${questIndex}`;
    const saveNpcId = `${npcId}_${roomSuffix}`;
    const passed = next.size >= quest.items.length;

    await saveNPCProgress("castle", saveNpcId, next.size, passed, quest.items.length, [word]);

    if (playerId && location.state?.questId) {
      try {
        await submitChallenge(playerId, location.state.questId, npcId, next.size, quest.items.length, passed);
      } catch (err) {
        console.error("[CastleRoomPage] submitChallenge failed:", err);
      }
    }
  };

  const handleQuestClose = () => setQuestItem(null);

  const SCENE_ROUTES = ["/castle/gate", "/castle/courtyard", "/castle/library"];

  const handleNextRoom = () => {
    if (isLastQuest) {
      navigate(returnTo, { state: { completed: true } });
    } else {
      const nextIdx = questIndex + 1;
      navigate(SCENE_ROUTES[nextIdx], {
        state: { npcId, npcName, returnTo, questIndex: nextIdx },
      });
    }
  };

  // ── Guard: invalid quest ──────────────────────────────────────────────────
  if (!quest) {
    return (
      <div className="croom-container">
        <div style={{ color: "#fff", padding: 40, fontFamily: "monospace" }}>
          No quest found for NPC "{npcId}" index {questIndex}.
        </div>
        <Button variant="back" className="croom-back" onClick={handleBack}>← Back</Button>
      </div>
    );
  }

  return (
    <div className="croom-container">

      {/* ── Background (changes per quest) ──────────────────────────────── */}
      <img
        src={quest.background}
        alt={quest.sceneName}
        className="croom-background"
        draggable={false}
      />

      {/* ── Back button ─────────────────────────────────────────────────── */}
      <Button variant="back" className="croom-back" onClick={handleBack}>
        ← Back
      </Button>

      {/* ── Scene / quest label ──────────────────────────────────────────── */}
      <div className="croom-scene-label">
        {!introDone
          ? "Story Introduction"
          : `${quest.sceneName} · Room ${questIndex + 1} / ${totalQuests}`}
      </div>

      {/* ── Progress dots (one per quest) ───────────────────────────────── */}
      <div className="croom-quest-dots">
        {Array.from({ length: totalQuests }).map((_, i) => (
          <span
            key={i}
            className={[
              "croom-quest-dot",
              i < questIndex ? "croom-quest-dot--done" : "",
              i === questIndex ? "croom-quest-dot--active" : "",
            ]
              .filter(Boolean)
              .join(" ")}
          />
        ))}
      </div>

      {/* ── Debug tools ─────────────────────────────────────────────────── */}
      <HouseDebugTools
        debugMode={debugMode}
        setDebugMode={setDebugMode}
        selectedRegion={selectedRegion}
        setSelectedRegion={setSelectedRegion}
      />

      {/* ── Hover / clickable regions ────────────────────────────────────── */}
      {introDone &&
        quest.items.map((region) => {
          const isDone = completedItems.has(region.id);
          return (
            <div
              key={region.id}
              className={[
                "croom-hover-region",
                debugMode ? "croom-hover-region--debug" : "",
                debugMode && selectedRegion?.id === region.id
                  ? "croom-hover-region--selected"
                  : "",
                !debugMode && activeItem?.id === region.id
                  ? "croom-hover-region--active"
                  : "",
                !debugMode && isDone ? "croom-hover-region--done" : "",
              ]
                .filter(Boolean)
                .join(" ")}
              style={{
                left: `${region.x}%`,
                top: `${region.y}%`,
                width: `${region.w}%`,
                height: `${region.h}%`,
                cursor: debugMode ? "crosshair" : (!introDone || activeItem || questItem || showRoomComplete ? "default" : "pointer"),
              }}
              onClick={() => handleItemClick(region)}
            >
              {debugMode && (
                <span className="croom-debug-badge">{region.id}</span>
              )}

              {!debugMode && !activeItem && !questItem && !showRoomComplete && (
                <span
                  className={`croom-item-dot ${isDone ? "croom-item-dot--done" : ""}`}
                />
              )}

              {!debugMode && !activeItem && !questItem && !showRoomComplete && (
                <div className="croom-hover-tooltip">
                  <span className="croom-hover-tooltip-bisaya">
                    {region.labelBisaya}
                  </span>
                  <span className="croom-hover-tooltip-english">
                    {region.labelEnglish}
                  </span>
                  {isDone && (
                    <span className="croom-hover-tooltip-done">✓ Nahuman na!</span>
                  )}
                </div>
              )}
            </div>
          );
        })}

      {/* ── NPC sprite ──────────────────────────────────────────────────── */}
      <div className="croom-npc-wrap">
        <img
          src={NpcImage}
          alt={npcName}
          className={[
            "croom-npc-image",
            introLine || currentLine ? "croom-npc-image--talking" : "",
          ]
            .filter(Boolean)
            .join(" ")}
          draggable={false}
        />
      </div>

      {/* ── Intro DialogueBox ────────────────────────────────────────────── */}
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

      {/* ── Item description DialogueBox ─────────────────────────────────── */}
      {introDone && currentLine && (
        <DialogueBox
          title={currentLine.speaker}
          text={
            <span className="croom-bilingual">
              <span className="croom-bilingual-bisaya">
                {currentLine.bisayaText}
              </span>
              <span className="croom-bilingual-english">
                {currentLine.englishText}
              </span>
              {isLastDialogueLine && (
                <span className="croom-quest-incoming-inline">
                  🎮 Mini-game sunod! · Mini-game coming up!
                </span>
              )}
            </span>
          }
          introItem={{ label: activeItem.labelBisaya, imageKey: activeItem.id }}
          isNarration={false}
          isPlayer={false}
          showNextButton={true}
          onNext={handleDialogueNext}
        />
      )}

      {/* ── Idle hint ────────────────────────────────────────────────────── */}
      {introDone &&
        !activeItem &&
        !questItem &&
        !showRoomComplete &&
        !debugMode && (
          <div className="croom-idle-hint">
            <span className="croom-idle-hint-bisaya">
              💬 I-click ang bisan unsang butang para makat-on og Compound Words!
            </span>
            <span className="croom-idle-hint-english">
              Click any item to learn about Compound Words!
            </span>
          </div>
        )}

      {/* ── Quest Modal — visual drag OR word-combine depending on item ────── */}
      {questItem && (
        questItem.mechanic === "visual_drag"
          ? <CastleVisualDragModal
            item={questItem}
            npcName={npcName}
            npcImage={NpcImage}
            onClose={handleQuestClose}
            onComplete={handleQuestComplete}
          />
          : <CastleCompoundWordModal
            item={questItem}
            npcName={npcName}
            npcImage={NpcImage}
            onClose={handleQuestClose}
            onComplete={handleQuestComplete}
          />
      )}

      {/* ── Room Complete overlay ─────────────────────────────────────────── */}
      {showRoomComplete && (
        <div className="croom-complete-overlay">
          <div className="croom-complete-card">
            <div className="croom-complete-emoji">
              {isLastQuest ? "🏆" : "⭐"}
            </div>
            <h2 className="croom-complete-title">
              {isLastQuest ? "Quest Complete!" : `${quest.sceneName} Done!`}
            </h2>
            <p className="croom-complete-sub">
              {isLastQuest
                ? "Nahuman na nimo ang tanan nga lawak! / You finished all the rooms!"
                : `Maayong trabaho! Adto na sa sunod nga lawak! / Great job! On to the next room!`}
            </p>

            {/* Compound words learned summary */}
            <div className="croom-complete-words">
              {quest.items.map((item) => (
                <span key={item.id} className="croom-complete-word-chip">
                  {item.compoundWord.result}
                </span>
              ))}
            </div>

            <Button variant="primary" onClick={handleNextRoom}>
              {isLastQuest ? "🏰 Return to Castle" : `Next Room →`}
            </Button>
          </div>
        </div>
      )}

    </div>
  );
};

export default CastleRoomPage;
