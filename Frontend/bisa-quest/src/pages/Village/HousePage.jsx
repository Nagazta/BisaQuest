import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Button from "../../components/Button";
import DialogueBox from "../../components/instructions/DialogueBox";
import LigayaCharacter from "../../assets/images/characters/vocabulary/Village_Quest_NPC_2.png";
import houseBackground from "../../assets/images/environments/scenario/house.jpg";
import arrowImage from "../../assets/images/signs/arrow.png";
import "./HousePage.css";

const FALLBACK_STEPS = [
  "Hi....! I was supposed to clean the living room before my mom comes home. Can you help me clean up?",
  "I'm using a broom and dustpan to sweep the floor, a mop to make it shiny, and rags to wipe the cabinet!",
  "Each tool has a name in Cebuano! I will show you pictures and you have to guess what each cleaning tool is called.",
  "Did you understand the task? Are you ready to start?",
];

const HousePage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // VillagePage must pass questId (living room drag_drop) AND kitchenQuestId + iaQuestId
  const questId        = location.state?.questId        || null;
  const kitchenQuestId = location.state?.kitchenQuestId || null;
  const iaQuestId      = location.state?.iaQuestId      || null;
  const npcId          = location.state?.npcId          || "village_npc_2";
  const npcName        = location.state?.npcName        || "Ligaya";

  const API = import.meta.env.VITE_API_URL || "";

  const [steps,   setSteps]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [step,    setStep]    = useState(0);

  useEffect(() => {
    if (!questId) {
      console.warn("[HousePage] No questId — using fallback dialogue.");
      setSteps(FALLBACK_STEPS);
      setLoading(false);
      return;
    }

    const loadDialogues = async () => {
      try {
        const res = await fetch(`${API}/api/challenge/quest/${questId}/dialogues`);
        if (!res.ok) throw new Error(`Dialogue fetch failed: ${res.status}`);
        const { data } = await res.json();

        if (Array.isArray(data) && data.length === 0) {
          console.warn(`[HousePage] no dialogues for quest ${questId}`);
          setSteps(FALLBACK_STEPS);
        } else {
          setSteps(data.map(row => row.dialogue_text));
        }
      } catch (err) {
        console.error("[HousePage] Dialogue load error:", err);
        setSteps(FALLBACK_STEPS);
      } finally {
        setLoading(false);
      }
    };

    loadDialogues();
  }, [questId, API]);

  const isLastStep = steps.length > 0 && step === steps.length - 1;

  const handleBack = () => navigate("/student/village", { state: { questId } });
  const handleNext = () => { if (!isLastStep) setStep(s => s + 1); };
  const handleNo   = () => setStep(0);

  const handleYes = () => {
    navigate("/student/dragAndDrop", {
      state: {
        questId,           // living room drag_drop quest
        kitchenQuestId,    // kitchen drag_drop quest
        iaQuestId,         // final item_association quest
        npcId,
        npcName,
        returnTo:  "/student/village",
        sceneType: "living_room",  // always start at living room
      },
    });
  };

  return (
    <div className="house-container">
      <img src={houseBackground} alt="House" className="house-background" />

      <Button variant="back" onClick={handleBack}>← Back</Button>

      <div className="house-npc-section">
        <img src={LigayaCharacter} alt={npcName} className="house-npc-image" />

        <div className="house-dialogue">
          {loading ? (
            <DialogueBox title={npcName} text="..." showNextButton={false} />
          ) : steps.length === 0 ? (
            <DialogueBox
              title={npcName}
              text="(No dialogue available – check questId or database)"
              showNextButton={false}
            />
          ) : (
            <DialogueBox
              title={npcName}
              text={steps[step] || ""}
              showNextButton={false}
            />
          )}

          {!loading && !isLastStep && (
            <Button variant="arrow" className="dialogue-next-btn" onClick={handleNext}>
              <img src={arrowImage} alt="Next" className="dialogue-arrow-img" />
            </Button>
          )}

          {!loading && isLastStep && (
            <div className="dialogue-choices">
              <Button variant="primary" onClick={handleYes}>✓ Yes, I'm ready!</Button>
              <Button variant="danger"  onClick={handleNo}>✗ Not yet</Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HousePage;