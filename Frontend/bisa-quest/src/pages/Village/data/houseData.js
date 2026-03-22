import AssetManifest from "../../../services/AssetManifest";

export const NPC_IMAGES = {
  village_npc_2: AssetManifest.village.npcs.ligaya,
};

export const LIVING_ROOM_LABELS = [
  // ── Left wall ─────────────────────────────────────────────────────────────
  {
    id: "purtahan",
    labelBisaya: "Purtahan/Pultahan",
    labelEnglish: "Door",
    descriptionBisaya: "Usa ka nagtabayag o nag-aginod nga babag nga mosira sa agianan sa usa ka lawak, balay, o sakyanan.",
    descriptionEnglish: "A swinging or sliding barrier that will close the entrance to a room or building or vehicle",
    imageKey: "purtahan",
    x: 0, y: 44, w: 10, h: 18,
  },
  {
    id: "estante_wall",
    labelBisaya: "Estante sa Dingding",
    labelEnglish: "Wall Shelf",
    descriptionBisaya: "Gibitay sa dingding para sa mga gamit ug dekorasyon.",
    descriptionEnglish: "Mounted on the wall to hold items and decorations.",
    imageKey: "estante_wall",
    x: 21, y: 30, w: 5, h: 5,
  },
  {
    id: "bulak",
    labelBisaya: "Bulak / Tanum",
    labelEnglish: "Plant",
    descriptionBisaya: "Tanum nga nagpaayos sa sulod sa balay ug naghatag og presko nga hangin.",
    descriptionEnglish: "A plant that decorates the home and helps freshen the air.",
    imageKey: "bulak",
    x: 14, y: 24, w: 5, h: 6,
  },
  {
    id: "toalya",
    labelBisaya: "Toalya",
    labelEnglish: "Cloth / Towel",
    descriptionBisaya: "Gamit sa paglimpyo o pagpunas sa mga butang sa balay.",
    descriptionEnglish: "Used for cleaning or wiping things around the house.",
    imageKey: "toalya",
    x: 17, y: 39, w: 5, h: 10,
  },
  {
    id: "lampara",
    labelBisaya: "Lampara",
    labelEnglish: "Lamp / Lantern",
    descriptionBisaya: "Naghatag og suga sa gabii. Sa una, gamiton ang lana o kandila.",
    descriptionEnglish: "Provides light at night. In the past, oil or candles were used.",
    imageKey: "lamp",
    x: 30, y: 26, w: 4, h: 10,
  },
  {
    id: "relo",
    labelBisaya: "Relo",
    labelEnglish: "Clock",
    descriptionBisaya: "Ginagamit aron mahibaw-an ang oras sa adlaw.",
    descriptionEnglish: "Used to tell the time of day.",
    imageKey: "relo",
    x: 45.5, y: 26, w: 5, h: 6,
  },
  {
    id: "bag",
    labelBisaya: "Bag / Bayong",
    labelEnglish: "Bag / Basket",
    descriptionBisaya: "Gigamit sa pagdala og mga gamit o palengke.",
    descriptionEnglish: "Used for carrying belongings or going to the market.",
    imageKey: "bag",
    x: 28, y: 42, w: 7, h: 10,
  },
  {
    id: "kalendaryo",
    labelBisaya: "Kalendaryo",
    labelEnglish: "Calendar",
    descriptionBisaya: "Gipakita ang mga petsa ug buwan sa tuig.",
    descriptionEnglish: "Shows the dates and months of the year.",
    imageKey: "kalendaryo",
    x: 69, y: 31, w: 8, h: 10,
  },
  {
    id: "silhig",
    labelBisaya: "Silhig",
    labelEnglish: "Broom",
    descriptionBisaya: "Gamiton sa pagsapu sa salog aron malimpyo ang balay.",
    descriptionEnglish: "Used to sweep the floor and keep the house clean.",
    imageKey: "walis",
    x: 39, y: 45, w: 6, h: 14,
  },
  {
    id: "planggana",
    labelBisaya: "Planggana",
    labelEnglish: "Basin",
    descriptionBisaya: "Sudlanan sa tubig para sa paglaba o paghilam-os.",
    descriptionEnglish: "A container for water used for washing or rinsing.",
    imageKey: "planggana",
    x: 35, y: 58, w: 8, h: 7,
  },
  {
    id: "baldi",
    labelBisaya: "Baldi",
    labelEnglish: "Bucket",
    descriptionBisaya: "Sudlanan sa tubig para sa paglimpyo o paglaba.",
    descriptionEnglish: "A bucket for holding water used for cleaning or washing.",
    imageKey: "baldi",
    x: 30, y: 59, w: 6, h: 8,
  },
  // ── Center ────────────────────────────────────────────────────────────────
  {
    id: "kurtina",
    labelBisaya: "Kurtina",
    labelEnglish: "Curtain",
    descriptionBisaya: "Tabil sa bintana nga nagpugong sa init ug naghatag og privacy.",
    descriptionEnglish: "A window covering that blocks heat and gives privacy.",
    imageKey: "kurtina",
    x: 52, y: 31, w: 6, h: 12,
  },
  {
    id: "bintana",
    labelBisaya: "Bintana",
    labelEnglish: "Window",
    descriptionBisaya: "Bukas nga parte sa dingding para sa hangin ug suga gikan sa gawas.",
    descriptionEnglish: "An opening in the wall that lets in air and light from outside.",
    imageKey: "bintana",
    x: 58, y: 30, w: 10, h: 13,
  },
  {
    id: "litrato",
    labelBisaya: "Litrato",
    labelEnglish: "Picture Frame",
    descriptionBisaya: "Gi-frame nga larawan sa pamilya o dekorasyon sa dingding.",
    descriptionEnglish: "A framed photo of family or a decoration hung on the wall.",
    imageKey: "litrato",
    x: 43.5, y: 36, w: 5, h: 6,
  },
  {
    id: "sopa",
    labelBisaya: "Sopa / Bangko",
    labelEnglish: "Bench / Sofa",
    descriptionBisaya: "Lingkoranan sa sala para sa pahinga ug pakig-istoryahanay.",
    descriptionEnglish: "Seating in the living area for resting and conversation.",
    imageKey: "sopa",
    x: 53, y: 46, w: 18, h: 12,
  },
  {
    id: "book",
    labelBisaya: "Libro",
    labelEnglish: "Book",
    descriptionBisaya: "Gamiton sa pagbasa og mga istorya.",
    descriptionEnglish: "Used for reading stories.",
    imageKey: "book",
    x: 51, y: 58, w: 6, h: 6,
  },
  {
    id: "lamesa",
    labelBisaya: "Lamesa",
    labelEnglish: "Table",
    descriptionBisaya: "Gamit sa pagbutang og mga butang o pag-abot sa bisita.",
    descriptionEnglish: "Used for placing items or serving guests.",
    imageKey: "lamesa_sala",
    x: 56, y: 59, w: 16, h: 9,
  },
  {
    id: "alfombra",
    labelBisaya: "Alfombra / Banig",
    labelEnglish: "Rug",
    descriptionBisaya: "Gibuklad sa salog para sa dekorasyon ug pagpahumok sa tiil.",
    descriptionEnglish: "Spread on the floor for decoration and to cushion your feet.",
    imageKey: "alfombra",
    x: 45, y: 70, w: 31, h: 12,
  },
  // ── Right wall ────────────────────────────────────────────────────────────
  {
    id: "aparador",
    labelBisaya: "Aparador",
    labelEnglish: "Cabinet",
    descriptionBisaya: "Sudlanan sa mga sinina, libro, o uban pang gamit sa balay.",
    descriptionEnglish: "Stores clothes, books, or other household items.",
    imageKey: "aparador",
    x: 74, y: 34, w: 9, h: 20,
  },
  {
    id: "bookshelf",
    labelBisaya: "Estante",
    labelEnglish: "Bookshelf",
    descriptionBisaya: "Gamiton sa pagbutang og libro",
    descriptionEnglish: "Used for storing books",
    imageKey: "bookshelf",
    x: 85, y: 34, w: 11, h: 52,
  },
  {
    id: "mop",
    labelBisaya: "Mop",
    labelEnglish: "Mop",
    descriptionBisaya: "Gigamit sa paglimpyo sa salog gamit ang tubig. Mas epektibo sa silhig.",
    descriptionEnglish: "Used to clean the floor with water. More effective than a dry broom.",
    x: 44, y: 46, w: 6, h: 14,
  },
  // ── Floor & ceiling ───────────────────────────────────────────────────────
  {
    id: "doormat",
    labelBisaya: "Talamakanan",
    labelEnglish: "Doormat",
    descriptionBisaya: "Himo sa mga dahon o buli, gamiton sa paghigda o paglingkod.",
    descriptionEnglish: "Woven from leaves or palm, used for sleeping or sitting.",
    imageKey: "doormat",
    x: 9, y: 85, w: 10, h: 11,
  },
  {
    id: "salog",
    labelBisaya: "Salog",
    labelEnglish: "Floor",
    descriptionBisaya: "Ang lapak sa balay, kasagaran gama sa semento o kahoy.",
    descriptionEnglish: "The ground surface of the house, usually cement or wood.",
    imageKey: "salog",
    x: 20, y: 80, w: 30, h: 7,
  },
  {
    id: "atop",
    labelBisaya: "Kisame / Atop",
    labelEnglish: "Ceiling",
    descriptionBisaya: "Ang taas nga bahin sa sulod sa balay nga nagtabon sa atop.",
    descriptionEnglish: "The upper interior surface of the house that covers the roof.",
    imageKey: "sala_ceiling",
    x: 45, y: 7, w: 10, h: 6,
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
    bisayaText: "Mao ni among Sala — ang living room sa balay.",
    englishText: "This is our Sala — the living room of the house.",
  },
  {
    speaker: "Ligaya",
    bisayaText: "Humana ang tulo ka challenges para maka-move sa next level.",
    englishText: "Finish 3 challenges by helping clean the living room to reach the next level.",
  },
  {
    speaker: "Ligaya",
    bisayaText: "I-pwesto imong mouse sa mga butang og i-click para makat-on!",
    englishText: "Move your mouse over any item and click it to learn more!",
  },
];

// ── Item dialogue ─────────────────────────────────────────────────────────────
// Step 0: item name introduction (both languages)
// Step 1: description (both languages)
export const buildDialogue = (region) => [
  {
    speaker: "Ligaya",
    bisayaText: `Kini ang "${region.labelBisaya}"!`,
    englishText: `This is the "${region.labelEnglish}"!`,
  },
  {
    speaker: "Ligaya",
    bisayaText: region.descriptionBisaya,
    englishText: region.descriptionEnglish,
  },
];
