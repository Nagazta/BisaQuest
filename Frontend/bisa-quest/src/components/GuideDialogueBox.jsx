import React from "react";
import "./GuideDialogueBox.css";

const GuideDialogueBox = ({ name = "Guide", text = "" }) => {
  return (
    <div className="guide-dialogue-box">
      <div className="dialogue-name">{name}</div>
      <div className="dialogue-text">{text}</div>
    </div>
  );
};

export default GuideDialogueBox;
