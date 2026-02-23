// controllers/lobbyController.js
// UC-2.1: Returns player's environment progress for the lobby map

import { lobbyService } from '../services/lobbyService.js';

/**
 * GET /api/lobby/:playerId/progress
 */
export const getLobbyProgress = async (req, res) => {
    try {
        const { playerId } = req.params;

        if (!playerId) {
            return res.status(400).json({ success: false, error: 'playerId is required' });
        }

        const data = await lobbyService.getEnvironmentProgress(playerId);

        res.json({ success: true, data });

    } catch (error) {
        console.error('getLobbyProgress error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};