import AssetManifest from "../../../services/AssetManifest";

export const NPC_IMAGES = {
  village_npc_2: AssetManifest.village.npcs.ligaya,
};

export const LIVING_ROOM_LABELS = [
  // ── Left wall ─────────────────────────────────────────────────────────────
  {
    id: "purtahan",
    labelBisaya: "purtahan / pultahan",
    labelEnglish: "door",
    descriptionBisaya: "Ang pultahan kay maablihan ug masirad-an aron matabonan ang agianan sa kwarto, building, o sakyanan.",
    descriptionEnglish: "A door opens and closes to cover the entrance of a room, building, or vehicle.",
    x: 1, y: 30, w: 8, h: 40,
  },
  {
    id: "estante_wall",
    labelBisaya: "estante ",
    labelEnglish: "shelf",
    descriptionBisaya: "Ang estante kay nipis nga tabla nga gibutang sa bungbong diin nimo ibutang ang mga butang.",
    descriptionEnglish: "A shelf is a thin, flat board attached to a wall where you can put things.",
    x: 12, y: 32, w: 15, h: 7,
  },
  {
    id: "bulak",
    labelBisaya: "houseplant",
    labelEnglish: "houseplant",
    descriptionBisaya: "Ang houseplant kay tanom nga ibutang sulod sa balay para dekorasyon.",
    descriptionEnglish: "A houseplant is a plant kept inside the house used mostly as decoration.",
    x: 13, y: 25, w: 6, h: 7,
  },
  {
    id: "toalya",
    labelBisaya: "Toalya",
    labelEnglish: "Cloth / Towel",
    descriptionBisaya: "Gamit sa paglimpyo o pagpunas sa mga butang sa balay.",
    descriptionEnglish: "Used for cleaning or wiping things around the house.",
    x: 16.5, y: 39.5, w: 5, h: 14,
  },
  {
    id: "lampara",
    labelBisaya: "Lampara",
    labelEnglish: "Lamp / Lantern",
    descriptionBisaya: "Naghatag og suga sa gabii. Sa una, gamiton ang lana o kandila.",
    descriptionEnglish: "Provides light at night. In the past, oil or candles were used.",
    x: 30.5, y: 28, w: 3, h: 8,
  },
  {
    id: "relo",
    labelBisaya: "Relo",
    labelEnglish: "Clock",
    descriptionBisaya: "Ginagamit aron mahibaw-an ang oras sa adlaw.",
    descriptionEnglish: "Used to tell the time of day.",
    x: 34, y: 28, w: 3, h: 7,
  },
  {
    id: "bag",
    labelBisaya: "Bag / Bayong",
    labelEnglish: "Bag / Basket",
    descriptionBisaya: "Gigamit sa pagdala og mga gamit o palengke.",
    descriptionEnglish: "Used for carrying belongings or going to the market.",
    x: 30, y: 40, w: 4, h: 13,
  },
  {
    id: "kalendaryo",
    labelBisaya: "Kalendaryo",
    labelEnglish: "Calendar",
    descriptionBisaya: "Gipakita ang mga petsa ug buwan sa tuig.",
    descriptionEnglish: "Shows the dates and months of the year.",
    x: 34.5, y: 38, w: 3, h: 8,
  },
  {
    id: "silhig",
    labelBisaya: "Silhig",
    labelEnglish: "Broom",
    descriptionBisaya: "Gamiton sa pagsapu sa salog aron malimpyo ang balay.",
    descriptionEnglish: "Used to sweep the floor and keep the house clean.",
    x: 41, y: 44, w: 5, h: 16.5,
  },
  {
    id: "planggana",
    labelBisaya: "Planggana",
    labelEnglish: "Basin",
    descriptionBisaya: "Sudlanan sa tubig para sa paglaba o paghilam-os.",
    descriptionEnglish: "A container for water used for washing or rinsing.",
    x: 34, y: 60, w: 8, h: 6,
  },
  // ── Center ────────────────────────────────────────────────────────────────
  {
    id: "kurtina",
    labelBisaya: "Kurtina",
    labelEnglish: "Curtain",
    descriptionBisaya: "Tabil sa bintana nga nagpugong sa init ug naghatag og privacy.",
    descriptionEnglish: "A window covering that blocks heat and gives privacy.",
    x: 54.5, y: 26, w: 3.5, h: 20,
  },
  {
    id: "bintana",
    labelBisaya: "Bintana",
    labelEnglish: "Window",
    descriptionBisaya: "Bukas nga parte sa dingding para sa hangin ug suga gikan sa gawas.",
    descriptionEnglish: "An opening in the wall that lets in air and light from outside.",
    x: 58, y: 26, w: 9, h: 17,
  },
  {
    id: "litrato",
    labelBisaya: "Litrato",
    labelEnglish: "Picture Frame",
    descriptionBisaya: "Gi-frame nga larawan sa pamilya o dekorasyon sa dingding.",
    descriptionEnglish: "A framed photo of family or a decoration hung on the wall.",
    x: 44.5, y: 35, w: 8, h: 6,
  },
  {
    id: "dingding",
    labelBisaya: "Dingding",
    labelEnglish: "Wall",
    descriptionBisaya: "Ang nagtabon sa kiliran sa balay, kasagaran gama sa semento o kahoy.",
    descriptionEnglish: "The sides of the house, usually made of cement or wood.",
    x: 41, y: 15, w: 10, h: 15,
  },
  {
    id: "sopa",
    labelBisaya: "Sopa / Bangko",
    labelEnglish: "Bench / Sofa",
    descriptionBisaya: "Lingkoranan sa sala para sa pahinga ug pakig-istoryahanay.",
    descriptionEnglish: "Seating in the living area for resting and conversation.",
    x: 51.5, y: 47, w: 18, h: 16,
  },
  {
    id: "book",
    labelBisaya: "Libro",
    labelEnglish: "Book",
    descriptionBisaya: "Gamiton sa pagbasa og mga istorya.",
    descriptionEnglish: "Used for reading stories.",
    x: 54, y: 56, w: 13, h: 8,
  },
  {
    id: "lamesa",
    labelBisaya: "Lamesa",
    labelEnglish: "Table",
    descriptionBisaya: "Gamit sa pagbutang og mga butang o pag-abot sa bisita.",
    descriptionEnglish: "Used for placing items or serving guests.",
    x: 54, y: 61, w: 13, h: 8,
  },
  {
    id: "alfombra",
    labelBisaya: "Alpombra / Karpet",
    labelEnglish: "Carpet",
    descriptionBisaya: "Gibuklad sa salog para sa dekorasyon ug pagpahumok sa tiil.",
    descriptionEnglish: "Spread on the floor for decoration and to cushion your feet.",
    x: 39, y: 63, w: 42, h: 16,
  },
  // ── Right wall ────────────────────────────────────────────────────────────
  {
    id: "aparador",
    labelBisaya: "Aparador",
    labelEnglish: "Cabinet",
    descriptionBisaya: "Sudlanan sa mga sinina, libro, o uban pang gamit sa balay.",
    descriptionEnglish: "Stores clothes, books, or other household items.",
    x: 80, y: 58, w: 5, h: 12,
  },
  {
    id: "bookshelf",
    labelBisaya: "Estante",
    labelEnglish: "Bookshelf",
    descriptionBisaya: "Gamiton sa pagbutang og libro",
    descriptionEnglish: "Used for storing books",
    x: 85, y: 36, w: 14, h: 50,
  },
  {
    id: "mop",
    labelBisaya: "Mop",
    labelEnglish: "Mop",
    descriptionBisaya: "Gigamit sa paglimpyo sa salog gamit ang tubig. Mas epektibo sa silhig.",
    descriptionEnglish: "Used to clean the floor with water. More effective than a dry broom.",
    x: 45, y: 44, w: 4, h: 16,   // ← adjust this to wherever you want it
  },
  // ── Floor & ceiling ───────────────────────────────────────────────────────
  {
    id: "trapo",
    labelBisaya: "Talamakan",
    labelEnglish: "Doormat",
    descriptionBisaya: "Ang talamakan kay makita sa pultahan aron ipahid ang hugaw sa sapatos.",
    descriptionEnglish: "A doormat is a mat placed near a door where you wipe your shoes or feet.",
    x: -1, y: 82, w: 15, h: 12,
  },
  {
    id: "salog",
    labelBisaya: "Salog",
    labelEnglish: "Floor",
    descriptionBisaya: "Ang lapak sa balay, kasagaran gama sa semento o kahoy.",
    descriptionEnglish: "The ground surface of the house, usually cement or wood.",
    x: 25, y: 85, w: 30, h: 10,
  },
  {
    id: "kisame",
    labelBisaya: "Kisame / Atop",
    labelEnglish: "Ceiling",
    descriptionBisaya: "Ang taas nga bahin sa sulod sa balay nga nagtabon sa atop.",
    descriptionEnglish: "The upper interior surface of the house that covers the roof.",
    x: 35, y: 7, w: 30, h: 8,
  },
];

