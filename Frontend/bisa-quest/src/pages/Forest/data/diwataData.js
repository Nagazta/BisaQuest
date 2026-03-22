// ─────────────────────────────────────────────────────────────────────────────
//  diwataData.js — Data for Diwata's forest-glow exploration scene
//  Theme: "Restore balance through opposites" → antonyms via cause & effect
// ─────────────────────────────────────────────────────────────────────────────
import AssetManifest from "../../../services/AssetManifest";

// ── NPC image map ─────────────────────────────────────────────────────────────
export const DIWATA_NPC_IMAGES = {
  forest_npc_3: AssetManifest.forest.npcs.diwata,
};

// ── Clickable items ─────────────────────────────
// Positions are placeholders; user will adjust manually
export const GLOW_ITEMS = [
  {
    id: "bulak",
    labelBisaya: "Laya na Bulak",
    labelEnglish: "Wilted Flowers",
    descriptionBisaya: "Kining mga bulak nalaya. Kinahanglan ang balanse aron mubukad sila pag-usab.",
    descriptionEnglish: "These flowers have wilted. They need balance to bloom again.",
    x: 65, y: 85, w: 8, h: 10,
  },
  {
    id: "langob",
    labelBisaya: "Ngitngit na Langob",
    labelEnglish: "Dark Cave",
    descriptionBisaya: "Ngitngit kaayo ang langob. Kinahanglan ang kahayag aron mapuno kini.",
    descriptionEnglish: "The cave is very dark. It needs light to be filled again.",
    x: 72, y: 60, w: 8, h: 10,
  },
  {
    id: "suba",
    labelBisaya: "Suba",
    labelEnglish: "River",
    descriptionBisaya: "Ang suba wala maagay. Ang mga babag kinahanglan tangtangon.",
    descriptionEnglish: "The river is not flowing. The obstacles must be removed.",
    x: 42, y: 75, w: 8, h: 10,
  },
  {
    id: "lampara",
    labelBisaya: "Lampara",
    labelEnglish: "Guiding Lamp",
    descriptionBisaya: "Ang lampara naghatod sa kahayag ngadto sa kangitngit.",
    descriptionEnglish: "The lamp guides light into the darkness.",
    x: 17.5, y: 40, w: 8, h: 10,
  },
];

// ── Diwata intro dialogue (10 lines) ─────────────────────────────────────────
export const DIWATA_INTRO_DIALOGUE = [
  {
    speaker: "Diwata",
    bisayaText: "Kumusta... Ako si Diwata, tigbantay sa kalasangan parehas ni Lunti.",
    englishText: "Hello... I am Diwata, a guardian of the forest just like Lunti.",
  },
  {
    speaker: "Diwata",
    bisayaText: "Pasayloa ko sa akong kahimtang... medyo huyang na ang akong gahum.",
    englishText: "Forgive my state... my power has become weak.",
  },
  {
    speaker: "Diwata",
    bisayaText: "Ang kalasangan diri kaniadto hayag ug puno sa kinabuhi.",
    englishText: "This forest was once bright and full of life.",
  },
  {
    speaker: "Diwata",
    bisayaText: "Apan karon... ang mga bulak nalaya ug ang kahayag nagkagamay.",
    englishText: "But now... the flowers have wilted and the light has faded.",
  },
  {
    speaker: "Diwata",
    bisayaText: "Nawala ang balanse sa mga butang nga mag-atbang.",
    englishText: "The balance between opposite things has been lost.",
  },
  {
    speaker: "Diwata",
    bisayaText: "Ang uban nga mga butang kinahanglan magtinabangay pinaagi sa ilang kalahian.",
    englishText: "Some things must work together through their differences.",
  },
  {
    speaker: "Diwata",
    bisayaText: "Ang mga pulong nga parehas ug kahulugan gitawag og SYNONYMS.",
    englishText: "Words that mean the same are called SYNONYMS.",
  },
  {
    speaker: "Diwata",
    bisayaText: "Ang mga pulong nga magkasukwahi gitawag og ANTONYMS.",
    englishText: "Words that are opposites are called ANTONYMS.",
  },
  {
    speaker: "Diwata",
    bisayaText: "Tabangi ko nga ibalik ang kahayag ug balanse sa kalasangan.",
    englishText: "Help me restore the light and balance of this forest.",
  },
  {
    speaker: "Diwata",
    bisayaText: "I-click ang mga bahin sa palibot aron magsugod.",
    englishText: "Click the areas around you to begin.",
  },
];

