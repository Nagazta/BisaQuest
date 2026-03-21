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
    x: 3, y: 46, w: 6, h: 10,
  },
  {
    id: "estante_wall",
    labelBisaya: "Estante sa Dingding",
    labelEnglish: "Wall Shelf",
    descriptionBisaya: "Gibitay sa dingding para sa mga gamit ug dekorasyon.",
    descriptionEnglish: "Mounted on the wall to hold items and decorations.",
    x: 19.5, y: 28.5, w: 5, h: 5,
  },
  {
    id: "bulak",
    labelBisaya: "Bulak / Tanum",
    labelEnglish: "Plant",
    descriptionBisaya: "Tanum nga nagpaayos sa sulod sa balay ug naghatag og presko nga hangin.",
    descriptionEnglish: "A plant that decorates the home and helps freshen the air.",
    x: 13.5, y: 26.5, w: 5, h: 5,
  },
  {
    id: "toalya",
    labelBisaya: "Toalya",
    labelEnglish: "Cloth / Towel",
    descriptionBisaya: "Gamit sa paglimpyo o pagpunas sa mga butang sa balay.",
    descriptionEnglish: "Used for cleaning or wiping things around the house.",
    x: 17, y: 42, w: 4, h: 10,
  },
  {
    id: "lampara",
    labelBisaya: "Lampara",
    labelEnglish: "Lamp / Lantern",
    descriptionBisaya: "Naghatag og suga sa gabii. Sa una, gamiton ang lana o kandila.",
    descriptionEnglish: "Provides light at night. In the past, oil or candles were used.",
    imageKey: "lamp",
    x: 29.5, y: 28, w: 4, h: 10,
  },
  {
    id: "relo",
    labelBisaya: "Relo",
    labelEnglish: "Clock",
    descriptionBisaya: "Ginagamit aron mahibaw-an ang oras sa adlaw.",
    descriptionEnglish: "Used to tell the time of day.",
    x: 45.5, y: 28.5, w: 5, h: 5,
  },
  {
    id: "bag",
    labelBisaya: "Bag / Bayong",
    labelEnglish: "Bag / Basket",
    descriptionBisaya: "Gigamit sa pagdala og mga gamit o palengke.",
    descriptionEnglish: "Used for carrying belongings or going to the market.",
    x: 28, y: 42, w: 6, h: 10,
  },
  {
    id: "kalendaryo",
    labelBisaya: "Kalendaryo",
    labelEnglish: "Calendar",
    descriptionBisaya: "Gipakita ang mga petsa ug buwan sa tuig.",
    descriptionEnglish: "Shows the dates and months of the year.",
    x: 72, y: 37, w: 6, h: 8,
  },
  {
    id: "silhig",
    labelBisaya: "Silhig",
    labelEnglish: "Broom",
    descriptionBisaya: "Gamiton sa pagsapu sa salog aron malimpyo ang balay.",
    descriptionEnglish: "Used to sweep the floor and keep the house clean.",
    imageKey: "walis",
    x: 40, y: 48.5, w: 6, h: 15,
  },
  {
    id: "planggana",
    labelBisaya: "Planggana",
    labelEnglish: "Basin",
    descriptionBisaya: "Sudlanan sa tubig para sa paglaba o paghilam-os.",
    descriptionEnglish: "A container for water used for washing or rinsing.",
    imageKey: "planggana",
    x: 35, y: 61, w: 8, h: 6,
  },
  // ── Center ────────────────────────────────────────────────────────────────
  {
    id: "kurtina",
    labelBisaya: "Kurtina",
    labelEnglish: "Curtain",
    descriptionBisaya: "Tabil sa bintana nga nagpugong sa init ug naghatag og privacy.",
    descriptionEnglish: "A window covering that blocks heat and gives privacy.",
    x: 51.5, y: 33, w: 5, h: 10,
  },
  {
    id: "bintana",
    labelBisaya: "Bintana",
    labelEnglish: "Window",
    descriptionBisaya: "Bukas nga parte sa dingding para sa hangin ug suga gikan sa gawas.",
    descriptionEnglish: "An opening in the wall that lets in air and light from outside.",
    x: 57, y: 33, w: 10, h: 10,
  },
  {
    id: "litrato",
    labelBisaya: "Litrato",
    labelEnglish: "Picture Frame",
    descriptionBisaya: "Gi-frame nga larawan sa pamilya o dekorasyon sa dingding.",
    descriptionEnglish: "A framed photo of family or a decoration hung on the wall.",
    x: 42.5, y: 38.5, w: 5, h: 5,
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
    x: 52.5, y: 49, w: 15, h: 10,
  },
  {
    id: "book",
    labelBisaya: "Libro",
    labelEnglish: "Book",
    descriptionBisaya: "Gamiton sa pagbasa og mga istorya.",
    descriptionEnglish: "Used for reading stories.",
    x: 57, y: 59.5, w: 6, h: 5,
  },
  {
    id: "lamesa",
    labelBisaya: "Lamesa",
    labelEnglish: "Table",
    descriptionBisaya: "Gamit sa pagbutang og mga butang o pag-abot sa bisita.",
    descriptionEnglish: "Used for placing items or serving guests.",
    imageKey: "lamesa_sala",
    x: 56.5, y: 64, w: 11, h: 6,
  },
  {
    id: "alfombra",
    labelBisaya: "Alfombra / Banig",
    labelEnglish: "Rug",
    descriptionBisaya: "Gibuklad sa salog para sa dekorasyon ug pagpahumok sa tiil.",
    descriptionEnglish: "Spread on the floor for decoration and to cushion your feet.",
    imageKey: "alfombra",
    x: 45, y: 70, w: 30, h: 10,
  },
  // ── Right wall ────────────────────────────────────────────────────────────
  {
    id: "aparador",
    labelBisaya: "Aparador",
    labelEnglish: "Cabinet",
    descriptionBisaya: "Sudlanan sa mga sinina, libro, o uban pang gamit sa balay.",
    descriptionEnglish: "Stores clothes, books, or other household items.",
    x: 78, y: 37.5, w: 8, h: 15,
  },
  {
    id: "bookshelf",
    labelBisaya: "Estante",
    labelEnglish: "Bookshelf",
    descriptionBisaya: "Gamiton sa pagbutang og libro",
    descriptionEnglish: "Used for storing books",
    x: 85, y: 45, w: 10, h: 40,
  },
  {
    id: "mop",
    labelBisaya: "Mop",
    labelEnglish: "Mop",
    descriptionBisaya: "Gigamit sa paglimpyo sa salog gamit ang tubig. Mas epektibo sa silhig.",
    descriptionEnglish: "Used to clean the floor with water. More effective than a dry broom.",
    x: 44.5, y: 50.5, w: 5, h: 15,
  },
  // ── Floor & ceiling ───────────────────────────────────────────────────────
  {
    id: "trapo",
    labelBisaya: "Trapo",
    labelEnglish: "Floor Mat",
    descriptionBisaya: "Himo sa mga dahon o buli, gamiton sa paghigda o paglingkod.",
    descriptionEnglish: "Woven from leaves or palm, used for sleeping or sitting.",
    x: 1, y: 84, w: 12, h: 8,
  },
  {
    id: "salog",
    labelBisaya: "Salog",
    labelEnglish: "Floor",
    descriptionBisaya: "Ang lapak sa balay, kasagaran gama sa semento o kahoy.",
    descriptionEnglish: "The ground surface of the house, usually cement or wood.",
    x: 20, y: 87, w: 30, h: 6,
  },
  {
    id: "kisame",
    labelBisaya: "Kisame / Atop",
    labelEnglish: "Ceiling",
    descriptionBisaya: "Ang taas nga bahin sa sulod sa balay nga nagtabon sa atop.",
    descriptionEnglish: "The upper interior surface of the house that covers the roof.",
    x: 45, y: 8.5, w: 10, h: 5,
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
