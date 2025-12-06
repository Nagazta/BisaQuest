import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getGameDataByNPC, getRandomGameSet } from '../../data/moduleOneGames';
import ProgressBar from '../../components/ProgressBar';
import NPCCharacter from '../../components/NPCCharacter';
import FeedbackNotification from '../../components/FeedbackNotification';
import Button from '../../components/Button';
import GuideDialogueBox from '../../components/GuideDialogueBox';   
import WordMatchingBg from '../../assets/images/environments/Vocabulary/village-bg.png';
import './styles/WordMatchingPage.css';

const WordMatchingPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const npcId = location.state?.npcId || 'nando';

  const [gameData, setGameData] = useState(null);
  const [wordMatchingData, setWordMatchingData] = useState([]);
  const [selectedWord, setSelectedWord] = useState(null);
  const [selectedDefinition, setSelectedDefinition] = useState(null);
  const [matches, setMatches] = useState([]);
  const [feedback, setFeedback] = useState(null);
  const [progress, setProgress] = useState(0);
  const [completedWords, setCompletedWords] = useState([]);
  const [showHint, setShowHint] = useState(true);
  const [startTime, setStartTime] = useState(null);
  const [encountersRemaining, setEncountersRemaining] = useState(3);
  const [latestAttempt, setLatestAttempt] = useState(null);
  const [showReplayConfirm, setShowReplayConfirm] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);

  useEffect(() => {
    // Load game data for this NPC
    const npcGameData = getGameDataByNPC(npcId);
    if (npcGameData && npcGameData.gameType === 'word_matching') {
      setGameData(npcGameData);
      checkPreviousAttempt();
    } else {
      console.error('Invalid NPC or game type for word matching');
      navigate('/student/village');
    }
  }, [npcId]);

  const checkPreviousAttempt = async () => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch('http://localhost:5000/api/npc/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          npcId,
          challengeType: 'word_matching'
        })
      });

      const result = await response.json();
      
      if (result.success) {
        setEncountersRemaining(result.data.encountersRemaining);
        setLatestAttempt(result.data.latestAttempt);
        
        if (result.data.latestAttempt) {
          setShowReplayConfirm(true);
        } else {
          startGame();
        }
      }
    } catch (error) {
      console.error('Error checking previous attempt:', error);
      startGame();
    }
  };

  const startGame = () => {
    if (!gameData) return;
    
    const selectedSet = getRandomGameSet(npcId);
    if (selectedSet && selectedSet.words) {
      setWordMatchingData(selectedSet.words);
      setStartTime(Date.now());
      setGameStarted(true);
      setShowReplayConfirm(false);
    }
  };

  const handleCancelReplay = () => {
    navigate('/student/village');
  };

  useEffect(() => {
    if (wordMatchingData.length > 0) {
      const newProgress = Math.round((matches.length / wordMatchingData.length) * 100);
      setProgress(newProgress);
    }
  }, [matches, wordMatchingData.length]);

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
        type: 'warning',
        message: 'Please select both a word and a definition!'
      });
      return;
    }

    if (selectedWord.id === selectedDefinition.id) {
      setMatches([...matches, { word: selectedWord, definition: selectedDefinition }]);
      setCompletedWords([...completedWords, selectedWord.id]);
      setFeedback({ 
        type: 'success', 
        message: matches.length === 0 ? gameData.dialogues.firstMatch : gameData.dialogues.correct
      });
      setSelectedWord(null);
      setSelectedDefinition(null);

      if (matches.length === 0) {
        setShowHint(false);
      }
    } else {
      setFeedback({ type: 'error', message: gameData.dialogues.incorrect });
    }
  };

  const handleBack = () => {
    navigate('/student/village');
  };

  const handleComplete = async () => {
    try {
      const token = localStorage.getItem('token');
      const timeSpent = Math.floor((Date.now() - startTime) / 1000);
      
      await fetch('http://localhost:5000/api/npc/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          npcId,
          challengeType: 'word_matching',
          score: matches.length,
          totalQuestions: wordMatchingData.length,
          timeSpent,
          completed: true
        })
      });
      
      navigate('/student/village', { state: { completed: true } });
    } catch (error) {
      console.error('Error submitting challenge:', error);
      navigate('/student/village', { state: { completed: true } });
    }
  };

  const isComplete = matches.length === wordMatchingData.length;

  if (!gameData) {
    return <div className="loading-message">Loading...</div>;
  }

  // Replay confirmation modal
  if (showReplayConfirm && latestAttempt) {
    return (
      <div className="word-matching-page">
        <div 
          className="word-matching-background"
          style={{ backgroundImage: `url(${WordMatchingBg})` }}
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

      <ProgressBar 
        progress={progress} 
        variant="environment" 
        showLabel={true} 
      />

      <Button className="btn-back" onClick={handleBack}>
        ← Back
      </Button>

      <div className="encounters-info">
        Attempts Remaining: {encountersRemaining}
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
            {isComplete ? 'Complete' : 'Submit'}
          </button>
        </div>

        <div className="word-button-list">
          {wordMatchingData.map((item) => (
            <Button
              key={item.id}
              className={`word-button ${
                selectedWord?.id === item.id ? 'selected' : ''
              } ${completedWords.includes(item.id) ? 'completed' : ''}`}
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
                selectedDefinition?.id === item.id ? 'selected' : ''
              } ${completedWords.includes(item.id) ? 'completed' : ''}`}
              onClick={() => handleDefinitionClick(item)}
            >
              <p>{item.definition}</p>
            </div>
          ))}
        </div>
      </div>

      <FeedbackNotification 
        type={feedback?.type}
        message={feedback?.message}
      />

      <div className="grass-decoration" />
    </div>
  );
};

export default WordMatchingPage;