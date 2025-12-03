import React from "react";
import "./styles/StudentCard.css";

const StudentCard = ({ student }) => {
  const quests = [
    { name: "Vocabulary Quest", progress: student.vocab_progress || 0 },
    { name: "Compound Quest", progress: student.compound_progress || 0 },
    {
      name: "Synonyms & Antonym Quest",
      progress: student.synonym_progress || 0,
    },
    {
      name: "Integrated Narrative Quest",
      progress: student.narrative_progress || 0,
    },
  ];

  return (
    <div className="student-card">
      <div className="student-avatar"></div>
      <h3>{student.fullname}</h3>
      <p className="overall-progress">
        Overall: {student.overall_progress || 0}%
      </p>

      <div className="quest-progress">
        {quests.map((quest, idx) => (
          <div key={idx} className="quest-item">
            <span>{quest.name}</span>
            <span>{quest.progress}%</span>
          </div>
        ))}
      </div>

      <div className="card-actions">
        <button className="view-btn">View</button>
        <div className="last-activity">Last Activity: Vocabulary Quest</div>
      </div>
    </div>
  );
};

export default StudentCard;
