import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/Button';
import CharacterCard from '../../components/CharacterCard'
import Boy from '../../assets/images/characters/Boy.png'
import Girl from '../../assets/images/characters/Girl.png'    
import '../../pages/Student/styles/CharacterSelectionPage.css';


const CharacterSelectionPage = () => {
  const navigate = useNavigate();
  const [selectedCharacter, setSelectedCharacter] = useState(null);

  const characters = [
    { 
      id: 'male', 
      gender: 'Roberto', 
      image: Boy 
    },
    { 
      id: 'female', 
      gender: 'Roberta', 
      image: Girl 
    }
  ];

  const handleBack = () => {
    navigate("/dashboard"); 
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
        <Button 
          variant="back" 
          className="back-button"
          onClick={handleBack}
        >
          ← Back
        </Button>

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