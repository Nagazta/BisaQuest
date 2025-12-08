import { supabase } from '../config/supabaseClient.js';

// Save language preference for a specific quest
export const saveLanguagePreference = async (req, res) => {
    try {
        const { student_id, quest_id, language_code } = req.body;

        // Validate required fields
        if (!student_id || !quest_id || !language_code) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: student_id, quest_id, language_code'
            });
        }

        // Validate language_code
        if (!['en', 'ceb'].includes(language_code)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid language_code. Must be "en" or "ceb"'
            });
        }

        // Upsert (insert or update if exists)
        const { data, error } = await supabase
            .from('language_preferences')
            .upsert({
                student_id,
                quest_id,
                language_code,
                updated_at: new Date().toISOString()
            }, {
                onConflict: 'student_id,quest_id'
            })
            .select()
            .single();

        if (error) throw error;

        res.status(200).json({
            success: true,
            message: 'Language preference saved successfully',
            data: data
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to save language preference',
            error: error.message
        });
    }
};

// Get language preference for a specific quest
export const getLanguagePreference = async (req, res) => {
    try {
        const { student_id, quest_id } = req.query;

        if (!student_id || !quest_id) {
            return res.status(400).json({
                success: false,
                message: 'Missing required parameters: student_id, quest_id'
            });
        }

        const { data, error } = await supabase
            .from('language_preferences')
            .select('*')
            .eq('student_id', student_id)
            .eq('quest_id', quest_id)
            .single();

        if (error && error.code !== 'PGRST116') {
            throw error;
        }

        // Return default language if no preference found
        res.status(200).json({
            success: true,
            data: data || { language_code: 'en' }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch language preference',
            error: error.message
        });
    }
};

// Get all language preferences for a student
export const getAllLanguagePreferences = async (req, res) => {
    try {
        const { student_id } = req.query;

        if (!student_id) {
            return res.status(400).json({
                success: false,
                message: 'Missing required parameter: student_id'
            });
        }

        const { data, error } = await supabase
            .from('language_preferences')
            .select('*')
            .eq('student_id', student_id)
            .order('quest_id');

        if (error) throw error;

        res.status(200).json({
            success: true,
            data: data || []
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch language preferences',
            error: error.message
        });
    }
};

// Update language preference
export const updateLanguagePreference = async (req, res) => {
    try {
        const { student_id, quest_id, language_code } = req.body;

        if (!student_id || !quest_id || !language_code) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: student_id, quest_id, language_code'
            });
        }

        // Validate language_code
        if (!['en', 'ceb'].includes(language_code)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid language_code. Must be "en" or "ceb"'
            });
        }

        const { data, error } = await supabase
            .from('language_preferences')
            .update({
                language_code,
                updated_at: new Date().toISOString()
            })
            .eq('student_id', student_id)
            .eq('quest_id', quest_id)
            .select()
            .single();

        if (error) throw error;

        res.status(200).json({
            success: true,
            message: 'Language preference updated successfully',
            data: data
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to update language preference',
            error: error.message
        });
    }
};

// Delete language preference (reset to default)
export const deleteLanguagePreference = async (req, res) => {
    try {
        const { student_id, quest_id } = req.body;

        if (!student_id || !quest_id) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: student_id, quest_id'
            });
        }

        const { error } = await supabase
            .from('language_preferences')
            .delete()
            .eq('student_id', student_id)
            .eq('quest_id', quest_id);

        if (error) throw error;

        res.status(200).json({
            success: true,
            message: 'Language preference deleted successfully'
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to delete language preference',
            error: error.message
        });
    }
};