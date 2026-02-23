// controllers/castleController.js
// UC-2.4: Castle access verification (both village + forest required) and progress

import { castleService } from '../services/castleService.js';

/**
 * GET /api/castle/:playerId
 */
export const getCastleProgress = async (req, res) => {
    try {
        const { playerId } = req.params;
        const data = await castleService.getCastleProgress(playerId);

        if (!data.unlocked) {
            return res.status(403).json({
                success: false,
                locked:  true,
                error:   'Castle Quest is locked. Complete both Village and Forest Quests first.',
                data
            });
        }

        res.json({ success: true, data });
    } catch (error) {
        console.error('getCastleProgress error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

/**
 * PUT /api/castle/:playerId/progress
 */
export const updateCastleProgress = async (req, res) => {
    try {
        const { playerId } = req.params;
        const { castle_progress, npc_completions } = req.body;

        const data = await castleService.updateCastleProgress(playerId, castle_progress, npc_completions);
        res.json({ success: true, data });
    } catch (error) {
        console.error('updateCastleProgress error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};