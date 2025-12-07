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

  const [showQuestModal, setShowQuestModal] = React.useState(false);
  const [showSaveModal, setShowSaveModal] = React.useState(false);
  const [savedProgress, setSavedProgress] = React.useState(null);
  const [selectedQuest, setSelectedQuest] = React.useState(null);
  const [notification, setNotification] = React.useState(null);
  const [moduleProgress, setModuleProgress] = React.useState({});

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

  // Fetch module progress on mount
  useEffect(() => {
    fetchModuleProgress();
  }, []);

  // Function to fetch module completion progress
  const fetchModuleProgress = async () => {
    try {
      const sessionData = JSON.parse(localStorage.getItem("session"));
      const token = localStorage.getItem("token");
      
      if (!sessionData?.user?.id || !token) return;

      // Get student_id first
      const studentResponse = await fetch(
        `${import.meta.env.VITE_API_URL}/api/student/by-user/${sessionData.user.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!studentResponse.ok) return;

      const studentData = await studentResponse.json();
      const studentId = studentData.data.student_id;

      console.log("Fetching completions for student_id:", studentId);

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/completion/student/${studentId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        console.log("No completions found yet");
        return;
      }

      const result = await response.json();

      if (result.success && result.data) {
        const progressMap = {};
        result.data.forEach(completion => {
          progressMap[completion.module_id] = completion.completion_percentage;
        });
        setModuleProgress(progressMap);
        console.log("Module progress loaded:", progressMap);
      }
    } catch (error) {
      console.error("Error fetching module progress:", error);
    }
  };

  // Notification for completion
  useEffect(() => {
    if (location.state?.moduleCompleted) {
      setNotification({
        type: "success",
        title: "Quest Complete!",
        message: `Congratulations! You've completed the ${
          location.state.moduleId === 1 ? "Vocabulary Quest" : "quest"
        }!`,
      });
      
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, navigate, location.pathname]);

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
      progress: moduleProgress[1] || 0,
      image: Village,
    },
    {
      id: 2,
      title: "Synonyms & Antonyms Quest",
      subtitle: "Forest Theme",
      description: "Journey through the magical forest",
      progress: moduleProgress[2] || 0,
      image: Forest,
    },
    {
      id: 3,
      title: "Compound Quest",
      subtitle: "Castle Theme",
      description: "Master word Building in the Castle",
      progress: moduleProgress[3] || 0,
      image: Kingdom,
    },
    {
      id: 4,
      title: "Narrative Problem Solving Quest",
      subtitle: "Kingdom Theme",
      description: "Apply your skills in the Kingdom",
      progress: moduleProgress[4] || 0,
      image: Throne,
    },
  ];

  const handleStartQuest = async (questId) => {
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

    await checkForSavedProgress();
  };

  const checkForSavedProgress = async () => {
    try {
      console.log("🔍 Starting checkForSavedProgress...");
      
      const sessionData = JSON.parse(localStorage.getItem("session"));
      console.log("📦 Session data:", sessionData);
      
      if (!sessionData?.user?.id) {
        console.log("❌ No session user ID found");
        return;
      }

      console.log("🌐 Fetching student data for user:", sessionData.user.id);
      const studentResponse = await fetch(
        `${import.meta.env.VITE_API_URL}/api/student/by-user/${sessionData.user.id}`
      );

      console.log("📡 Student response status:", studentResponse.status, studentResponse.ok);

      if (!studentResponse.ok) {
        console.log("❌ Student response not OK");
        return;
      }

      const studentData = await studentResponse.json();
      console.log("👤 Student data received:", studentData);
      
      // FIXED: Use student_id instead of user_id
      const student_id = studentData.data.student_id;
      console.log("🆔 Using student_id for progress check:", student_id);

      console.log("🌐 Fetching progress for student_id:", student_id, "quest: 1");
      const progressResponse = await fetch(
        `${import.meta.env.VITE_API_URL}/api/progress/${student_id}/1`
      );

      console.log("📡 Progress response status:", progressResponse.status, progressResponse.ok);

      if (!progressResponse.ok) {
        console.log("ℹ️ No progress found (response not OK) - showing quest modal");
        setShowQuestModal(true);
        return;
      }

      const progressData = await progressResponse.json();
      console.log("💾 Progress data received:", progressData);
      console.log("✅ hasProgress:", progressData.hasProgress);
      console.log("📊 data:", progressData.data);

      if (progressData.hasProgress && progressData.data) {
        console.log("🎉 Progress found! Showing save modal");
        setSavedProgress(progressData.data);
        setShowSaveModal(true);
      } else {
        console.log("ℹ️ No hasProgress flag or data - showing quest modal");
        setShowQuestModal(true);
      }
    } catch (err) {
      console.error("💥 Error checking progress:", err);
      setShowQuestModal(true);
    }
  };

  const handleContinue = () => {
    setShowSaveModal(false);
    navigate("/student/village");
  };

  const handleCloseSaveModal = () => {
    setShowSaveModal(false);
  };

  const handleNewGame = async () => {
    try {
      const sessionData = JSON.parse(localStorage.getItem("session"));
      const studentResponse = await fetch(
        `${import.meta.env.VITE_API_URL}/api/student/by-user/${sessionData.user.id}`
      );
      const studentData = await studentResponse.json();
      // FIXED: Use student_id consistently
      const student_id = studentData.data.student_id;

      const deleteProgressResponse = await fetch(
        `${import.meta.env.VITE_API_URL}/api/progress/reset-all`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            student_id: student_id,
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
      
      fetchModuleProgress();
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
        onClose={() => setShowQuestModal(false)}
      />

      <SaveProgressModal
        isOpen={showSaveModal}
        onContinue={handleContinue}
        onNewGame={handleNewGame}
        onClose={handleCloseSaveModal}
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