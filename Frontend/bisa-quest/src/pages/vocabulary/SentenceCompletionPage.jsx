import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getGameDataByNPC, getRandomGameSet } from '../../data/moduleOneGames';
import ProgressBar from '../../components/ProgressBar';
import NPCCharacter from '../../components/NPCCharacter';
import FeedbackNotification from '../../components/FeedbackNotification';
import Button from '../../components/Button';
import GuideDialogueBox from '../../components/GuideDialogueBox';
import SentenceCompletionBg from '../../assets/images/environments/Vocabulary/well-bg.png';
import './styles/SentenceCompletionPage.css';

const SentencePrompt = ({ sentence, selectedAnswer, isSubmitted, correctAnswer }) => {
  const displayedWord =
    selectedAnswer
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
                isSubmitted && selectedAnswer === correctAnswer ? "correct-fill" : ""
              } ${
                isSubmitted && selectedAnswer !== correctAnswer ? "incorrect-fill" : ""
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
  correctAnswer
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
      <div className="title-header">Sentence Completion</div>

      <SentencePrompt
        sentence={sentence}
        selectedAnswer={selectedChoice}
        isSubmitted={isSubmitted}
        correctAnswer={correctAnswer}
      />

      <div className="choices-label">Choices</div>

      <div className="choices-container">
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
  const npcId = location.state?.npcId || 'vicente';

  const [gameData, setGameData] = useState(null);
  const [sentenceData, setSentenceData] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedChoice, setSelectedChoice] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [progress, setProgress] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [encountersRemaining, setEncountersRemaining] = useState(3);
  const [latestAttempt, setLatestAttempt] = useState(null);
  const [showReplayConfirm, setShowReplayConfirm] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);

  useEffect(() => {
    console.log('=== SENTENCE COMPLETION PAGE MOUNTED ===');
    console.log('NPC ID from location.state:', location.state?.npcId);
    console.log('Using npcId:', npcId);
    
    // Load game data for this NPC
    const npcGameData = getGameDataByNPC(npcId);
    console.log('Game data retrieved:', {
      found: !!npcGameData,
      gameType: npcGameData?.gameType,
      npcName: npcGameData?.npcName
    });
    
    if (npcGameData && npcGameData.gameType === 'sentence_completion') {
      console.log('✅ Valid game data found, setting gameData state');
      setGameData(npcGameData);
    } else {
      console.error('❌ Invalid NPC or game type for sentence completion', {
        npcId,
        gameData: npcGameData
      });
      navigate('/student/village');
    }
  }, [npcId]);

  // Separate effect to check previous attempt after gameData is set
  useEffect(() => {
    if (gameData) {
      console.log('GameData is now available, checking previous attempt');
      checkPreviousAttempt();
    }
  }, [gameData]);

  const checkPreviousAttempt = async () => {
    console.log('=== CHECKING PREVIOUS ATTEMPT ===');
    try {
      const token = localStorage.getItem('token');
      console.log('Token exists:', !!token);
      console.log('Token (first 30 chars):', token?.substring(0, 30));
      
      const requestBody = {
        npcId,
        challengeType: 'sentence_completion'
      };
      
      console.log('Sending POST to /api/npc/start with body:', requestBody);
      
      const response = await fetch('http://localhost:5000/api/npc/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestBody)
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);
      
      const result = await response.json();
      console.log('Response body:', JSON.stringify(result, null, 2));
      
      if (result.success) {
        console.log('✅ Previous attempt check successful');
        console.log('Encounters remaining:', result.data.encountersRemaining);
        console.log('Latest attempt:', result.data.latestAttempt);
        
        setEncountersRemaining(result.data.encountersRemaining);
        setLatestAttempt(result.data.latestAttempt);
        
        if (result.data.latestAttempt) {
          console.log('Found previous attempt, showing replay confirmation');
          setShowReplayConfirm(true);
        } else {
          console.log('No previous attempt, starting fresh game');
          startGame();
        }
      } else {
        console.error('❌ API returned success: false', result);
        startGame();
      }
    } catch (error) {
      console.error('=== ERROR IN checkPreviousAttempt ===');
      console.error('Error type:', error.constructor.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      startGame();
    }
  };

  const startGame = () => {
    console.log('=== STARTING GAME ===');
    if (!gameData) {
      console.error('❌ Cannot start game: gameData is null');
      return;
    }
    
    const selectedSet = getRandomGameSet(npcId);
    console.log('Random game set selected:', {
      found: !!selectedSet,
      setId: selectedSet?.set_id,
      sentenceCount: selectedSet?.sentences?.length
    });
    
    if (selectedSet && selectedSet.sentences) {
      console.log('✅ Game starting with sentences:', selectedSet.sentences.length);
      setSentenceData(selectedSet.sentences);
      setStartTime(Date.now());
      setGameStarted(true);
      setShowReplayConfirm(false);
    } else {
      console.error('❌ Invalid game set:', selectedSet);
    }
  };

  const handleCancelReplay = () => {
    console.log('User cancelled replay, navigating back to village');
    navigate('/student/village');
  };

  const currentItem = sentenceData[currentQuestionIndex];
  const totalQuestions = sentenceData.length;
  const isComplete = currentQuestionIndex >= totalQuestions;

  useEffect(() => {
    if (sentenceData.length > 0) {
      const newProgress = Math.round((currentQuestionIndex / totalQuestions) * 100);
      setProgress(newProgress);
    }
  }, [currentQuestionIndex, sentenceData.length]);

  useEffect(() => {
    if (feedback) {
      const timer = setTimeout(() => setFeedback(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [feedback]);

  const handleBack = () => {
    navigate('/student/village');
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
        message: "Please select an answer choice first!" 
      });
      return;
    }

    setIsSubmitted(true);

    if (selectedChoice === currentItem.correctAnswer) {
      setCorrectCount((count) => count + 1);
      setFeedback({ 
        type: "success", 
        message: currentQuestionIndex === 0 
          ? gameData.dialogues.firstCorrect 
          : gameData.dialogues.correct 
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
        message: gameData.dialogues.incorrect
      });
      setIsSubmitted(false);
    }
  };

  const handleComplete = async () => {
    console.log('=== COMPLETING GAME ===');
    try {
      const token = localStorage.getItem('token');
      const timeSpent = Math.floor((Date.now() - startTime) / 1000);
      
      const submitData = {
        npcId,
        challengeType: 'sentence_completion',
        score: correctCount,
        totalQuestions: sentenceData.length,
        timeSpent,
        completed: true
      };
      
      console.log('Submitting completion:', submitData);
      
      await fetch('http://localhost:5000/api/npc/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(submitData)
      });
      
      console.log('✅ Completion submitted, navigating to village');
      navigate('/student/village', { state: { completed: true } });
    } catch (error) {
      console.error('Error submitting challenge:', error);
      navigate('/student/village', { state: { completed: true } });
    }
  };

  if (!gameData) {
    return <div className="loading-message">Loading...</div>;
  }

  // Replay confirmation modal
  if (showReplayConfirm && latestAttempt) {
    return (
      <div className="sentence-completion-page">
        <div 
          className="sentence-completion-background"
          style={{ backgroundImage: `url(${SentenceCompletionBg})` }}
        />
        
        <div className="replay-confirmation-modal">
          <div className="replay-modal-content">
            <h2>Previous Attempt Found</h2>
            <div className="previous-score-info">
              <p><strong>Previous Score:</strong> {latestAttempt.score}/{latestAttempt.totalQuestions}</p>
              <p><strong>Time Spent:</strong> {latestAttempt.timeSpent}s</p>
              <p><strong>Attempts Remaining:</strong> {encountersRemaining}</p>
            </div>
            <p className="replay-warning">
              Are you sure you want to play again? Your best score will be kept.
            </p>
            <div className="replay-modal-buttons">
              <Button onClick={startGame} className="btn-confirm">
                Yes, Play Again
              </Button>
              <Button onClick={handleCancelReplay} className="btn-cancel">
                No, Go Back
              </Button>
            </div>
          </div>
        </div>
      </div>
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
        ← Back
      </Button>

      <div className="encounters-info">
        Attempts Remaining: {encountersRemaining}
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
                ? gameData.dialogues.complete.replace('{score}', correctCount).replace('{total}', totalQuestions)
                : currentQuestionIndex === 0
                ? gameData.dialogues.hint
                : gameData.dialogues.progress
            }
          />

          <button 
            className="submit-button-quiz"
            onClick={isComplete ? handleComplete : handleSubmit}
            disabled={!isComplete && !selectedChoice}
          >
            {isComplete ? 'Complete' : 'Submit'}
          </button>
        </div>

        {!isComplete && currentItem && (
          <SentenceCompletionPanel
            sentence={currentItem.sentence}
            choices={currentItem.choices}
            selectedChoice={selectedChoice}
            handleChoiceClick={handleChoiceClick}
            isSubmitted={isSubmitted}
            correctAnswer={currentItem.correctAnswer}
          />
        )}
      </div>

      <FeedbackNotification 
        type={feedback?.type}
        message={feedback?.message}
      />

      <div className="grass-decoration" />
    </div>
  );
};

export default SentenceCompletionPage;