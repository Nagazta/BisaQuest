// ─────────────────────────────────────────────────────────────────────────────
//  dragDropConstants.js
// ─────────────────────────────────────────────────────────────────────────────

import houseBackground from "../assets/images/environments/scenario/house.jpg";

// ── Item images ───────────────────────────────────────────────────────────────
import BroomImg   from "../assets/items/broom.png";
import DustpanImg from "../assets/items/dustpan.png";
import MopImg     from "../assets/items/mop.png";
import PillowImg  from "../assets/items/pillow.png";
import RagImg     from "../assets/items/rag.png";
import SlipperImg from "../assets/items/slipper.png";
import TrashImg   from "../assets/items/trash 1.png";
import BrushImg   from "../assets/items/brush.png";
import towelImg   from "../assets/items/towel.png";
import bedsheetImg from "../assets/items/bedsheet.png";
import habolImg    from "../assets/items/habol.png";
import handfanImg   from "../assets/items/hand_fan.png";
// ── Image lookup map ──────────────────────────────────────────────────────────
export const ITEM_IMAGE_MAP = {
  broom:    BroomImg,
  walis:    BroomImg,
  dustpan:  DustpanImg,
  panlabay: DustpanImg,
  mop:      MopImg,
  towel:    towelImg,
  habol:    habolImg,
  kumot: bedsheetImg,
  pillow:   PillowImg,
  unan:     PillowImg,
  abano:    handfanImg,
  rag:      RagImg,
  trapo:    RagImg,
  brush:    BrushImg,
  slipper:  SlipperImg,
  sinelas:  SlipperImg,
  trash:    TrashImg,
  basura:   TrashImg,
};

// ── Scene backgrounds ─────────────────────────────────────────────────────────
export const SCENE_BACKGROUNDS = {
  living_room: houseBackground,
};

export const DEFAULT_BACKGROUND = houseBackground;

// ── Zone registry ─────────────────────────────────────────────────────────────
export const ZONE_REGISTRY = {
  bookshelf: { label: "Bookshelf / Estante", x: 73, y: 35,  w: 20, h: 50 },
  sofa:      { label: "Sofa / Sopa",         x: 40, y: 50,  w: 21, h: 16 },
  aparador:  { label: "Cabinet / Aparador",  x: 24, y: 40,  w: 10, h: 30 },
  lamesa:    { label: "Table / Lamesa",      x: 42, y: 68,  w: 20, h: 10 },
  sulok:     { label: "Corner / Sulok",      x: 34, y: 40,  w: 6,  h: 30 },
  planggana: { label: "Basin / Planggana",   x: 57, y: 80,  w: 14, h: 16 },
};

export const SCENE_ZONES = {
  living_room: ["bookshelf", "sofa", "aparador", "lamesa", "sulok", "planggana"],
};

// ── Start positions — naturally scattered around the room ─────────────────────
// Spread across floor, corners, and mid areas. Avoids NPC zone (bottom-left <25%).
export const START_POSITIONS = [
  { x: 52, y: 44 },   // center of room, near bench
  { x: 78, y: 72 },   // right side, lower floor
  { x: 38, y: 78 },   // center-left floor
  { x: 65, y: 58 },   // right-center floor
  { x: 58, y: 82 },   // lower center floor
  { x: 44, y: 62 },   // middle floor
];

// ── IA scatter positions ──────────────────────────────────────────────────────
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

// ── Fallback items ────────────────────────────────────────────────────────────
export const FALLBACK_ITEMS = [
  { id: "fb_1", label: "Broom / Walis",      zone: "sulok",     startX: 52, startY: 44, image: BroomImg   },
  { id: "fb_2", label: "Dustpan / Panlabay", zone: "sulok",     startX: 78, startY: 72, image: DustpanImg },
  { id: "fb_3", label: "Brush / Sipilyo",    zone: "sulok",     startX: 38, startY: 78, image: null        },
  { id: "fb_4", label: "Mop / Mop",          zone: "planggana", startX: 65, startY: 58, image: MopImg     },
  { id: "fb_5", label: "Wet Rag / Trapo",    zone: "planggana", startX: 58, startY: 82, image: RagImg     },
  { id: "fb_6", label: "Bucket / Timba",     zone: "planggana", startX: 44, startY: 62, image: null        },
];