// ── Per-item approach dialogue (shown when player clicks an item) ──────────────
export const buildGlowDialogue = (item) => {
  const map = {
    bulak: [
      { speaker: "Diwata", bisayaText: "Tan-awa kining mga bulak... nalaya sila tungod sa kawalay balanse.", englishText: "Look at these flowers... they wilted because of lost balance." },
      { speaker: "Diwata", bisayaText: "Tabangi sila nga mubukad pag-usab.", englishText: "Help them bloom again." },
    ],
    langob: [
      { speaker: "Diwata", bisayaText: "Ang langob puno sa kangitngit... wala na ang kahayag niini.", englishText: "The cave is filled with darkness... its light is gone." },
      { speaker: "Diwata", bisayaText: "Ibalik ang kahayag ngadto sa mga ngitngit nga sulod.", englishText: "Restore the light into the dark spaces." },
    ],
    suba: [
      { speaker: "Diwata", bisayaText: "Ang suba wala makaagay... gibabagan sa mga babag.", englishText: "The river cannot flow... it is blocked by obstacles." },
      { speaker: "Diwata", bisayaText: "Limpyohi ang dalan aron makaagay pag-usab ang tubig.", englishText: "Clear the path so the water can flow again." },
    ],
    lampara: [
      { speaker: "Diwata", bisayaText: "Ang lampara gitago sa kangitngit. Kinahanglan ipunting ang kahayag.", englishText: "The lamp hides in darkness. Its light must be directed." },
      { speaker: "Diwata", bisayaText: "I-ikot ang lampara aron maabot ang mga nangayo og kahayag.", englishText: "Rotate the lamp so its light reaches those lost in darkness." },
    ],
  };
  return map[item.id] || [
    { speaker: "Diwata", bisayaText: item.descriptionBisaya, englishText: item.descriptionEnglish },
  ];
};

// ─────────────────────────────────────────────────────────────────────────────
//  Mini-game data sets
// ─────────────────────────────────────────────────────────────────────────────

// ── 1. BLOOM REVIVAL (Wilted Flowers) ────────────────────────────────────────
export const BLOOM_DATA = {
  introDialogue: [
    { bisayaText: "Tan-awa pag-ayo ang bulak.", englishText: "Look carefully at the flower." },
    { bisayaText: "Kinahanglan niya og balanse aron mabuhi pag-usab.", englishText: "It needs balance to grow again." },
    { bisayaText: "Gamita ang mga elemento sa palibot aron ibalik ang iyang kusog.", englishText: "Use the elements around you to restore it." },
  ],
  synonymDialogue: [
    { bisayaText: "Maayo...", englishText: "Good..." },
    { bisayaText: "Naibalik nimo ang balanse.", englishText: "You brought balance back." },
    { bisayaText: "Ang magkasukwahi nga mga butang makatabang sa usag usa.", englishText: "Opposite elements can help each other." },
    { bisayaText: "Sama sa mga pulong nga parehas ug kahulugan.", englishText: "Just like words that mean the same." },
    { bisayaText: "Mao ni ang synonyms.", englishText: "These are synonyms." },
  ],
  antonymDialogue: [
    { bisayaText: "Ug ang magkasukwahi?", englishText: "And the opposites?" },
    { bisayaText: "Huyang ↔ Kusog. Uga ↔ Basa. Ngitngit ↔ Hayag.", englishText: "Weak ↔ Strong. Dry ↔ Wet. Dark ↔ Bright." },
    { bisayaText: "Kining mga pares maoy gitawag og antonyms.", englishText: "These pairs are called antonyms." },
    { bisayaText: "Ang mga antonyms makatabang sa pagbalik sa balanse.", englishText: "Antonyms help restore balance." },
  ],
  // Each slider: name, emoji, target zone [min, max] out of 0-100
  sliders: [
    { id: "light", label: "Kahayag / Light", emoji: "☀️", targetMin: 45, targetMax: 75 },
    { id: "water", label: "Tubig / Water", emoji: "💧", targetMin: 40, targetMax: 70 },
    { id: "wind", label: "Hangin / Wind", emoji: "🌬️", targetMin: 30, targetMax: 65 },
  ],
};

