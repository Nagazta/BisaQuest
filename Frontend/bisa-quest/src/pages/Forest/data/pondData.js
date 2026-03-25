import AssetManifest from "../../../services/AssetManifest";

export const NPC_IMAGES = {
  forest_npc_1: AssetManifest.forest.npcs.forest_guardian,
};

export const POND_ITEMS = [
  {
    id: "tubig",
    labelBisaya: "Ang Tubig",
    labelEnglish: "The Water",
    descriptionBisaya: "Si Lunti gigutom. Tabangi siya mamasol og isda nga naay saktong pulong!",
    descriptionEnglish: "Lunti is hungry. Help her catch fish with the correct word!",
    x: 35,
    y: 57,
    w: 20,
    h: 15,
  },
  {
    id: "isda",
    labelBisaya: "Isda",
    labelEnglish: "Fishes",
    descriptionBisaya:
      "Ang mga bata nga isda kay nalibog ug nabulag sa ilang inahan.",
    descriptionEnglish:
      "Baby fishes are confused and separated from their mother.",
    emoji: "🐟",
    x: 35,
    y: 67,
    w: 14,
    h: 18,
  },
  {
    id: "baki",
    labelBisaya: "Baki",
    labelEnglish: "Frog",
    descriptionBisaya:
      "Tabangi ang baki sa pagpili sa luwas na agi-anan!",
    descriptionEnglish:
      "Help the frog choose the safe path!",
    emoji: "🐸",
    x: 56,
    y: 67,
    w: 16,
    h: 16,
  },
  {
    id: "pawikan",
    labelBisaya: "Pawikan",
    labelEnglish: "Turtle",
    descriptionBisaya:
      "Ang bao sa pawikan kay nabuak! I-taod nato ug balik!",
    descriptionEnglish:
      "The turtles' shells shattered! Let's put them back together!",
    emoji: "🐢",
    x: 20,
    y: 60,
    w: 14,
    h: 18,
  },
  {
    id: "kalayo",
    labelBisaya: "Ang Kalayo",
    labelEnglish: "The Campfire",
    descriptionBisaya: "Nagpalami si Lunti og isda sa kalayo.",
    descriptionEnglish: "Lunti is cooking some delicious fish over the fire.",
    x: 45.5,
    y: 38,
    w: 10,
    h: 10,
  },
  {
    id: "bulaklak",
    labelBisaya: "Mga Bulaklak",
    labelEnglish: "The Flowers",
    descriptionBisaya: "Ang mga bulaklak nangalaya na. Tabangi si Lunti nga mapresko kini balik pinaagi sa pagbisbis og tubig!",
    descriptionEnglish: "The flowers have withered. Help Lunti make them fresh again by watering them!",
    x: 65,
    y: 85,
    w: 12,
    h: 12,
  },
];

export const CAMPFIRE_GAME_DATA = {
  rounds: [
    {
      introDialogue: {
        speaker: "Lunti",
        bisayaText: "Gutom na gyud ko! Luto-on nato kining isda para LAMI (Delicious) kaonon.",
        englishText: "I'm so hungry! Let's cook this fish so it's DELICIOUS (Lami) to eat."
      },
      cookingDialogue: {
        speaker: "Lunti",
        bisayaText: "I-duol ang isda sa kalayo para maluto og maayo.",
        englishText: "Move the fish closer to the fire to cook it well."
      },
      eatingDialogue: {
        speaker: "Lunti",
        bisayaText: "Hmm! LAMI ug LAB-AS na gyud kining isdaa! Ang LAMI ug LAB-AS kay parehas og kahulogan (Synonyms).",
        englishText: "Hmm! This fish is DELICIOUS and FRESH! DELICIOUS and FRESH have similar meanings (Synonyms)."
      }
    },
    {
      introDialogue: {
        speaker: "Lunti",
        bisayaText: "Luto pa ta og usa! Pero ayaw palabi-i og luto, basin ma-INIT (Hot) kaayo.",
        englishText: "Let's cook one more! But don't overcook it, it might get too HOT (Init)."
      },
      cookingDialogue: {
        speaker: "Lunti",
        bisayaText: "Bantayi ang kalayo, ayaw pasagdi nga masunog.",
        englishText: "Watch the fire, don't let it burn."
      },
      eatingDialogue: {
        speaker: "Lunti",
        bisayaText: "Init pa gyud! Ang INIT (Hot) kay kabaliktaran sa BUGNAW (Cold). Mao ni ang Antonyms.",
        englishText: "It's still hot! HOT (Init) is the opposite of COLD (Bugnaw). These are Antonyms."
      }
    },
    {
      introDialogue: {
        speaker: "Lunti",
        bisayaText: "Usa na lang gyud para ma-BUSOG (Full) na ko!",
        englishText: "Just one more so I'll be FULL (Busog)!"
      },
      cookingDialogue: {
        speaker: "Lunti",
        bisayaText: "Hapit na gyud ma-cooked! Gamay na lang!",
        englishText: "It's almost cooked! Just a little more!"
      },
      eatingDialogue: {
        speaker: "Lunti",
        bisayaText: "Busog na gyud ko! Ang BUSOG ug PUNO (Satiated) kay parehas ra og kahulogan (Synonyms).",
        englishText: "I'm finally full! FULL and SATIATED (Puno) mean the same thing (Synonyms)."
      }
    }
  ]
};

