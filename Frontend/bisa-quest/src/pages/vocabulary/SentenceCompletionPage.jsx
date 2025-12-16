import { useState, useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { getGameDataByNPC } from "../../data/moduleOneGames";
import { useLanguagePreference } from "../../hooks/useLanguagePreference";
import ProgressBar from "../../components/ProgressBar";
import NPCCharacter from "../../components/NPCCharacter";
import FeedbackNotification from "../../components/FeedbackNotification";
import Button from "../../components/Button";
import GuideDialogueBox from "../../components/GuideDialogueBox";
import SentenceCompletionBg from "../../assets/images/environments/Vocabulary/well-bg.png";
import "./styles/SentenceCompletionPage.css";
import ReplayConfirmModal from "../../components/ReplayConfirmModal";
import { useGameSession } from "../../hooks/useGameSession";

const SentencePrompt = ({
  sentence,
  selectedAnswer,
  isSubmitted,
  correctAnswer,
}) => {
  const displayedWord = selectedAnswer
    ? selectedAnswer
    : isSubmitted && correctAnswer
    ? correctAnswer
    : "[____]";

  const parts = sentence.split("[___]");

  return (
    <div className="question-text">
      {parts.map((part, index) => (
        <span key={index}>
          {part}
          {index < parts.length - 1 && (
            <span
              className={`fill-in-the-blank ${
                isSubmitted && selectedAnswer === correctAnswer
                  ? "correct-fill"
                  : ""
              } ${
                isSubmitted && selectedAnswer !== correctAnswer
                  ? "incorrect-fill"
                  : ""
              }`}
            >
              {displayedWord}
            </span>
          )}
        </span>
      ))}
    </div>
  );
};

const SentenceCompletionPanel = ({
  sentence,
  choices,
  selectedChoice,
  handleChoiceClick,
  isSubmitted,
  correctAnswer,
  language,
}) => {
  const getChoiceButtonClass = (choice) => {
    let className = "choice-button";

    if (choice === selectedChoice) className += " selected";

    if (isSubmitted) {
      if (choice === correctAnswer) className += " correct-answer";
      else if (choice === selectedChoice) className += " incorrect-answer";
    }

    return className;
  };

  return (
    <div className="center-panel sentence-completion-box">
      <div className="title-header sentence">
        {language === "ceb" ? "Pagpuno sa Sentence" : "Sentence Completion"}
      </div>

      <SentencePrompt
        sentence={sentence}
        selectedAnswer={selectedChoice}
        isSubmitted={isSubmitted}
        correctAnswer={correctAnswer}
      />

      <div className="choices-label sentence">
        {language === "ceb" ? "Mga Pili" : "Choices"}
      </div>

      <div className="choices-container sentence">
        {choices.map((choice, index) => (
          <Button
            key={index}
            className={getChoiceButtonClass(choice)}
            onClick={() => handleChoiceClick(choice)}
            disabled={isSubmitted}
          >
            {choice}
          </Button>
        ))}
      </div>
    </div>
  );
};

const SentenceCompletionPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const npcId = location.state?.npcId || "vicente";
  const questId = location.state?.questId || 1;

  // Load language preference
  const { language, loading: langLoading } = useLanguagePreference(questId);

  const gameData = useMemo(() => {
    if (langLoading) return null;

    const npcGameData = getGameDataByNPC(npcId, language);
    if (npcGameData && npcGameData.gameType === "sentence_completion") {
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
    gameContent: sentenceData,
    startTime,
    startGame,
    handleCancelReplay,
  } = useGameSession(npcId, gameData, "sentence_completion", language);

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedChoice, setSelectedChoice] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const currentItem = sentenceData[currentQuestionIndex];
  const totalQuestions = sentenceData.length;
  const isComplete = currentQuestionIndex >= totalQuestions;

  const progress = useMemo(() => {
    if (sentenceData.length > 0) {
      return Math.round((currentQuestionIndex / totalQuestions) * 100);
    }
    return 0;
  }, [currentQuestionIndex, sentenceData.length, totalQuestions]);

  useEffect(() => {
    if (feedback) {
      const timer = setTimeout(() => setFeedback(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [feedback]);

  const handleBack = () => {
    navigate("/student/village", {
      state: { questId }
    });
  };

  const handleChoiceClick = (choice) => {
    if (!isSubmitted) {
      setSelectedChoice(choice);
      setFeedback(null);
    }
  };

  const handleSubmit = () => {
    if (!selectedChoice) {
      setFeedback({
        type: "warning",
        message: language === "ceb" 
          ? "Palihug pilia ang tubag sa una!"
          : "Please select an answer choice first!",
      });
      return;
    }

    setIsSubmitted(true);

    if (selectedChoice === currentItem.correctAnswer) {
      setCorrectCount((count) => count + 1);
      setFeedback({
        type: "success",
        message:
          currentQuestionIndex === 0
            ? gameData.dialogues.firstCorrect
            : gameData.dialogues.correct,
      });

      // Move to next question
      setTimeout(() => {
        setCurrentQuestionIndex((i) => i + 1);
        setSelectedChoice(null);
        setFeedback(null);
        setIsSubmitted(false);
      }, 1500);
    } else {
      setFeedback({
        type: "error",
        message: gameData.dialogues.incorrect,
      });
      setIsSubmitted(false);
    }
  };

  const handleComplete = async () => {
    try {
      const token = localStorage.getItem("token");
      const timeSpent = Math.floor((Date.now() - startTime) / 1000);

      const submitData = {
        npcId,
        challengeType: "sentence_completion",
        score: correctCount,
        totalQuestions: sentenceData.length,
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

      // Check environment progress after submission
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

      const progressResult = await progressResponse.json();

      if (progressResult.success) {
        const progress =
          progressResult.data.progress ??
          progressResult.data.progress_percentage ??
          0;

        // If progress >= 75%, show option to view summary
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
                score: correctCount,
                totalQuestions: sentenceData.length,
                timeSpent,
              },
            },
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
      <div className="sentence-completion-page">
        <div
          className="sentence-completion-background"
          style={{ backgroundImage: `url(${SentenceCompletionBg})` }}
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
        backgroundImage={SentenceCompletionBg}
      />
    );
  }

  if (!gameStarted) {
    return (
      <div className="sentence-completion-page">
        <div
          className="sentence-completion-background"
          style={{ backgroundImage: `url(${SentenceCompletionBg})` }}
        />
        <div className="loading-message">Loading...</div>
      </div>
    );
  }

  return (
    <div className="sentence-completion-page">
      <div
        className="sentence-completion-background"
        style={{ backgroundImage: `url(${SentenceCompletionBg})` }}
      />

      <ProgressBar
        progress={isComplete ? 100 : progress}
        variant="environment"
        showLabel={true}
      />

      <Button className="btn-back" onClick={handleBack}>
        ← {language === "ceb" ? "Balik" : "Back"}
      </Button>

      <div className="encounters-info">
        {language === "ceb" ? "Mga Sulay nga Nahibilin" : "Attempts Remaining"}: {encountersRemaining}
      </div>

      <div className="association-content">
        <div className="left-panel-quiz">
          <NPCCharacter
            characterImage={gameData.character}
            variant="sentence"
            alt={gameData.npcName}
          />

          <GuideDialogueBox
            name={gameData.npcName}
            text={
              isComplete
                ? gameData.dialogues.complete
                    .replace("{score}", correctCount)
                    .replace("{total}", totalQuestions)
                : currentQuestionIndex === 0
                ? gameData.dialogues.hint
                : gameData.dialogues.progress
            }
          />

          <Button
            className="submit-button-quiz"
            onClick={isComplete ? handleComplete : handleSubmit}
            disabled={!isComplete && !selectedChoice}
          >
            {isComplete 
              ? (language === "ceb" ? "Kompleto" : "Complete")
              : (language === "ceb" ? "Isumite" : "Submit")
            }
          </Button>
        </div>

        {!isComplete && currentItem && (
          <SentenceCompletionPanel
            sentence={currentItem.sentence}
            choices={currentItem.choices}
            selectedChoice={selectedChoice}
            handleChoiceClick={handleChoiceClick}
            isSubmitted={isSubmitted}
            correctAnswer={currentItem.correctAnswer}
            language={language}
          />
        )}
      </div>

      <FeedbackNotification type={feedback?.type} message={feedback?.message} />

      <div className="grass-decoration" />
    </div>
  );
};

export default SentenceCompletionPage;