// ── Intro dialogue ────────────────────────────────────────────────────────────
// Each line has: speaker, bisayaText, englishText
export const INTRO_DIALOGUE = [
  {
    speaker: "Ligaya",
    bisayaText: "Hello! Ako si Ligaya. Welcome sa among balay!",
    englishText: "Hello! My name is Ligaya. Welcome to our home!",
  },
  {
    speaker: "Ligaya",
    bisayaText: "Mao ni among Sala.",
    englishText: "This is our living area.",
  },
  {
    speaker: "Ligaya",
    bisayaText: "Itudlo ang mouse sa usa ka butang ug i-click aron makakat-on pa.",
    englishText: "Point your mouse at an item and click it to learn more.",
  },
  {
    speaker: "Ligaya",
    bisayaText: "Humana ang tulo ka challenges para ma-unlock ang sunod nga level.",
    englishText: "Complete 3 challenges to unlock the next level!",
  },
];

// ── Item dialogue ─────────────────────────────────────────────────────────────
// Step 0: item name introduction (both languages)
// Step 1: description (both languages)
export const buildDialogue = (region) => [
  {
    speaker: "Ligaya",
    bisayaText: `Kini ang "${region.labelBisaya}"!`,
    englishText: `This object is called "${region.labelEnglish}"!`,
  },
  {
    speaker: "Ligaya",
    bisayaText: region.descriptionBisaya,
    englishText: region.descriptionEnglish,
  },
];
