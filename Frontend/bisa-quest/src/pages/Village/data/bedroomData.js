import AssetManifest from "../../../services/AssetManifest";

export const NPC_IMAGES = {
  village_npc_2: AssetManifest.village.npcs.ligaya,
};

export const BEDROOM_LABELS = [
  {
    id: "door_back_bedroom",
    labelBisaya: "Purtahan/Pultahan",
    labelEnglish: "Door",
    descriptionBisaya: "Ang pultahan pagawas.",
    descriptionEnglish: "The door to go out.",
    x: 0, y: 30, w: 15, h: 45,
  },
  {
    id: "katre",
    labelBisaya: "Katre",
    labelEnglish: "Bed",
    descriptionBisaya: "Ang higdaanan para mupahulay og matulog.",
    descriptionEnglish: "The bed for resting and sleeping.",
    imageKey: "katre",
    x: 25, y: 59, w: 33, h: 13,
  },
  {
    id: "suga_bedroom",
    labelBisaya: "Suga sa Kisame",
    labelEnglish: "Ceiling Light",
    descriptionBisaya: "Ang suga nga nagdan-ag sa tibuok kwarto.",
    descriptionEnglish: "The light that illuminates the entire room.",
    x: 48, y: 5, w: 10, h: 20,
  },
  {
    id: "paspas",
    labelBisaya: "Paspas / Abog-abog",
    labelEnglish: "Dust Feather / Duster",
    descriptionBisaya: "Gamiton sa paglimpyo sa abog sa mga muwebles.",
    descriptionEnglish: "Used for cleaning dust off furniture.",
    x: 64, y: 52, w: 7, h: 5,
  },
  {
    id: "bintana_bedroom",
    labelBisaya: "Bintana",
    labelEnglish: "Window",
    descriptionBisaya: "Bukas nga parte sa dingding para sa hangin ug suga.",
    descriptionEnglish: "An opening in the wall for air and light.",
    x: 48, y: 33, w: 10, h: 18,
  },
  {
    id: "kalendaryo_bedroom",
    labelBisaya: "Kalendaryo",
    labelEnglish: "Calendar",
    descriptionBisaya: "Gipakita ang mga petsa ug buwan sa tuig.",
    descriptionEnglish: "Shows the dates and months of the year.",
    imageKey: "kalendaryo",
    x: 63, y: 34, w: 7, h: 15,
  },
  {
    id: "aparador_bedroom",
    labelBisaya: "Aparador",
    labelEnglish: "Cabinet",
    descriptionBisaya: "Sudlanan sa mga sinina o uban pang gamit.",
    descriptionEnglish: "Stores clothes or other things.",
    imageKey: "aparador",
    x: 65, y: 55, w: 9, h: 18,
  },
  {
    id: "bentilador_bedroom",
    labelBisaya: "Bentilador",
    labelEnglish: "Electric Fan",
    descriptionBisaya: "Gamit pampabugnaw kung puwerte kainit.",
    descriptionEnglish: "Used to cool down when it's very hot.",
    imageKey: "Bentilador",
    x: 14, y: 64, w: 10, h: 20,
  },
  {
    id: "plantsa_bedroom",
    labelBisaya: "Plantsa / Plantsahan",
    labelEnglish: "Iron / Ironing Board",
    descriptionBisaya: "Gigamit sa pagpahu karsonsilyo o sinina aron hapsay tan-awon.",
    descriptionEnglish: "Used to iron clothes or pants to make them look neat.",
    x: 78, y: 51, w: 12, h: 27,
  },
  {
    id: "bukag_bedroom",
    labelBisaya: "Bukag / Sudlanan sa Labhunon",
    labelEnglish: "Laundry Basket",
    descriptionBisaya: "Sudlanan sa mga bulingon nga sanina.",
    descriptionEnglish: "Container for dirty clothes.",
    imageKey: "laundry_basket",
    x: 83, y: 68, w: 13, h: 19,
  }
];

export const INTRO_DIALOGUE = [
  {
    speaker: "Ligaya",
    bisayaText: "Mao ni ang Kwarto.",
    englishText: "This is the Bedroom.",
  },
  {
    speaker: "Ligaya",
    bisayaText: "Dire mi mupahulay og matulog. I-click ang pultahan para mubalik sa sala.",
    englishText: "This is where we rest and sleep. Click the door to go back to the living room.",
  }
];

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
