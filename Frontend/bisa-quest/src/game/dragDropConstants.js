// ─────────────────────────────────────────────────────────────────────────────
//  dragDropConstants.js
//  Shared constants for DragAndDrop and ItemAssociation games.
// ─────────────────────────────────────────────────────────────────────────────

// ── Scene backgrounds ─────────────────────────────────────────────────────────
import houseBackground    from "../assets/images/environments/scenario/house.jpg";
import kitchenBackground  from "../assets/images/environments/scenario/kitchen.jpg";
import bedroomBackground from "../assets/images/environments/scenario/bedroom.jpg";


// ── Item images — Living Room ─────────────────────────────────────────────────
import BroomImg    from "../assets/items/broom.png";
import DustpanImg  from "../assets/items/dustpan.png";
import MopImg      from "../assets/items/mop.png";
import PillowImg   from "../assets/items/pillow.png";
import RagImg      from "../assets/items/rag.png";
import SlipperImg  from "../assets/items/slipper.png";
import TrashImg    from "../assets/items/trash 1.png";
import BrushImg    from "../assets/items/brush.png";
import TowelImg    from "../assets/items/towel.png";
import BedsheetImg from "../assets/items/bedsheet.png";
import HabolImg    from "../assets/items/habol.png";
import HandfanImg  from "../assets/items/hand_fan.png";

// ── Item images — Kitchen ─────────────────────────────────────────────────────
import PotImg    from "../assets/items/pot.png";
import PanImg    from "../assets/items/pan.png";
import LadleImg  from "../assets/items/ladle.png";
import KnifeImg  from "../assets/items/knife.png";
import PlateImg  from "../assets/items/plate.png";
import CupImg    from "../assets/items/cup.png";

// ── Image lookup map ──────────────────────────────────────────────────────────
export const ITEM_IMAGE_MAP = {
  // Living room
  broom:    BroomImg,
  walis:    BroomImg,
  dustpan:  DustpanImg,
  panlabay: DustpanImg,
  mop:      MopImg,
  towel:    TowelImg,
  habol:    HabolImg,
  kumot:    BedsheetImg,
  pillow:   PillowImg,
  unan:     PillowImg,
  abano:    HandfanImg,
  rag:      RagImg,
  trapo:    RagImg,
  brush:    BrushImg,
  slipper:  SlipperImg,
  sinelas:  SlipperImg,
  trash:    TrashImg,
  basura:   TrashImg,
  // Kitchen
  pot:      PotImg,
  kaldero:  PotImg,
  pan:      PanImg,
  kawali:   PanImg,
  ladle:    LadleImg,
  sandok:   LadleImg,
  knife:    KnifeImg,
  kutsilyo: KnifeImg,
  plate:    PlateImg,
  plato:    PlateImg,
  cup:      CupImg,
  tasa:     CupImg,
  // Bedroom — reuse existing assets
  bedsheet: BedsheetImg,
  habol2:   HabolImg,
  pillow2:  PillowImg,
  slipper2: SlipperImg,
  towel2:   TowelImg,
};

// ── Scene backgrounds ─────────────────────────────────────────────────────────
export const SCENE_BACKGROUNDS = {
  living_room: houseBackground,
  kitchen:     kitchenBackground,
  bedroom:     bedroomBackground,   // 🛏️ swap to bedroomBackground when asset is ready
};

export const DEFAULT_BACKGROUND = houseBackground;

// ── Zone registry ─────────────────────────────────────────────────────────────
export const ZONE_REGISTRY = {

  // ── Living room ───────────────────────────────────────────────────────────
  bookshelf: { label: "Bookshelf / Estante", x: 73, y: 35, w: 20, h: 50 },
  sofa:      { label: "Sofa / Sopa",         x: 40, y: 50, w: 21, h: 16 },
  aparador:  { label: "Cabinet / Aparador",  x: 24, y: 40, w: 10, h: 30 },
  lamesa:    { label: "Table / Lamesa",      x: 42, y: 68, w: 20, h: 10 },
  sulok:     { label: "Corner / Sulok",      x: 34, y: 40, w:  6, h: 30 },
  planggana: { label: "Basin / Planggana",   x: 57, y: 80, w: 14, h: 16 },

  // ── Kitchen ───────────────────────────────────────────────────────────────
  // ⚠️ Calibrate once kitchen.jpg is available using Debug mode.
  stove:     { label: "Stove / Kalan",       x: 15, y: 35, w: 22, h: 35 },
  counter:   { label: "Counter / Kontra",    x: 38, y: 35, w: 25, h: 30 },
  rack:      { label: "Rack / Estante",      x: 64, y: 20, w: 16, h: 45 },
  dish_rack: { label: "Dish Rack / Plahan",  x: 64, y: 55, w: 16, h: 30 },
  ref:       { label: "Ref / Ref",           x: 82, y: 10, w: 16, h: 60 },
  sink:      { label: "Sink / Lababo",       x: 38, y: 65, w: 18, h: 25 },

  // ── Bedroom (mock) ────────────────────────────────────────────────────────
  // ⚠️ Calibrate once bedroom.jpg is available using Debug mode.
  bed:       { label: "Bed / Higdaanan",     x: 30, y: 35, w: 40, h: 40 },
  wardrobe:  { label: "Wardrobe / Aparador", x:  5, y: 10, w: 18, h: 70 },
  bedside:   { label: "Bedside / Lamesa",    x: 72, y: 45, w: 14, h: 30 },
  floor:     { label: "Floor / Salog",       x: 25, y: 78, w: 50, h: 18 },
};

