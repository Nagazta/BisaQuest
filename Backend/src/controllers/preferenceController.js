import { supabase } from '../config/supabaseClient.js';

// Save character preference
export const saveCharacterPreference = async (req, res) => {
    try {
        const { student_id, quest_id, character_gender } = req.body;

        // Validate required fields
        if (!student_id || !quest_id || !character_gender) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: student_id, quest_id, character_gender'
            });
        }

        // Validate character_gender
        if (!['male', 'female'].includes(character_gender)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid character_gender. Must be "male" or "female"'
            });
        }

        // Check if preference already exists
        const { data: existing, error: checkError } = await supabase
            .from('user_preferences')
            .select('*')
            .eq('student_id', student_id)
            .eq('quest_id', quest_id)
            .single();

        if (checkError && checkError.code !== 'PGRST116') {
            throw checkError;
        }

        let result;

        if (existing) {
            // Update existing preference
            const { data, error } = await supabase
                .from('user_preferences')
                .update({
                    character_gender,
                    updated_at: new Date().toISOString()
                })
                .eq('student_id', student_id)
                .eq('quest_id', quest_id)
                .select()
                .single();

            if (error) throw error;
            result = data;
        } else {
            // Insert new preference
            const { data, error } = await supabase
                .from('user_preferences')
                .insert({
                    student_id,
                    quest_id,
                    character_gender
                })
                .select()
                .single();

            if (error) throw error;
            result = data;
        }

        res.status(200).json({
            success: true,
            message: 'Character preference saved successfully',
            data: result
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to save character preference',
            error: error.message
        });
    }
};

// Save language preference
export const saveLanguagePreference = async (req, res) => {
    try {
        const { student_id, quest_id, language_preference } = req.body;

        // Validate required fields
        if (!student_id || !quest_id || !language_preference) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: student_id, quest_id, language_preference'
            });
        }

        // Validate language_preference
        if (!['en', 'ceb'].includes(language_preference)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid language_preference. Must be "en" or "ceb"'
            });
        }

        // Check if preference already exists
        const { data: existing, error: checkError } = await supabase
            .from('user_preferences')
            .select('*')
            .eq('student_id', student_id)
            .eq('quest_id', quest_id)
            .single();

        if (checkError && checkError.code !== 'PGRST116') {
            throw checkError;
        }

        let result;

        if (existing) {
            // Update existing preference
            const { data, error } = await supabase
                .from('user_preferences')
                .update({
                    language_preference,
                    updated_at: new Date().toISOString()
                })
                .eq('student_id', student_id)
                .eq('quest_id', quest_id)
                .select()
                .single();

            if (error) throw error;
            result = data;
        } else {
            // Insert new preference
            const { data, error } = await supabase
                .from('user_preferences')
                .insert({
                    student_id,
                    quest_id,
                    language_preference
                })
                .select()
                .single();

            if (error) throw error;
            result = data;
        }

        res.status(200).json({
            success: true,
            message: 'Language preference saved successfully',
            data: result
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to save language preference',
            error: error.message
        });
    }
};

// Get user preferences for a specific quest
export const getPreferences = async (req, res) => {
    try {
        const { student_id, quest_id } = req.query;

        if (!student_id || !quest_id) {
            return res.status(400).json({
                success: false,
                message: 'Missing required parameters: student_id, quest_id'
            });
        }

        const { data, error } = await supabase
            .from('user_preferences')
            .select('*')
            .eq('student_id', student_id)
            .eq('quest_id', quest_id)
            .single();

        if (error && error.code !== 'PGRST116') {
            throw error;
        }

        res.status(200).json({
            success: true,
            data: data || null
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch preferences',
            error: error.message
        });
    }
};