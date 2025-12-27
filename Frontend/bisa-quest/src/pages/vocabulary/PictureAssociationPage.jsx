import { useState, useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { getGameDataByNPC } from "../../data/moduleOneGames";
import { useLanguagePreference } from "../../hooks/useLanguagePreference";
import ProgressBar from "../../components/ProgressBar";
import NPCCharacter from "../../components/NPCCharacter";
import Button from "../../components/Button";
import FeedbackNotification from "../../components/FeedbackNotification";
import GuideDialogueBox from "../../components/GuideDialogueBox";
import PictureAssociationBg from "../../assets/images/environments/Vocabulary/farm-bg.png";
import "./PictureAssociationPage.css";
import ReplayConfirmModal from "../../components/ReplayConfirmModal";
import { useGameSession } from "../../hooks/useGameSession";

const PictureAssociationPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const npcId = location.state?.npcId || "ligaya";
  const questId = location.state?.questId || 1;

  // Load language preference
  const { language, loading: langLoading } = useLanguagePreference(questId);

  const gameData = useMemo(() => {
    if (langLoading) return null;

    const npcGameData = getGameDataByNPC(npcId, language);

    if (npcGameData && npcGameData.gameType === "word_association") {
      return npcGameData;
    } else {
      navigate("/student/village");
      return null;
    }
  }, [npcId, language, langLoading, navigate]);

  const {
    encountersRemaining,
    latestAttempt,
    showReplayConfirm,
    gameStarted,
    gameContent: pictureData,
    startTime,
    startGame,
    handleCancelReplay,
  } = useGameSession(npcId, gameData, "word_association", language);

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedChoice, setSelectedChoice] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [showHint, setShowHint] = useState(true);

  const currentItem = pictureData[currentQuestion];
  const totalQuestions = pictureData.length;
  const isComplete = currentQuestion >= totalQuestions;

  // Calculate progress
  const progress = useMemo(() => {
    if (pictureData.length > 0) {
      return Math.round((currentQuestion / totalQuestions) * 100);
    }
    return 0;
  }, [currentQuestion, pictureData.length, totalQuestions]);

  // Auto-hide feedback after 3 seconds
  useEffect(() => {
    if (feedback) {
      const timer = setTimeout(() => {
        setFeedback(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [feedback]);

  const handleChoiceClick = (choice) => {
    setSelectedChoice(choice);
    setFeedback(null);
  };

  const handleSubmit = () => {
    if (!selectedChoice) {
      setFeedback({
        type: "warning",
        message: language === "ceb" 
          ? "Palihug pilia usa una!"
          : "Please select a choice first!",
      });
      return;
    }

    // Check if answer is correct
    if (selectedChoice === currentItem.word) {
      setCorrectAnswers(correctAnswers + 1);
      setFeedback({
        type: "success",
        message:
          currentQuestion === 0
            ? gameData.dialogues.firstMatch
            : gameData.dialogues.correct,
      });

      // Move to next question after a delay
      setTimeout(() => {
        setCurrentQuestion(currentQuestion + 1);
        setSelectedChoice(null);
        setFeedback(null);
      }, 1500);

      if (currentQuestion === 0) {
        setShowHint(false);
      }
    } else {
      setFeedback({
        type: "error",
        message: gameData.dialogues.incorrect,
      });
    }
  };

  const handleBack = () => {
    navigate("/student/village", {
      state: { questId }
    });
  };

  const handleComplete = async () => {
    try {
      const token = localStorage.getItem("token");
      const timeSpent = Math.floor((Date.now() - startTime) / 1000);

      const submitData = {
        npcId,
        challengeType: "word_association",
        score: correctAnswers,
        totalQuestions: pictureData.length,
        timeSpent,
        completed: true,
      };

      await fetch("http://localhost:5000/api/npc/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(submitData),
      });

      // Check environment progress
      const progressResponse = await fetch(
        `${import.meta.env.VITE_API_URL}/api/npc/environment-progress?environmentType=village`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      const progressResult = await progressResponse.json();
      
      if (progressResult.success) {
        const progress = progressResult.data.progress ?? progressResult.data.progress_percentage ?? 0;
        
        if (progress >= 75) {
          navigate("/student/summary", {
            state: {
              showSummary: true,
              environmentProgress: progress,
              returnTo: "/student/village",
              questId: questId,
              completedQuest: {
                npcId,
                npcName: gameData.npcName,
                score: correctAnswers,
                totalQuestions: pictureData.length,
                timeSpent
              }
            }
          });
        } else {
          navigate("/student/village", { 
            state: { 
              completed: true,
              questId: questId
            } 
          });
        }
      } else {
        navigate("/student/village", { 
          state: { 
            completed: true,
            questId: questId
          } 
        });
      }
    } catch (error) {
      navigate("/student/village", { 
        state: { 
          completed: true,
          questId: questId
        } 
      });
    }
  };

  if (langLoading) {
    return (
      <div className="picture-association-page">
        <div
          className="picture-association-background"
          style={{ backgroundImage: `url(${PictureAssociationBg})` }}
        />
        <div className="loading-message">
          {language === "ceb" ? "Nag-load..." : "Loading language..."}
        </div>
      </div>
    );
  }

  if (!gameData) {
    return <div className="loading-message">Loading...</div>;
  }

  // Replay confirmation modal
  if (showReplayConfirm && latestAttempt) {
    return (
      <ReplayConfirmModal
        isOpen={showReplayConfirm}
        latestAttempt={latestAttempt}
        encountersRemaining={encountersRemaining}
        onPlayAgain={startGame}
        onGoBack={handleCancelReplay}
        backgroundImage={PictureAssociationBg}
      />
    );
  }

  if (!gameStarted) {
    return (
      <div className="picture-association-page">
        <div
          className="picture-association-background"
          style={{ backgroundImage: `url(${PictureAssociationBg})` }}
        />
        <div className="loading-message">Loading...</div>
      </div>
    );
  }

  return (
    <div className="picture-association-page">
      {/* Background */}
      <div
        className="picture-association-background"
        style={{ backgroundImage: `url(${PictureAssociationBg})` }}
      />

      <Button className="btn-back" onClick={handleBack}>
        ← {language === "ceb" ? "Balik" : "Back"}
      </Button>

      {/* Progress Bar */}
      <ProgressBar
        progress={isComplete ? 100 : progress}
        variant="environment"
        showLabel={true}
      />

      <div className="encounters-info">
        {language === "ceb" ? "Mga Sulay nga Nahibilin" : "Attempts Remaining"}: {encountersRemaining}
      </div>

      {/* Main Content Area */}
      <div className="association-content">
        {/* Left Side - Guide Character Panel */}
        <div className="left-panel">
          <NPCCharacter
            characterImage={gameData.character}
            variant="association"
            alt={gameData.npcName}
          />

          <GuideDialogueBox
            name={gameData.npcName}
            text={
              showHint && currentQuestion === 0
                ? gameData.dialogues.hint
                : isComplete
                ? gameData.dialogues.complete
                : gameData.dialogues.progress
            }
          />

          <button
            className="submit-button-association"
            onClick={isComplete ? handleComplete : handleSubmit}
            disabled={!isComplete && !selectedChoice}
          >
            {isComplete 
              ? (language === "ceb" ? "Kompleto" : "Complete")
              : (language === "ceb" ? "Ipasa" : "Submit")
            }
          </button>
        </div>

         {/* Center + Choices Column */}
      {!isComplete && currentItem && (
        <div className="middle-column">
          {/* Center - Picture Display */}
          <div className="center-panel">
            <div className="title-header">
              {language === "ceb" ? "Tag-ana ang Hulagway" : "Picture Association"}
            </div>

            <div className="picture-display">
              <img
                src={currentItem.image}
                alt="Association"
                className="association-image"
              />
            </div>
          </div>

          {/* Right Side - Choice Buttons (now under center) */}
          <div className="right-panel">
            <div className="choices-label">
              {language === "ceb" ? "Mga Pilianan" : "Choices"}
            </div>

            <div className="choices-container">
              {currentItem.choices?.map((choice, index) => (
                <button
                  key={index}
                  className={`choice-button ${
                    selectedChoice === choice ? "selected" : ""
                  }`}
                  onClick={() => handleChoiceClick(choice)}
                >
                  {choice}
                </button>
              ))}
            </div>
          </div>
        </div>
        )}
      </div>

      {/* Feedback Notification */}
      <FeedbackNotification type={feedback?.type} message={feedback?.message} />

      {/* Decorative grass */}
      <div className="grass-decoration-association" />
    </div>
  );
};

export default PictureAssociationPage;