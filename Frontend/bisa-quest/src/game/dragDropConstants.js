// ─────────────────────────────────────────────────────────────────────────────
//  dragDropConstants.js
//  Shared constants for both DragAndDrop and ItemAssociation games.
// ─────────────────────────────────────────────────────────────────────────────

import houseBackground from "../assets/images/environments/scenario/house.jpg";
// import kitchenBackground  from "../assets/images/environments/scenario/kitchen.jpg";
// import bedroomBackground  from "../assets/images/environments/scenario/bedroom.jpg";
// import bathroomBackground from "../assets/images/environments/scenario/bathroom.jpg";

// ── Scene backgrounds ─────────────────────────────────────────────────────────
export const SCENE_BACKGROUNDS = {
  living_room: houseBackground,
  // kitchen:  kitchenBackground,
  // bedroom:  bedroomBackground,
  // bathroom: bathroomBackground,
};

export const DEFAULT_BACKGROUND = houseBackground;

// ── Zone registry (DragAndDrop) ───────────────────────────────────────────────
// ALL zones across ALL scenes live here.
// Every zone is ALWAYS rendered as a valid drop target — items dropped in
// the wrong zone simply won't be marked correct. This prevents players from
// guessing based on how many zones are visible.
//
// Coordinates are % of the game container (0–100).
// Labels are English / Bisaya to match bisaquest_seed_v3.sql.
// Zone IDs must match correct_zone values in challenge_items exactly.
export const ZONE_REGISTRY = {

  // ── Living room (house.jpg) ───────────────────────────────────────────────
  bookshelf: { label: "Bookshelf / Estante", x: 66, y: 1,  w: 33, h: 55 },
  sofa:      { label: "Sofa / Sopa",         x: 46, y: 38, w: 24, h: 26 },
  aparador:  { label: "Cabinet / Aparador",  x: 67, y: 56, w: 33, h: 40 },
  lamesa:    { label: "Table / Lamesa",      x: 38, y: 62, w: 22, h: 20 },
  sulok:     { label: "Corner / Sulok",      x: 20, y: 38, w: 14, h: 52 },
  planggana: { label: "Basin / Planggana",   x: 0,  y: 38, w: 14, h: 52 },

  // ── Kitchen (kitchen.jpg) — add coordinates when asset is ready ───────────
  // kitchen_counter: { label: "Counter / Kontra",   x: 20, y: 30, w: 45, h: 25 },
  // ref:             { label: "Ref / Ref",           x: 70, y: 10, w: 25, h: 60 },
  // sink:            { label: "Sink / Lababo",       x: 10, y: 35, w: 20, h: 25 },
  // dining_table:    { label: "Dining / Hapag",      x: 30, y: 60, w: 40, h: 30 },

  // ── Bedroom (bedroom.jpg) — add coordinates when asset is ready ───────────
  // bed:             { label: "Bed / Higdaanan",     x: 40, y: 30, w: 45, h: 40 },
  // wardrobe:        { label: "Wardrobe / Aparador", x: 0,  y: 5,  w: 20, h: 75 },
  // study_desk:      { label: "Study Desk / Lamesa", x: 70, y: 40, w: 28, h: 35 },
};

// ── Scene → its zones mapping ─────────────────────────────────────────────────
export const SCENE_ZONES = {
  living_room: ["bookshelf", "sofa", "aparador", "lamesa", "sulok", "planggana"],
  // kitchen:  ["kitchen_counter", "ref", "sink", "dining_table"],
  // bedroom:  ["bed", "wardrobe", "study_desk"],
};

// ── DragAndDrop item starting positions (by index, 0-based) ──────────────────
export const START_POSITIONS = [
  { x: 48, y: 42 },
  { x: 82, y: 76 },
  { x: 53, y: 68 },
  { x: 62, y: 68 },
  { x: 20, y: 60 },
  { x: 35, y: 75 },
];

// ── ItemAssociation scatter positions (by index, 0-based) ────────────────────
// 10 positions spread naturally across the scene (supports up to 10 items).
// Avoids the NPC section (bottom-left) and the complete button (bottom-right).
export const IA_ITEM_POSITIONS = [
  { x: 72, y: 12 },   // 0 — bookshelf area top
  { x: 55, y: 30 },   // 1 — center-upper
  { x: 82, y: 42 },   // 2 — right mid
  { x: 72, y: 68 },   // 3 — right lower
  { x: 55, y: 76 },   // 4 — center lower
  { x: 42, y: 58 },   // 5 — coffee table area
  { x: 30, y: 72 },   // 6 — lower center-left
  { x: 14, y: 52 },   // 7 — left corner
  { x: 25, y: 35 },   // 8 — left-upper
  { x: 45, y: 22 },   // 9 — center-upper left
];

// ── Dev fallback items (used when no questId is passed) ───────────────────────
// Mirrors bisaquest_seed_v3.sql Quest 1: Cleaning Tools
export const FALLBACK_ITEMS = [
  { id: "fb_1", label: "Broom / Walis",      zone: "sulok",     startX: 48, startY: 42 },
  { id: "fb_2", label: "Dustpan / Panlabay", zone: "sulok",     startX: 35, startY: 75 },
  { id: "fb_3", label: "Brush / Sipilyo",    zone: "sulok",     startX: 20, startY: 60 },
  { id: "fb_4", label: "Mop / Mop",          zone: "planggana", startX: 82, startY: 76 },
  { id: "fb_5", label: "Wet Rag / Trapo",    zone: "planggana", startX: 53, startY: 68 },
  { id: "fb_6", label: "Bucket / Timba",     zone: "planggana", startX: 62, startY: 68 },
];