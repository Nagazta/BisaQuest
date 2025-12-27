// Character Images
import NandoCharacter from '../assets/images/characters/vocabulary/Village_Quest_NPC_1.png';
import LigayaCharacter from '../assets/images/characters/vocabulary/Village_Quest_NPC_2.png';
import VicenteCharacter from '../assets/images/characters/vocabulary/Village_Quest_NPC_3.png';

export const moduleOneGames = {
  // NANDO - Word Matching Game
  nando: {
    npcId: 'nando',
    npcName: {
      en: 'Nando',
      ceb: 'Nando'
    },
    character: NandoCharacter,
    gameType: 'word_matching',
    dialogues: {
      en: {
        intro: "Welcome! Help me match these words with their definitions.",
        hint: "Click on a word, then click on its matching definition!",
        progress: "Keep going! You're doing great!",
        complete: "Excellent work! You've matched all the words correctly!",
        firstMatch: "Great! You got your first match!",
        correct: "Correct! Great job!",
        incorrect: "Not quite right. Try again!"
      },
      ceb: {
        intro: "Maayong pag-abot! Tabangan ko sa pagtugma niining mga pulong sa ilang kahulogan.",
        hint: "Pinduta ang pulong, dayon pinduta ang iyang katugbang kahulogan!",
        progress: "Padayon! Maayo kaayo imong nahimo!",
        complete: "Maayo kaayo! Natugma nimo ang tanan nga mga pulong!",
        firstMatch: "Maayo! Nakuha nimo ang imong una nga tugma!",
        correct: "Husto! Maayo kaayo!",
        incorrect: "Dili pa sakto. Sulayi pag-usab!"
      }
    },
    gameSets: {
      en: [
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
      ],
      ceb: [
        {
          set_id: 'nando_set_1',
          words: [
            { id: 1, word: 'Balay', definition: 'Usa ka bilding alang sa mga tawo nga mopuyo' },
            { id: 2, word: 'Kagamitan', definition: 'Mga himan o butang nga gikinahanglan alang sa usa ka tumong' },
            { id: 3, word: 'Suba', definition: 'Usa ka dako nga natural nga agianan sa tubig' },
            { id: 4, word: 'Tawo', definition: 'Usa ka indibidwal nga sakop sa kaliwatan sa Homo sapiens' },
            { id: 5, word: 'Hayop', definition: 'Usa ka buhi nga organismo nga mokaon ug organikong butang' }
          ]
        },
        {
          set_id: 'nando_set_2',
          words: [
            { id: 1, word: 'Kahoy', definition: 'Usa ka woody perennial nga tanum nga adunay punoan ug mga sanga' },
            { id: 2, word: 'Bukid', definition: 'Usa ka dako nga natural nga kataas sa ibabaw sa yuta' },
            { id: 3, word: 'Libro', definition: 'Usa ka sinulat o giimprinta nga buhat nga adunay mga panid' },
            { id: 4, word: 'Pagkaon', definition: 'Bisan unsang sustansya nga makapalig-on nga gikaon o giinom' },
            { id: 5, word: 'Tubig', definition: 'Usa ka walay kolor, tin-aw, ug walay baho nga likido nga importante sa kinabuhi' }
          ]
        },
        {
          set_id: 'nando_set_3',
          words: [
            { id: 1, word: 'Langit', definition: 'Ang bahin sa atmospera nga makita gikan sa yuta' },
            { id: 2, word: 'Bato', definition: 'Usa ka tig-a nga solidong butang nga dili metal' },
            { id: 3, word: 'Baryo', definition: 'Usa ka gamay nga komunidad sa rural nga lugar' },
            { id: 4, word: 'Tanaman', definition: 'Usa ka bahin sa yuta alang sa pagtanom ug bulak o utanon' },
            { id: 5, word: 'Tulay', definition: 'Usa ka istruktura nga moagi sa karsada ibabaw sa suba o babag' }
          ]
        }
      ]
    }
  },

  // LIGAYA - Word Association Game (Picture Matching)
  ligaya: {
    npcId: 'ligaya',
    npcName: {
      en: 'Ligaya',
      ceb: 'Ligaya'
    },
    character: LigayaCharacter,
    gameType: 'word_association',
    dialogues: {
      en: {
        intro: "Hello! Let's match pictures with their words!",
        hint: "Look at the picture and find the matching word.",
        progress: "You're doing wonderful!",
        complete: "Perfect! You know all these words!",
        firstMatch: "Great start!",
        correct: "Yes! That's correct!",
        incorrect: "Not quite, try again!"
      },
      ceb: {
        intro: "Kumusta! Magtugma kita ug mga hulagway sa ilang mga pulong!",
        hint: "Tan-awa ang hulagway ug pangitaa ang katugbang nga pulong.",
        progress: "Maayo kaayo imong nahimo!",
        complete: "Perpekto! Nahibal-an nimo ang tanan niining mga pulong!",
        firstMatch: "Maayong pagsugod!",
        correct: "Oo! Husto kana!",
        incorrect: "Dili pa, sulayi pag-usab!"
      }
    },
    gameSets: {
      en: [
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
            },
            {
              id: 4,
              word: 'Bird',
              image: 'https://images.unsplash.com/photo-1552728089-57bdde30beb3?w=500',
              description: 'An animal that can fly',
              choices: ['Fish', 'Bird', 'Dog']
            },
            {
              id: 5,
              word: 'Rain',
              image: 'https://images.unsplash.com/photo-1428908728789-d2de25dbd4e2?w=500',
              description: 'Water falling from the sky',
              choices: ['Snow', 'Wind', 'Rain']
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
            },
            {
              id: 4,
              word: 'Star',
              image: 'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=500',
              description: 'Bright objects in the night sky',
              choices: ['Planet', 'Star', 'Comet']
            },
            {
              id: 5,
              word: 'Cloud',
              image: 'https://images.unsplash.com/photo-1534088568595-a066f410bcda?w=500',
              description: 'White fluffy things in the sky',
              choices: ['Fog', 'Smoke', 'Cloud']
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
            },
            {
              id: 4,
              word: 'Butterfly',
              image: 'https://images.unsplash.com/photo-1526336024174-e58f5cdd8e13?w=500',
              description: 'A colorful insect with wings',
              choices: ['Bee', 'Butterfly', 'Dragonfly']
            },
            {
              id: 5,
              word: 'Rainbow',
              image: 'https://images.unsplash.com/photo-1513002749550-c59d786b8e6c?w=500',
              description: 'Colorful arc in the sky after rain',
              choices: ['Lightning', 'Rainbow', 'Sunset']
            }
          ]
        }
      ],
      ceb: [
        {
          set_id: 'ligaya_set_1',
          items: [
            {
              id: 1,
              word: 'Malipayon',
              image: 'https://images.unsplash.com/photo-1567653418876-5bb0e566e1c2?w=500',
              description: 'Pagbati ug kalipay ug katagbawan',
              choices: ['Masulub-on', 'Malipayon', 'Nasuko']
            },
            {
              id: 2,
              word: 'Kahoy',
              image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=500',
              description: 'Usa ka taas nga tanum nga adunay dahon',
              choices: ['Bato', 'Tubig', 'Kahoy']
            },
            {
              id: 3,
              word: 'Adlaw',
              image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500',
              description: 'Ang hayag nga bituon sa langit',
              choices: ['Bulan', 'Adlaw', 'Panganod']
            },
            {
              id: 4,
              word: 'Langgam',
              image: 'https://images.unsplash.com/photo-1552728089-57bdde30beb3?w=500',
              description: 'Usa ka hayop nga makaalupad',
              choices: ['Isda', 'Langgam', 'Iro']
            },
            {
              id: 5,
              word: 'Ulan',
              image: 'https://images.unsplash.com/photo-1428908728789-d2de25dbd4e2?w=500',
              description: 'Tubig nga nahulog gikan sa langit',
              choices: ['Niyebe', 'Hangin', 'Ulan']
            }
          ]
        },
        {
          set_id: 'ligaya_set_2',
          items: [
            {
              id: 1,
              word: 'Dagat',
              image: 'https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=500',
              description: 'Usa ka dako nga lawas sa parat nga tubig',
              choices: ['Suba', 'Dagat', 'Linaw']
            },
            {
              id: 2,
              word: 'Bukid',
              image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500',
              description: 'Usa ka taas kaayong bungtod',
              choices: ['Walog', 'Bukid', 'Lasang']
            },
            {
              id: 3,
              word: 'Pamilya',
              image: 'https://images.unsplash.com/photo-1609220136736-443140cffec6?w=500',
              description: 'Mga tawo nga may kalabotan kanimo',
              choices: ['Pamilya', 'Estranghero', 'Hayop']
            },
            {
              id: 4,
              word: 'Bituon',
              image: 'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=500',
              description: 'Mahayag nga mga butang sa langit sa gabii',
              choices: ['Planeta', 'Bituon', 'Kometa']
            },
            {
              id: 5,
              word: 'Panganod',
              image: 'https://images.unsplash.com/photo-1534088568595-a066f410bcda?w=500',
              description: 'Puti ug humok nga mga butang sa langit',
              choices: ['Gabon', 'Aso', 'Panganod']
            }
          ]
        },
        {
          set_id: 'ligaya_set_3',
          items: [
            {
              id: 1,
              word: 'Libro',
              image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=500',
              description: 'Usa ka butang nga imong basahon',
              choices: ['Lapis', 'Libro', 'Papel']
            },
            {
              id: 2,
              word: 'Bulak',
              image: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=500',
              description: 'Usa ka maanyag nga tanum',
              choices: ['Bulak', 'Sagbot', 'Dahon']
            },
            {
              id: 3,
              word: 'Balay',
              image: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=500',
              description: 'Diin mopuyo ang mga tawo',
              choices: ['Bilding', 'Balay', 'Eskwelahan']
            },
            {
              id: 4,
              word: 'Alibangbang',
              image: 'https://images.unsplash.com/photo-1526336024174-e58f5cdd8e13?w=500',
              description: 'Usa ka maanyag nga insekto nga adunay pako',
              choices: ['Buyog', 'Alibangbang', 'Tutuburon']
            },
            {
              id: 5,
              word: 'Balangaw',
              image: 'https://images.unsplash.com/photo-1513002749550-c59d786b8e6c?w=500',
              description: 'Maanyag nga kurba sa langit human sa ulan',
              choices: ['Kilat', 'Balangaw', 'Takipsilim']
            }
          ]
        }
      ]
    }
  },

  // VICENTE - Sentence Completion Game
  vicente: {
    npcId: 'vicente',
    npcName: {
      en: 'Vicente',
      ceb: 'Vicente'
    },
    character: VicenteCharacter,
    gameType: 'sentence_completion',
    dialogues: {
      en: {
        intro: "A merchant needs to be clear with words. Complete the sentence below!",
        hint: "Read carefully and choose the word that fits best.",
        progress: "You're understanding these sentences well!",
        complete: "You've mastered these words! Well done!",
        firstCorrect: "Excellent! That's the right word!",
        correct: "Correct! Great job!",
        incorrect: "Not quite, but keep trying!"
      },
      ceb: {
        intro: "Ang usa ka negosyante kinahanglan nga tin-aw sa mga pulong. Kompleto ang sentence sa ubos!",
        hint: "Basaha pag-ayo ug pilia ang pulong nga mohaum.",
        progress: "Maayo ang imong pagsabot niining mga sentence!",
        complete: "Nakat-onan nimo kining mga pulong! Maayo kaayo!",
        firstCorrect: "Tama kaayo! Mao na ang hustong pulong!",
        correct: "Husto! Maayo kaayo!",
        incorrect: "Dili pa, pero padayon lang!"
      }
    },
    gameSets: {
      en: [
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
            },
            {
              id: 4,
              sentence: "We cook our meals using [___] from the well.",
              correctAnswer: "water",
              choices: ["sand", "water", "stone"]
            },
            {
              id: 5,
              sentence: "The children play in the [___] near the village.",
              correctAnswer: "field",
              choices: ["cave", "field", "wall"]
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
            },
            {
              id: 4,
              sentence: "The [___] provides shade on hot days.",
              correctAnswer: "tree",
              choices: ["rock", "tree", "stream"]
            },
            {
              id: 5,
              sentence: "We cross the [___] to reach the next town.",
              correctAnswer: "bridge",
              choices: ["fence", "bridge", "gate"]
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
            },
            {
              id: 4,
              sentence: "The village elder shares stories by the [___].",
              correctAnswer: "fire",
              choices: ["water", "fire", "wind"]
            },
            {
              id: 5,
              sentence: "We gather [___] from the forest for cooking.",
              correctAnswer: "wood",
              choices: ["metal", "wood", "cloth"]
            }
          ]
        }
      ],
      ceb: [
        {
          set_id: 'vicente_set_1',
          sentences: [
            {
              id: 1,
              sentence: "Ang pagkaon importante kaayo. Makita nato ang [___] kada adlaw",
              correctAnswer: "adlaw",
              choices: ["adlaw", "tubig", "hangin"]
            },
            {
              id: 2,
              sentence: "Kinahanglan nakong mopalit ug presko nga utanon gikan sa [___].",
              correctAnswer: "merkado",
              choices: ["bukid", "merkado", "dagat"]
            },
            {
              id: 3,
              sentence: "Ang negosyante nagputos sa iyang mga baligya alang sa taas nga [___].",
              correctAnswer: "panaw",
              choices: ["balay", "panaw", "lamesa"]
            },
            {
              id: 4,
              sentence: "Nagluto kita gamit ang [___] gikan sa atabay.",
              correctAnswer: "tubig",
              choices: ["balas", "tubig", "bato"]
            },
            {
              id: 5,
              sentence: "Ang mga bata nagdula sa [___] duol sa baryo.",
              correctAnswer: "uma",
              choices: ["lungag", "uma", "pader"]
            }
          ]
        },
        {
          set_id: 'vicente_set_2',
          sentences: [
            {
              id: 1,
              sentence: "Ang mag-uuma nagtanom ug liso sa [___].",
              correctAnswer: "uma",
              choices: ["suba", "uma", "langit"]
            },
            {
              id: 2,
              sentence: "Kinahanglan nato ang [___] aron motubo ang himsog nga mga tanom.",
              correctAnswer: "tubig",
              choices: ["bato", "tubig", "kalayo"]
            },
            {
              id: 3,
              sentence: "Ang ani gitipigan sa [___].",
              correctAnswer: "bodega",
              choices: ["bodega", "linaw", "bukid"]
            },
            {
              id: 4,
              sentence: "Ang [___] naghatag ug landong sa init nga adlaw.",
              correctAnswer: "kahoy",
              choices: ["bato", "kahoy", "sapa"]
            },
            {
              id: 5,
              sentence: "Molabang kita sa [___] aron makaabot sa sunod nga lungsod.",
              correctAnswer: "tulay",
              choices: ["kural", "tulay", "ganghaan"]
            }
          ]
        },
        {
          set_id: 'vicente_set_3',
          sentences: [
            {
              id: 1,
              sentence: "Ang negosyante mubiyahe pinaagi sa [___] aron ibaligya ang mga butang.",
              correctAnswer: "kariton",
              choices: ["barko", "kariton", "langgam"]
            },
            {
              id: 2,
              sentence: "Gidala niya ang iyang mga himan sa usa ka dakong [___].",
              correctAnswer: "bag",
              choices: ["bag", "kahoy", "bato"]
            },
            {
              id: 3,
              sentence: "Sa gabii, mopahulay kita sa atong [___].",
              correctAnswer: "balay",
              choices: ["uma", "balay", "dalan"]
            },
            {
              id: 4,
              sentence: "Ang tigulang sa baryo nagpaambit ug mga sugilanon duol sa [___].",
              correctAnswer: "kalayo",
              choices: ["tubig", "kalayo", "hangin"]
            },
            {
              id: 5,
              sentence: "Mangolekta kita ug [___] gikan sa lasang alang sa pagluto.",
              correctAnswer: "kahoy",
              choices: ["metal", "kahoy", "panapton"]
            }
          ]
        }
      ]
    }
  }
};

