import { supabase } from '../config/supabaseClient.js';

export const getStudentByUserId = async (req, res) => {
    try {
        const { userId } = req.params;

        if (!userId) {
            return res.status(400).json({
                success: false,
                message: 'Missing user_id parameter'
            });
        }

        const { data, error } = await supabase
            .from('student')
            .select('*')
            .eq('user_id', userId)
            .single();

        if (error) {
            throw error;
        }

        if (!data) {
            return res.status(404).json({
                success: false,
                message: 'Student not found'
            });
        }

        res.status(200).json({
            success: true,
            data: data
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch student data',
            error: error.message
        });
    }
};