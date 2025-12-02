import Button from "./Button";

const CharacterCard = ({ character, isSelected, onClick }) => {
  return (
    <Button 
      variant="character-card"
      className={`character-card ${isSelected ? 'selected' : ''}`}
      onClick={onClick}
    >
      <div className="character-frame">
        <img 
          src={character.image} 
          alt={character.gender}
          className="character-image"
        />
        <img 
          src="/assets/images/.cards.png" 
          alt="card frame"
          className="card-frame"
        />
      </div>
    </Button>
  );
};

export default CharacterCard;