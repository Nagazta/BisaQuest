import { useNavigate } from 'react-router-dom';
import EnvironmentPage from '../../components/EnvironmentPage';
import Button from '../../components/Button';

// Import your images - adjust these paths to match your project structure
import VillageBackground from '../../assets/images/environments/village.png';
import NandoCharacter from '../../assets/images/characters/vocabulary/Village_Quest_NPC_1.png';
import LigayaCharacter from '../../assets/images/characters/vocabulary/Village_Quest_NPC_2.png';
import VicenteCharacter from '../../assets/images/characters/vocabulary/Village_Quest_NPC_3.png';
import PlayerCharacter from '../../assets/images/characters/Boy.png';

import './styles/VillagePage.css'

const VillagePage = () => {
  const navigate = useNavigate();

  const villageNPCs = [
    {
      character: NandoCharacter,
      name: "Nando",
      x: 50, // Center horizontally
      y: 35, // Upper area
      showName: true,
      npcId: 'nando'
    },
    {
      character: LigayaCharacter,
      name: "Ligaya",
      x: 70, // Right side
      y: 45, // Middle height
      showName: true,
      npcId: 'ligaya'
    },
    {
      character: VicenteCharacter,
      name: "Vicente",
      x: 20, // Left side
      y: 60, // Lower middle
      showName: true,
      npcId: 'vicente'
    }
  ];

  const handleNPCClick = (npc, index) => {
    // Get the npcId from the NPC object
    const npcId = villageNPCs[index].npcId;
    
    console.log(`Clicked on ${npc.name} (${npcId})`);
    
    navigate('/student/instructions', { 
      state: { 
        npcId: npcId,
        returnTo: '/student/village' 
      } 
    });
  };

  const handleBackClick = () => {
    navigate('/dashboard');
  };

  return (
    <div className="village-page-wrapper">
      {/* Back Button overlay */}
      <Button 
        variant="back" 
        className="back-button-village-overlay" 
        onClick={handleBackClick}
      >
        ← Back
      </Button>

      {/* Environment Page with all NPCs and player movement */}
      <EnvironmentPage
        environmentType="village"
        backgroundImage={VillageBackground}
        npcs={villageNPCs}
        onNPCClick={handleNPCClick}
        playerCharacter={PlayerCharacter}
      />
    </div>
  );
};

export default VillagePage;