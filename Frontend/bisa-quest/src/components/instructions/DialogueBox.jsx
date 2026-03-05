import Button from "../Button";
import Arrow from "../../assets/images/signs/arrow.png";
import "./DialogueBox.css";

/**
 * DialogueBox — reusable full-width bottom bar.
 *
 * Used by HousePage, DragAndDrop, ForestScenePage, and any
 * future scene page. No per-page CSS needed.
 *
 * Props:
 *   title          — speaker name in the left dark panel
 *   text           — dialogue text in the center
 *   language       — "en" | "ceb" (added as className on text)
 *   onNext         — callback for the arrow button
 *   showNextButton — show the arrow button (default true)
 *   rightSlot      — optional JSX rendered on the right instead
 *                    of the arrow (e.g. Yes / No buttons)
 */
const DialogueBox = ({
  title = "The Guide",
  text,
  language = "en",
  onNext,
  showNextButton = true,
  rightSlot = null,
}) => {
  return (
    <div className="dialogue-box">

      {/* Left panel — speaker name */}
      <div className="dialogue-header">
        <h3 className="dialogue-title">{title}</h3>
      </div>

      {/* Center — dialogue text */}
      <div className="dialogue-content">
        <p className={`dialogue-text ${language}`}>{text}</p>
      </div>

      {/* Right — custom slot OR arrow button */}
      {rightSlot ? (
        <div style={{ flexShrink: 0, marginRight: 24 }}>
          {rightSlot}
        </div>
      ) : showNextButton ? (
        <Button variant="arrow" className="next-arrow-btn" onClick={onNext}>
          <img src={Arrow} alt="Next" className="arrow-icon" />
        </Button>
      ) : null}

    </div>
  );
};

export default DialogueBox;