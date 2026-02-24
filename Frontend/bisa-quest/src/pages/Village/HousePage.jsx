import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Button from "../../components/Button";
import DialogueBox from "../../components/instructions/DialogueBox";
import LigayaCharacter from "../../assets/images/characters/vocabulary/Village_Quest_NPC_2.png";
import houseBackground from "../../assets/images/environments/scenario/house.jpg";
import arrowImage from "../../assets/images/signs/arrow.png";
import "./HousePage.css";

// Fallback dialogue used only when API is unavailable
const FALLBACK_STEPS = [
  "Hi....! I was supposed to clean the living room before my mom comes home. Can you help me clean up?",
  "I'm using a broom and dustpan to sweep the floor, a mop to make it shiny, and rags to wipe the cabinet!",
  "Each tool has a name in Cebuano! I will show you pictures and you have to guess what each cleaning tool is called.",
  "Did you understand the task? Are you ready to start?",
];
// Temporarily add right before the return in HousePage
const HousePage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // questId + npcId come from VillagePage when player presses E on Ligaya
  const questId = location.state?.questId || null;
  const npcId   = location.state?.npcId   || "village_npc_2";
  const npcName = location.state?.npcName || "Ligaya";

  const API = import.meta.env.VITE_API_URL || "";

  // ── Dialogue steps fetched from DB ──────────────────────────────────────
  const [steps,   setSteps]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [step,    setStep]    = useState(0);

  // debug helpers
  console.log("HousePage questId", questId, "API", API);
  console.log("RENDER — loading:", loading, "steps:", steps, "step:", step, "current:", steps[step]);

  useEffect(() => {
    if (!questId) {
      // No questId — use fallback so dev can still see the page
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

        // if the returned array is empty, attempt to find another quest with
        // actual dialogues and switch to it rather than leaving the user staring
        // at a blank dialogue box.
        if (Array.isArray(data) && data.length === 0) {
          console.warn(`[HousePage] no dialogues for quest ${questId}`);
          // fetch all quests for this NPC, then probe each one until we find
          // one that has at least one dialogue step.  we deliberately do this
          // AFTER loading so we can still show the fallback text briefly.
          try {
            const listRes = await fetch(`${API}/api/challenge/npc/${npcId}/quest`);
            if (listRes.ok) {
              let { data: quests } = await listRes.json();
              // randomize the order so we don’t always head to the same next quest
              if (Array.isArray(quests) && quests.length > 1) {
                for (let i = quests.length - 1; i > 0; i--) {
                  const j = Math.floor(Math.random() * (i + 1));
                  [quests[i], quests[j]] = [quests[j], quests[i]];
                }
              }
              for (let q of quests) {
                if (q.quest_id === questId) continue;
                const chk = await fetch(`${API}/api/challenge/quest/${q.quest_id}/dialogues`);
                if (!chk.ok) continue;
                const { data: chkData } = await chk.json();
                if (Array.isArray(chkData) && chkData.length > 0) {
                  console.log(`[HousePage] redirecting to quest ${q.quest_id} with content`);
                  navigate('/house', {
                    state: { ...location.state, questId: q.quest_id }
                  });
                  return; // leave early - navigation will reload page
                }
              }
            }
          } catch (err2) {
            console.error('[HousePage] error while searching for alternate quest', err2);
          }
          // we didn't find any other quest; fallback steps will be used below
          setSteps(FALLBACK_STEPS);
        } else {
          // data is ordered by step_order from the DB
          setSteps(data.map(row => row.dialogue_text));
        }
      } catch (err) {
        console.error("[HousePage] Dialogue load error:", err);
        // Silently fall back — player still gets a dialogue
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
        questId,
        npcId,
        npcName,
        returnTo: "/student/village",
      },
    });
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="house-container">
      <img src={houseBackground} alt="House" className="house-background" />

      <Button variant="back" onClick={handleBack}>
        ← Back
      </Button>

      <div className="house-npc-section">
        <img src={LigayaCharacter} alt={npcName} className="house-npc-image" />

        <div className="house-dialogue">
          {loading ? (
            <DialogueBox title={npcName} text="..." showNextButton={false} />
          ) : steps.length === 0 ? (
            // nothing returned from the API
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

          {/* Next arrow — all steps except last */}
          {!loading && !isLastStep && (
            <Button
              variant="arrow"
              className="dialogue-next-btn"
              onClick={handleNext}
            >
              <img src={arrowImage} alt="Next" className="dialogue-arrow-img" />
            </Button>
          )}

          {/* Yes / No — last step only */}
          {!loading && isLastStep && (
            <div className="dialogue-choices">
              <Button variant="primary" onClick={handleYes}>
                ✓ Yes, I'm ready!
              </Button>
              <Button variant="danger" onClick={handleNo}>
                ✗ Not yet
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HousePage;