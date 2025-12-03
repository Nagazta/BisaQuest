import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import EnvironmentPage from '../../components/EnvironmentPage';

// Import your images - adjust these paths to match your project structure
import VillageBackground from '../../assets/images/environments/village.png';
import VillageNPC1 from '../../assets/images/characters/vocabulary/Village_Quest_NPC_1.png';
import VillageNPC2 from '../../assets/images/characters/vocabulary/Village_Quest_NPC_2.png';
import VillageNPC3 from '../../assets/images/characters/vocabulary/Village_Quest_NPC_3.png';
import PlayerCharacter from '../../assets/images/characters/Boy.png';

const VillagePage = () => {
  const navigate = useNavigate();

  // Position NPCs around the village map (adjust x, y percentages based on your background)
  const villageNPCs = [
    {
      character: VillageNPC1,
      name: "Village Elder",
      x: 50, // Center horizontally
      y: 30, // Near the top
      showName: true,
      dialogues: [
        "Welcome, young learner! I am the village elder, and I'm delighted to guide you through our beautiful village today.",
        "Our village is a place of learning and discovery. Here, you'll meet friendly villagers who will help you master new skills and vocabulary.",
        "Click on the other villagers to start their challenges!"
      ]
    },
    {
      character: VillageNPC2,
      name: "Village Farmer",
      x: 70, // Right side
      y: 50, // Middle height
      showName: true,
      dialogues: [
        "Hello there! I'm the village farmer. I tend to the crops and animals around here.",
        "Would you like to help me with some tasks? I have vocabulary challenges about nature and farming!",
        "Complete my challenges to earn rewards and progress through the village."
      ]
    },
    {
      character: VillageNPC3,
      name: "Village Merchant",
      x: 20, // Left side
      y: 60, // Lower middle
      showName: true,
      dialogues: [
        "Greetings! I'm the village merchant. I travel far and wide to bring goods to our village.",
        "I have exciting vocabulary challenges about trading, items, and adventures!",
        "Good luck on your learning journey!"
      ]
    }
  ];

  const handleNPCClick = (npc, index) => {
    console.log(`Clicked on ${npc.name}`);
    // You can navigate to specific challenge pages here
    // navigate(`/village/challenge/${index}`);
  };

  return (
    <EnvironmentPage
      environmentType="village"
      backgroundImage={VillageBackground}
      npcs={villageNPCs}
      onNPCClick={handleNPCClick}
      playerCharacter={PlayerCharacter}
    />
  );
};

export default VillagePage;