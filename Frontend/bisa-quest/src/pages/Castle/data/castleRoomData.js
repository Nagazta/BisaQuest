import AssetManifest from "../../../services/AssetManifest";

export const CASTLE_NPC_IMAGES = {
  castle_npc_1: AssetManifest.castle.npcs.princess_hara,
};

// ─────────────────────────────────────────────────────────────────────────────
//  CASTLE_QUESTS
//  Princess Hara — 3 scenes in order:
//    0 · Castle Gate      → /castle/gate
//    1 · Castle Courtyard → /castle/courtyard
//    2 · Castle Library   → /castle/library
//  Each item's compound word is hidden inside its English name.
// ─────────────────────────────────────────────────────────────────────────────
export const CASTLE_QUESTS = {

  // ══════════════════════════════════════════════════════════════════════════
  //  Princess Hara — castle_npc_1
  // ══════════════════════════════════════════════════════════════════════════
  castle_npc_1: [

    // ── Quest 0: Castle Gate (/castle/gate) ─────────────────────────────────
    {
      index: 0,
      sceneName: "Castle Gate",
      background: AssetManifest.castle.scenarios.gate,
      introDialogue: [
        {
          speaker: "Princess Hara",
          bisayaText: "Maayong pag-abot! Ako si Princess Hara. Kini ang Castle Gate!",
          englishText: "Welcome! I am Princess Hara. This is the Castle Gate!",
        },
        {
          speaker: "Princess Hara",
          bisayaText: "Kini ang pultahan sa among kastilyo — puno og Compound Words!",
          englishText: "This is the entrance to our castle — full of Compound Words!",
        },
        {
          speaker: "Princess Hara",
          bisayaText: "Matun-an nato ang mga pulong nga gihiusa para makahimo og bag-ong pulong!",
          englishText: "Let us learn words that are joined together to form a new word!",
        },
        {
          speaker: "Princess Hara",
          bisayaText: "I-click ang mga butang sa Gate para makat-on!",
          englishText: "Click the items at the Gate to learn!",
        },
      ],
      items: [
        {
          id: "drawbridge",
          labelBisaya: "Tulay / Bridge",
          labelEnglish: "Drawbridge",
          descriptionBisaya: "Usa ka tulay nga mahimong itaas o ipaubos ibabaw sa moat para kontrol-on ang pagsulod sa kastilyo.",
          descriptionEnglish: "A bridge that can be raised or lowered over a moat to allow or block entry into the castle.",
          x: -0.5, y: 50, w: 50, h: 18,
          compoundWord: { word1: "DRAW", word2: "BRIDGE", result: "DRAWBRIDGE", bisayaResult: "Taas-ubos nga Tulay", distractors: ["DOOR", "MOAT"] },
          applyGame: {
            sceneBefore: AssetManifest.castle.scenarios.brokenBridge,
            sceneAfter:  AssetManifest.castle.scenarios.gate,
            draggable: { image: AssetManifest.castle.scenarios.draw, label: "DRAW", startX: 78, startY: 72 },
            dropZone:  { x: 10, y: 50, w: 50, h: 35 },
            hintBisaya:  "I-drag ang tulay sa agianan para mahimo og drawbridge!",
            hintEnglish: "Drag the draw onto the path to create the drawbridge!",
          },
        },
        {
          id: "doorway",
          labelBisaya: "Purtahan / Door",
          labelEnglish: "Doorway",
          descriptionBisaya: "Usa ka bukas nga parte sa dingding nga adunay purtahan, mao ang panguna nga pagsulod sa kastilyo.",
          descriptionEnglish: "An opening in a wall fitted with a door, serving as the main entrance to the castle.",
          x: 38, y: 18, w: 25, h: 55,
          compoundWord: { word1: "DOOR", word2: "WAY", result: "DOORWAY", bisayaResult: "Purtahan", distractors: ["ARCH", "PATH"] },
          applyGame: {
            sceneBefore: AssetManifest.castle.scenarios.doorOpen,
            sceneAfter:  AssetManifest.castle.scenarios.doorway,
            draggable: { image: AssetManifest.castle.scenarios.door, label: "DOOR", startX: 78, startY: 72 },
            dropZone:  { x: 25, y: 15, w: 40, h: 70 },
            hintBisaya:  "I-drag ang pultahan sa bukas nga paagi para mahimo og doorway!",
            hintEnglish: "Drag the door onto the open way to create a doorway!",
          },
        },
        {
          id: "keyhole",
          labelBisaya: "Yawi / Key",
          labelEnglish: "Keyhole",
          descriptionBisaya: "Usa ka gamay nga buho sa kandado diin isulod ang tamang yawi para ablihi kini.",
          descriptionEnglish: "A small slot in a lock through which the correct key is inserted to open it.",
          x: 48, y: 29, w: 6, h: 10,
          compoundWord: { word1: "KEY", word2: "HOLE", result: "KEYHOLE", bisayaResult: "Buho sa Yawi", distractors: ["LOCK", "SLOT"] },
          applyGame: {
            sceneBefore: AssetManifest.castle.scenarios.locked,
            sceneAfter:  AssetManifest.castle.scenarios.unlocked,
            draggable: { image: AssetManifest.castle.scenarios.key, label: "KEY", startX: 78, startY: 72 },
            dropZone:  { x: 42, y: 28, w: 16, h: 26 },
            hintBisaya:  "I-drag ang yawi sa buho sa kandado para ablihan kini!",
            hintEnglish: "Drag the key into the keyhole to unlock it!",
          },
        },
        {
          id: "pathway",
          labelBisaya: "Agianan",
          labelEnglish: "Pathway",
          descriptionBisaya: "Usa ka makitid nga agianan nga bato nga gihimo para ligtas nga malaktan padulong sa kastilyo.",
          descriptionEnglish: "A narrow stone walkway built for people to walk along safely toward the castle.",
          x: 33, y: 80, w: 34, h: 10,
          compoundWord: { word1: "PATH", word2: "WAY", result: "PATHWAY", bisayaResult: "Agianan", distractors: ["ROAD", "WALK"] },
          applyGame: {
            sceneBefore: AssetManifest.castle.scenarios.path,
            sceneAfter:  AssetManifest.castle.scenarios.pathway,
            draggable: { image: AssetManifest.castle.scenarios.footprint, label: "WAY", startX: 78, startY: 72 },
            dropZone:  { x: 20, y: 40, w: 55, h: 40 },
            hintBisaya:  "I-drag ang mga tiil-tiil sa agianan para mahimo og pathway!",
            hintEnglish: "Drag the footprints onto the path to create a pathway!",
          },
        },
        {
          id: "waterway",
          labelBisaya: "Agianan sa Tubig / Waterway",
          labelEnglish: "Waterway",
          descriptionBisaya: "Usa ka natural o gihimong agianan sa tubig, sama sa moat sa palibot sa kastilyo.",
          descriptionEnglish: "A natural or man-made channel of water, like the moat that surrounds the castle.",
          x: 28, y: 60, w: 84, h: 12,
          compoundWord: { word1: "WATER", word2: "WAY", result: "WATERWAY", bisayaResult: "Agianan sa Tubig", distractors: ["RIVER", "FLOW"] },
          applyGame: {
            sceneBefore: AssetManifest.castle.scenarios.way,
            sceneAfter:  AssetManifest.castle.scenarios.waterway,
            draggable: { image: AssetManifest.castle.scenarios.water, label: "WATER", startX: 78, startY: 72 },
            dropZone:  { x: 30, y: 50, w: 50, h: 40 },
            hintBisaya:  "I-drag ang tubig sa agianan para mahimo og waterway!",
            hintEnglish: "Drag the water onto the path to create a waterway!",
          },
        },
        {
          id: "grassland",
          labelBisaya: "Damuhan / Grass",
          labelEnglish: "Grassland",
          descriptionBisaya: "Usa ka dapit nga puno og sagbot ug berde nga mga tanom sa palibot sa kastilyo.",
          descriptionEnglish: "A wide open area of land covered with grass growing around the castle.",
          x: 75, y: 34, w: 20, h: 28,
          compoundWord: { word1: "GRASS", word2: "LAND", result: "GRASSLAND", bisayaResult: "Damuhan", distractors: ["FIELD", "GREEN"] },
          applyGame: {
            sceneBefore: AssetManifest.castle.scenarios.land,
            sceneAfter:  AssetManifest.castle.scenarios.grassland,
            draggable: { image: AssetManifest.castle.scenarios.grass, label: "GRASS", startX: 78, startY: 72 },
            dropZone:  { x: 20, y: 30, w: 55, h: 50 },
            hintBisaya:  "I-drag ang sagbot sa yuta para mahimo og grassland!",
            hintEnglish: "Drag the grass onto the land to create a grassland!",
          },
        },
        {
          id: "stonework",
          labelBisaya: "Bato / Stone",
          labelEnglish: "Stonework",
          descriptionBisaya: "Ang kahanas sa pagtukod gamit ang mga bato, makita sa mga dingding sa kastilyo.",
          descriptionEnglish: "The craft of constructing structures using shaped and fitted stone, seen in the castle walls.",
          x: 20, y: -5, w: 22, h: 50,
          compoundWord: { word1: "STONE", word2: "WORK", result: "STONEWORK", bisayaResult: "Trabaho sa Bato", distractors: ["BRICK", "BUILD"] },
          applyGame: {
            sceneBefore: AssetManifest.castle.scenarios.stone,
            sceneAfter:  AssetManifest.castle.scenarios.stonework,
            draggable: { image: AssetManifest.castle.scenarios.hammer, label: "WORK", startX: 78, startY: 72 },
            dropZone:  { x: 20, y: 20, w: 30, h: 50 },
            hintBisaya:  "I-drag ang martilyo sa bato para makahimo og stonework!",
            hintEnglish: "Drag the hammer onto the stone to create stonework!",
          },
        },
      ],
    },

    // ── Quest 1: Castle Courtyard (/castle/courtyard) ───────────────────────
    {
      index: 1,
      sceneName: "Castle Courtyard",
      background: AssetManifest.castle.scenarios.courtyard,
      introDialogue: [
        {
          speaker: "Princess Hara",
          bisayaText: "Maayo! Karon adto kita sa Courtyard — ang tanaman sa kastilyo!",
          englishText: "Great job! Now let us go to the Courtyard — the castle's garden!",
        },
        {
          speaker: "Princess Hara",
          bisayaText: "Daghan compound words ang makita dinhi sa Courtyard ug Garden. I-click ang mga butang!",
          englishText: "Many compound words can be found here in the Courtyard and Garden. Click the items!",
        },
      ],
      items: [
        {
          id: "flagpole",
          labelBisaya: "Poste sa Bandila / Flagpole",
          labelEnglish: "Flagpole",
          descriptionBisaya: "Usa ka taas nga poste nga adunay bandila sa ibabaw, makita sa courtyard sa kastilyo.",
          descriptionEnglish: "A tall pole with a flag at the top, found standing in the castle courtyard.",
          x: 65, y: -0.9, w: 6, h: 55,
          compoundWord: { word1: "FLAG", word2: "POLE", result: "FLAGPOLE", bisayaResult: "Poste sa Bandila", distractors: ["ROPE", "MAST"] },
          applyGame: {
            sceneBefore: AssetManifest.castle.scenarios.pole,
            sceneAfter:  AssetManifest.castle.scenarios.flagpole,
            draggable: { image: AssetManifest.castle.scenarios.flag, label: "FLAG", startX: 78, startY: 72 },
            dropZone:  { x: 40, y: 5, w: 18, h: 55 },
            hintBisaya:  "I-drag ang bandila sa poste para mahimo og flagpole!",
            hintEnglish: "Drag the flag onto the pole to create a flagpole!",
          },
        },
        {
          id: "courtyard",
          labelBisaya: "Korte / Patio",
          labelEnglish: "Courtyard",
          descriptionBisaya: "Usa ka abli nga lugar nga gilibutan og mga dingding o mga bilding, sama sa espasyo sa kastilyo.",
          descriptionEnglish: "An open area of ground surrounded by walls or buildings, like the open space of the castle.",
          x: 18, y: 72, w: 62, h: 20,
          compoundWord: { word1: "COURT", word2: "YARD", result: "COURTYARD", bisayaResult: "Korte / Patyo", distractors: ["GARDEN", "FIELD"] },
          applyGame: {
            sceneBefore: AssetManifest.castle.scenarios.noCourtyard,
            sceneAfter:  AssetManifest.castle.scenarios.courtyard,
            draggable: { image: AssetManifest.castle.scenarios.yard, label: "YARD", startX: 78, startY: 72 },
            dropZone:  { x: 15, y: 55, w: 65, h: 35 },
            hintBisaya:  "I-drag ang sagbot sa korte para mahimo og courtyard!",
            hintEnglish: "Drag the grass onto the court to create a courtyard!",
          },
        },
        {
          id: "rooftop",
          labelBisaya: "Atop sa Bilding / Rooftop",
          labelEnglish: "Rooftop",
          descriptionBisaya: "Ang pinaka-tass nga bahin sa atop sa kastilyo, makita gikan sa courtyard.",
          descriptionEnglish: "The very top surface of the castle roof, visible from the courtyard below.",
          x: 5, y: 2, w: 88, h: 18,
          compoundWord: { word1: "ROOF", word2: "TOP", result: "ROOFTOP", bisayaResult: "Atop sa Bilding", distractors: ["CEIL", "PEAK"] },
          wordEmojis: { ROOF: "🏠", TOP: "⬆️", CEIL: "🪟", PEAK: "⛰️" },
          applyGame: {
            sceneBefore: AssetManifest.castle.scenarios.noRooftop,
            sceneAfter:  AssetManifest.castle.scenarios.courtyard,
            draggable: { image: AssetManifest.castle.scenarios.roof, label: "ROOF", startX: 78, startY: 72 },
            dropZone:  { x: 5, y: 2, w: 88, h: 30 },
            hintBisaya:  "I-drag ang atop sa bilding para mahimo og rooftop!",
            hintEnglish: "Drag the roof onto the building to create a rooftop!",
          },
        },
        {
          id: "archway",
          labelBisaya: "Arko nga Agianan / Archway",
          labelEnglish: "Archway",
          descriptionBisaya: "Usa ka arko nga sudlan or agianan nga gihimo sa bato, kasagaran makita sa mga kastilyo.",
          descriptionEnglish: "A curved stone entrance or passage commonly found in castles and old buildings.",
          x: 30, y: 20, w: 38, h: 55,
          compoundWord: { word1: "ARCH", word2: "WAY", result: "ARCHWAY", bisayaResult: "Arko nga Paagi", distractors: ["GATE", "PATH"] },
          applyGame: {
            sceneBefore: AssetManifest.castle.scenarios.arch,
            sceneAfter:  AssetManifest.castle.scenarios.courtyard,
            draggable: { image: AssetManifest.castle.scenarios.archWay, label: "WAY", startX: 78, startY: 72 },
            dropZone:  { x: 25, y: 20, w: 45, h: 60 },
            hintBisaya:  "I-drag ang agianan sa arko para mahimo og archway!",
            hintEnglish: "Drag the way into the arch to create an archway!",
          },
        },
        {
          id: "sunlight",
          labelBisaya: "Kahayag sa Adlaw / Sunlight",
          labelEnglish: "Sunlight",
          descriptionBisaya: "Ang kahayag nga gikan sa adlaw nga naghatag og init ug liwanag sa tibuok courtyard.",
          descriptionEnglish: "The light that comes from the sun, filling the courtyard with warmth and brightness.",
          x: 10, y: 3, w: 38, h: 14,
          compoundWord: { word1: "SUN", word2: "LIGHT", result: "SUNLIGHT", bisayaResult: "Kahayag sa Adlaw", distractors: ["GLOW", "BEAM"] },
          applyGame: {
            sceneBefore: AssetManifest.castle.scenarios.noLight,
            sceneAfter:  AssetManifest.castle.scenarios.sunlight,
            draggable: { image: AssetManifest.castle.scenarios.sun, label: "SUN", startX: 78, startY: 72 },
            dropZone:  { x: 20, y: 5, w: 55, h: 45 },
            hintBisaya:  "I-drag ang adlaw para mahimo og sunlight!",
            hintEnglish: "Drag the sun to create sunlight!",
          },
        },
      ],
    },

    // ── Quest 2: Castle Library (/castle/library) ────────────────────────────
    {
      index: 2,
      sceneName: "Castle Library",
      background: AssetManifest.castle.scenarios.library,
      introDialogue: [
        {
          speaker: "Princess Hara",
          bisayaText: "Katapusan na! Kini ang Library — ang pinaka-espesyal nga lawak sa kastilyo!",
          englishText: "Last one! This is the Library — the most special room in the castle!",
        },
        {
          speaker: "Princess Hara",
          bisayaText: "Dinhi, i-drag ang mga butang para makita ang compound words. Kaya nimo!",
          englishText: "Here, drag the items to discover the compound words. You can do it!",
        },
      ],
      items: [
        // ── All library items use the visual drag mechanic ───────────────────
        {
          id: "bookshelf",
          labelBisaya: "Estante sa Libro",
          labelEnglish: "Bookshelf",
          descriptionBisaya: "Usa ka taas nga muwebles nga adunay mga patag na suporta para sa pagtago sa mga libro.",
          descriptionEnglish: "A tall piece of furniture with flat horizontal supports used for storing books.",
          x: 23, y: 9, w: 18, h: 78,
          mechanic: "visual_drag",
          visualDrag: {
            dragLabel: "Book / Libro",   dragEmoji: "📖",
            targetLabel: "Shelf / Estante", targetEmoji: "🗄️",
            resultEmoji: "📚",
            instructionBisaya: "I-drag ang libro ngadto sa estante!",
            instructionEnglish: "Drag the book onto the shelf!",
          },
          compoundWord: { word1: "BOOK", word2: "SHELF", result: "BOOKSHELF", bisayaResult: "Estante sa Libro", distractors: ["DOOR", "CASE"] },
        },
        {
          id: "candlelight",
          labelBisaya: "Chandelier / Kandila",
          labelEnglish: "Candlelight",
          descriptionBisaya: "Ang mahumok ug init nga kahayag nga gikan sa nagdilaab nga mga kandila. Maganda siya sa gabii!",
          descriptionEnglish: "The soft, warm glow that comes from burning candles. It makes the room feel cosy at night!",
          x: 33, y: 2, w: 32, h: 22,
          mechanic: "visual_drag",
          visualDrag: {
            dragLabel: "Candle / Kandila",  dragEmoji: "🕯️",
            targetLabel: "Light / Kahayag", targetEmoji: "💡",
            resultEmoji: "✨",
            instructionBisaya: "I-drag ang kandila ngadto sa kahayag!",
            instructionEnglish: "Drag the candle to the light!",
          },
          compoundWord: { word1: "CANDLE", word2: "LIGHT", result: "CANDLELIGHT", bisayaResult: "Chandelier / Kandila", distractors: ["WAX", "FLAME"] },
        },
        {
          id: "windowsill",
          labelBisaya: "Bintana nga May Kolor",
          labelEnglish: "Windowsill",
          descriptionBisaya: "Ang patag nga bahin sa ilawom sa frame sa bintana. Kasagaran gamiton para sa pagbutang og mga bulak o dekorasyon.",
          descriptionEnglish: "The flat ledge at the bottom of a window frame. Often used to place flowers or decorations.",
          x: 74, y: 4, w: 13, h: 68,
          mechanic: "visual_drag",
          visualDrag: {
            dragLabel: "Window / Bintana",      dragEmoji: "🪟",
            targetLabel: "Sill / Bahandilaan",  targetEmoji: "🪨",
            resultEmoji: "🌈",
            instructionBisaya: "I-drag ang bintana ngadto sa sill!",
            instructionEnglish: "Drag the window onto the sill!",
          },
          compoundWord: { word1: "WINDOW", word2: "SILL", result: "WINDOWSILL", bisayaResult: "Bintana nga May Kolor", distractors: ["DOOR", "PANE"] },
        },
        {
          id: "fireplace",
          labelBisaya: "Sunoganan / Fireplace",
          labelEnglish: "Fireplace",
          descriptionBisaya: "Usa ka istraktura nga gitukod sa dingding para sa kalayo. Nagpainit kini sa tibuok lawak sa tingtugnaw.",
          descriptionEnglish: "A structure built into the wall that holds a fire. It warms the whole room during cold weather.",
          x: 16, y: 47, w: 13, h: 33,
          mechanic: "visual_drag",
          visualDrag: {
            dragLabel: "Fire / Kalayo",  dragEmoji: "🔥",
            targetLabel: "Place / Lugar", targetEmoji: "🏠",
            resultEmoji: "🔥",
            instructionBisaya: "I-drag ang kalayo ngadto sa lugar!",
            instructionEnglish: "Drag the fire into the place!",
          },
          compoundWord: { word1: "FIRE", word2: "PLACE", result: "FIREPLACE", bisayaResult: "Sunoganan", distractors: ["WOOD", "WARM"] },
        },
        {
          id: "candlestick",
          labelBisaya: "Kandelero / Candlestick",
          labelEnglish: "Candlestick",
          descriptionBisaya: "Usa ka suportahan nga gigamit para itindog ang kandila samtang nagsiga. Makita kini sa mga lamesa sa library.",
          descriptionEnglish: "A holder designed to support a candle upright while it burns. You can see them on the library table.",
          x: 67, y: 63, w: 20, h: 11,
          mechanic: "visual_drag",
          visualDrag: {
            dragLabel: "Candle / Kandila", dragEmoji: "🕯️",
            targetLabel: "Stick / Tungkod", targetEmoji: "🪵",
            resultEmoji: "🕯️",
            instructionBisaya: "I-drag ang kandila ngadto sa stick!",
            instructionEnglish: "Drag the candle onto the stick!",
          },
          compoundWord: { word1: "CANDLE", word2: "STICK", result: "CANDLESTICK", bisayaResult: "Tangkayan sa Kandila", distractors: ["WAX", "HOLDER"] },
        },
        {
          id: "storybook",
          labelBisaya: "Libro sa Istorya / Storybook",
          labelEnglish: "Storybook",
          descriptionBisaya: "Usa ka libro nga adunay mga istorya, kasagaran adunay mga hulagway, para basahon sa mga bata.",
          descriptionEnglish: "A book containing stories, often with pictures, meant to be read by children.",
          x: 39, y: 73, w: 17, h: 11,
          mechanic: "visual_drag",
          visualDrag: {
            dragLabel: "Story / Istorya", dragEmoji: "📝",
            targetLabel: "Book / Libro",  targetEmoji: "📖",
            resultEmoji: "📕",
            instructionBisaya: "I-drag ang istorya ngadto sa libro!",
            instructionEnglish: "Drag the story into the book!",
          },
          compoundWord: { word1: "STORY", word2: "BOOK", result: "STORYBOOK", bisayaResult: "Libro sa Istorya", distractors: ["READ", "TALE"] },
        },
        {
          id: "armchair",
          labelBisaya: "Lingkoranan / Chair",
          labelEnglish: "Armchair",
          descriptionBisaya: "Usa ka komportable nga lingkoranan nga adunay suportahan para sa mga braso sa duha ka kilid.",
          descriptionEnglish: "A comfortable padded chair that has rests for your arms on both sides.",
          x: 45, y: 54, w: 9, h: 24,
          mechanic: "visual_drag",
          visualDrag: {
            dragLabel: "Arm / Braso",       dragEmoji: "💪",
            targetLabel: "Chair / Lingkoranan", targetEmoji: "🪑",
            resultEmoji: "🪑",
            instructionBisaya: "I-drag ang braso ngadto sa lingkoranan!",
            instructionEnglish: "Drag the arm onto the chair!",
          },
          compoundWord: { word1: "ARM", word2: "CHAIR", result: "ARMCHAIR", bisayaResult: "Lingkoranan", distractors: ["SEAT", "REST"] },
        },
      ],
    },
  ],
};

// ── Helpers ───────────────────────────────────────────────────────────────────
export const getQuestData = (npcId, questIndex = 0) => {
  const quests = CASTLE_QUESTS[npcId];
  if (!quests) return null;
  return quests[questIndex] ?? null;
};

export const getTotalQuests = (npcId) => {
  return CASTLE_QUESTS[npcId]?.length ?? 0;
};

// ── Item dialogue builder ──────────────────────────────────────────────────────
// Line 1 — introduce the item by name
// Line 2 — explain what it IS (meaning, no formula)
// Line 3 — challenge: figure out the two words
export const buildCastleDialogue = (region, npcName) => [
  {
    speaker: npcName,
    bisayaText: `Tan-awa kini — ang "${region.labelBisaya}"!`,
    englishText: `Look at this — the "${region.labelEnglish}"!`,
  },
  {
    speaker: npcName,
    bisayaText: region.descriptionBisaya,
    englishText: region.descriptionEnglish,
  },
  {
    speaker: npcName,
    bisayaText: `Hmm... Unsa nga duha ka pulong ang nagtukod sa pulong nga "${region.labelEnglish}"? Sulayan nato!`,
    englishText: `Hmm... What two words make up the word "${region.labelEnglish}"? Let's find out!`,
  },
];
