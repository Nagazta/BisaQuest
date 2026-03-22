import AssetManifest from "../../../services/AssetManifest";

export const NPC_IMAGES = {
  forest_npc_1: AssetManifest.forest.npcs.forest_guardian,
};

// ── 5 Clickable pond items (placeholder positions — adjust when background is ready) ──
export const POND_ITEMS = [
  {
    id: "tubig",
    labelBisaya: "Ang Tubig",
    labelEnglish: "The Water",
    descriptionBisaya: "Si Lunti gigutom. Tabangi siya mamasol og isda nga naay saktong pulong!",
    descriptionEnglish: "Lunti is hungry. Help her catch fish with the correct word!",
    x: 39,
    y: 55,
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
    y: 60,
    w: 14,
    h: 18,
  },
  {
    id: "laksoy",
    labelBisaya: "Mga Laksoy ug Bunga",
    labelEnglish: "Squirrels & Nuts",
    descriptionBisaya:
      "Duha ka pamilya sa laksoy nagbahin sa ilang bunga, pero nasagol ang mga label — kinahanglan ibalik sa husto pinaagi sa kabaliktaran nga pulong!",
    descriptionEnglish:
      "Two squirrel families are sorting their nuts, but the labels got mixed up — sort them by placing each nut with its opposite word!",
    emoji: "🐿️",
    x: 70,
    y: 20,
    w: 14,
    h: 18,
  },
  {
    id: "baki",
    labelBisaya: "Mga Baki",
    labelEnglish: "Frogs on Lily Pads",
    descriptionBisaya:
      "Ang tulay sa mga baki nabuak! Kinahanglan ibutang ang bato nga may kabaliktaran nga pulong para mataod balik ang tulay!",
    descriptionEnglish:
      "The frogs' lily pad bridge is broken! Place word-stones with the antonym to rebuild each section!",
    emoji: "🐸",
    x: 42,
    y: 65,
    w: 16,
    h: 16,
  },
  {
    id: "alitaptap",
    labelBisaya: "Mga Alitaptap",
    labelEnglish: "Fireflies",
    descriptionBisaya:
      "Ang mga alitaptap dili na modan-ag! Tabanga sila pagpangita sa ilang partner — ang pareho nga kahulogan!",
    descriptionEnglish:
      "The fireflies stopped glowing! Help them find their synonym partner to light up again!",
    emoji: "✨",
    x: 80,
    y: 55,
    w: 14,
    h: 18,
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
];

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
    bisayaText: "Nanginahanglan ko sa imong tabang, anak.",
    englishText: "I need your help, child.",
  },
  {
    speaker: "Lunti",
    bisayaText: "Ang mga hayop dinhi kay nagkagubot na ug nagkalibogan!",
    englishText: "The animals here are in chaos and confusion!",
  },
  {
    speaker: "Lunti",
    bisayaText: "Wala na sila nagkasinabtanay sa pagka-parehas ug kalahian sa mga pulong.",
    englishText: "They're not understanding the similarities and differences of words.",
  },
  {
    speaker: "Lunti",
    bisayaText: "Ang uban nga mga pulong parehas ug kahulogan. Gitawag sila og SYNONYMS.",
    englishText: "Some words are alike. They mean the same or similar. These are called SYNONYMS.",
  },
  {
    speaker: "Lunti",
    bisayaText: "Ang uban nga pulong kay lahi. Sila kay mag-atbang sa kahulogan. Gitawag sila ug ANTONYMNS.",
    englishText: "Some words are very different. They are opposites. These are called ANTONYMS.",
  },
  {
    speaker: "Lunti",
    bisayaText: "Magkat-on ta nila!",
    englishText: "Let's learn them together!",
  },
  {
    speaker: "Lunti",
    bisayaText: "I-click lang ang mga butang sa palibot!",
    englishText: "Just click the items on the surroundings!",
  },
];

// ── Per-item dialogue builder (2 steps like Ligaya) ───────────────────────────
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

// ── Word pair data for each mini-game ─────────────────────────────────────────

