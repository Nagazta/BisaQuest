import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import SidebarNavigation from "../../components/SidebarNavigation";
import QuestCard from "../../components/QuestCard";
import Village from "../../assets/images/cardsImage/village.png";
import Forest from "../../assets/images/cardsImage/forest.png";
import Kingdom from "../../assets/images/cardsImage/kingdom.png";
import Throne from "../../assets/images/cardsImage/throne.png";
import "./styles/StudentDashboard.css";
import QuestStartModal from "../../components/QuestStartModal";
import SaveProgressModal from "../../components/progress/SaveProgressModal";
import Notification from "../../components/Notification";
import ParticleEffects from "../../components/ParticleEffects";

const StudentDashboard = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleBeforeUnload = () => {
      sessionStorage.setItem("isRefreshing", "true");
    };

    const handleUnload = () => {
      if (sessionStorage.getItem("isRefreshing") !== "true") {
        localStorage.removeItem("user");
        localStorage.removeItem("session");
      }
    };
    sessionStorage.removeItem("isRefreshing");

    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("unload", handleUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("unload", handleUnload);
    };
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const quests = [
    {
      id: 1,
      title: "Vocabulary Quest",
      subtitle: "Village Theme",
      description: "Explore the village and learn new words",
      progress: 45,
      image: Village,
    },
    {
      id: 2,
      title: "Synonyms & Antonyms Quest",
      subtitle: "Forest Theme",
      description: "Journey through the magical forest",
      progress: 30,
      image: Forest,
    },
    {
      id: 3,
      title: "Compound Quest",
      subtitle: "Castle Theme",
      description: "Master word Building in the Castle",
      progress: 60,
      image: Kingdom,
    },
    {
      id: 4,
      title: "Narrative Problem Solving Quest",
      subtitle: "Kingdom Theme",
      description: "Apply your skills in the Kingdom",
      progress: 15,
      image: Throne,
    },
  ];

  const [showQuestModal, setShowQuestModal] = React.useState(false);
  const [showSaveModal, setShowSaveModal] = React.useState(false);
  const [savedProgress, setSavedProgress] = React.useState(null);
  const [selectedQuest, setSelectedQuest] = React.useState(null);
  const [notification, setNotification] = React.useState(null);
  const handleStartQuest = async (questId) => {
    // Close notification if open
    setNotification(null);

    if (questId !== 1) {
      setNotification({
        type: "error",
        title: "Quest Locked",
        message: "This quest is locked! Complete the previous quest first.",
      });
      return;
    }

    const quest = quests.find((q) => q.id === questId);
    setSelectedQuest(quest);

    // Check for saved progress before showing quest modal
    await checkForSavedProgress();
  };

  const checkForSavedProgress = async () => {
    try {
      const sessionData = JSON.parse(localStorage.getItem("session"));
      if (!sessionData?.user?.id) return;

      const studentResponse = await fetch(
        `${import.meta.env.VITE_API_URL}/api/student/by-user/${
          sessionData.user.id
        }`
      );

      if (!studentResponse.ok) return;

      const studentData = await studentResponse.json();
      const user_id = studentData.data.user_id;

      const progressResponse = await fetch(
        `${import.meta.env.VITE_API_URL}/api/progress/${user_id}/1`
      );

      if (!progressResponse.ok) {
        // No saved progress, show quest start modal
        setShowQuestModal(true);
        return;
      }

      const progressData = await progressResponse.json();

      if (progressData.hasProgress && progressData.data) {
        // Has saved progress, show save progress modal
        setSavedProgress(progressData.data);
        setShowSaveModal(true);
      } else {
        // No saved progress, show quest start modal
        setShowQuestModal(true);
      }
    } catch (err) {
      console.error("Error checking progress:", err);
      // On error, just show quest start modal
      setShowQuestModal(true);
    }
  };

  const handleContinue = () => {
    setShowSaveModal(false);
    navigate("/student/village");
  };

  const handleNewGame = async () => {
    try {
      const sessionData = JSON.parse(localStorage.getItem("session"));
      const studentResponse = await fetch(
        `${import.meta.env.VITE_API_URL}/api/student/by-user/${
          sessionData.user.id
        }`
      );
      const studentData = await studentResponse.json();
      const user_id = studentData.data.user_id;

      // Delete all student_progress records
      const deleteProgressResponse = await fetch(
        `${import.meta.env.VITE_API_URL}/api/progress/reset-all`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            student_id: user_id,
          }),
        }
      );

      if (!deleteProgressResponse.ok) {
        throw new Error("Failed to reset progress");
      }

      console.log("Progress reset successfully");
      setSavedProgress(null);
      setShowSaveModal(false);
      setShowQuestModal(true);
    } catch (err) {
      console.error("Error resetting progress:", err);
      setShowSaveModal(false);
      setShowQuestModal(true);
    }
  };

  const handleConfirmQuest = () => {
    setShowQuestModal(false);
    navigate("/student/characterSelection");
  };

  return (
    <div className="dashboard-container">
      <ParticleEffects enableMouseTrail={false} />

      <SidebarNavigation onLogout={handleLogout} />

      <div className="main-content">
        <div className="quests-grid">
          {quests.map((quest) => (
            <QuestCard
              key={quest.id}
              quest={quest}
              onStartQuest={handleStartQuest}
            />
          ))}
        </div>

        <div className="decorative-clouds">
          <div className="cloud cloud-1"></div>
          <div className="cloud cloud-2"></div>
          <div className="cloud cloud-3"></div>
        </div>
      </div>

      <QuestStartModal
        isOpen={showQuestModal}
        questTitle={selectedQuest?.title}
        onConfirm={handleConfirmQuest}
      />

      <SaveProgressModal
        isOpen={showSaveModal}
        onContinue={handleContinue}
        onNewGame={handleNewGame}
        characterImage={savedProgress?.characterImage}
        savedProgress={savedProgress}
      />

      {notification && (
        <Notification
          type={notification.type}
          title={notification.title}
          message={notification.message}
          onClose={() => setNotification(null)}
        />
      )}
    </div>
  );
};

export default StudentDashboard;