// Helper function to get game data by NPC ID with language support
export const getGameDataByNPC = (npcId, language = 'en') => {
  const gameData = moduleOneGames[npcId];
  if (!gameData) return null;

  return {
    ...gameData,
    npcName: gameData.npcName[language] || gameData.npcName.en,
    dialogues: gameData.dialogues[language] || gameData.dialogues.en,
    gameSets: gameData.gameSets[language] || gameData.gameSets.en
  };
};

// Helper function to get random game set with language support
export const getRandomGameSet = (npcId, language = 'en') => {
  const gameData = getGameDataByNPC(npcId, language);
  if (!gameData || !gameData.gameSets || gameData.gameSets.length === 0) {
    return null;
  }
  const randomIndex = Math.floor(Math.random() * gameData.gameSets.length);
  return gameData.gameSets[randomIndex];
};

// Helper function to get dialogues with language support
export const getDialogues = (npcId, language = 'en') => {
  const gameData = getGameDataByNPC(npcId, language);
  return gameData?.dialogues || {};
};

// Helper function to get NPC info with language support
export const getNPCInfo = (npcId, language = 'en') => {
  const gameData = getGameDataByNPC(npcId, language);
  if (!gameData) return null;

  return {
    npcId: gameData.npcId,
    npcName: gameData.npcName,
    character: gameData.character,
    gameType: gameData.gameType
  };
};