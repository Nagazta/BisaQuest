import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import EnvironmentPage from "../../components/EnvironmentPage";
import Button from "../../components/Button";
import ParticleEffects from "../../components/ParticleEffects";
import { environmentApi } from "../../services/environmentServices.js";
// Images
import VillageBackground from "../../assets/images/environments/village.png";
import NandoCharacter from "../../assets/images/characters/vocabulary/Village_Quest_NPC_1.png";
import LigayaCharacter from "../../assets/images/characters/vocabulary/Village_Quest_NPC_2.png";
import VicenteCharacter from "../../assets/images/characters/vocabulary/Village_Quest_NPC_3.png";
import PlayerCharacter from "../../assets/images/characters/Boy.png";

import QuestStartModal from "../../components/QuestStartModal";
import "./styles/VillagePage.css";

const VillagePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [villageNPCs, setVillageNPCs] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedNPC, setSelectedNPC] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [environmentProgress, setEnvironmentProgress] = useState(0); // NEW
  const [showSummaryButton, setShowSummaryButton] = useState(false); // NEW

  // Refresh progress when returning from a completed game
  useEffect(() => {
    if (location.state?.completed) {
      console.log("Challenge completed, refreshing village progress...");
      setRefreshKey((prev) => prev + 1);
      // Clear the state
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, navigate, location.pathname]);

  useEffect(() => {
    initializeVillage();
  }, [refreshKey]); // Re-run when refreshKey changes

  const initializeVillage = async () => {
    const studentId = localStorage.getItem("studentId");
    if (!studentId) {
      console.error("No student ID found in localStorage");
      return;
    }
    console.log("Found studentId in localStorage:", studentId);

    // Frontend-defined NPCs with showName property and quest types
    const npcs = [
      {
        npcId: "nando",
        name: "Nando",
        x: 50,
        y: 35,
        character: NandoCharacter,
        showName: true,
        quest: "word_matching",
      },
      {
        npcId: "ligaya",
        name: "Ligaya",
        x: 70,
        y: 45,
        character: LigayaCharacter,
        showName: true,
        quest: "word_association",
      },
      {
        npcId: "vicente",
        name: "Vicente",
        x: 20,
        y: 60,
        character: VicenteCharacter,
        showName: true,
        quest: "sentence_completion",
      },
    ];
    setVillageNPCs(npcs);

    // Initialize environment in backend
    try {
      const response = await environmentApi.initializeEnvironment(
        "village",
        studentId
      );
      if (!response.success) {
        console.error("Backend environment init failed:", response.error);
      }

      // NEW: Check environment progress
      await checkEnvironmentProgress();
    } catch (err) {
      console.error("Error initializing environment:", err);
    } finally {
      /* empty */
    }
  };

  // NEW: Function to check environment progress
  const checkEnvironmentProgress = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/npc/environment-progress?environmentType=village`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      const result = await response.json();
      
      if (result.success) {
        const progress = result.data.progress ?? result.data.progress_percentage ?? 0;
        setEnvironmentProgress(progress);
        
        // Show summary button if progress >= 75%
        if (progress >= 75) {
          setShowSummaryButton(true);
        }
      }
    } catch (error) {
      console.error("Error checking environment progress:", error);
    }
  };

  // NEW: Handle view summary
  const handleViewSummary = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/npc/environment-progress?environmentType=village`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      const result = await response.json();
      
      if (result.success) {
        navigate("/student/summary", {
          state: {
            showSummary: true,
            environmentProgress: result.data.progress,
            summaryData: result.data,
            returnTo: "/student/village",
          }
        });
      }
    } catch (error) {
      console.error("Error fetching summary data:", error);
    }
  };

  const handleNPCClick = (npc) => {
    setSelectedNPC(npc);
    setShowModal(true);
  };

  const handleStartQuest = async () => {
    if (!selectedNPC) return;

    const studentId = localStorage.getItem("studentId");
    if (!studentId) return console.error("No student ID found");

    try {
      await environmentApi.logNPCInteraction({
        studentId,
        npcName: selectedNPC.name,
      });
      await environmentApi.startNPCInteraction({
        npcId: selectedNPC.npcId,
        challengeType: selectedNPC.quest,
      });

      console.log("NPC interaction logged for:", selectedNPC.name);
    } catch (err) {
      console.error("Error logging NPC interaction:", err);
    }

    // Navigate based on quest type
    if (selectedNPC.quest === "word_matching") {
      navigate("/student/wordMatching", {
        state: {
          npcId: selectedNPC.npcId,
          npcName: selectedNPC.name,
          returnTo: "/student/village",
        },
      });
    } else if (selectedNPC.quest === "sentence_completion") {
      navigate("/student/sentenceCompletion", {
        state: {
          npcId: selectedNPC.npcId,
          npcName: selectedNPC.name,
          returnTo: "/student/village",
        },
      });
    } else if (selectedNPC.quest === "word_association") {
      navigate("/student/pictureAssociation", {
        state: {
          npcId: selectedNPC.npcId,
          npcName: selectedNPC.name,
          returnTo: "/student/village",
        },
      });
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedNPC(null);
  };

  const handleBackClick = () => setShowExitConfirm(true);

  const handleConfirmExit = () => {
    setShowExitConfirm(false);
    navigate("/dashboard");
  };

  const handleCancelExit = () => setShowExitConfirm(false);

  return (
    <div className="village-page-wrapper">
      <ParticleEffects enableMouseTrail={false} />
      <Button
        variant="back"
        className="back-button-village-overlay"
        onClick={handleBackClick}
      >
        ← Back
      </Button>

      {/* NEW: View Summary Button */}
      {showSummaryButton && (
        <Button
          variant="primary"
          className="view-summary-button"
          onClick={handleViewSummary}
        >
          📊 View Summary
        </Button>
      )}

      <EnvironmentPage
        key={refreshKey}
        environmentType="village"
        backgroundImage={VillageBackground}
        npcs={villageNPCs}
        onNPCClick={handleNPCClick}
        playerCharacter={PlayerCharacter}
      />

      <div className="decorative-clouds">
        <div className="cloud cloud-1"></div>
        <div className="cloud cloud-2"></div>
        <div className="cloud cloud-3"></div>
      </div>

      {showModal && selectedNPC && (
        <QuestStartModal
          npcName={selectedNPC.name}
          npcImage={selectedNPC.character}
          questType={selectedNPC.quest}
          onStart={handleStartQuest}
          onClose={handleCloseModal}
        />
      )}

      {showExitConfirm && (
        <div className="quest-modal-overlay" onClick={handleCancelExit}>
          <div
            className="quest-modal-scroll"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="scroll-content">
              <h2 className="quest-modal-title">Exit Village?</h2>
              <div className="quest-modal-divider"></div>
              <p className="quest-modal-instructions">
                Your progress is saved.
              </p>
              <div
                style={{
                  display: "flex",
                  gap: "15px",
                  justifyContent: "center",
                  marginTop: "20px",
                }}
              >
                <Button
                  onClick={handleConfirmExit}
                  variant="primary"
                  className="quest-modal-button"
                >
                  Leave
                </Button>
                <Button
                  onClick={handleCancelExit}
                  variant="secondary"
                  className="quest-modal-button"
                >
                  Stay
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VillagePage;