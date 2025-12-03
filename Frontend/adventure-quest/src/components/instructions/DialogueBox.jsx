import DialogueText from '../instructions/DialogueText';
import NextArrowButton from '../instructions/NextArrowButton';
import '../instructions/styles/DialogueBox.css';

const DialogueBox = ({ 
  title = "The Guide", 
  text, 
  language = 'en',
  onNext,
  showNextButton = true,
  arrowImage 
}) => {
  return (
    <div className="dialogue-box">
      <div className="dialogue-header">
        <h3 className="dialogue-title">{title}</h3>
      </div>
      <div className="dialogue-content">
        <DialogueText text={text} language={language} />
      </div>
      {showNextButton && (
        <NextArrowButton 
          onClick={onNext} 
          arrowImage={arrowImage}
        />
      )}
    </div>
  );
};

export default DialogueBox;