export const FLOWER_GAME_DATA = {
  rounds: [
    {
      id: 1,
      targetConcept: "Antonym & Synonym",
      introDialogue: {
        speaker: "Lunti",
        bisayaText: "Bisbisan nato kining MALAYA nga bulak para mahimo kining PRESKO!",
        englishText: "Let's water this Wilted (malaya) flower to make it Fresh (presko)!"
      },
      wateringDialogues: [
        { threshold: 0, bisayaText: "Sige pa, bisbisi pa og maayo!", englishText: "Keep going, water them well!" },
        { threshold: 33, bisayaText: "Wow! Pagka-NINDOT (Beautiful) na gyud tan-awon!", englishText: "Wow! It looks Beautiful (Nindot)!" },
        { threshold: 66, bisayaText: "Tan-awa! Pagka-GWAPA (Pretty) na gyud ni!", englishText: "Look! This one is Pretty (Gwapa)!" }
      ],
      resultDialogue: {
        speaker: "Lunti",
        bisayaText: "Pagka-MATAHOM na gyud! NINDOT, GWAPA, ug MATAHOM ang mga flowers",
        englishText: "It's really LOVELY! The flowers are beautiful, pretty, and lovely!"
      }
    }
  ]
};

// ── Intro dialogue ─────────────────────────────────────────────────────
export const INTRO_DIALOGUE = [
  {
    speaker: "Lunti",
    bisayaText: "Kumusta! Ako si Lunti, ang tigbantay sa kalasangan.",
    englishText: "Hello! I am Lunti, the Guardian of the Forest.",
  },
  {
    speaker: "Lunti",
    bisayaText: "Salamat kaayo sa pag-abot!",
    englishText: "Thank you so much for arriving!",
  },
  {
    speaker: "Lunti",
    bisayaText: "Tabangi ko sa SYNONYMS ug ANTONYMS para sa mga hayop dinhi!",
    englishText: "Help me with SYNONYMS and ANTONYMS for the animals here!",
  },
];

export const buildPondDialogue = (region) => [
  {
    speaker: "Lunti",
    bisayaText: `Tan-awa! Kini ang ${region.labelBisaya}!`,
    englishText: `Look! It's ${region.labelEnglish}!`,
  },
  {
    speaker: "Lunti",
    bisayaText: region.descriptionBisaya,
    englishText: region.descriptionEnglish,
  },
];



export const FISH_FAMILIES_DATA = {
  // NPC intro dialogue (4 lines) shown before the dragging begins
  introDialogue: [
    {
      bisayaText: "Ang GAMAY nga isda kay padulong sa GAMAY nga mama nga isda.",
      englishText: "SMALL fishes go to SMALL mother fish.",
    },
    {
      bisayaText: "Ang DAKO nga isda kay padulong sa DAKO nga mama nga isda.",
      englishText: "BIG fishes go to BIG mother fish.",
    },
    {
      bisayaText: "I-drag sila padulong sa ilang mama nga isda.",
      englishText: "Drag them to the right mother fish.",
    },
  ],

  completionDialogue: [
    {
      bisayaText: "Maayo kaayo!",
      englishText: "Good job!",
    },
  ],

  // 6 baby fish: 3 small, 3 big
  babyFish: [
    {
      id: "baby_s1",
      size: "small",
      tooltipBisaya: "Gamay, paspas, gaan",
      tooltipEnglish: "Small, fast, light",
    },
    {
      id: "baby_s2",
      size: "small",
      tooltipBisaya: "Gamay, paspas, gaan",
      tooltipEnglish: "Small, fast, light",
    },
    {
      id: "baby_s3",
      size: "small",
      tooltipBisaya: "Gamay, paspas, gaan",
      tooltipEnglish: "Small, fast, light",
    },
    {
      id: "baby_b1",
      size: "big",
      tooltipBisaya: "Dako, hinay, bug-at",
      tooltipEnglish: "Big, slow, heavy",
    },
    {
      id: "baby_b2",
      size: "big",
      tooltipBisaya: "Dako, hinay, bug-at",
      tooltipEnglish: "Big, slow, heavy",
    },
    {
      id: "baby_b3",
      size: "big",
      tooltipBisaya: "Dako, hinay, bug-at",
      tooltipEnglish: "Big, slow, heavy",
    },
  ],
};



export const FROG_PATH_DATA = {
  // NPC intro dialogue (4 lines) before the game starts
  introDialogue: [
    {
      bisayaText: "Ganahan mutabok sa lim-aw ang baki.",
      englishText: "This frog wants to cross the pond.",
    },
    {
      bisayaText: "Tabangi siya mulukso sa LUWAS nga dahon. Dili sa mga dahon nga delikado.",
      englishText: "Help it jump on SAFE lily pads. Not on the dangerous ones.",
    },
  ],
  completionDialogue: [
    {
      bisayaText: "Nakaabut na ang baki! Salamat sa imong tabang!",
      englishText: "The frog made it across! Thanks for your help!"
    },
  ],

  // 3 pad rows — safe variant paired with unsafe variant
  // Rendered as pure SVG visuals, no text labels
  padRows: [
    { safeVariant: "perfect", unsafeVariant: "wilted" },
    { safeVariant: "small_hole", unsafeVariant: "cracks" },
    { safeVariant: "tiny_crack", unsafeVariant: "huge_hole" },
  ],
};



