import AssetManifest from "../../../services/AssetManifest";

//  NPC image map 
export const DIWATA_NPC_IMAGES = {
  forest_npc_3: AssetManifest.forest.npcs.diwata,
};

//  Clickable items 
// Positions are placeholders; user will adjust manually
export const GLOW_ITEMS = [
  {
    id: "bulak",
    labelBisaya: "Laya na Bulak",
    labelEnglish: "Wilted Flowers",
    descriptionBisaya: "Kining mga bulak nalaya na. Kinahanglan og tabang aron mubukad sila pag-usab.",
    descriptionEnglish: "These flowers have wilted. They need help to bloom again.",
    x: 65, y: 85, w: 8, h: 10,
  },
  {
    id: "langob",
    labelBisaya: "Langob",
    labelEnglish: "Cave",
    descriptionBisaya: "Ngitngit kaayo ang langob. Kinahanglan ang kahayag aron mapuno kini.",
    descriptionEnglish: "The cave is very dark. It needs light to shine again.",
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
    x: 18.7, y: 40, w: 8, h: 10,
  },
];

export const DIWATA_INTRO_DIALOGUE = [
  {
    speaker: "Diwata",
    bisayaText: "Kumusta... Ako si Diwata, tigbantay sa kalasangan parehas ni Lunti.",
    englishText: "Hello... I am Diwata, a guardian of the forest just like Lunti.",
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

//  Per-item approach dialogue (shown when player clicks an item) 
export const buildGlowDialogue = (item) => {
  const map = {
    bulak: [
      { speaker: "Diwata", bisayaText: "Tan-awa kining mga bulak... nalaya sila tungod wala na ang balanse.", englishText: "Look at these flowers... they wilted because of lost balance." },
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

export const BLOOM_DATA = {
  introDialogue: [
    { bisayaText: "Tan-awa pag-ayo ang bulak.", englishText: "Look carefully at the flower." },
    { bisayaText: "Kinahanglan niya og balanse aron mabuhi pag-usab.", englishText: "It needs balance to grow again." },
    { bisayaText: "Gamita ang mga elemento sa palibot aron ibalik ang iyang kusog.", englishText: "Use the elements around you to restore it." },
  ],
  completionDialogue: [
    { bisayaText: "Mibukad na ang bulak! Salamat kaayo!", englishText: "The flower has bloomed! Thank you!" },
    { bisayaText: "ANTONYMS: Huyang ug Kusog", englishText: "ANTONYMS: Weak and Strong" },
    { bisayaText: "SYNONYMS: Nindot, Gwapa, Matahom", englishText: "SYNONYMS: Beautiful, Pretty, Lovely" },
  ],
  // Each slider: name, emoji, target zone [min, max] out of 0-100
  sliders: [
    { id: "light", label: "Kahayag / Light", emoji: "☀️", targetMin: 45, targetMax: 75 },
    { id: "water", label: "Tubig / Water", emoji: "💧", targetMin: 40, targetMax: 70 },
    { id: "wind", label: "Hangin / Wind", emoji: "🌬️", targetMin: 30, targetMax: 65 },
  ],
};


//  2. CAVE LIGHT (Dark Cave) — Firefly Line-Up 
export const CAVE_DATA = {
  introDialogue: [
    { bisayaText: "Ang langob puno sa kangitngit... gihigtan sa usa ka enchantment.", englishText: "The cave is filled with darkness... held by an enchantment." },
    { bisayaText: "Aron mabuksan ang langob, kinahanglan i-linya sila — gikan sa GAMAY ngadto sa DAKO.", englishText: "To open the cave, we must line them up — from the SMALLEST TO BIGGEST." },
  ],
  feedbackDialogue: [
    { bisayaText: "Ang langob wala motubag...", englishText: "The cave did not respond..." },
    { bisayaText: "Basin sayop ang han-ay sa mga alitaptap. Sulayi pag-usab!", englishText: "Maybe the order of the fireflies is wrong. Try again!" },
  ],
  completionDialogue: [
    { bisayaText: "Hayag na ang langob! Ang mga alitaptap gibutang sa hustong han-ay!", englishText: "The cave is illuminated! The fireflies were placed in the right order!" },
  ],
  // No zones/items — the firefly game builds its own internal state.
};

//  3. RIVER FLOW (River) 
export const RIVER_DATA = {
  introDialogue: [
    { bisayaText: "Ang suba dili na makaagay.", englishText: "The river can no longer flow." },
    { bisayaText: "Ang mga babag naghunong sa tubig — bato, kahoy, ug paragos nga sagbot.", englishText: "Things are blocking the water — a rock, a log, and dried grass." },
    { bisayaText: "I-hold ang matag babag aron tangtangon sila sa dalan sa suba.", englishText: "Hold down on each one to remove it from the river's path." },
  ],
  completionDialogue: [
    { bisayaText: "Nakaagay na ang suba! Salamat sa imong kusog!", englishText: "The river flows again! Thank you for your strength!" },
  ],
  // 3 obstacles to clear (ids map to image assets in RiverFlowGame.jsx)
  obstacles: [
    { id: "o1", label: "Bato / Boulder", x: 28, y: 45 },
    { id: "o2", label: "Kahoy / Log", x: 50, y: 42 },
    { id: "o3", label: "Paragos / Dried Grass", x: 72, y: 47 },
  ],
};

//  4. LANTERN GUIDE (Guiding Lamp) 
export const LANTERN_DATA = {
  introDialogue: [
    { bisayaText: "Ang lampara adunay duha ka galakon nga porma — ang sulod ug ang gawas.", englishText: "The lamp has two magic circles — the inner one and the outer one." },
    { bisayaText: "Ang SULOD: I-ikot hangtod kini mosiga pag-ayo — HAYAG, dili NGITNGIT.", englishText: "The INNER circle: Rotate it until it glows fully bright — HAYAG (bright), not NGITNGIT (dark)." },
    { bisayaText: "Ang GAWAS: I-ikot hangtod ang amihan, habagat, silangan, ug kasadpan maabot sa hustong direksyon.", englishText: "The OUTER circle: Rotate it until north, south, east, and west align to the right direction." },
    { bisayaText: "Kung tama na ang duha, ang lampara magsiga ug makatabang sa tanan!", englishText: "When both are correct, the lamp will shine and guide everyone!" },
  ],
  // Brightness ring: 3 snap positions (step = 120°)
  // 0° = no light, 120° = dim, 240° = bright (correct)
  brightnessCorrectAngle: 240,
  brightnessStep: 120,
  // Compass ring: 4 snap positions (step = 90°), correct when compass = 0° (N at top)
  compassCorrectAngle: 0,
  compassStep: 90,
  completionDialogue: [
    { bisayaText: "Nagsiga na ang lampara! Salamat!", englishText: "The lamp shines! Thank you!" },
  ],
};
