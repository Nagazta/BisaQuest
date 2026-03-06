import Button from "../Button";
import Arrow from "../../assets/images/signs/arrow.png";
import { ITEM_IMAGE_MAP } from "../../game/dragDropConstants";
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
 *   introItem      — { label, imageKey } — if provided, floats an item card
 *                    above the dialogue bar while this row is active
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
  introItem = null,
}) => {
  const boxClass = [
    "dialogue-box",
    isNarration ? "dialogue-box--narration" : "",
    isPlayer    ? "dialogue-box--player"    : "",
  ].filter(Boolean).join(" ");

  return (
    <>
      {/* ── Item intro card — floats above the bar when introItem is set ── */}
      {introItem && (() => {
        // Normalise the imageKey: lowercase + trim so DB values like "Walis" or "BROOM "
        // still resolve against ITEM_IMAGE_MAP keys like "walis" / "broom"
        const rawKey     = introItem.imageKey || "";
        const normKey    = rawKey.trim().toLowerCase();
        // Also try the label itself as a fallback key (e.g. label="Walis" → key="walis")
        const labelKey   = (introItem.label || "").trim().toLowerCase().split(/[\s/,]+/)[0];
        const resolvedImg =
          ITEM_IMAGE_MAP?.[normKey]  ||
          ITEM_IMAGE_MAP?.[rawKey]   ||
          ITEM_IMAGE_MAP?.[labelKey] ||
          null;

        // Dev hint — remove after confirming images show correctly
        if (introItem.imageKey && !resolvedImg) {
          console.warn(
            `[DialogueBox] introItem imageKey "${introItem.imageKey}" (normalised: "${normKey}") ` +
            `not found in ITEM_IMAGE_MAP. Available keys:`,
            Object.keys(ITEM_IMAGE_MAP)
          );
        }

        return (
          <div className="dialogue-intro-wrap">
            <div className="dialogue-intro-card">
              <div className="dialogue-intro-sparkles">✨</div>
              {resolvedImg
                ? <img
                    src={resolvedImg}
                    alt={introItem.label}
                    className="dialogue-intro-img"
                    draggable={false}
                  />
                : <div className="dialogue-intro-emoji">🖼️</div>
              }
              <h3 className="dialogue-intro-label">{introItem.label}</h3>
              <div className="dialogue-intro-sparkles">✨</div>
            </div>
          </div>
        );
      })()}

      {/* ── Main bar ─────────────────────────────────────────────────────── */}
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
    </>
  );
};

export default DialogueBox;