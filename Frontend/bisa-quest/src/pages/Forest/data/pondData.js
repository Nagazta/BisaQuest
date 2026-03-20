import AssetManifest from "../../../services/AssetManifest";

export const NPC_IMAGES = {
  forest_npc_1: AssetManifest.forest.npcs.forest_guardian,
};

// ── 5 Clickable pond items (placeholder positions — adjust when background is ready) ──
export const POND_ITEMS = [
  {
    id: "isda",
    labelBisaya: "Mga Isda",
    labelEnglish: "Grouped Fishes",
    descriptionBisaya:
      "Duha ka grupo sa isda ang nagka-away kay nagtuo sila nga lahi ang ilang giingon — pero pareho ra diay ang kahulogan!",
    descriptionEnglish:
      "Two groups of fish are fighting because they think they're saying different things — but the words are actually synonyms!",
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
    labelBisaya: "Mga Pawikan",
    labelEnglish: "Turtles & Shells",
    descriptionBisaya:
      "Ang mga bao sa pawikan nabuak! Pangitaa ang katunga nga pareho og kahulogan para mataod balik!",
    descriptionEnglish:
      "The turtles' shells cracked! Find the half with the same meaning (synonym) to repair each shell!",
    emoji: "🐢",
    x: 20,
    y: 60,
    w: 14,
    h: 18,
  },
];

// ── 4-line intro dialogue ─────────────────────────────────────────────────────
export const INTRO_DIALOGUE = [
  {
    speaker: "Lunti",
    bisayaText:
      "Kumusta! Ako si Lunti, ang tigbantay sa kalasangan. Salamat sa pag-abot dinhi!",
    englishText:
      "Hello! I'm Lunti, the guardian of this forest. Thanks for coming!",
  },
  {
    speaker: "Lunti",
    bisayaText:
      "Ang mga hayop diri sa linaw nagkagubot! Nagka-away sila tungod sa mga pulong.",
    englishText:
      "The animals here at the pond are in chaos! They're fighting over words.",
  },
  {
    speaker: "Lunti",
    bisayaText:
      "Ang uban nagkalibog kay pareho ra diay ang kahulogan — synonym! Ang uban nasagol ang kabaliktaran — antonym!",
    englishText:
      "Some are confused because the words actually mean the same thing — synonyms! Others mixed up their opposites — antonyms!",
  },
  {
    speaker: "Lunti",
    bisayaText:
      "I-click ang matag grupo sa hayop para matabangan sila! Ikaw lang ang makahimo!",
    englishText:
      "Click on each animal group to help them! You're the only one who can do it!",
  },
];

// ── Per-item dialogue builder (2 steps like Ligaya) ───────────────────────────
export const buildPondDialogue = (region) => [
  {
    speaker: "Lunti",
    bisayaText: `Tan-awa! ${region.emoji} "${region.labelBisaya}"!`,
    englishText: `Look! ${region.emoji} "${region.labelEnglish}"!`,
  },
  {
    speaker: "Lunti",
    bisayaText: region.descriptionBisaya,
    englishText: region.descriptionEnglish,
  },
];

// ── Word pair data for each mini-game ─────────────────────────────────────────

export const FISH_SYNONYM_PAIRS = [
  { wordA: "Dako", meaningA: "Big", wordB: "Dagko", meaningB: "Big" },
  { wordA: "Gamay", meaningA: "Small", wordB: "Dyutay", meaningB: "Small" },
  {
    wordA: "Guwapo",
    meaningA: "Handsome",
    wordB: "Gwapo",
    meaningB: "Handsome",
  },
  {
    wordA: "Nindot",
    meaningA: "Beautiful",
    wordB: "Maanindot",
    meaningB: "Beautiful",
  },
];

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

export const FROG_ANTONYM_SLOTS = [
  { padWord: "Mainit", padMeaning: "Hot", stoneWord: "Bugnaw", stoneMeaning: "Cold" },
  { padWord: "Gamay", padMeaning: "Small", stoneWord: "Dako", stoneMeaning: "Big" },
  { padWord: "Mingaw", padMeaning: "Lonely", stoneWord: "Malipayon", stoneMeaning: "Happy" },
];

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