// ── 2. CAVE LIGHT (Dark Cave) ─────────────────────────────────────────────────
export const CAVE_DATA = {
  introDialogue: [
    { bisayaText: "Ang langob puno sa kangitngit.", englishText: "The cave is filled with darkness." },
    { bisayaText: "Kinahanglan ang tamang butang aron maabot ang kahayag.", englishText: "The right things are needed to bring light." },
    { bisayaText: "Pilia ang angay nga tinubdan sa kahayag.", englishText: "Choose the right sources of light." },
  ],
  synonymDialogue: [
    { bisayaText: "Maayo kaayo!", englishText: "Very good!" },
    { bisayaText: "Kining mga butang naghatod sa kahayag.", englishText: "These things bring light." },
    { bisayaText: "Lahi-lahi sila apan parehas ang buhat.", englishText: "They look different but do the same thing." },
    { bisayaText: "Sama sa mga synonyms — lahi ang pulong, parehas ang kahulogan.", englishText: "Like synonyms — different words, same meaning." },
    { bisayaText: "Mao ni ang synonyms.", englishText: "These are synonyms." },
  ],
  antonymDialogue: [
    { bisayaText: "Apan kini dili makahatod og kahayag.", englishText: "But these cannot bring light." },
    { bisayaText: "Bato, dahon, tubig — dili sila tinubdan sa kahayag.", englishText: "Rock, leaf, water — they are not sources of light." },
    { bisayaText: "Sila ang kaatbang sa kahayag.", englishText: "They are the opposite of light." },
    { bisayaText: "Mao ni ang antonyms — ang kahayag ug ang kangitngit.", englishText: "These are antonyms — light and darkness." },
  ],
  // 3 dark zones to fill
  zones: [
    { id: "z1", label: "Left chamber", x: 18, y: 40 },
    { id: "z2", label: "Centre tunnel", x: 50, y: 35 },
    { id: "z3", label: "Right alcove", x: 78, y: 42 },
  ],
  // Items: correct = true means they illuminate
  items: [
    { id: "torch", emoji: "🔦", label: "Torch", correct: true },
    { id: "lantern", emoji: "🏮", label: "Lantern", correct: true },
    { id: "gstone", emoji: "💎", label: "Glowing Stone", correct: true },
    { id: "crystal", emoji: "✨", label: "Sun Crystal", correct: true },
    { id: "rock", emoji: "🪨", label: "Rock", correct: false },
    { id: "leaf", emoji: "🍃", label: "Leaf", correct: false },
    { id: "drop", emoji: "💧", label: "Water Drop", correct: false },
    { id: "wood", emoji: "🪵", label: "Broken Wood", correct: false },
  ],
};

