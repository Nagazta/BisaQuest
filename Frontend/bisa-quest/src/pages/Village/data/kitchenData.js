import AssetManifest from "../../../services/AssetManifest";

export const NPC_IMAGES = {
  village_npc_2: AssetManifest.village.npcs.ligaya,
};

export const KITCHEN_LABELS = [
  {
    id: "door_back_kitchen",
    labelBisaya: "Purtahan/Pultahan",
    labelEnglish: "Door",
    descriptionBisaya: "Ang pultahan pagawas.",
    descriptionEnglish: "The door to go out.",
    x: 3, y: 20, w: 15, h: 45,
  },
  {
    id: "lababo",
    labelBisaya: "Lababo",
    labelEnglish: "Sink",
    descriptionBisaya: "Ang lababo kay hugasanan sa mga plato og kamot.",
    descriptionEnglish: "This is where we wash the plates and our hands.",
    imageKey: "lababo",
    x: 45, y: 49, w: 12, h: 19,
  },
  {
    id: "dapogan",
    labelBisaya: "Dapogan / Sug-ang",
    labelEnglish: "Wood Stove",
    descriptionBisaya: "Lutoanan ginamit ang kahoy.",
    descriptionEnglish: "Cooking stove using firewood.",
    x: 57, y: 52, w: 10, h: 17,
  },
  {
    id: "drumin",
    labelBisaya: "Drumin / Sudlanan sa tubig",
    labelEnglish: "Water Barrel",
    descriptionBisaya: "Dako nga sudlanan sa tubig para panluto og panghugas.",
    descriptionEnglish: "Large barrel for storing water for cooking and washing.",
    imageKey: "drumin",
    x: 66, y: 50, w: 9, h: 19,
  },
  {
    id: "bintana_kitchen",
    labelBisaya: "Bintana",
    labelEnglish: "Window",
    descriptionBisaya: "Bukas nga parte sa dingding para hangin og suga.",
    descriptionEnglish: "Opening in the wall for air and light.",
    x: 46, y: 28, w: 9, h: 17,
  },
  {
    id: "lamesa_kitchen",
    labelBisaya: "Banggera / Lamesa",
    labelEnglish: "Counter / Table",
    descriptionBisaya: "Butanganan og andaman sa mga pagkaon.",
    descriptionEnglish: "Counter for placing and preparing food.",
    imageKey: "lamesa",
    x: 18, y: 48, w: 28, h: 19,
  },
  {
    id: "estante_wala",
    labelBisaya: "Estante",
    labelEnglish: "Shelves",
    descriptionBisaya: "Butanganan sa mga plato og kaldero.",
    descriptionEnglish: "Shelves for plates and pots.",
    imageKey: "shelf",
    x: 24, y: 27, w: 22, h: 19,
  },
  {
    id: "estante_tuo",
    labelBisaya: "Dakong Estante",
    labelEnglish: "Large Shelf",
    descriptionBisaya: "Kabinete para sa mga buak nga gamit og uban pa.",
    descriptionEnglish: "Cabinet for fragile items and others.",
    imageKey: "big_shelf",
    x: 75, y: 24, w: 20, h: 35,
  },
  {
    id: "basket_kitchen",
    labelBisaya: "Bukag / Basket",
    labelEnglish: "Basket / Crate",
    descriptionBisaya: "Sudlanan sa mga prutas o gulay.",
    descriptionEnglish: "Container for fruits or vegetables.",
    imageKey: "red_crate",
    x: 79, y: 78, w: 14, h: 16,
  }
];

export const INTRO_DIALOGUE = [
  {
  speaker: "Ligaya",
  bisayaText: "Mao ni ang kusina!",
  englishText: "This is the kitchen!",
},
{
  speaker: "Ligaya",
  bisayaText: "Diri mi magluto ug mokaon.",
  englishText: "This is where we cook and eat.",
},
{
  speaker: "Ligaya",
  bisayaText: "I-click ang mga butang sa kusina para makakat-on pa.",
  englishText: "Click the items in the kitchen to learn more.",
},
{
  speaker: "Ligaya",
  bisayaText: "Kung gusto ka mubalik sa sala, i-click ang pultahan.",
  englishText: "If you want to go back to the living room, click the door.",
},
{
  speaker: "Ligaya",
  bisayaText: "I-click ang arrow para magsugod ang adventure sa kusina!",
  englishText: "Click the arrow to start the kitchen adventure!",
}
];

export const buildDialogue = (region) => [
  {
    speaker: "Ligaya",
    bisayaText: `Kini ang ${region.labelBisaya}!`,
    englishText: `This is the ${region.labelEnglish}!`,
  },
  {
    speaker: "Ligaya",
    bisayaText: region.descriptionBisaya,
    englishText: region.descriptionEnglish,
  },
];