// ── Scene → zone IDs ──────────────────────────────────────────────────────────
export const SCENE_ZONES = {
  living_room: ["bookshelf", "sofa", "aparador", "lamesa", "sulok", "planggana"],
  kitchen:     ["stove", "counter", "rack", "dish_rack", "ref", "sink"],
  bedroom:     ["bed", "wardrobe", "bedside", "floor"],
};

// ── DragAndDrop start positions (by index) ────────────────────────────────────
export const START_POSITIONS = [
  { x: 52, y: 44 },
  { x: 78, y: 72 },
  { x: 38, y: 78 },
  { x: 65, y: 58 },
  { x: 58, y: 82 },
  { x: 44, y: 62 },
];

// ── ItemAssociation scatter positions (by index) ──────────────────────────────
export const IA_ITEM_POSITIONS = [
  { x: 72, y: 12 },
  { x: 55, y: 30 },
  { x: 82, y: 42 },
  { x: 72, y: 68 },
  { x: 55, y: 76 },
  { x: 42, y: 58 },
  { x: 30, y: 72 },
  { x: 14, y: 52 },
  { x: 25, y: 35 },
  { x: 45, y: 22 },
];

// ── Fallback items — Living Room ──────────────────────────────────────────────
export const FALLBACK_ITEMS = [
  { id: "fb_1", label: "Broom / Walis",      zone: "sulok",     startX: 52, startY: 44, image: BroomImg   },
  { id: "fb_2", label: "Dustpan / Panlabay", zone: "sulok",     startX: 78, startY: 72, image: DustpanImg },
  { id: "fb_3", label: "Brush / Sipilyo",    zone: "sulok",     startX: 38, startY: 78, image: BrushImg   },
  { id: "fb_4", label: "Mop / Mop",          zone: "planggana", startX: 65, startY: 58, image: MopImg     },
  { id: "fb_5", label: "Wet Rag / Trapo",    zone: "planggana", startX: 58, startY: 82, image: RagImg     },
  { id: "fb_6", label: "Bucket / Timba",     zone: "planggana", startX: 44, startY: 62, image: null       },
];

// ── Fallback items — Kitchen ──────────────────────────────────────────────────
export const FALLBACK_ITEMS_KITCHEN = [
  { id: "kb_1", label: "Pot / Kaldero",    zone: "stove",     startX: 52, startY: 44, image: PotImg   },
  { id: "kb_2", label: "Pan / Kawali",     zone: "stove",     startX: 78, startY: 72, image: PanImg   },
  { id: "kb_3", label: "Ladle / Sandok",   zone: "rack",      startX: 38, startY: 78, image: LadleImg },
  { id: "kb_4", label: "Knife / Kutsilyo", zone: "counter",   startX: 65, startY: 58, image: KnifeImg },
  { id: "kb_5", label: "Plate / Plato",    zone: "dish_rack", startX: 58, startY: 82, image: PlateImg },
  { id: "kb_6", label: "Cup / Tasa",       zone: "dish_rack", startX: 44, startY: 62, image: CupImg   },
];

// ── Fallback items — Bedroom (mock) ───────────────────────────────────────────
// Uses existing assets — swap images when bedroom-specific PNGs are ready.
export const FALLBACK_ITEMS_BEDROOM = [
  { id: "bb_1", label: "Pillow / Unan",       zone: "bed",      startX: 52, startY: 44, image: PillowImg   },
  { id: "bb_2", label: "Bedsheet / Habol",    zone: "bed",      startX: 65, startY: 58, image: BedsheetImg },
  { id: "bb_3", label: "Blanket / Kumot",     zone: "bed",      startX: 44, startY: 62, image: HabolImg    },
  { id: "bb_4", label: "Slipper / Sinelas",   zone: "floor",    startX: 78, startY: 72, image: SlipperImg  },
  { id: "bb_5", label: "Towel / Tualya",      zone: "wardrobe", startX: 38, startY: 78, image: TowelImg    },
  { id: "bb_6", label: "Hand Fan / Abano",    zone: "bedside",  startX: 58, startY: 82, image: HandfanImg  },
];