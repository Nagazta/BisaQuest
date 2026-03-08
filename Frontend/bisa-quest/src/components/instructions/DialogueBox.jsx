import { useRef, useEffect, useLayoutEffect, useCallback, useState } from "react";
import Button from "../Button";
import Arrow from "../../assets/images/signs/arrow.png";
import { ITEM_IMAGE_MAP } from "../../game/dragDropConstants";
import "./DialogueBox.css";

/**
 * DialogueBox — reusable full-width bottom bar.
 *
 * Props:
 *   title, text, isNarration, isPlayer, language, onNext, showNextButton,
 *   rightSlot, introItem
 *
 * Scroll behaviour:
 *   - If text fits in the box → arrow is active, click advances dialogue.
 *   - If text overflows → box expands upward, player scrolls manually.
 *     Arrow is greyed and disabled until they reach the bottom, then
 *     it lights up and clicking it advances to the next dialogue line.
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
  introItems = null, // Support for multiple items
}) => {
  const contentRef = useRef(null);

  const [hasOverflow, setHasOverflow] = useState(false);
  const [atBottom, setAtBottom] = useState(true);   // true = arrow active
  const [displayText, setDisplayText] = useState(text);

  // ── Reset on new text ────────────────────────────────────────────────────
  useEffect(() => {
    setDisplayText(text);
  }, [text]);

  // ── Detect overflow after paint ──────────────────────────────────────────
  useLayoutEffect(() => {
    const el = contentRef.current;
    if (!el) return;

    el.scrollTop = 0;

    const overflow = el.scrollHeight > el.clientHeight + 20;
    setHasOverflow(overflow);
    // If no overflow the arrow is immediately active; if overflow, lock it
    setAtBottom(!overflow);
  }, [displayText]);

  // ── Track manual scroll → unlock arrow when at bottom ───────────────────
  const handleScroll = useCallback(() => {
    const el = contentRef.current;
    if (!el) return;
    const remaining = el.scrollHeight - el.scrollTop - el.clientHeight;
    setAtBottom(remaining <= 20);
  }, []);

  // ── Arrow click — only fires when unlocked ───────────────────────────────
  const handleArrowClick = useCallback(() => {
    if (!atBottom) return;   // locked — player hasn't scrolled yet
    onNext?.();
  }, [atBottom, onNext]);

  // ── CSS classes ──────────────────────────────────────────────────────────
  const boxClass = [
    "dialogue-box",
    isNarration ? "dialogue-box--narration" : "",
    isPlayer ? "dialogue-box--player" : "",
    hasOverflow ? "dialogue-box--expanded" : "",
  ].filter(Boolean).join(" ");

  const arrowClass = [
    "next-arrow-btn",
    !atBottom ? "next-arrow-btn--locked" : "",
  ].filter(Boolean).join(" ");

  return (
    <>
      {/* ── Item intro card(s) ── */}
      {(introItems || (introItem ? [introItem] : null)) && (
        <div className="dialogue-intro-wrap">
          {(introItems || [introItem]).map((item, idx) => {
            const rawKey = item.imageKey || "";
            const normKey = rawKey.trim().toLowerCase();
            const labelKey = (item.label || "").trim().toLowerCase().split(/[\s/,]+/)[0];
            const resolvedImg =
              ITEM_IMAGE_MAP?.[normKey] ||
              ITEM_IMAGE_MAP?.[rawKey] ||
              ITEM_IMAGE_MAP?.[labelKey] ||
              null;

            if (item.imageKey && !resolvedImg) {
              console.warn(`[DialogueBox] introItem imageKey "${item.imageKey}" not found in ITEM_IMAGE_MAP`);
            }

            return (
              <div key={item.id || idx} className="dialogue-intro-card">
                <div className="dialogue-intro-sparkles">✨</div>
                {resolvedImg
                  ? <img src={resolvedImg} alt={item.label} className="dialogue-intro-img" draggable={false} />
                  : <div className="dialogue-intro-emoji">🖼️</div>
                }
                <h3 className="dialogue-intro-label">{item.label}</h3>
                <div className="dialogue-intro-sparkles">✨</div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Main dialogue bar ── */}
      <div className={boxClass}>

        {/* Left panel — hidden for narration */}
        {!isNarration && (
          <div className={`dialogue-header ${isPlayer ? "dialogue-header--player" : ""}`}>
            <h3 className="dialogue-title">{title}</h3>
          </div>
        )}

        {/* Center — scrollable dialogue text */}
        <div
          key={displayText}
          className={`dialogue-content${hasOverflow ? " dialogue-content--overflow" : ""}`}
          ref={contentRef}
          onScroll={hasOverflow ? handleScroll : undefined}
        >
          <p className={[
            "dialogue-text",
            language,
            isNarration ? "dialogue-text--narration" : "",
            isPlayer ? "dialogue-text--player" : "",
          ].filter(Boolean).join(" ")}>
            {isNarration ? `✦ ${displayText} ✦` : displayText}
          </p>

          {/* Scroll-hint fade at bottom when locked */}
          {hasOverflow && !atBottom && (
            <div className="dialogue-scroll-hint" aria-hidden="true">
              ▼ scroll
            </div>
          )}
        </div>

        {/* Right — custom slot OR arrow */}
        {rightSlot ? (
          <div style={{ flexShrink: 0, marginRight: 24 }}>
            {rightSlot}
          </div>
        ) : showNextButton ? (
          <Button
            variant="arrow"
            className={arrowClass}
            onClick={handleArrowClick}
            disabled={!atBottom}
            title={!atBottom ? "Scroll down to continue" : "Next"}
          >
            <img src={Arrow} alt="Next" className="arrow-icon" />
          </Button>
        ) : null}

      </div>
    </>
  );
};

export default DialogueBox;