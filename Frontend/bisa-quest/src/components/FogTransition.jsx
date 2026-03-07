// ─────────────────────────────────────────────────────────────────────────────
//  FogTransition.jsx  —  Realistic left-to-right fog wipe
//
//  Props:
//    active   {boolean}   — triggers the animation when true
//    onDone   {fn}        — called at ~900ms midpoint (put navigate() here)
//    label    {string}    — text shown when fog covers screen (optional)
//                          defaults to nothing if not passed
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useRef } from "react";
import "./FogTransition.css";

const FogTransition = ({ active, onDone, label }) => {
  const calledRef = useRef(false);

  useEffect(() => {
    if (!active) { calledRef.current = false; return; }

    const timer = setTimeout(() => {
      if (!calledRef.current) {
        calledRef.current = true;
        onDone?.();
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [active, onDone]);

  if (!active) return null;

  return (
    <div className="fog-transition" aria-hidden="true">

      <div className="fog-base" />

      <div className="fog-wisp fog-wisp--1" />
      <div className="fog-wisp fog-wisp--2" />
      <div className="fog-wisp fog-wisp--3" />
      <div className="fog-wisp fog-wisp--4" />
      <div className="fog-wisp fog-wisp--5" />
      <div className="fog-wisp fog-wisp--6" />

      <div className="fog-particle fog-particle--1" />
      <div className="fog-particle fog-particle--2" />
      <div className="fog-particle fog-particle--3" />
      <div className="fog-particle fog-particle--4" />
      <div className="fog-particle fog-particle--5" />

      {/* Only render text if label is provided */}
      {label && <div className="fog-center-text">{label}</div>}
    </div>
  );
};

export default FogTransition;