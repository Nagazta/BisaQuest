// ─────────────────────────────────────────────────────────────────────────────
//  dragDropUtils.js
//  Pure helper functions for the Drag & Drop game.
// ─────────────────────────────────────────────────────────────────────────────

import { ITEM_IMAGE_MAP } from "./dragDropConstants";

/**
 * Resolves the image for an item by checking if its label (lowercased)
 * contains any key from ITEM_IMAGE_MAP.
 *
 * @param {string} label  - e.g. "Broom / Walis"
 * @returns {string|null} - imported image URL or null
 */
export const resolveItemImage = (label = "") => {
  const lower = label.toLowerCase();
  const matchedKey = Object.keys(ITEM_IMAGE_MAP).find(key => lower.includes(key));
  return matchedKey ? ITEM_IMAGE_MAP[matchedKey] : null;
};

/**
 * Returns the NPC dialogue box text based on current game state.
 */
export const getDialogueText = (feedback, allCorrect, instructions) => {
  if (allCorrect)
    return "Great job! You got them all! / Maayo kaayo! Nahuman na nimo ang tanan! 🎉";
  if (feedback?.type === "correct")
    return `Correct! "${feedback.label}" — Right place! / Husto! Tama ang lugar! ✓`;
  if (feedback?.type === "wrong")
    return "Wrong place! Try again! / Sayop ang lugar! Sulayi pag-usab! ✗";
  return instructions || "Drag each item to the correct place! / I-drag ang bawat bagay sa tamang lugar!";
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