import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useLanguagePreference } from "../../hooks/useLanguagePreference";
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
  const questId = location.state?.questId || 1;

  // Load language preference
  const { language, loading: langLoading } = useLanguagePreference(questId);

  const [villageNPCs, setVillageNPCs] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedNPC, setSelectedNPC] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [environmentProgress, setEnvironmentProgress] = useState(0);
  const [showSummaryButton, setShowSummaryButton] = useState(false);

  // Refresh progress when returning from a completed game
  useEffect(() => {
    if (location.state?.completed) {
      setRefreshKey((prev) => prev + 1);
      // Clear the state
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, navigate, location.pathname]);

  useEffect(() => {
    initializeVillage();
  }, [refreshKey]);

  const initializeVillage = async () => {
    const studentId = localStorage.getItem("studentId");
    if (!studentId) {
      return;
    }
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
        // Error already logged in service
      }

      // Check environment progress
      await checkEnvironmentProgress();
    } catch (err) {
      // Error handled
    }
  };

  // Function to check environment progress
  const checkEnvironmentProgress = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${
          import.meta.env.VITE_API_URL
        }/api/npc/environment-progress?environmentType=village`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const result = await response.json();

      if (result.success) {
        const progress =
          result.data.progress ?? result.data.progress_percentage ?? 0;
        setEnvironmentProgress(progress);

        // Show summary button if progress >= 75%
        if (progress >= 75) {
          setShowSummaryButton(true);
        }
      }
    } catch (error) {
      // Error handled
    }
  };

  // Handle view summary
  const handleViewSummary = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${
          import.meta.env.VITE_API_URL
        }/api/npc/environment-progress?environmentType=village`,
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
            questId: questId,
          },
        });
      }
    } catch (error) {
      // Error handled
    }
  };

  const checkAndShowSummary = async () => {
    try {
      const token = localStorage.getItem("token");

      // Check environment progress
      const progressResponse = await fetch(
        `${
          import.meta.env.VITE_API_URL
        }/api/npc/environment-progress?environmentType=village`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const result = await progressResponse.json();

      if (result.success) {
        const progress =
          result.data.progress ?? result.data.progress_percentage ?? 0;

        // If 100% complete, automatically navigate to completion page
        if (progress >= 100) {
          navigate("/student/viewCompletion", {
            state: {
              showSummary: true,
              environmentProgress: progress,
              summaryData: result.data,
              returnTo: "/student/village",
              questId: questId,
            },
          });
        }
      }
    } catch (error) {
      // Error handled
    }
  };

  // Update the useEffect that handles completed state
  useEffect(() => {
    if (location.state?.completed) {
      setRefreshKey((prev) => prev + 1);

      // Check if module is complete
      checkAndShowSummary();

      // Clear the state
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, navigate, location.pathname]);

  const handleNPCClick = (npc) => {
    setSelectedNPC(npc);
    setShowModal(true);
  };

  const handleStartQuest = async () => {
    if (!selectedNPC) return;

    const studentId = localStorage.getItem("studentId");
    if (!studentId) return;

    try {
      await environmentApi.logNPCInteraction({
        studentId,
        npcName: selectedNPC.name,
      });
      await environmentApi.startNPCInteraction({
        npcId: selectedNPC.npcId,
        challengeType: selectedNPC.quest,
      });
    } catch (err) {
      // Error handled
    }

    // Navigate based on quest type
    if (selectedNPC.quest === "word_matching") {
      navigate("/student/wordMatching", {
        state: {
          npcId: selectedNPC.npcId,
          npcName: selectedNPC.name,
          questId: questId,
          returnTo: "/student/village",
        },
      });
    } else if (selectedNPC.quest === "sentence_completion") {
      navigate("/student/sentenceCompletion", {
        state: {
          npcId: selectedNPC.npcId,
          npcName: selectedNPC.name,
          questId: questId,
          returnTo: "/student/village",
        },
      });
    } else if (selectedNPC.quest === "word_association") {
      navigate("/student/pictureAssociation", {
        state: {
          npcId: selectedNPC.npcId,
          npcName: selectedNPC.name,
          questId: questId,
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

  if (langLoading) {
    return (
      <div className="village-page-wrapper">
        <ParticleEffects enableMouseTrail={false} />
        <div className="loading-message">Loading...</div>
      </div>
    );
  }

  return (
    <div className="village-page-wrapper">
      <ParticleEffects enableMouseTrail={false} />
      <Button
        variant="back"
        className="back-button-village-overlay"
        onClick={handleBackClick}
      >
        ← {language === "ceb" ? "Balik" : "Back"}
      </Button>

      {/* View Summary Button */}
      {showSummaryButton && (
        <Button
          variant="primary"
          className="view-summary-button"
          onClick={handleViewSummary}
        >
          📊 {language === "ceb" ? "Tan-awa ang Summary" : "View Summary"}
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
              <h2 className="quest-modal-title">
                {language === "ceb" ? "Mobiya sa Baryo?" : "Exit Village?"}
              </h2>
              <div className="quest-modal-divider"></div>
              <p className="quest-modal-instructions">
                {language === "ceb"
                  ? "Ang imong progreso natipigan."
                  : "Your progress is saved."}
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
                  onClick={handleCancelExit}
                  variant="secondary"
                  className="quest-modal-button"
                >
                  {language === "ceb" ? "Magpabilin" : "Stay"}
                </Button>
                <Button
                  onClick={handleConfirmExit}
                  variant="primary"
                  className="quest-modal-button"
                >
                  {language === "ceb" ? "Mobiya" : "Leave"}
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
