import Button from "../Button";
import Arrow from "../../assets/images/signs/arrow.png";
import "./styles/DialogueBox.css";

const DialogueBox = ({
  title = "The Guide",
  text,
  language = "en",
  onNext,
  showNextButton = true,
}) => {
  return (
    <div className="dialogue-box">
      <div className="dialogue-header">
        <h3 className="dialogue-title">{title}</h3>
      </div>
      <div className="dialogue-content">
        <p className={`dialogue-text ${language}`}>{text}</p>
      </div>
      {showNextButton && (
        <Button variant="arrow" className="next-arrow-btn" onClick={onNext}>
          <img src={Arrow} alt="Next" className="arrow-icon" />
        </Button>
      )}
    </div>
  );
};

export default DialogueBox;
