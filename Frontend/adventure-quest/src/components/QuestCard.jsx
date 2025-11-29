import React from 'react';
import Button from '../components/Button';
import ProgressBar from '../components/ProgressBar';
import cardBackground from '../assets/images/cards.png';
import '../components/styles/QuestCard.css';

const QuestCard = ({ quest, onStartQuest }) => {
  return (
    <div className="quest-card" style={{ backgroundImage: `url(${cardBackground})` }}>
      <div className="quest-card-content">
        <div className="quest-image-container">
          <img 
            src={quest.image} 
            alt={quest.title}
            className="quest-image"
          />
          <div className="quest-image-overlay">
            <h3 className="quest-title">{quest.title}</h3>
            <p className="quest-subtitle">{quest.subtitle}</p>
          </div>
        </div>
        
        <p className="quest-description">{quest.description}</p>
        <p className="progress-label">Progress</p>
        
        <div className="quest-progress">
          <ProgressBar progress={quest.progress} />
        </div>
        
        <div className="quest-footer">
          <Button className= "btnQuestStart"onClick={() => onStartQuest(quest.id)} variant="primary">
            Start Quest
          </Button>
        </div>
      </div>
    </div>
  );
};

export default QuestCard;