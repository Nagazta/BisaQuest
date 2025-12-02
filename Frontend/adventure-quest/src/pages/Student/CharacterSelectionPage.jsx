
import React, { useState } from 'react';
import Button from '../../components/Button';
import QuestTitle from '../../components/QuestTitle'
import CharacterCard from '../../components/CharacterCard'
import UserProfileHeader from '../../components/UserProfileHeader'
import Boy from '../../assets/images/characters/Boy.png'
import '../../pages/Student/styles/CharacterSelectionPage.css';


const CharacterSelectionPage = () => {
  const [selectedCharacter, setSelectedCharacter] = useState(null);

  const characters = [
    { 
      id: 'male', 
      gender: 'Male', 
      image: <Boy/> 
    },
    { 
      id: 'female', 
      gender: 'Female', 
      image: '/assets/images/characters/Girl.png' 
    }
  ];

  const handleMenuClick = () => {
    console.log('Menu clicked');
    // Add menu modal logic here
  };

  const handleCharacterSelect = (characterId) => {
    setSelectedCharacter(characterId);
  };

  const handleProceed = (gender) => {
    console.log(`Selected ${gender} character, proceeding to quest...`);
    // Add navigation logic here
  };

  return (
    <div className="character-selection-container">
      <div className="decorative-clouds">
        <div className="cloud cloud-1"></div>
        <div className="cloud cloud-2"></div>
        <div className="cloud cloud-3"></div>
      </div>

      <div className="main-content">
        <div className="header">
          <Button variant="menu" onClick={handleMenuClick}>
            Menu
          </Button>
          <QuestTitle questName="Vocabulary Quest Village Theme" />
          <UserProfileHeader 
            userName="Juan Dela Cruz" 
            profilePicture={null}
          />
        </div>

        <div className="selection-content">
          <h2 className="selection-prompt">Please Choose a character</h2>
          
          <div className="characters-container">
            {characters.map((character) => (
              <div key={character.id} className="character-option">
                <CharacterCard 
                  character={character}
                  isSelected={selectedCharacter === character.id}
                  onClick={() => handleCharacterSelect(character.id)}
                />
                <Button 
                  variant="character-select"
                  onClick={() => handleProceed(character.gender)}
                >
                  {character.gender}
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CharacterSelectionPage;