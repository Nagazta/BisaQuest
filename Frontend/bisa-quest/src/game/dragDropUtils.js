// ─────────────────────────────────────────────────────────────────────────────
//  dragDropUtils.js
//  Pure helper functions for the Drag & Drop game.
//  No React, no side effects — safe to unit test independently.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Returns the NPC dialogue box text based on current game state.
 * Priority: allCorrect → correct feedback → wrong feedback → instructions
 *
 * @param {{ type: "correct"|"wrong", label: string } | null} feedback
 * @param {boolean} allCorrect
 * @param {string}  instructions  - fetched from quest meta
 * @returns {string}
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
 * Falls back to living_room if the scene isn't in the map.
 *
 * @param {string} sceneType
 * @param {Record<string, string[]>} sceneZones  - SCENE_ZONES from constants
 * @returns {string[]}
 */
export const getZoneIdsForScene = (sceneType, sceneZones) =>
  sceneZones[sceneType] ?? sceneZones["living_room"] ?? [];

/**
 * Builds the full list of DropZone objects for a scene.
 * ALL zones for the scene are returned — not just the ones used by the quest.
 * This ensures players always see 6 targets and can't guess by elimination.
 *
 * @param {string}   sceneType
 * @param {Record<string, string[]>}  sceneZones
 * @param {Record<string, object>}    zoneRegistry
 * @returns {{ id: string, label: string, x: number, y: number, w: number, h: number }[]}
 */
export const buildAllDropZones = (sceneType, sceneZones, zoneRegistry) => {
  const ids = getZoneIdsForScene(sceneType, sceneZones);
  return ids
    .filter(id => {
      if (!zoneRegistry[id]) {
        console.warn(
          `[dragDropUtils] Zone "${id}" is in SCENE_ZONES but missing from ZONE_REGISTRY. Skipping.`
        );
        return false;
      }
      return true;
    })
    .map(id => ({ id, ...zoneRegistry[id] }));
};

/**
 * Maps raw DB rows from /api/challenge/quest/:id/items into item objects.
 *
 * @param {object[]} rawItems   - rows from challenge_items
 * @param {{ x: number, y: number }[]} startPositions
 * @returns {{ id: string, label: string, zone: string, startX: number, startY: number }[]}
 */
export const mapRawItems = (rawItems, startPositions) =>
  rawItems.map((row, i) => ({
    id:     String(row.item_id),
    label:  row.label,
    zone:   row.correct_zone,
    startX: startPositions[i]?.x ?? 50,
    startY: startPositions[i]?.y ?? 60,
  }));