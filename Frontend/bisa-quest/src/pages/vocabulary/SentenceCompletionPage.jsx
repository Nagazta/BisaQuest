import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

import ProgressBar from '../../components/ProgressBar';
import Button from '../../components/Button';
import FeedbackNotification from '../../components/FeedbackNotification';
import GuideDialogueBox from '../../components/GuideDialogueBox';

import VicenteCharacter from '../../assets/images/characters/vocabulary/Village_Quest_NPC_3.png';

import './styles/SentenceCompletionPage.css'

const SENTENCE_DATA = [
  {
    id: 1,
    sentence: "The food is very important. We see the [___] everyday",
    correctAnswer: "sun",
    choices: ["sun", "water", "air"],
  },
  {
    id: 2,
    sentence: "I need to buy some fresh vegetables from the [___].",
    correctAnswer: "market",
    choices: ["mountain", "market", "ocean"],
  },
  {
    id: 3,
    sentence: "The merchant packed his goods for the long [___].",
    correctAnswer: "journey",
    choices: ["house", "journey", "desk"],
  }
];

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

  const returnTo = location.state?.returnTo || "/student/quest";

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [selectedChoice, setSelectedChoice] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);

  const currentItem = SENTENCE_DATA[currentQuestionIndex];
  const totalQuestions = SENTENCE_DATA.length;
  const isComplete = currentQuestionIndex >= totalQuestions;

  useEffect(() => {
    const newProgress = Math.round((currentQuestionIndex / totalQuestions) * 100);
    setProgress(newProgress);
  }, [currentQuestionIndex, totalQuestions]);

  useEffect(() => {
    if (feedback) {
      const timer = setTimeout(() => setFeedback(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [feedback]);

  const handleBack = () => {
    navigate(returnTo);
  };

  const handleChoiceClick = (choice) => {
    if (!isSubmitted) {
      setSelectedChoice(choice);
      setFeedback(null);
    }
  };

  const handleSubmit = () => {
    if (isComplete) {
      navigate(returnTo, { state: { completed: true, npcId: "vicente" } });
      return;
    }

    if (!selectedChoice) {
      setFeedback({ type: "warning", message: "Please select an answer choice first!" });
      return;
    }

    setIsSubmitted(true);

    if (selectedChoice === currentItem.correctAnswer) {
      setCorrectCount((count) => count + 1);
      setFeedback({ type: "success", message: "Correct! Great job!" });

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
        message: `Incorrect. The correct answer was **${currentItem.correctAnswer}**.`
      });
      setIsSubmitted(false);
    }
  };


  return (
    <div className="quiz-page-container">

      <Button variant="back" className="back-button-quiz" onClick={handleBack}>
        ← Back
      </Button>

      <ProgressBar
        progress={isComplete ? 100 : progress}
        variant="instruction"
        showLabel={true}
      />

      <div className="association-content">

        {/* LEFT PANEL — Character + Dialogue + Submit */}
        <div className="left-panel-quiz">

          <img
            src={VicenteCharacter}
            alt="Vicente"
            className="guide-character-img"
          />

          <Button
            className="submit-button-quiz"
            onClick={handleSubmit}
            disabled={!selectedChoice && !isComplete}
          >
            {isComplete ? "Complete" : "Submit"}
          </Button>

          <GuideDialogueBox
            name="Vicente"
            text={
              isComplete
                ? `You've mastered these words! Final Score: ${correctCount}/${totalQuestions}`
                : "A merchant needs to be clear with words. Complete the sentence below!"
            }
          />

        </div>


        {/* RIGHT PANEL — Question */}
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

      <FeedbackNotification type={feedback?.type} message={feedback?.message} />

    </div>
  );
};

export default SentenceCompletionPage;
