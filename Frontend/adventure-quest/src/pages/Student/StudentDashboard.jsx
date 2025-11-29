import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SidebarNavigation from '../../components/SidebarNavigation';
import QuestCard from '../../components/QuestCard';
import Village from '../../assets/images/cardsImage/village.png'
import Forest from '../../assets/images/cardsImage/forest.png'
import Kingdom from '../../assets/images/cardsImage/kingdom.png'
import Throne from '../../assets/images/cardsImage/throne.png'
import '../Student/styles/StudentDashboard.css';


const StudentDashboard = () => {
  const [user] = useState({ name: 'Juan Dela Cruz' });
  const navigate = useNavigate();
  const handleLogout = () => {
  navigate("/login");   
};

  const quests = [
    {
      id: 1,
      title: 'Vocabulary Quest',
      subtitle: 'Village Theme',
      description: 'Explore the village and learn new words',
      progress: 45,
      image: Village
    },
    {
      id: 2,
      title: 'Synonyms & Antonyms Quest',
      subtitle: 'Forest Theme',
      description: 'Journey through the magical forest',
      progress: 30,
      image: Forest
    },
    {
      id: 3,
      title: 'Compound Quest',
      subtitle: 'Castle Theme',
      description: 'Master word Building in the Castle',
      progress: 60,
      image: Kingdom
    },
    {
      id: 4,
      title: 'Narrative Problem Solving Quest',
      subtitle: 'Kingdom Theme',
      description: 'Apply your skills in the Kingdom',
      progress: 15,
      image: Throne
    }
  ];
  
  const handleStartQuest = (questId) => {
    console.log(`Starting quest ${questId}`);
    alert(`Starting Quest ${questId}!`);
  };
  

  
  return (
    <div className="dashboard-container">
      <SidebarNavigation onLogout={handleLogout} />
      
      <div className="main-content">
        <div className="quests-grid">
          {quests.map(quest => (
            <QuestCard 
              key={quest.id} 
              quest={quest} 
              onStartQuest={handleStartQuest}
            />
          ))}
        </div>
        
        <div className="decorative-clouds">
          <div className="cloud cloud-1"></div>
          <div className="cloud cloud-2"></div>
          <div className="cloud cloud-3"></div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;