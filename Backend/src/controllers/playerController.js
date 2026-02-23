// controllers/playerController.js
// Uses single 'players' table - no auth required

import { supabase } from '../config/supabaseClient.js';

/**
 * Create an anonymous player
 * POST /api/player/create
 * Body: { nickname?: string }
 */
export const createPlayer = async (req, res) => {
    try {
        const { nickname = 'Guest Player' } = req.body;

        const { data, error } = await supabase
            .from('players')
            .insert([
                {
                    nickname: nickname.trim() || 'Guest Player',
                    progress_data: {},
                    character: null
                }
            ])
            .select()
            .single();

        if (error) {
            console.error('Player creation error:', error);
            throw error;
        }

        res.status(201).json({
            success: true,
            message: 'Player created successfully',
            data: {
                player_id: data.player_id,
                nickname: data.nickname,
                character: data.character,
                progress_data: data.progress_data,
                created_at: data.created_at
            }
        });

    } catch (error) {
        console.error('Create player error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to create player'
        });
    }
};

/**
 * Get player by player_id
 * GET /api/player/:playerId
 */
export const getPlayer = async (req, res) => {
    try {
        const { playerId } = req.params;

        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(playerId)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid player ID format'
            });
        }

        const { data, error } = await supabase
            .from('players')
            .select('*')
            .eq('player_id', playerId)
            .single();

        if (error) throw error;

        if (!data) {
            return res.status(404).json({
                success: false,
                error: 'Player not found'
            });
        }

        res.json({
            success: true,
            data
        });

    } catch (error) {
        console.error('Get player error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to get player'
        });
    }
};

/**
 * Update player nickname
 * PUT /api/player/:playerId/nickname
 * Body: { nickname: string }
 */
export const updateNickname = async (req, res) => {
    try {
        const { playerId } = req.params;
        const { nickname } = req.body;

        if (!nickname || nickname.trim().length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Nickname is required'
            });
        }

        if (nickname.length > 50) {
            return res.status(400).json({
                success: false,
                error: 'Nickname must be 50 characters or less'
            });
        }

        const { data, error } = await supabase
            .from('players')
            .update({ nickname: nickname.trim() })
            .eq('player_id', playerId)
            .select()
            .single();

        if (error) throw error;

        res.json({
            success: true,
            message: 'Nickname updated successfully',
            data
        });

    } catch (error) {
        console.error('Update nickname error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to update nickname'
        });
    }
};

/**
 * Update player character selection
 * PUT /api/player/:playerId/character
 * Body: { character: string }
 */
export const updateCharacter = async (req, res) => {
    try {
        const { playerId } = req.params;
        const { character } = req.body;

        if (!character || character.trim().length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Character is required'
            });
        }

        const { data, error } = await supabase
            .from('players')
            .update({ character: character.trim() })
            .eq('player_id', playerId)
            .select()
            .single();

        if (error) throw error;

        res.json({
            success: true,
            message: 'Character updated successfully',
            data
        });

    } catch (error) {
        console.error('Update character error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to update character'
        });
    }
};

/**
 * Get player progress
 * GET /api/player/:playerId/progress
 */
export const getProgress = async (req, res) => {
    try {
        const { playerId } = req.params;

        const { data, error } = await supabase
            .from('players')
            .select('player_id, nickname, progress_data')
            .eq('player_id', playerId)
            .single();

        if (error) throw error;

        if (!data) {
            return res.status(404).json({
                success: false,
                error: 'Player not found'
            });
        }

        res.json({
            success: true,
            data: {
                player_id: data.player_id,
                nickname: data.nickname,
                progress_data: data.progress_data || {}
            }
        });

    } catch (error) {
        console.error('Get progress error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to get progress'
        });
    }
};

/**
 * Update player progress
 * PUT /api/player/:playerId/progress
 * Body: { progress_data: object }
 */
export const updateProgress = async (req, res) => {
    try {
        const { playerId } = req.params;
        const { progress_data } = req.body;

        if (!progress_data || typeof progress_data !== 'object') {
            return res.status(400).json({
                success: false,
                error: 'progress_data must be a valid object'
            });
        }

        // Fetch existing progress first, then merge to avoid overwriting
        const { data: existing, error: fetchError } = await supabase
            .from('players')
            .select('progress_data')
            .eq('player_id', playerId)
            .single();

        if (fetchError) throw fetchError;

        const merged = {
            ...(existing?.progress_data || {}),
            ...progress_data
        };

        const { data, error } = await supabase
            .from('players')
            .update({ progress_data: merged })
            .eq('player_id', playerId)
            .select()
            .single();

        if (error) throw error;

        res.json({
            success: true,
            message: 'Progress updated successfully',
            data
        });

    } catch (error) {
        console.error('Update progress error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to update progress'
        });
    }
};

/**
 * Get player stats
 * GET /api/player/:playerId/stats
 */
export const getStats = async (req, res) => {
    try {
        const { playerId } = req.params;

        const { data, error } = await supabase
            .from('players')
            .select('*')
            .eq('player_id', playerId)
            .single();

        if (error) throw error;

        if (!data) {
            return res.status(404).json({
                success: false,
                error: 'Player not found'
            });
        }

        const progressData = data.progress_data || {};
        const completedModules = Object.values(progressData).filter(
            v => typeof v === 'number' && v >= 100
        ).length;
        const badgeCount = progressData.badges ? progressData.badges.length : 0;
        const overallProgress = progressData.overall_progress || 0;

        res.json({
            success: true,
            data: {
                player_id: data.player_id,
                nickname: data.nickname,
                character: data.character,
                overall_progress: overallProgress,
                badges_count: badgeCount,
                completed_modules: completedModules,
                created_at: data.created_at
            }
        });

    } catch (error) {
        console.error('Get stats error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to get stats'
        });
    }
};

/**
 * Reset player progress
 * DELETE /api/player/:playerId/reset
 */
export const resetProgress = async (req, res) => {
    try {
        const { playerId } = req.params;

        const { data, error } = await supabase
            .from('players')
            .update({ progress_data: {} })
            .eq('player_id', playerId)
            .select()
            .single();

        if (error) throw error;

        res.json({
            success: true,
            message: 'Progress reset successfully',
            data
        });

    } catch (error) {
        console.error('Reset progress error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to reset progress'
        });
    }
};