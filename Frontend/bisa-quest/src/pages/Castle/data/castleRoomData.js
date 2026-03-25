import AssetManifest from "../../../services/AssetManifest";

export const CASTLE_NPC_IMAGES = {
  castle_npc_1: AssetManifest.castle.npcs.princess_hara,
};


export const CASTLE_QUESTS = {
  castle_npc_1: [

    //  Quest 0: Castle Gate (/castle/gate) ─────────────────────────────────
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
          labelBisaya: "Tulay",
          labelEnglish: "Drawbridge",
          descriptionBisaya: "Usa ka tulay nga mahimong itaas o ipaubos para makasulod o dili sa kastilyo.",
          descriptionEnglish: "A bridge that can go up or down to let people in or out of the castle.",
          x: -0.5, y: 50, w: 50, h: 18,
          compoundWord: { word1: "DRAW", word2: "BRIDGE", result: "DRAWBRIDGE", bisayaResult: "Taas-ubos nga Tulay", distractors: ["DOOR", "MOAT"] },
          applyGame: {
            sceneBefore: AssetManifest.castle.scenarios.brokenBridge,
            sceneAfter: AssetManifest.castle.scenarios.gate,
            draggable: { image: AssetManifest.castle.scenarios.draw, label: "DRAW", startX: 78, startY: 72 },
            dropZone: { x: 27, y: 50, w: 43, h: 38 },
            hintBisaya: "I-drag ang tulay sa agianan para mahimo og drawbridge!",
            hintEnglish: "Drag the draw onto the path to create the drawbridge!",
          },
        },
        {
          id: "doorway",
          labelBisaya: "Purtahan",
          labelEnglish: "Doorway",
          descriptionBisaya: "Usa ka bukas nga bahin sa dingding nga adunay purtahan. Dinhi ka mosulod sa kastilyo.",
          descriptionEnglish: "An opening in a wall with a door. This is where you enter the castle.",
          x: 38, y: 18, w: 25, h: 55,
          compoundWord: { word1: "DOOR", word2: "WAY", result: "DOORWAY", bisayaResult: "Purtahan", distractors: ["ARCH", "PATH"] },
          applyGame: {
            sceneBefore: AssetManifest.castle.scenarios.doorOpen,
            sceneAfter: AssetManifest.castle.scenarios.doorway,
            draggable: { image: AssetManifest.castle.scenarios.door, label: "DOOR", startX: 78, startY: 72 },
            dropZone: { x: 36, y: 13, w: 26, h: 58 },
            hintBisaya: "I-drag ang pultahan sa bukas nga paagi para mahimo og doorway!",
            hintEnglish: "Drag the door onto the open way to create a doorway!",
          },
        },
        {
          id: "keyhole",
          labelBisaya: "Yawi",
          labelEnglish: "Keyhole",
          descriptionBisaya: "Usa ka gamay nga buho sa kandado diin isulod ang tamang yawi para ablihi kini.",
          descriptionEnglish: "A small hole in a lock. Put the right key in to open it.",
          x: 48, y: 29, w: 6, h: 10,
          compoundWord: { word1: "KEY", word2: "HOLE", result: "KEYHOLE", bisayaResult: "Buho sa Yawi", distractors: ["LOCK", "SLOT"] },
          applyGame: {
            sceneBefore: AssetManifest.castle.scenarios.locked,
            sceneAfter: AssetManifest.castle.scenarios.unlocked,
            draggable: { image: AssetManifest.castle.scenarios.key, label: "KEY", startX: 78, startY: 72 },
            dropZone: { x: 42, y: 58, w: 16, h: 26 },
            hintBisaya: "I-drag ang yawi sa buho sa kandado para ablihan kini!",
            hintEnglish: "Drag the key into the keyhole to unlock it!",
          },
        },
        {
          id: "pathway",
          labelBisaya: "Agianan",
          labelEnglish: "Pathway",
          descriptionBisaya: "Usa ka makitid nga agianan nga bato. Dinhi ka molakaw padulong sa kastilyo.",
          descriptionEnglish: "A narrow stone path for people to walk on toward the castle.",
          x: 33, y: 80, w: 34, h: 10,
          compoundWord: { word1: "PATH", word2: "WAY", result: "PATHWAY", bisayaResult: "Agianan", distractors: ["ROAD", "WALK"] },
          applyGame: {
            sceneBefore: AssetManifest.castle.scenarios.path,
            sceneAfter: AssetManifest.castle.scenarios.pathway,
            draggable: { image: AssetManifest.castle.scenarios.footprint, label: "WAY", startX: 78, startY: 72 },
            dropZone: { x: 20, y: 40, w: 55, h: 40 },
            hintBisaya: "I-drag ang mga tiil-tiil sa agianan para mahimo og pathway!",
            hintEnglish: "Drag the footprints onto the path to create a pathway!",
          },
        },
        {
          id: "waterway",
          labelBisaya: "Agianan sa Tubig",
          labelEnglish: "Waterway",
          descriptionBisaya: "Usa ka agianan sa tubig sa palibot sa kastilyo.",
          descriptionEnglish: "A path of water that goes around the castle.",
          x: 28, y: 60, w: 84, h: 12,
          compoundWord: { word1: "WATER", word2: "WAY", result: "WATERWAY", bisayaResult: "Agianan sa Tubig", distractors: ["RIVER", "FLOW"] },
          applyGame: {
            sceneBefore: AssetManifest.castle.scenarios.way,
            sceneAfter: AssetManifest.castle.scenarios.waterway,
            draggable: { image: AssetManifest.castle.scenarios.water, label: "WATER", startX: 78, startY: 72 },
            dropZone: { x: 28, y: 50, w: 45, h: 40 },
            hintBisaya: "I-drag ang tubig sa agianan para mahimo og waterway!",
            hintEnglish: "Drag the water onto the path to create a waterway!",
          },
        },
        {
          id: "grassland",
          labelBisaya: "Damuhan",
          labelEnglish: "Grassland",
          descriptionBisaya: "Usa ka dapit nga puno og sagbot ug berde nga mga tanom.",
          descriptionEnglish: "A big open area of land covered with green grass.",
          x: 75, y: 34, w: 20, h: 28,
          compoundWord: { word1: "GRASS", word2: "LAND", result: "GRASSLAND", bisayaResult: "Damuhan", distractors: ["FIELD", "GREEN"] },
          applyGame: {
            sceneBefore: AssetManifest.castle.scenarios.land,
            sceneAfter: AssetManifest.castle.scenarios.grassland,
            draggable: { image: AssetManifest.castle.scenarios.grass, label: "GRASS", startX: 78, startY: 72 },
            dropZone: { x: 20, y: 30, w: 55, h: 50 },
            hintBisaya: "I-drag ang sagbot sa yuta para mahimo og grassland!",
            hintEnglish: "Drag the grass onto the land to create a grassland!",
          },
        },
        {
          id: "stonework",
          labelBisaya: "Bato",
          labelEnglish: "Stonework",
          descriptionBisaya: "Ang pagtukod gamit ang mga bato. Makita kini sa mga dingding sa kastilyo.",
          descriptionEnglish: "Building things using stones. You can see it in the castle walls.",
          x: 20, y: -5, w: 22, h: 50,
          compoundWord: { word1: "STONE", word2: "WORK", result: "STONEWORK", bisayaResult: "Trabaho sa Bato", distractors: ["BRICK", "BUILD"] },
          applyGame: {
            sceneBefore: AssetManifest.castle.scenarios.stone,
            sceneAfter: AssetManifest.castle.scenarios.stonework,
            draggable: { image: AssetManifest.castle.scenarios.hammer, label: "WORK", startX: 78, startY: 72 },
            dropZone: { x: 20, y: 20, w: 30, h: 50 },
            hintBisaya: "I-drag ang martilyo sa bato para makahimo og stonework!",
            hintEnglish: "Drag the hammer onto the stone to create stonework!",
          },
        },
      ],
    },

    //  Quest 1: Castle Courtyard (/castle/courtyard) 
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
          labelBisaya: "Poste sa Bandila",
          labelEnglish: "Flagpole",
          descriptionBisaya: "Usa ka taas nga poste nga adunay bandila sa ibabaw.",
          descriptionEnglish: "A tall pole with a flag on top.",
          x: 65, y: -0.9, w: 6, h: 55,
          compoundWord: { word1: "FLAG", word2: "POLE", result: "FLAGPOLE", bisayaResult: "Poste sa Bandila", distractors: ["ROPE", "MAST"] },
          applyGame: {
            sceneBefore: AssetManifest.castle.scenarios.pole,
            sceneAfter: AssetManifest.castle.scenarios.flagpole,
            draggable: { image: AssetManifest.castle.scenarios.flag, label: "FLAG", startX: 78, startY: 72 },
            dropZone: { x: 41, y: 2, w: 21, h: 36 },
            hintBisaya: "I-drag ang bandila sa poste para mahimo og flagpole!",
            hintEnglish: "Drag the flag onto the pole to create a flagpole!",
          },
        },
        {
          id: "courtyard",
          labelBisaya: "Korte",
          labelEnglish: "Courtyard",
          descriptionBisaya: "Usa ka abli nga lugar nga gilibutan og mga dingding. Makita kini sa kastilyo.",
          descriptionEnglish: "An open area surrounded by walls or buildings inside the castle.",
          x: 30, y: 69, w: 62, h: 20,
          compoundWord: { word1: "COURT", word2: "YARD", result: "COURTYARD", bisayaResult: "Korte / Patyo", distractors: ["GARDEN", "FIELD"] },
          applyGame: {
            sceneBefore: AssetManifest.castle.scenarios.noCourtyard,
            sceneAfter: AssetManifest.castle.scenarios.courtyard,
            draggable: { image: AssetManifest.castle.scenarios.yard, label: "YARD", startX: 78, startY: 72 },
            dropZone: { x: 22, y: 57, w: 48, h: 39 },
            hintBisaya: "I-drag ang sagbot sa korte para mahimo og courtyard!",
            hintEnglish: "Drag the grass onto the court to create a courtyard!",
          },
        },
        {
          id: "rooftop",
          labelBisaya: "Atop sa Bilding",
          labelEnglish: "Rooftop",
          descriptionBisaya: "Ang pinaka-taas nga bahin sa atop sa kastilyo.",
          descriptionEnglish: "The very top part of the castle roof.",
          x: 5, y: 2, w: 88, h: 18,
          compoundWord: { word1: "ROOF", word2: "TOP", result: "ROOFTOP", bisayaResult: "Atop sa Bilding", distractors: ["CEIL", "PEAK"] },
          wordEmojis: { ROOF: "🏠", TOP: "⬆️", CEIL: "🪟", PEAK: "⛰️" },
          applyGame: {
            sceneBefore: AssetManifest.castle.scenarios.noRooftop,
            sceneAfter: AssetManifest.castle.scenarios.courtyard,
            draggable: { image: AssetManifest.castle.scenarios.roof, label: "ROOF", startX: 78, startY: 72 },
            dropZone: { x: 5, y: 2, w: 88, h: 30 },
            hintBisaya: "I-drag ang atop sa bilding para mahimo og rooftop!",
            hintEnglish: "Drag the roof onto the building to create a rooftop!",
          },
        },
        {
          id: "archway",
          labelBisaya: "Arko nga Agianan",
          labelEnglish: "Archway",
          descriptionBisaya: "Usa ka arko nga agianan nga gihimo sa bato. Makita kini sa mga kastilyo.",
          descriptionEnglish: "A curved stone entrance found in castles and old buildings.",
          x: 30, y: 23, w: 38, h: 55,
          compoundWord: { word1: "ARCH", word2: "WAY", result: "ARCHWAY", bisayaResult: "Arko nga Paagi", distractors: ["GATE", "PATH"] },
          applyGame: {
            sceneBefore: AssetManifest.castle.scenarios.arch,
            sceneAfter: AssetManifest.castle.scenarios.courtyard,
            draggable: { image: AssetManifest.castle.scenarios.archWay, label: "WAY", startX: 78, startY: 72 },
            dropZone: { x: 35, y: 49, w: 28, h: 46 },
            hintBisaya: "I-drag ang agianan sa arko para mahimo og archway!",
            hintEnglish: "Drag the way into the arch to create an archway!",
          },
        },
        {
          id: "sunlight",
          labelBisaya: "Kahayag sa Adlaw",
          labelEnglish: "Sunlight",
          descriptionBisaya: "Ang kahayag gikan sa adlaw. Naghatag kini og init ug liwanag sa courtyard.",
          descriptionEnglish: "The light that comes from the sun. It makes the courtyard warm and bright.",
          x: 10, y: 3, w: 38, h: 14,
          compoundWord: { word1: "SUN", word2: "LIGHT", result: "SUNLIGHT", bisayaResult: "Kahayag sa Adlaw", distractors: ["GLOW", "BEAM"] },
          applyGame: {
            sceneBefore: AssetManifest.castle.scenarios.noLight,
            sceneAfter: AssetManifest.castle.scenarios.sunlight,
            draggable: { image: AssetManifest.castle.scenarios.sun, label: "SUN", startX: 78, startY: 72 },
            dropZone: { x: 20, y: 5, w: 55, h: 45 },
            hintBisaya: "I-drag ang adlaw para mahimo og sunlight!",
            hintEnglish: "Drag the sun to create sunlight!",
          },
        },
      ],
    },

    //  Quest 2: Castle Library (/castle/library) 
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
        //  All library items use the visual drag mechanic 
        {
          id: "bookshelf",
          labelBisaya: "Estante sa Libro",
          labelEnglish: "Bookshelf",
          descriptionBisaya: "Usa ka taas nga estante nga gigamit para itago ang mga libro.",
          descriptionEnglish: "A tall piece of furniture used to store and hold books.",
          x: 23, y: 9, w: 18, h: 78,
          compoundWord: { word1: "BOOK", word2: "SHELF", result: "BOOKSHELF", bisayaResult: "Estante sa Libro", distractors: ["DOOR", "CASE"] },
          applyGame: {
            sceneBefore: AssetManifest.castle.scenarios.noBooks,
            sceneAfter: AssetManifest.castle.scenarios.withBook,
            draggable: { image: AssetManifest.castle.scenarios.books, label: "BOOK", startX: 78, startY: 72 },
            dropZone: { x: 31, y: 10, w: 30, h: 75 },
            hintBisaya: "I-drag ang mga libro sa estante para mahimo og bookshelf!",
            hintEnglish: "Drag the books onto the shelf to create a bookshelf!",
          },
        },
        {
          id: "candlelight",
          labelBisaya: "Kandila",
          labelEnglish: "Candlelight",
          descriptionBisaya: "Ang humok nga kahayag gikan sa mga kandila. Nindot kini tan-awon sa gabii!",
          descriptionEnglish: "The soft warm light from candles. It makes the room feel nice at night!",
          x: 33, y: 2, w: 32, h: 22,
          compoundWord: { word1: "CANDLE", word2: "LIGHT", result: "CANDLELIGHT", bisayaResult: "Chandelier / Kandila", distractors: ["WAX", "FLAME"] },
          applyGame: {
            sceneBefore: AssetManifest.castle.scenarios.candle,
            sceneAfter: AssetManifest.castle.scenarios.candlelight,
            draggable: { image: AssetManifest.castle.scenarios.light, label: "LIGHT", startX: 78, startY: 72 },
            dropZone: { x: 25, y: 5, w: 45, h: 35 },
            hintBisaya: "I-drag ang kahayag sa kandila para mahimo og candlelight!",
            hintEnglish: "Drag the light to the candle to create candlelight!",
          },
        },
        {
          id: "fireplace",
          labelBisaya: "Sunoganan",
          labelEnglish: "Fireplace",
          descriptionBisaya: "Usa ka lugar sa dingding nga gihimoan og kalayo. Nagpainit kini sa lawak kung bugnaw.",
          descriptionEnglish: "A place in the wall that holds a fire. It keeps the room warm when it is cold.",
          x: 16, y: 60, w: 13, h: 33,
          compoundWord: { word1: "FIRE", word2: "PLACE", result: "FIREPLACE", bisayaResult: "Sunoganan", distractors: ["WOOD", "WARM"] },
          applyGame: {
            sceneBefore: AssetManifest.castle.scenarios.noFire,
            sceneAfter: AssetManifest.castle.scenarios.withFire,
            draggable: { image: AssetManifest.castle.scenarios.fire, label: "FIRE", startX: 78, startY: 72 },
            dropZone: { x: 36, y: 60, w: 25, h: 35 },
            hintBisaya: "I-drag ang kalayo sa lugar para mahimo og fireplace!",
            hintEnglish: "Drag the fire into the place to create a fireplace!",
          },
        },
        {
          id: "candlestick",
          labelBisaya: "Kandelero",
          labelEnglish: "Candlestick",
          descriptionBisaya: "Usa ka suportahan para sa kandila. Makita kini sa mga lamesa sa library.",
          descriptionEnglish: "A holder that keeps a candle standing up while it burns.",
          x: 67, y: 63, w: 20, h: 11,
          compoundWord: { word1: "CANDLE", word2: "STICK", result: "CANDLESTICK", bisayaResult: "Tangkayan sa Kandila", distractors: ["WAX", "HOLDER"] },
          applyGame: {
            sceneBefore: AssetManifest.castle.scenarios.sideStick,
            sceneAfter: AssetManifest.castle.scenarios.sideCandle,
            draggable: { image: AssetManifest.castle.scenarios.candleStick, label: "CANDLE", startX: 78, startY: 72 },
            dropZone: { x: 12, y: 55, w: 30, h: 40 },
            hintBisaya: "I-drag ang kandelero sa stick para mahimo og candlestick!",
            hintEnglish: "Drag the candle-stick onto the stick to create a candlestick!",
          },
        },
        {
          id: "storybook",
          labelBisaya: "Libro sa Istorya",
          labelEnglish: "Storybook",
          descriptionBisaya: "Usa ka libro nga puno og mga istorya ug mga hulagway para sa mga bata.",
          descriptionEnglish: "A book full of stories and pictures for children to read.",
          x: 40, y: 76, w: 17, h: 11,
          compoundWord: { word1: "STORY", word2: "BOOK", result: "STORYBOOK", bisayaResult: "Libro sa Istorya", distractors: ["READ", "TALE"] },
          applyGame: {
            sceneBefore: AssetManifest.castle.scenarios.tableBook,
            sceneAfter: AssetManifest.castle.scenarios.tableStorybook,
            draggable: { image: AssetManifest.castle.scenarios.story, label: "STORY", startX: 78, startY: 72 },
            dropZone: { x: 21, y: 15, w: 57, h: 54 },
            hintBisaya: "I-drag ang istorya sa libro para mahimo og storybook!",
            hintEnglish: "Drag the story into the book to create a storybook!",
          },
        },
        {
          id: "sunlight",
          labelBisaya: "Kahayag sa Adlaw",
          labelEnglish: "Sunlight",
          descriptionBisaya: "Ang kahayag nga gikan sa adlaw nga naghatag og init ug liwanag sa sulod sa library.",
          descriptionEnglish: "The light that comes from the sun. It fills the library with warmth and brightness.",
          x: 69, y: 1, w: 13, h: 50,
          compoundWord: { word1: "SUN", word2: "LIGHT", result: "SUNLIGHT", bisayaResult: "Kahayag sa Adlaw", distractors: ["GLOW", "BEAM"] },
          applyGame: {
            sceneBefore: AssetManifest.castle.scenarios.library,
            sceneAfter: AssetManifest.castle.scenarios.libraryLit,
            draggable: { image: AssetManifest.castle.scenarios.sun, label: "SUN", startX: 78, startY: 72 },
            dropZone: { x: 60, y: 5, w: 30, h: 55 },
            hintBisaya: "I-drag ang adlaw sa bintana para mahimo og sunlight sa library!",
            hintEnglish: "Drag the sun to the window to create sunlight in the library!",
          },
        },
      ],
    },
  ],
};

//  Helpers 
export const getQuestData = (npcId, questIndex = 0) => {
  const quests = CASTLE_QUESTS[npcId];
  if (!quests) return null;
  return quests[questIndex] ?? null;
};

export const getTotalQuests = (npcId) => {
  return CASTLE_QUESTS[npcId]?.length ?? 0;
};

//  Item dialogue builder 

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
