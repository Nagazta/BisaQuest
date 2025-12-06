import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getGameDataByNPC, getRandomGameSet } from '../../data/moduleOneGames';
import ProgressBar from '../../components/ProgressBar';
import NPCCharacter from '../../components/NPCCharacter';
import Button from '../../components/Button';
import FeedbackNotification from '../../components/FeedbackNotification';
import GuideDialogueBox from '../../components/GuideDialogueBox';
import PictureAssociationBg from '../../assets/images/environments/Vocabulary/farm-bg.png';
import './styles/PictureAssociationPage.css';

const PictureAssociationPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const npcId = location.state?.npcId || 'ligaya';

  const [gameData, setGameData] = useState(null);
  const [pictureData, setPictureData] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedChoice, setSelectedChoice] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [progress, setProgress] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [showHint, setShowHint] = useState(true);
  const [startTime, setStartTime] = useState(null);
  const [encountersRemaining, setEncountersRemaining] = useState(3);
  const [latestAttempt, setLatestAttempt] = useState(null);
  const [showReplayConfirm, setShowReplayConfirm] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);

  useEffect(() => {
    console.log('=== PICTURE ASSOCIATION PAGE MOUNTED ===');
    console.log('NPC ID from location.state:', location.state?.npcId);
    console.log('Using npcId:', npcId);
    
    // Load game data for this NPC
    const npcGameData = getGameDataByNPC(npcId);
    console.log('Game data retrieved:', {
      found: !!npcGameData,
      gameType: npcGameData?.gameType,
      npcName: npcGameData?.npcName
    });
    
    if (npcGameData && npcGameData.gameType === 'word_association') {
      console.log('✅ Valid game data found, setting gameData state');
      setGameData(npcGameData);
    } else {
      console.error('❌ Invalid NPC or game type for word association', {
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
      
      const requestBody = {
        npcId,
        challengeType: 'word_association'
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
      
      const result = await response.json();
      console.log('Response body:', JSON.stringify(result, null, 2));
      
      if (result.success) {
        console.log('✅ Previous attempt check successful');
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
      console.error('Error:', error);
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
      itemCount: selectedSet?.items?.length
    });
    
    if (selectedSet && selectedSet.items) {
      console.log('✅ Game starting with items:', selectedSet.items.length);
      setPictureData(selectedSet.items);
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

  const currentItem = pictureData[currentQuestion];
  const totalQuestions = pictureData.length;
  const isComplete = currentQuestion >= totalQuestions;

  // Calculate progress
  useEffect(() => {
    if (pictureData.length > 0) {
      const newProgress = Math.round((currentQuestion / totalQuestions) * 100);
      setProgress(newProgress);
    }
  }, [currentQuestion, pictureData.length]);

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
        type: 'warning',
        message: 'Please select a choice first!'
      });
      return;
    }

    // Check if answer is correct
    if (selectedChoice === currentItem.word) {
      setCorrectAnswers(correctAnswers + 1);
      setFeedback({
        type: 'success',
        message: currentQuestion === 0 
          ? gameData.dialogues.firstMatch 
          : gameData.dialogues.correct
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
        type: 'error',
        message: gameData.dialogues.incorrect
      });
    }
  };

  const handleBack = () => {
    navigate('/student/village');
  };

  const handleComplete = async () => {
    console.log('=== COMPLETING GAME ===');
    try {
      const token = localStorage.getItem('token');
      const timeSpent = Math.floor((Date.now() - startTime) / 1000);
      
      const submitData = {
        npcId,
        challengeType: 'word_association',
        score: correctAnswers,
        totalQuestions: pictureData.length,
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
      <div className="picture-association-page">
        <div 
          className="picture-association-background"
          style={{ backgroundImage: `url(${PictureAssociationBg})` }}
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
      
      <Button 
        className="btn-back"
        onClick={handleBack}
      >
        ← Back
      </Button>

      {/* Progress Bar */}
      <ProgressBar 
        progress={isComplete ? 100 : progress} 
        variant="environment" 
        showLabel={true} 
      />

      <div className="encounters-info">
        Attempts Remaining: {encountersRemaining}
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
            {isComplete ? 'Complete' : 'Submit'}
          </button>
        </div>

        {/* Center - Picture Display */}
        {!isComplete && currentItem && (
          <div className="center-panel">
            <div className="title-header">Picture Association</div>
            
            <div className="picture-display">
              <img 
                src={currentItem.image} 
                alt="Association" 
                className="association-image"
              />
            </div>
          </div>
        )}

        {/* Right Side - Choice Buttons */}
        {!isComplete && currentItem && (
          <div className="right-panel">
            <div className="choices-label">Choices</div>
            <div className="choices-container">
              {currentItem.choices?.map((choice, index) => (
                <button
                  key={index}
                  className={`choice-button ${selectedChoice === choice ? 'selected' : ''}`}
                  onClick={() => handleChoiceClick(choice)}
                >
                  {choice}
                </button>
              ))}
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