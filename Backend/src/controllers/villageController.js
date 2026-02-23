// controllers/villageController.js
// UC-2.2: Village data and player progress

import { villageService } from '../services/villageService.js';

/**
 * GET /api/village/:playerId
 */
export const getVillageProgress = async (req, res) => {
    try {
        const { playerId } = req.params;
        const data = await villageService.getVillageProgress(playerId);
        res.json({ success: true, data });
    } catch (error) {
        console.error('getVillageProgress error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

/**
 * PUT /api/village/:playerId/progress
 * Body: { village_progress: number, npc_completions?: object }
 */
export const updateVillageProgress = async (req, res) => {
    try {
        const { playerId } = req.params;
        const { village_progress, npc_completions } = req.body;

        const data = await villageService.updateVillageProgress(playerId, village_progress, npc_completions);
        res.json({ success: true, data });
    } catch (error) {
        console.error('updateVillageProgress error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};