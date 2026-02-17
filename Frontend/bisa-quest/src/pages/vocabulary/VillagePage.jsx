import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useLanguagePreference } from "../../hooks/useLanguagePreference";
import { useCharacterPreference } from "../../hooks/useCharacterPreference";
import EnvironmentPage from "../../components/EnvironmentPage";
import Button from "../../components/Button";
import ParticleEffects from "../../components/ParticleEffects";
import { environmentApi } from "../../services/environmentServices.js";
// Images
import VillageBackground from "../../assets/images/environments/Vocabulary/village-bg.png";
import NandoCharacter from "../../assets/images/characters/vocabulary/Village_Quest_NPC_1.png";
import LigayaCharacter from "../../assets/images/characters/vocabulary/Village_Quest_NPC_2.png";
import VicenteCharacter from "../../assets/images/characters/vocabulary/Village_Quest_NPC_3.png";
import BoyCharacter from "../../assets/images/characters/Boy.png";
import GirlCharacter from "../../assets/images/characters/Girl.png";
// Music
import bgMusic from "../../assets/music/bg-music.mp3";

import QuestStartModal from "../../components/QuestStartModal";
import "./VillagePage.css";

const VillagePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const questId = location.state?.questId || 1;
  const audioRef = useRef(null);

  // ✅ Always use bisaquest_student_id
  const studentId = localStorage.getItem("bisaquest_student_id");

  const { language, loading: langLoading } = useLanguagePreference(questId);
  const { character, loading: charLoading } = useCharacterPreference(questId);

  const [villageNPCs, setVillageNPCs] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedNPC, setSelectedNPC] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [environmentProgress, setEnvironmentProgress] = useState(0);
  const [showSummaryButton, setShowSummaryButton] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  const PlayerCharacter = character === "female" ? GirlCharacter : BoyCharacter;

  // Background music
  useEffect(() => {
    const playMusic = () => {
      if (audioRef.current) {
        audioRef.current.volume = 0.3;
        audioRef.current.play().catch(() => {
          console.log("Waiting for user interaction to play music");
        });
      }
    };

    playMusic();

    const handleInteraction = () => {
      playMusic();
      document.removeEventListener("click", handleInteraction);
      document.removeEventListener("keydown", handleInteraction);
      document.removeEventListener("touchstart", handleInteraction);
    };

    document.addEventListener("click", handleInteraction);
    document.addEventListener("keydown", handleInteraction);
    document.addEventListener("touchstart", handleInteraction);

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      document.removeEventListener("click", handleInteraction);
      document.removeEventListener("keydown", handleInteraction);
      document.removeEventListener("touchstart", handleInteraction);
    };
  }, []);

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  useEffect(() => {
    if (location.state?.completed) {
      setRefreshKey((prev) => prev + 1);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, navigate, location.pathname]);

  useEffect(() => {
    initializeVillage();
  }, [refreshKey]);

  const initializeVillage = async () => {
    if (!studentId) {
      console.warn("No bisaquest_student_id found in localStorage");
      return;
    }

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

    try {
      // ✅ studentId passed directly, no token needed
      await environmentApi.initializeEnvironment("village", studentId);
      await checkEnvironmentProgress();
    } catch (err) {
      console.error("Error initializing village:", err);
    }
  };

  const checkEnvironmentProgress = async () => {
    if (!studentId) return;

    try {
      // ✅ Pass studentId as query param instead of Bearer token
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/npc/environment-progress?environmentType=village&studentId=${studentId}`
      );

      const result = await response.json();

      if (result.success) {
        const progress = result.data.progress ?? result.data.progress_percentage ?? 0;
        setEnvironmentProgress(progress);

        if (progress >= 75) {
          setShowSummaryButton(true);
        }
      }
    } catch (error) {
      console.error("Error checking environment progress:", error);
    }
  };

  const handleViewSummary = async () => {
    if (!studentId) return;

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/npc/environment-progress?environmentType=village&studentId=${studentId}`
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
      console.error("Error fetching summary:", error);
    }
  };

  const checkAndShowSummary = async () => {
    if (!studentId) return;

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/npc/environment-progress?environmentType=village&studentId=${studentId}`
      );

      const result = await response.json();

      if (result.success) {
        const progress = result.data.progress ?? result.data.progress_percentage ?? 0;

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
      console.error("Error checking summary:", error);
    }
  };

  useEffect(() => {
    if (location.state?.completed) {
      setRefreshKey((prev) => prev + 1);
      checkAndShowSummary();
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, navigate, location.pathname]);

  const handleNPCClick = (npc) => {
    setSelectedNPC(npc);
    setShowModal(true);
  };

  const handleStartQuest = async () => {
    if (!selectedNPC || !studentId) return;

    try {
      // ✅ studentId passed in body, no token needed
      await environmentApi.logNPCInteraction({
        studentId,
        npcName: selectedNPC.name,
      });
      await environmentApi.startNPCInteraction({
        npcId: selectedNPC.npcId,
        challengeType: selectedNPC.quest,
        studentId,
      });
    } catch (err) {
      console.error("Error starting quest:", err);
    }

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

  if (langLoading || charLoading) {
    return (
      <div className="village-page-wrapper">
        <ParticleEffects enableMouseTrail={false} />
        <div className="loading-message">Loading...</div>
      </div>
    );
  }

  return (
    <div className="village-page-wrapper">
      <audio ref={audioRef} loop>
        <source src={bgMusic} type="audio/mpeg" />
      </audio>

      <ParticleEffects enableMouseTrail={false} />

      <button
        className="music-toggle-button"
        onClick={toggleMute}
        aria-label={isMuted ? "Unmute" : "Mute"}
      >
        {isMuted ? "🔇" : "🔊"}
      </button>

      <Button
        variant="back"
        className="back-button-village-overlay"
        onClick={handleBackClick}
      >
        ← {language === "ceb" ? "Balik" : "Back"}
      </Button>

      {showSummaryButton && (
        <Button
          variant="primary"
          className="view-summary-button"
          onClick={handleViewSummary}
        >
          {language === "ceb" ? "Tan-awa ang Summary" : "View Summary"}
        </Button>
      )}

      <EnvironmentPage
        key={refreshKey}
        environmentType="village"
        backgroundImage={VillageBackground}
        npcs={villageNPCs}
        onNPCClick={handleNPCClick}
        playerCharacter={PlayerCharacter}
        debugMode={true}
        studentId={studentId}
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
                {language === "ceb" ? "Mubiya sa Baryo?" : "Exit Village?"}
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
                  {language === "ceb" ? "Mubiya" : "Leave"}
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