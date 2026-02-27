// ─────────────────────────────────────────────────────────────────────────────
//  components/CleaningAnimation.jsx
//  Sparkle / dust burst that plays over a correctly clicked item.
//  Pure CSS animation — no external library needed.
//  Auto-removes itself after the animation completes.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useState } from "react";
import "./CleaningAnimation.css";

// Generates N sparkle particles at random angles/distances from center
const generateParticles = (count = 8) =>
  Array.from({ length: count }, (_, i) => ({
    id:     i,
    angle:  (360 / count) * i + Math.random() * 20 - 10,  // spread evenly + slight random offset
    dist:   28 + Math.random() * 18,                        // 28–46 px from center
    size:   4  + Math.random() * 5,                         // 4–9 px
    delay:  Math.random() * 80,                             // 0–80 ms stagger
    color:  ["#ffe066", "#ff9de2", "#a0f0a0", "#7ecfff", "#ffb347"][i % 5],
  }));

const CleaningAnimation = ({ onDone }) => {
  const [particles] = useState(() => generateParticles(10));

  // Call onDone after animation so parent can clean up
  useEffect(() => {
    const t = setTimeout(onDone, 700);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div className="ca-root" aria-hidden="true">
      {/* Central burst star */}
      <div className="ca-star">✦</div>

      {/* Sparkle particles */}
      {particles.map(p => (
        <div
          key={p.id}
          className="ca-particle"
          style={{
            width:           p.size,
            height:          p.size,
            background:      p.color,
            animationDelay:  `${p.delay}ms`,
            "--angle":       `${p.angle}deg`,
            "--dist":        `${p.dist}px`,
          }}
        />
      ))}
    </div>
  );
};

export default CleaningAnimation;