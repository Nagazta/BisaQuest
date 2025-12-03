import '../components/styles/NPCCharacter.css';
import Oldman from '../assets/images/characters/oldman.png';

const NPCCharacter = ({ characterImage, variant = 'default', alt = 'Character' }) => {
  return (
    <div className={`npc-character-container ${variant}`}>
      <img 
        src={characterImage || Oldman} 
        alt={alt}
        className="npc-character-image"
      />
    </div>
  );
};

export default NPCCharacter;