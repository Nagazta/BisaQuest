import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import HamburgerMenu from "../../components/HamburgerMenu";
import InteractiveMap from "../../components/InteractiveMap";
import Village from "../../assets/images/cardsImage/village.png";
import Forest from "../../assets/images/cardsImage/forest.png";
import Kingdom from "../../assets/images/cardsImage/kingdom.png";
import "./StudentDashboard.css";
import QuestStartModal from "../../components/QuestStartModal";
import SaveProgressModal from "../../components/progress/SaveProgressModal";
import Notification from "../../components/Notification";
import ParticleEffects from "../../components/ParticleEffects";

const StudentDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [showQuestModal, setShowQuestModal] = React.useState(false);
  const [showSaveModal, setShowSaveModal] = React.useState(false);
  const [savedProgress, setSavedProgress] = React.useState(null);
  const [selectedQuest, setSelectedQuest] = React.useState(null);
  const [notification, setNotification] = React.useState(null);
  const [moduleProgress, setModuleProgress] = React.useState({});

  // Fetch module progress on mount
  useEffect(() => {
    if (user && user.student_id) {
      fetchModuleProgress();
    }
  }, [user]);

  // Function to fetch module completion progress
  const fetchModuleProgress = async () => {
    try {
      if (!user || !user.student_id) {
        console.log('⚠️ No user or student_id available');
        return;
      }

      console.log('📊 Fetching progress for student:', user.student_id);

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/completion/student/${user.student_id}`
      );

      if (!response.ok) {
        console.log('⚠️ Progress fetch failed');
        return;
      }

      const result = await response.json();

      if (result.success && result.data) {
        const progressMap = {};
        result.data.forEach(completion => {
          progressMap[completion.module_id] = completion.completion_percentage;
        });
        setModuleProgress(progressMap);
        console.log('✅ Progress loaded:', progressMap);
      }
    } catch (error) {
      console.error('❌ Error fetching progress:', error);
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
    console.log('🚪 Logout button clicked');
    await logout();
    navigate("/");
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
    }
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
      if (!user || !user.student_id) {
        console.log('⚠️ No student_id available');
        setShowQuestModal(true);
        return;
      }

      console.log('🔍 Checking for saved progress:', user.student_id);

      const progressResponse = await fetch(
        `${import.meta.env.VITE_API_URL}/api/progress/${user.student_id}/1`
      );

      if (!progressResponse.ok) {
        console.log('ℹ️ No saved progress found');
        setShowQuestModal(true);
        return;
      }

      const progressData = await progressResponse.json();

      if (progressData.hasProgress && progressData.data) {
        console.log('✅ Found saved progress');
        setSavedProgress(progressData.data);
        setShowSaveModal(true);
      } else {
        setShowQuestModal(true);
      }
    } catch (err) {
      console.error('❌ Error checking progress:', err);
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
      if (!user || !user.student_id) {
        console.error('❌ No student_id available');
        return;
      }

      console.log('🔄 Resetting progress for:', user.student_id);

      const deleteProgressResponse = await fetch(
        `${import.meta.env.VITE_API_URL}/api/progress/reset-all`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            student_id: user.student_id,
          }),
        }
      );

      if (!deleteProgressResponse.ok) {
        throw new Error("Failed to reset progress");
      }

      console.log('✅ Progress reset successfully');

      setSavedProgress(null);
      setShowSaveModal(false);
      setShowQuestModal(true);
      
      fetchModuleProgress();
    } catch (err) {
      console.error('❌ Error resetting progress:', err);
      setShowSaveModal(false);
      setShowQuestModal(true);
    }
  };

  const handleConfirmQuest = () => {
    setShowQuestModal(false);
    navigate("/student/village");
  };

  // Redirect if no user
  useEffect(() => {
    if (!user) {
      console.log('⚠️ No user found, redirecting to login');
      navigate('/');
    }
  }, [user, navigate]);

  return (
    <div className="dashboard-container">
      <ParticleEffects enableMouseTrail={false} />

      {/* Hamburger Menu */}
      <HamburgerMenu onLogout={handleLogout} />

      {/* Fullscreen Interactive Map */}
      <InteractiveMap 
        quests={quests}
        onQuestClick={handleStartQuest}
        moduleProgress={moduleProgress}
      />

      <div className="decorative-clouds">
        <div className="cloud cloud-1"></div>
        <div className="cloud cloud-2"></div>
        <div className="cloud cloud-3"></div>
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