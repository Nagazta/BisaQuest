// ─────────────────────────────────────────────────────────────────────────────
//  FogTransition.jsx  —  Realistic left-to-right fog wipe
//
//  Usage:
//    <FogTransition active={fogActive} onDone={() => navigate("/student/forest")} />
//
//  Props:
//    active   {boolean}  — triggers the animation when true
//    onDone   {fn}       — called when fog fully covers screen (~900ms)
//                          put your navigate() call here
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useRef } from "react";
import "./FogTransition.css";

const FogTransition = ({ active, onDone }) => {
  const calledRef = useRef(false);

  useEffect(() => {
    if (!active) { calledRef.current = false; return; }

    // Navigate at the midpoint — screen is fully white/foggy by ~900ms
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

      {/* Base fill — locks the screen white at the end */}
      <div className="fog-base" />

      {/* Six wisp layers at different speeds, heights, blurs */}
      <div className="fog-wisp fog-wisp--1" />
      <div className="fog-wisp fog-wisp--2" />
      <div className="fog-wisp fog-wisp--3" />
      <div className="fog-wisp fog-wisp--4" />
      <div className="fog-wisp fog-wisp--5" />
      <div className="fog-wisp fog-wisp--6" />

      {/* Tiny floating particles drifting through the mist */}
      <div className="fog-particle fog-particle--1" />
      <div className="fog-particle fog-particle--2" />
      <div className="fog-particle fog-particle--3" />
      <div className="fog-particle fog-particle--4" />
      <div className="fog-particle fog-particle--5" />

      {/* Text shown once fog covers the screen */}
      <div className="fog-center-text">🌲 Entering the Forest...</div>
    </div>
  );
};

export default FogTransition;