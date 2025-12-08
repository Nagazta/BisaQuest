import { useState, useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { getGameDataByNPC } from "../../data/moduleOneGames";
import { useLanguagePreference } from "../../hooks/useLanguagePreference";
import ProgressBar from "../../components/ProgressBar";
import NPCCharacter from "../../components/NPCCharacter";
import FeedbackNotification from "../../components/FeedbackNotification";
import Button from "../../components/Button";
import GuideDialogueBox from "../../components/GuideDialogueBox";
import WordMatchingBg from "../../assets/images/environments/Vocabulary/village-bg.png";
import "./styles/WordMatchingPage.css";
import ReplayConfirmModal from "../../components/ReplayConfirmModal";
import { useGameSession } from "../../hooks/useGameSession";

const WordMatchingPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const npcId = location.state?.npcId || "nando";
  const questId = location.state?.questId || 1;

  // Load language preference
  const { language, loading: langLoading } = useLanguagePreference(questId);

  const [selectedWord, setSelectedWord] = useState(null);
  const [selectedDefinition, setSelectedDefinition] = useState(null);
  const [matches, setMatches] = useState([]);
  const [feedback, setFeedback] = useState(null);
  const [completedWords, setCompletedWords] = useState([]);
  const [showHint, setShowHint] = useState(true);

  const gameData = useMemo(() => {
    if (langLoading) return null;
    
    const npcGameData = getGameDataByNPC(npcId, language);

    if (npcGameData && npcGameData.gameType === "word_matching") {
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
    gameContent: wordMatchingData,
    startTime,
    startGame,
    handleCancelReplay,
  } = useGameSession(npcId, gameData, "word_matching", language);

  const progress = useMemo(() => {
    if (wordMatchingData.length > 0) {
      return Math.round((matches.length / wordMatchingData.length) * 100);
    }
    return 0;
  }, [matches.length, wordMatchingData.length]);

  useEffect(() => {
    if (feedback) {
      const timer = setTimeout(() => setFeedback(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [feedback]);

  const handleWordClick = (word) => {
    if (completedWords.includes(word.id)) return;
    setSelectedWord(word);
    setFeedback(null);
  };

  const handleDefinitionClick = (definition) => {
    if (completedWords.includes(definition.id)) return;
    setSelectedDefinition(definition);
    setFeedback(null);
  };

  const handleSubmit = () => {
    if (!selectedWord || !selectedDefinition) {
      setFeedback({
        type: "warning",
        message: language === "ceb" 
          ? "Palihug pilia ang pulong ug kahulogan!"
          : "Please select both a word and a definition!",
      });
      return;
    }

    if (selectedWord.id === selectedDefinition.id) {
      setMatches([
        ...matches,
        { word: selectedWord, definition: selectedDefinition },
      ]);
      setCompletedWords([...completedWords, selectedWord.id]);
      setFeedback({
        type: "success",
        message:
          matches.length === 0
            ? gameData.dialogues.firstMatch
            : gameData.dialogues.correct,
      });
      setSelectedWord(null);
      setSelectedDefinition(null);

      if (matches.length === 0) {
        setShowHint(false);
      }
    } else {
      setFeedback({ type: "error", message: gameData.dialogues.incorrect });
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

      await fetch(`${import.meta.env.VITE_API_URL}/api/npc/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          npcId,
          challengeType: "word_matching",
          score: matches.length,
          totalQuestions: wordMatchingData.length,
          timeSpent,
          completed: true,
        }),
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
                score: matches.length,
                totalQuestions: wordMatchingData.length,
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

  const isComplete = matches.length === wordMatchingData.length;

  if (langLoading) {
    return (
      <div className="word-matching-page">
        <div
          className="word-matching-background"
          style={{ backgroundImage: `url(${WordMatchingBg})` }}
        />
        <div className="loading-message">Loading language...</div>
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
        backgroundImage={WordMatchingBg}
      />
    );
  }

  if (!gameStarted) {
    return (
      <div className="word-matching-page">
        <div
          className="word-matching-background"
          style={{ backgroundImage: `url(${WordMatchingBg})` }}
        />
        <div className="loading-message">Loading...</div>
      </div>
    );
  }

  return (
    <div className="word-matching-page">
      <div
        className="word-matching-background"
        style={{ backgroundImage: `url(${WordMatchingBg})` }}
      />

      <ProgressBar progress={progress} variant="environment" showLabel={true} />

      <Button className="btn-back" onClick={handleBack}>
        ← {language === "ceb" ? "Balik" : "Back"}
      </Button>

      <div className="encounters-info">
        {language === "ceb" ? "Mga Sulay nga Nahibilin" : "Attempts Remaining"}: {encountersRemaining}
      </div>

      <div className="matching-content">
        <div className="guide-character-panel">
          <NPCCharacter
            characterImage={gameData.character}
            variant="matching"
            alt={gameData.npcName}
          />

          <GuideDialogueBox
            name={gameData.npcName}
            text={
              showHint && matches.length === 0
                ? gameData.dialogues.hint
                : isComplete
                ? gameData.dialogues.complete
                : gameData.dialogues.progress
            }
          />

          <button
            className="submit-button"
            onClick={isComplete ? handleComplete : handleSubmit}
          >
            {isComplete 
              ? (language === "ceb" ? "Kompleto" : "Complete")
              : (language === "ceb" ? "Isumite" : "Submit")
            }
          </button>
        </div>

        <div className="word-button-list">
          {wordMatchingData.map((item) => (
            <Button
              key={item.id}
              variant="custom"
              className={`word-button ${
                selectedWord?.id === item.id ? "selected" : ""
              } ${completedWords.includes(item.id) ? "completed" : ""}`}
              onClick={() => handleWordClick(item)}
              disabled={completedWords.includes(item.id)}
            >
              {item.word}
            </Button>
          ))}
        </div>

        <div className="definition-list-panel">
          {wordMatchingData.map((item) => (
            <div
              key={item.id}
              className={`definition-card ${
                selectedDefinition?.id === item.id ? "selected" : ""
              } ${completedWords.includes(item.id) ? "completed" : ""}`}
              onClick={() => handleDefinitionClick(item)}
            >
              <p>{item.definition}</p>
            </div>
          ))}
        </div>
      </div>

      <FeedbackNotification type={feedback?.type} message={feedback?.message} />

      <div className="grass-decoration" />
    </div>
  );
};

export default WordMatchingPage;