export const FISH_FAMILIES_DATA = {
  // NPC intro dialogue (4 lines) shown before the dragging begins
  introDialogue: [
    {
      bisayaText: "Kini sila kay mga pamilya nga isda.",
      englishText: "These are fish families.",
    },
    {
      bisayaText: "Naa silay kaparehas nga grupo.",
      englishText: "They belong with others like them.",
    },
    {
      bisayaText: "Tan-awa kung unsa sila molihok ug unsa ilang dagway.",
      englishText: "Look at how they move and act.",
    },
    {
      bisayaText: "I-drag sila padulong sa ilang mama nga isda.",
      englishText: "Drag them to the right mother fish.",
    },
  ],

  // Post-completion lesson — synonyms
  synonymDialogue: [
    {
      bisayaText: "Maayo kaayo!",
      englishText: "Good job!",
    },
    {
      bisayaText: "Bisan lahi-lahi gamay ang ilang dagway…",
      englishText: "These fish may look a little different…",
    },
    {
      bisayaText: "Parehas ra sila.",
      englishText: "But they are the same kind.",
    },
    {
      bisayaText: "Sama sa mga pulong nga parehas ug kahulugan. Mao ni ang synonyms.",
      englishText: "Like words that mean the same. These are synonyms.",
    },
  ],

  // Post-completion lesson — antonyms (contrast both groups)
  antonymDialogue: [
    {
      bisayaText: "Tan-awa ang duha ka grupo.",
      englishText: "Now look at both sides.",
    },
    {
      bisayaText: "Ang dako ug gamay lahi kaayo.",
      englishText: "Big and small are very different.",
    },
    {
      bisayaText: "Magkasukwahi sila.",
      englishText: "They are opposites.",
    },
    {
      bisayaText: "Mao ni ang antonyms.",
      englishText: "These are antonyms.",
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

export const SQUIRREL_ANTONYM_PAIRS = {
  zoneA: { word: "Init", meaning: "Hot" },
  zoneB: { word: "Bugnaw", meaning: "Cold" },
  nuts: [
    { id: "nut_1", word: "Hayag", meaning: "Bright", correctZone: "B" },
    { id: "nut_2", word: "Ngitngit", meaning: "Dark", correctZone: "A" },
    { id: "nut_3", word: "Hinay", meaning: "Slow", correctZone: "B" },
    { id: "nut_4", word: "Paspas", meaning: "Fast", correctZone: "A" },
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
      bisayaText: "Tabangi siya mulukso sa luwas nga dahon.",
      englishText: "Help it jump on safe lily pads.",
    },
    {
      bisayaText: "Tan-awa pag-ayo. Ang uban halos parehas.",
      englishText: "Look carefully. Some pads are almost the same.",
    },
    {
      bisayaText: "Ang uban lahi kaayo.",
      englishText: "Some are too different.",
    },
  ],

  // Post-completion synonym lesson
  synonymDialogue: [
    {
      bisayaText: "Maayo kaayo.",
      englishText: "Good job.",
    },
    {
      bisayaText: "Lahi gamay ang mga dahon…",
      englishText: "These pads look a little different…",
    },
    {
      bisayaText: "Pero halos parehas sila.",
      englishText: "But they are almost the same.",
    },
    {
      bisayaText: "Sama sa mga pulong nga parehas ug kahulugan.",
      englishText: "Like words that mean the same.",
    },
    {
      bisayaText: "Mao ni ang synonyms.",
      englishText: "These are synonyms.",
    },
  ],

  // Post-synonym antonym lesson (4 lines)
  antonymDialogue: [
    {
      bisayaText: "Apan kini lahi kaayo.",
      englishText: "But this one is very different.",
    },
    {
      bisayaText: "Dili siya parehas sa uban.",
      englishText: "It is not like the others.",
    },
    {
      bisayaText: "Magkasukwahi kini.",
      englishText: "This is an opposite.",
    },
    {
      bisayaText: "Mao ni ang antonyms.",
      englishText: "These are antonyms.",
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

export const FIREFLY_SYNONYM_PAIRS = [
  { wordA: "Malipayon", meaningA: "Happy", wordB: "Masadya", meaningB: "Cheerful" },
  { wordA: "Nahadlok", meaningA: "Scared", wordB: "Nakulbaan", meaningB: "Frightened" },
  { wordA: "Kusog", meaningA: "Strong", wordB: "Lig-on", meaningB: "Sturdy" },
  { wordA: "Sakit", meaningA: "Painful", wordB: "Kasakit", meaningB: "Painful" },
];

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
    {
      bisayaText: "Tan-awa pag-ayo. Ang uban parehas… ang uban lahi kaayo.",
      englishText: "Look carefully. Some pieces are similar… some are very different.",
    },
  ],

  // Post-completion synonym lesson (5 lines)
  synonymDialogue: [
    { bisayaText: "Maayo kaayo.", englishText: "Good job." },
    { bisayaText: "Lahi-lahi gamay ang mga kabhang…", englishText: "These shells look a little different…" },
    { bisayaText: "Pero sakto gihapon sila magkuyog.", englishText: "But they still belong together." },
    { bisayaText: "Sama sa mga pulong nga parehas ug kahulugan.", englishText: "Like words that mean the same." },
    { bisayaText: "Mao ni ang synonyms.", englishText: "These are synonyms." },
  ],

  // Antonym lesson (4 lines)
  antonymDialogue: [
    { bisayaText: "Kini nga piraso lahi kaayo.", englishText: "This piece is very different." },
    { bisayaText: "Dili siya angay dinhi.", englishText: "It does not belong here." },
    { bisayaText: "Magkasukwahi siya.", englishText: "It is the opposite." },
    { bisayaText: "Mao ni ang antonyms.", englishText: "These are antonyms." },
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