// ── 3. RIVER FLOW (River) ─────────────────────────────────────────────────────
export const RIVER_DATA = {
  introDialogue: [
    { bisayaText: "Ang suba dili na makaagay.", englishText: "The river can no longer flow." },
    { bisayaText: "Ang mga babag naghunong sa tubig.", englishText: "Obstacles have stopped the water." },
    { bisayaText: "I-klik ang mga babag aron tangtangon sila.", englishText: "Click the obstacles to remove them." },
  ],
  synonymDialogue: [
    { bisayaText: "Maayo!", englishText: "Good!" },
    { bisayaText: "Ang suba nakaagay na pag-usab.", englishText: "The river flows once more." },
    { bisayaText: "Ang pag-ayo ug pagbabag pareho og epekto sa tubig.", englishText: "Fixing and blocking have the same effect on water." },
    { bisayaText: "Ang duha ka pulong nga parehas og kahulogan gitawag og synonyms.", englishText: "Two words with the same meaning are called synonyms." },
    { bisayaText: "Mao ni ang synonyms.", englishText: "These are synonyms." },
  ],
  antonymDialogue: [
    { bisayaText: "Gibabagan ↔ Nagaagay.", englishText: "Blocked ↔ Flowing." },
    { bisayaText: "Wala maglihok ↔ Naglihok.", englishText: "Still ↔ Moving." },
    { bisayaText: "Kining mga pares magkasukwahi — mao ni ang antonyms.", englishText: "These pairs are opposites — these are antonyms." },
    { bisayaText: "Ang pag-ayo sa suba nagpakita sa gahum sa mga antonyms.", englishText: "Restoring the river shows the power of antonyms." },
  ],
  // 3 obstacles to clear
  obstacles: [
    { id: "o1", emoji: "🪨", label: "Bato / Boulder", x: 28, y: 45 },
    { id: "o2", emoji: "🪵", label: "Kahoy / Log", x: 50, y: 42 },
    { id: "o3", emoji: "🌿", label: "Sagbot / Weeds", x: 72, y: 47 },
  ],
};

// ── 4. LANTERN GUIDE (Guiding Lamp) ──────────────────────────────────────────
export const LANTERN_DATA = {
  introDialogue: [
    { bisayaText: "Ang lampara adunay kahayag, apan wala pa kini makaabut sa mga nagsalig niini.", englishText: "The lamp has light, but it has not yet reached those who need it." },
    { bisayaText: "I-ikot ang lampara aron i-direksyon ang kahayag.", englishText: "Rotate the lamp to direct its light." },
    { bisayaText: "Itudlo ang kahayag sa tanan nga nagkinahanglan.", englishText: "Point the light toward all who need it." },
  ],
  synonymDialogue: [
    { bisayaText: "Gihayagan nimo ang tanan!", englishText: "You lit everything!" },
    { bisayaText: "Ang kahayag nakaabut sa mga nagtago sa kangitngit.", englishText: "The light reached those hiding in darkness." },
    { bisayaText: "Ang giya ug kahayag magkauban — parehas ang buhat.", englishText: "Guidance and light go together — they do the same thing." },
    { bisayaText: "Sama sa mga synonyms — managsama og kahulogan.", englishText: "Like synonyms — they share the same meaning." },
    { bisayaText: "Mao ni ang synonyms.", englishText: "These are synonyms." },
  ],
  antonymDialogue: [
    { bisayaText: "Hayag ↔ Ngitngit.", englishText: "Light ↔ Dark." },
    { bisayaText: "Makita ↔ Natago.", englishText: "Visible ↔ Hidden." },
    { bisayaText: "Tagda ↔ Nawala.", englishText: "Found ↔ Lost." },
    { bisayaText: "Kini sila antonyms — magkasukwahi apan nagkinabuhi sa usag usa.", englishText: "These are antonyms — opposites that depend on each other." },
  ],
  // 3 targets the beam must hit (angular positions around the lantern)
  // angle in degrees (0 = right, 90 = down, 180 = left, 270 = up)
  targets: [
    { id: "t1", emoji: "🌱", label: "Tanum / Plant", requiredAngle: 315, x: 25, y: 25 },
    { id: "t2", emoji: "🪨", label: "Agianan / Path", requiredAngle: 45, x: 72, y: 28 },
    { id: "t3", emoji: "🦋", label: "Alibangbang / Butterfly", requiredAngle: 180, x: 15, y: 60 },
  ],
  // How many degrees each click rotates the lantern
  rotationStep: 45,
};
