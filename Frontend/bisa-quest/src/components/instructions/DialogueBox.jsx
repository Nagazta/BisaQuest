import Button from "../Button";
import Arrow from "../../assets/images/signs/arrow.png";
import "./DialogueBox.css";

/**
 * DialogueBox — reusable full-width bottom bar.
 *
 * Props:
 *   title          — speaker name shown in the left panel
 *   text           — dialogue text in the center
 *   isNarration    — true → italic narration style, no speaker panel
 *   isPlayer       — true → player response style (right-aligned, teal panel)
 *   language       — "en" | "ceb"
 *   onNext         — arrow button callback
 *   showNextButton — show the arrow (default true)
 *   rightSlot      — optional JSX on the right instead of arrow
 */
const DialogueBox = ({
  title = "The Guide",
  text,
  isNarration = false,
  isPlayer = false,
  language = "en",
  onNext,
  showNextButton = true,
  rightSlot = null,
}) => {
  const boxClass = [
    "dialogue-box",
    isNarration ? "dialogue-box--narration" : "",
    isPlayer    ? "dialogue-box--player"    : "",
  ].filter(Boolean).join(" ");

  return (
    <div className={boxClass}>

      {/* Left panel — hidden for narration; right-side for player */}
      {!isNarration && (
        <div className={`dialogue-header ${isPlayer ? "dialogue-header--player" : ""}`}>
          <h3 className="dialogue-title">{title}</h3>
        </div>
      )}

      {/* Center — dialogue text */}
      <div className="dialogue-content">
        <p className={[
          "dialogue-text",
          language,
          isNarration ? "dialogue-text--narration" : "",
          isPlayer    ? "dialogue-text--player"    : "",
        ].filter(Boolean).join(" ")}>
          {isNarration ? `✦ ${text} ✦` : text}
        </p>
      </div>

      {/* Right — custom slot OR arrow */}
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