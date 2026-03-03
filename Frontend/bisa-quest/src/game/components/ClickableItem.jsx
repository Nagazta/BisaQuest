import { useState, useCallback, useEffect } from "react";
import CleaningAnimation from "./CleaningAnimation";
import "./ClickableItem.css";

const ClickableItem = ({ item, onClick, locked }) => {
  const [state,    setState]    = useState("idle");
  const [showAnim, setShowAnim] = useState(false);

  useEffect(() => {
    if (locked) {
      setState("correct");
      setShowAnim(true);
    }
  }, [locked]);

  const handleClick = useCallback(() => {
    if (state === "correct" || locked) return;

    if (item.isCorrect) {
      setState("correct");
      setShowAnim(true);
      onClick(item, true);
    } else {
      setState("wrong");
      onClick(item, false);
      setTimeout(() => setState("idle"), 650);
    }
  }, [state, locked, item, onClick]);

  return (
    <div
      className={`ci-card ci-card--${state}`}
      onClick={handleClick}
      role="button"
      tabIndex={state === "correct" ? -1 : 0}
      onKeyDown={e => e.key === "Enter" && handleClick()}
      aria-label={item.label}
      aria-pressed={state === "correct"}
    >
      <span className="ci-label">{item.label}</span>

      {state === "correct" && (
        <>
          {showAnim && <CleaningAnimation onDone={() => setShowAnim(false)} />}
          <div className="ci-check">✓</div>
        </>
      )}
    </div>
  );
};

export default ClickableItem;