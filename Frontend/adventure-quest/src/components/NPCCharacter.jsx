import '../components/styles/NPCCharacter.css';
import Oldman from '../assets/images/characters/oldman.png'

const NPCCharacter = ({ characterImage }) => {
  return (
    <div className="npc-character-container">
      <img 
        src={Oldman} 
        alt="The Guide"
        className="npc-character-image"
      />
    </div>
  );
};

export default NPCCharacter;