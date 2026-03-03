// ─────────────────────────────────────────────────────────────────────────────
//  dragDropUtils.js
//  Pure helper functions for the Drag & Drop game.
// ─────────────────────────────────────────────────────────────────────────────
import { ITEM_IMAGE_MAP } from "./dragDropConstants";

/**
 * Resolves the image for an item by checking if its label (lowercased)
 * contains any key from ITEM_IMAGE_MAP — matched as whole words only
 * to prevent collisions like "pants" matching "pan".
 *
 * @param {string} label  - e.g. "Pants / Sinina"
 * @returns {string|null} - imported image URL or null
 */
export const resolveItemImage = (label = "") => {
  const lower = label.toLowerCase();
  const matchedKey = Object.keys(ITEM_IMAGE_MAP).find(
    key => new RegExp(`\\b${key}\\b`).test(lower)
  );
  return matchedKey ? ITEM_IMAGE_MAP[matchedKey] : null;
};

/**
 * Returns NPC dialogue text based on current game state.
 *
 * Wrong feedback tells the player WHERE the item belongs
 * using the zone label from ZONE_REGISTRY, e.g.:
 *   "Pants / Sinina belongs to Wardrobe / Aparador! Try again!"
 *
 * @param {{ type: "correct"|"wrong", label: string, correctZone?: string } | null} feedback
 * @param {boolean} allCorrect
 * @param {string}  instructions
 * @param {Record<string, { label: string }>} zoneRegistry  - pass ZONE_REGISTRY in
 * @returns {string}
 */
export const getDialogueText = (feedback, allCorrect, instructions, zoneRegistry = {}) => {
  if (allCorrect)
    return "Ayos kaayo! You got them all! Nahuman na nimo! 🎉";
  if (feedback?.type === "correct")
    return `Correct! "${feedback.label}" — Tama ang lugar! ✓`;
  if (feedback?.type === "wrong") {
    const zoneLabel = feedback.correctZone
      ? zoneRegistry[feedback.correctZone]?.label
      : null;
    if (zoneLabel) {
      return `Sayop! Ang "${feedback.label}" belongs sa ${zoneLabel}! Try again! ✗`;
    }
    return `Sayop ang lugar! Try again! ✗`;
  }
  return instructions || "Drag each item to its correct place! I-drag ang bawat bagay sa tamang lugar!";
};

/**
 * Returns all zone ids that belong to a given scene type.
 */
export const getZoneIdsForScene = (sceneType, sceneZones) =>
  sceneZones[sceneType] ?? sceneZones["living_room"] ?? [];

/**
 * Builds the full list of DropZone objects for a scene.
 */
export const buildAllDropZones = (sceneType, sceneZones, zoneRegistry) => {
  const ids = getZoneIdsForScene(sceneType, sceneZones);
  return ids
    .filter(id => {
      if (!zoneRegistry[id]) {
        console.warn(`[dragDropUtils] Zone "${id}" missing from ZONE_REGISTRY. Skipping.`);
        return false;
      }
      return true;
    })
    .map(id => ({ id, ...zoneRegistry[id] }));
};

/**
 * Maps raw DB rows into item objects, auto-resolving images from labels.
 */
export const mapRawItems = (rawItems, startPositions) =>
  rawItems.map((row, i) => ({
    id:     String(row.item_id),
    label:  row.label,
    zone:   row.correct_zone,
    startX: startPositions[i]?.x ?? 50,
    startY: startPositions[i]?.y ?? 60,
    image:  resolveItemImage(row.label),
  }));