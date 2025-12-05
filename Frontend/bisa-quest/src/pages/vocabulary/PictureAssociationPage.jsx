import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import ProgressBar from '../../components/ProgressBar';
import NPCCharacter from '../../components/NPCCharacter';
import Button from '../../components/Button';
import FeedbackNotification from '../../components/FeedbackNotification';
import LigayaCharacter from '../../assets/images/characters/vocabulary/Village_Quest_NPC_2.png';
import PictureAssociationBg from '../../assets/images/environments/Vocabulary/farm-bg.png';
import GuideDialogueBox from "../../components/GuideDialogueBox";
import './styles/PictureAssociationPage.css';

// Picture association data
const pictureData = [
  {
    id: 1,
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500',
    correctAnswer: 'Sunset',
    choices: ['Mountain', 'Sunset', 'Ocean']
  },
  {
    id: 2,
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500',
    correctAnswer: 'Beach',
    choices: ['Forest', 'Beach', 'Desert']
  },
  {
    id: 3,
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500',
    correctAnswer: 'Nature',
    choices: ['City', 'Nature', 'Building']
  }
];

const PictureAssociationPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const npcId = location.state?.npcId || 'ligaya';

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedChoice, setSelectedChoice] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [progress, setProgress] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [showHint, setShowHint] = useState(true);

  const currentItem = pictureData[currentQuestion];

  // Calculate progress
  useEffect(() => {
    const newProgress = Math.round((currentQuestion / pictureData.length) * 100);
    setProgress(newProgress);
  }, [currentQuestion]);

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
    if (selectedChoice === currentItem.correctAnswer) {
      setCorrectAnswers(correctAnswers + 1);
      setFeedback({
        type: 'success',
        message: 'Correct! Well done!'
      });

      // Move to next question after a delay
      setTimeout(() => {
        if (currentQuestion < pictureData.length - 1) {
          setCurrentQuestion(currentQuestion + 1);
          setSelectedChoice(null);
          setFeedback(null);
        } else {
          // All questions completed
          setProgress(100);
          setFeedback({
            type: 'success',
            message: 'You completed all questions!'
          });
        }
      }, 1500);

      if (currentQuestion === 0) {
        setShowHint(false);
      }
    } else {
      setFeedback({
        type: 'error',
        message: 'Not quite right. Try again!'
      });
    }
  };

  const handleBack = () => {
    navigate('/student/village');
  };

  const handleComplete = () => {
    navigate('/student/village', {
      state: { completed: true }
    });
  };

  const isComplete = currentQuestion >= pictureData.length - 1 && correctAnswers >= pictureData.length;

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
        progress={progress} 
        variant="environment" 
        showLabel={true} 
      />

      {/* Main Content Area */}
      <div className="association-content">
        {/* Left Side - Guide Character Panel */}
        <div className="left-panel">
          <NPCCharacter 
            characterImage={LigayaCharacter}
            variant="association"
            alt="Ligaya"
          />
          
          <button 
            className="submit-button-association"
            onClick={isComplete ? handleComplete : handleSubmit}
          >
            {isComplete ? 'Complete' : 'Submit'}
          </button>

          <GuideDialogueBox
            name="Ligaya"
            text={
              showHint && currentQuestion === 0
                ? "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean commodo ligula eget dolor."
                : isComplete
                ? "Amazing work! You've completed all the picture associations!"
                : "Great progress! Keep it up!"
            }
          />
        </div>

        {/* Center - Picture Display */}
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

        {/* Right Side - Choice Buttons */}
        <div className="right-panel">
          <div className="choices-label">Choices</div>
          <div className="choices-container">
            {currentItem.choices.map((choice, index) => (
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
      </div>

      {/* Feedback Notification */}
      <FeedbackNotification type={feedback?.type} message={feedback?.message} />

      {/* Decorative grass */}
      <div className="grass-decoration-association" />
    </div>
  );
};

export default PictureAssociationPage;