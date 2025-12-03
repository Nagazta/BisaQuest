import Button from "./Button";
import Card from '../assets/images/cards.png';
import '../components/styles/CharacterCard.css';

const CharacterCard = ({ character, isSelected, onClick }) => {
  return (
    <Button 
      variant="character-card"
      className={`character-card ${isSelected ? 'selected' : ''}`}
      onClick={onClick}
    >
      <div className="character-frame">
        <img 
          src={Card} 
          alt="card frame"
          className="card-frame"
        />
        <img 
          src={character.image} 
          alt={character.gender}
          className="character-image"
        />
      </div>
    </Button>
  );
};

export default CharacterCard;