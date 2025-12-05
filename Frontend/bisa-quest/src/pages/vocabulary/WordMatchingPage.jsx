import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import ProgressBar from '../../components/ProgressBar';
import NPCCharacter from '../../components/NPCCharacter';
import FeedbackNotification from '../../components/FeedbackNotification';
import Button from '../../components/Button';
import GuideDialogueBox from '../../components/GuideDialogueBox';   
import NandoCharacter from '../../assets/images/characters/vocabulary/Village_Quest_NPC_1.png';
import WordMatchingBg from '../../assets/images/environments/Vocabulary/village-bg.png';
import './styles/WordMatchingPage.css';

const wordMatchingData = [
  { id: 1, word: 'House', definition: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean commodo ligula eget dolor.' },
  { id: 2, word: 'Equipment', definition: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean commodo ligula eget dolor.' },
  { id: 3, word: 'River', definition: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean commodo ligula eget dolor.' },
  { id: 4, word: 'Human', definition: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean commodo ligula eget dolor.' },
  { id: 5, word: 'Animal', definition: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean commodo ligula eget dolor.' }
];

const WordMatchingPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const npcId = location.state?.npcId || 'nando';

  const [selectedWord, setSelectedWord] = useState(null);
  const [selectedDefinition, setSelectedDefinition] = useState(null);
  const [matches, setMatches] = useState([]);
  const [feedback, setFeedback] = useState(null);
  const [progress, setProgress] = useState(0);
  const [completedWords, setCompletedWords] = useState([]);
  const [showHint, setShowHint] = useState(true);

  useEffect(() => {
    const newProgress = Math.round((matches.length / wordMatchingData.length) * 100);
    setProgress(newProgress);
  }, [matches]);

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
      setFeedback({ type: 'success', message: 'Correct! Great job!' });
      setSelectedWord(null);
      setSelectedDefinition(null);

      if (matches.length === 0) {
        setShowHint(false);
      }
    } else {
      setFeedback({ type: 'error', message: 'Not quite right. Try again!' });
    }
  };

  const handleBack = () => {
    navigate('/student/village');
  };

  const handleComplete = () => {
    navigate('/student/village', { state: { completed: true } });
  };

  const isComplete = matches.length === wordMatchingData.length;

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

      <div className="matching-content">
        
        {/* ◀ LEFT SIDE — Nando + GuideDialogueBox + Submit */}
        <div className="guide-character-panel">

          <NPCCharacter 
            characterImage={NandoCharacter}
            variant="matching"
            alt="Nando"
          />

          <GuideDialogueBox
            name="Nando"
            text={
              showHint && matches.length === 0
                ? "Click on a word, then click on its matching definition!"
                : isComplete
                ? "Excellent work! You've matched all the words correctly!"
                : "Keep going! You're doing great!"
            }
          />

          <button 
            className="submit-button"
            onClick={isComplete ? handleComplete : handleSubmit}
          >
            {isComplete ? 'Complete' : 'Submit'}
          </button>
        </div>

        {/* Middle — Words */}
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

        {/* Right — Definitions */}
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
