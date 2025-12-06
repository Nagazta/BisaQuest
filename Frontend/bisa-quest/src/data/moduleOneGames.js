// Character Images
import NandoCharacter from '../assets/images/characters/vocabulary/Village_Quest_NPC_1.png';
import LigayaCharacter from '../assets/images/characters/vocabulary/Village_Quest_NPC_2.png';
import VicenteCharacter from '../assets/images/characters/vocabulary/Village_Quest_NPC_3.png';

export const moduleOneGames = {
  // NANDO - Word Matching Game
  nando: {
    npcId: 'nando',
    npcName: 'Nando',
    character: NandoCharacter,
    gameType: 'word_matching',
    dialogues: {
      intro: "Welcome! Help me match these words with their definitions.",
      hint: "Click on a word, then click on its matching definition!",
      progress: "Keep going! You're doing great!",
      complete: "Excellent work! You've matched all the words correctly!",
      firstMatch: "Great! You got your first match!",
      correct: "Correct! Great job!",
      incorrect: "Not quite right. Try again!"
    },
    gameSets: [
      {
        set_id: 'nando_set_1',
        words: [
          { id: 1, word: 'House', definition: 'A building for people to live in' },
          { id: 2, word: 'Equipment', definition: 'Tools or items needed for a specific purpose' },
          { id: 3, word: 'River', definition: 'A large natural stream of water flowing in a channel' },
          { id: 4, word: 'Human', definition: 'A person or member of the species Homo sapiens' },
          { id: 5, word: 'Animal', definition: 'A living organism that feeds on organic matter' }
        ]
      },
      {
        set_id: 'nando_set_2',
        words: [
          { id: 1, word: 'Tree', definition: 'A woody perennial plant with a trunk and branches' },
          { id: 2, word: 'Mountain', definition: 'A large natural elevation of the earth surface' },
          { id: 3, word: 'Book', definition: 'A written or printed work consisting of pages' },
          { id: 4, word: 'Food', definition: 'Any nutritious substance that people eat or drink' },
          { id: 5, word: 'Water', definition: 'A colorless, transparent, odorless liquid essential for life' }
        ]
      },
      {
        set_id: 'nando_set_3',
        words: [
          { id: 1, word: 'Sky', definition: 'The region of the atmosphere seen from earth' },
          { id: 2, word: 'Stone', definition: 'A hard solid non-metallic mineral matter' },
          { id: 3, word: 'Village', definition: 'A small community in a rural area' },
          { id: 4, word: 'Garden', definition: 'A piece of ground for growing flowers or vegetables' },
          { id: 5, word: 'Bridge', definition: 'A structure carrying a road over a river or obstacle' }
        ]
      }
    ]
  },

  // LIGAYA - Word Association Game (Picture Matching)
  ligaya: {
    npcId: 'ligaya',
    npcName: 'Ligaya',
    character: LigayaCharacter,
    gameType: 'word_association',
    dialogues: {
      intro: "Hello! Let's match pictures with their words!",
      hint: "Look at the picture and find the matching word.",
      progress: "You're doing wonderful!",
      complete: "Perfect! You know all these words!",
      firstMatch: "Great start!",
      correct: "Yes! That's correct!",
      incorrect: "Not quite, try again!"
    },
    gameSets: [
      {
        set_id: 'ligaya_set_1',
        items: [
          { 
            id: 1, 
            word: 'Happy', 
            image: 'https://images.unsplash.com/photo-1567653418876-5bb0e566e1c2?w=500',
            description: 'Feeling joy and pleasure',
            choices: ['Sad', 'Happy', 'Angry']
          },
          { 
            id: 2, 
            word: 'Tree', 
            image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=500',
            description: 'A tall plant with leaves',
            choices: ['Rock', 'Water', 'Tree']
          },
          { 
            id: 3, 
            word: 'Sun', 
            image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500',
            description: 'The bright star in the sky',
            choices: ['Moon', 'Sun', 'Cloud']
          }
        ]
      },
      {
        set_id: 'ligaya_set_2',
        items: [
          { 
            id: 1, 
            word: 'Ocean', 
            image: 'https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=500',
            description: 'A large body of salt water',
            choices: ['River', 'Ocean', 'Lake']
          },
          { 
            id: 2, 
            word: 'Mountain', 
            image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500',
            description: 'A very tall hill',
            choices: ['Valley', 'Mountain', 'Forest']
          },
          { 
            id: 3, 
            word: 'Family', 
            image: 'https://images.unsplash.com/photo-1609220136736-443140cffec6?w=500',
            description: 'People related to you',
            choices: ['Family', 'Strangers', 'Animals']
          }
        ]
      },
      {
        set_id: 'ligaya_set_3',
        items: [
          { 
            id: 1, 
            word: 'Book', 
            image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=500',
            description: 'Something you read',
            choices: ['Pencil', 'Book', 'Paper']
          },
          { 
            id: 2, 
            word: 'Flower', 
            image: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=500',
            description: 'A colorful plant',
            choices: ['Flower', 'Grass', 'Leaf']
          },
          { 
            id: 3, 
            word: 'House', 
            image: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=500',
            description: 'Where people live',
            choices: ['Building', 'House', 'School']
          }
        ]
      }
    ]
  },

  // VICENTE - Sentence Completion Game
  vicente: {
    npcId: 'vicente',
    npcName: 'Vicente',
    character: VicenteCharacter,
    gameType: 'sentence_completion',
    dialogues: {
      intro: "A merchant needs to be clear with words. Complete the sentence below!",
      hint: "Read carefully and choose the word that fits best.",
      progress: "You're understanding these sentences well!",
      complete: "You've mastered these words! Well done!",
      firstCorrect: "Excellent! That's the right word!",
      correct: "Correct! Great job!",
      incorrect: "Not quite, but keep trying!"
    },
    gameSets: [
      {
        set_id: 'vicente_set_1',
        sentences: [
          {
            id: 1,
            sentence: "The food is very important. We see the [___] everyday",
            correctAnswer: "sun",
            choices: ["sun", "water", "air"]
          },
          {
            id: 2,
            sentence: "I need to buy some fresh vegetables from the [___].",
            correctAnswer: "market",
            choices: ["mountain", "market", "ocean"]
          },
          {
            id: 3,
            sentence: "The merchant packed his goods for the long [___].",
            correctAnswer: "journey",
            choices: ["house", "journey", "desk"]
          }
        ]
      },
      {
        set_id: 'vicente_set_2',
        sentences: [
          {
            id: 1,
            sentence: "The farmer planted seeds in the [___].",
            correctAnswer: "field",
            choices: ["river", "field", "sky"]
          },
          {
            id: 2,
            sentence: "We need [___] to grow healthy crops.",
            correctAnswer: "water",
            choices: ["stone", "water", "fire"]
          },
          {
            id: 3,
            sentence: "The harvest was stored in the [___].",
            correctAnswer: "barn",
            choices: ["barn", "lake", "mountain"]
          }
        ]
      },
      {
        set_id: 'vicente_set_3',
        sentences: [
          {
            id: 1,
            sentence: "The merchant travels by [___] to sell goods.",
            correctAnswer: "cart",
            choices: ["boat", "cart", "bird"]
          },
          {
            id: 2,
            sentence: "He carries his tools in a large [___].",
            correctAnswer: "bag",
            choices: ["bag", "tree", "stone"]
          },
          {
            id: 3,
            sentence: "At night, we rest in our [___].",
            correctAnswer: "home",
            choices: ["field", "home", "road"]
          }
        ]
      }
    ]
  }
};

// Helper function to get game data by NPC ID
export const getGameDataByNPC = (npcId) => {
  return moduleOneGames[npcId] || null;
};

// Helper function to get random game set
export const getRandomGameSet = (npcId) => {
  const gameData = moduleOneGames[npcId];
  if (!gameData || !gameData.gameSets || gameData.gameSets.length === 0) {
    return null;
  }
  const randomIndex = Math.floor(Math.random() * gameData.gameSets.length);
  return gameData.gameSets[randomIndex];
};

// Helper function to get dialogues
export const getDialogues = (npcId) => {
  const gameData = moduleOneGames[npcId];
  return gameData?.dialogues || {};
};

// Helper function to get NPC info
export const getNPCInfo = (npcId) => {
  const gameData = moduleOneGames[npcId];
  if (!gameData) return null;
  
  return {
    npcId: gameData.npcId,
    npcName: gameData.npcName,
    character: gameData.character,
    gameType: gameData.gameType
  };
};