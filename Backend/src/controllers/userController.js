// controllers/autoUserController.js
// Updated: No email, teacher_id, or class_code columns

import { supabase } from '../config/supabaseClient.js';
import { v4 as uuidv4 } from 'uuid';

/**
 * Create an anonymous user automatically
 * POST /api/auto-user/create
 * Body: { nickname?: string }
 */
export const createAutoUser = async (req, res) => {
    try {
        const { nickname = 'Guest Player' } = req.body;

        // Generate a unique username (no collision)
        const uniqueUsername = `player_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
        
        // Generate a random UUID for user_id
        const userId = uuidv4();

        // Create user in users table (NO EMAIL)
        const { data: userData, error: userError } = await supabase
            .from('users')
            .insert([
                {
                    user_id: userId,
                    username: uniqueUsername,
                    // email: DELETED - don't include this
                    fullname: nickname,
                    role: 'student'
                }
            ])
            .select()
            .single();

        if (userError) {
            console.error('User creation error:', userError);
            throw userError;
        }

        // Create student record (NO teacher_id, NO class_code)
        const { data: studentData, error: studentError } = await supabase
            .from('student')
            .insert([
                {
                    user_id: userId,
                    // teacher_id: DELETED - don't include this
                    // class_code: DELETED - don't include this
                    overall_progress: 0,
                    badges: [],
                    module_progress: {}
                }
            ])
            .select()
            .single();

        if (studentError) {
            console.error('Student creation error:', studentError);
            throw studentError;
        }

        res.status(201).json({
            success: true,
            message: 'User created successfully',
            data: {
                user_id: userData.user_id,
                student_id: studentData.student_id,
                username: userData.username,
                nickname: userData.fullname,
                role: 'student'
            }
        });

    } catch (error) {
        console.error('Create auto user error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to create user'
        });
    }
};

/**
 * Get user info
 * GET /api/auto-user/:userId
 */
export const getAutoUser = async (req, res) => {
    try {
        const { userId } = req.params;

        // Validate UUID format
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(userId)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid user ID format'
            });
        }

        // Get user data
        const { data: userData, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('user_id', userId)
            .single();

        if (userError) throw userError;

        if (!userData) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        // Get student data
        const { data: studentData, error: studentError } = await supabase
            .from('student')
            .select('*')
            .eq('user_id', userId)
            .single();

        if (studentError) throw studentError;

        res.json({
            success: true,
            data: {
                user: userData,
                student: studentData
            }
        });

    } catch (error) {
        console.error('Get auto user error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to get user data'
        });
    }
};

/**
 * Update user nickname
 * PUT /api/auto-user/:userId/nickname
 * Body: { nickname: string }
 */
export const updateNickname = async (req, res) => {
    try {
        const { userId } = req.params;
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
            .from('users')
            .update({ fullname: nickname.trim() })
            .eq('user_id', userId)
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
 * Get student progress
 * GET /api/auto-user/:userId/progress
 */
export const getProgress = async (req, res) => {
    try {
        const { userId } = req.params;

        // Get student data with progress
        const { data: studentData, error: studentError } = await supabase
            .from('student')
            .select('*')
            .eq('user_id', userId)
            .single();

        if (studentError) throw studentError;

        // Get student_progress if you have that table
        const { data: progressData, error: progressError } = await supabase
            .from('student_progress')
            .select('*')
            .eq('student_id', studentData.student_id);

        // Don't throw error if no progress yet
        const progress = progressError ? [] : progressData;

        res.json({
            success: true,
            data: {
                overall_progress: studentData.overall_progress || 0,
                badges: studentData.badges || [],
                module_progress: studentData.module_progress || {},
                detailed_progress: progress
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
 * Update student progress
 * PUT /api/auto-user/:userId/progress
 * Body: { overall_progress?, badges?, module_progress? }
 */
export const updateProgress = async (req, res) => {
    try {
        const { userId } = req.params;
        const { overall_progress, badges, module_progress } = req.body;

        // Get student_id first
        const { data: studentData } = await supabase
            .from('student')
            .select('student_id')
            .eq('user_id', userId)
            .single();

        if (!studentData) {
            return res.status(404).json({
                success: false,
                error: 'Student not found'
            });
        }

        const updates = {};
        if (overall_progress !== undefined) updates.overall_progress = overall_progress;
        if (badges !== undefined) updates.badges = badges;
        if (module_progress !== undefined) updates.module_progress = module_progress;

        const { data, error } = await supabase
            .from('student')
            .update(updates)
            .eq('user_id', userId)
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
 * Get user stats
 * GET /api/auto-user/:userId/stats
 */
export const getStats = async (req, res) => {
    try {
        const { userId } = req.params;

        // Get user info
        const { data: userData } = await supabase
            .from('users')
            .select('username, fullname, created_at')
            .eq('user_id', userId)
            .single();

        // Get student progress
        const { data: studentData } = await supabase
            .from('student')
            .select('overall_progress, badges, module_progress, created_at, updated_at')
            .eq('user_id', userId)
            .single();

        if (!userData || !studentData) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        // Calculate stats
        const badgeCount = studentData.badges ? studentData.badges.length : 0;
        const moduleProgress = studentData.module_progress || {};
        const completedModules = Object.values(moduleProgress).filter(
            progress => progress >= 100
        ).length;

        res.json({
            success: true,
            data: {
                nickname: userData.fullname,
                username: userData.username,
                overall_progress: studentData.overall_progress || 0,
                badges_count: badgeCount,
                completed_modules: completedModules,
                created_at: userData.created_at,
                last_played: studentData.updated_at
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
 * Reset all progress
 * DELETE /api/auto-user/:userId/reset
 */
export const resetProgress = async (req, res) => {
    try {
        const { userId } = req.params;

        const { data, error } = await supabase
            .from('student')
            .update({
                overall_progress: 0,
                badges: [],
                module_progress: {}
            })
            .eq('user_id', userId)
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