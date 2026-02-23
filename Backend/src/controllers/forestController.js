// controllers/forestController.js
// UC-2.3: Forest access verification and progress

import { forestService } from '../services/forestService.js';

/**
 * GET /api/forest/:playerId
 * Returns forest progress + whether it's unlocked
 */
export const getForestProgress = async (req, res) => {
    try {
        const { playerId } = req.params;
        const data = await forestService.getForestProgress(playerId);

        if (!data.unlocked) {
            return res.status(403).json({
                success: false,
                locked:  true,
                error:   'Forest Quest is locked. Complete the Village Quest first.',
                data
            });
        }

        res.json({ success: true, data });
    } catch (error) {
        console.error('getForestProgress error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

/**
 * PUT /api/forest/:playerId/progress
 */
export const updateForestProgress = async (req, res) => {
    try {
        const { playerId } = req.params;
        const { forest_progress, npc_completions } = req.body;

        const data = await forestService.updateForestProgress(playerId, forest_progress, npc_completions);
        res.json({ success: true, data });
    } catch (error) {
        console.error('updateForestProgress error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};