export const TURTLE_SYNONYM_PAIRS = [
  { turtleWord: "Makusog", turtleMeaning: "Loud", shellWord: "Saba", shellMeaning: "Noisy" },
  { turtleWord: "Hilom", turtleMeaning: "Quiet", shellWord: "Malinawon", shellMeaning: "Peaceful" },
  { turtleWord: "Bata", turtleMeaning: "Young/Child", shellWord: "Kabataan", shellMeaning: "Youth" },
];

export const FISHING_GAME_DATA = {
  introDialogue: [
    { speaker: "Lunti", bisayaText: "Gutom na kaayo ko...", englishText: "I am so hungry..." },
    { speaker: "Lunti", bisayaText: "Puwede ba nimo ko tabangan og pangisda?", englishText: "Could you help me catch some fish?" },
    { speaker: "Lunti", bisayaText: "Pero pili-a lang ang isda nga naay saktong pulong!", englishText: "But only catch the fish with the right word!" },
    { speaker: "Lunti", bisayaText: "Pangitaa ang Synonym (parehas) o Antonym (kabaliktaran) sa pulong.", englishText: "Find the Synonym or Antonym of the word." },
  ],
  completionDialogue: [
    { speaker: "Lunti", bisayaText: "Salamat kaayo!", englishText: "Thank you so much!" },
    { speaker: "Lunti", bisayaText: "The raw fish is ready to cook!", englishText: "The raw fish is ready to cook!" },
  ],
  rounds: [
    {
      targetWord: "Dako",
      targetEnglish: "Big",
      questionType: "Antonym",
      questionTypeBisaya: "Kabaliktaran",
      correctWord: "Gamay",
      wrongWords: ["Taas", "Daghan"],
    },
    {
      targetWord: "Sayop",
      targetEnglish: "Wrong",
      questionType: "Synonym",
      questionTypeBisaya: "Parehas",
      correctWord: "Sipyat",
      wrongWords: ["Sakto", "Maayo"],
    },
    {
      targetWord: "Init",
      targetEnglish: "Hot",
      questionType: "Antonym",
      questionTypeBisaya: "Kabaliktaran",
      correctWord: "Bugnaw",
      wrongWords: ["Paso", "Kalayo"],
    },
    {
      targetWord: "Paspas",
      targetEnglish: "Fast",
      questionType: "Synonym",
      questionTypeBisaya: "Parehas",
      correctWord: "Dali",
      wrongWords: ["Hinay", "Hunong"],
    },
    {
      targetWord: "Limpyo",
      targetEnglish: "Clean",
      questionType: "Antonym",
      questionTypeBisaya: "Kabaliktaran",
      correctWord: "Hugaw",
      wrongWords: ["Klaro", "Baga"],
    },
  ]
};
export const TURTLE_SHELL_DATA = {
  // NPC intro dialogue (3 lines)
  introDialogue: [
    {
      bisayaText: "Ang kabhang sa pawikan nabuak.",
      englishText: "The turtle's shell is broken.",
    },
    {
      bisayaText: "Tabangi siya pinaagi sa pagpili sa sakto nga mga piraso.",
      englishText: "Help fix it by choosing the right pieces.",
    },
  ],
  completionDialogue: [
    { bisayaText: "Nataod na ang kabhang! Salamat kaayo!", englishText: "The shell is fixed! Thank you!" },
  ],

  // 10 shell pieces: 5 correct (synonym-concept), 3 neutral-wrong, 2 opposite-wrong
  // variant: used to pick the SVG render style (no text labels)
  pieces: [
    // ── 5 correct pieces (belong to the turtle) ─────────────────────────────
    { id: "c1", type: "correct", variant: "smooth" },  // Smooth green shell
    { id: "c2", type: "correct", variant: "lined" },  // Green with faint lines
    { id: "c3", type: "correct", variant: "cracked" },  // Green with small crack
    { id: "c4", type: "correct", variant: "patched" },  // Light green patch pattern
    { id: "c5", type: "correct", variant: "uneven" },  // Uneven edges, same shape
    // ── 3 neutral-wrong pieces (different but not opposite) ──────────────────
    { id: "n1", type: "neutral", variant: "snail" },  // Snail spiral shell
    { id: "n2", type: "neutral", variant: "crab" },  // Hard curved crab plate
    { id: "n3", type: "neutral", variant: "clam" },  // Clam bisected shell
    // ── 2 opposite-wrong pieces (antonym concept) ────────────────────────────
    { id: "o1", type: "opposite", variant: "spiky" },  // Dark spiky fragment
    { id: "o2", type: "opposite", variant: "jagged" },  // Broken jagged, unstable
  ],
};

