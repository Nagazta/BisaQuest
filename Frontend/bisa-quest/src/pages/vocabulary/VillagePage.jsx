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
    } catch (err) {
      console.error("Error initializing environment:", err);
    } finally {
      /* empty */
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

  const handleBackClick = () => navigate("/dashboard");

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
    </div>
  );
};

export default VillagePage;
