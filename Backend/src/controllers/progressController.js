import { supabase } from '../config/supabaseClient.js';

// Check if progress exists for a student and quest
export const checkProgress = async (req, res) => {
    try {
        const { studentId, questId } = req.params;

        if (!studentId || !questId) {
            return res.status(400).json({
                success: false,
                message: 'Missing studentId or questId'
            });
        }

        // Check student_progress table for any completed challenges
        const { data: progressData, error: progressError } = await supabase
            .from('student_progress')
            .select('*')
            .eq('student_id', studentId)
            .gt('encounters_completed', 0); // Has at least 1 completed encounter

        if (progressError && progressError.code !== 'PGRST116') {
            throw progressError;
        }

        // Check if any challenges have been attempted
        const { data: attemptData, error: attemptError } = await supabase
            .from('challenge_attempts')
            .select('*')
            .eq('student_id', studentId)
            .eq('completed', true)
            .limit(1)
            .single();

        if (attemptError && attemptError.code !== 'PGRST116') {
            throw attemptError;
        }

        const hasProgress = (progressData && progressData.length > 0) || !!attemptData;

        res.status(200).json({
            success: true,
            hasProgress: hasProgress,
            data: hasProgress ? {
                progressCount: progressData?.length || 0,
                lastAttempt: attemptData
            } : null
        });

    } catch (error) {
        console.error('Error checking progress:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to check progress',
            error: error.message
        });
    }
};

// Save or update progress
export const saveProgress = async (req, res) => {
    try {
        const { student_id, quest_id, current_section, progress_percentage, last_checkpoint } = req.body;

        if (!student_id || !quest_id) {
            return res.status(400).json({
                success: false,
                message: 'Missing student_id or quest_id'
            });
        }

        // Upsert (insert or update if exists)
        const { data, error } = await supabase
            .from('quest_progress')
            .upsert({
                student_id,
                quest_id,
                current_section: current_section || 'instructions',
                progress_percentage: progress_percentage || 0,
                last_checkpoint: last_checkpoint || {},
                completed: progress_percentage === 100,
                updated_at: new Date().toISOString()
            }, {
                onConflict: 'student_id,quest_id' // Update if this combination exists
            })
            .select()
            .single();

        if (error) {
            throw error;
        }

        res.status(200).json({
            success: true,
            message: 'Progress saved successfully',
            data: data
        });

    } catch (error) {
        console.error('Error saving progress:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to save progress',
            error: error.message
        });
    }
};

// Reset progress (for "New Game" option)
export const resetProgress = async (req, res) => {
    try {
        const { student_id, quest_id } = req.body;

        if (!student_id || !quest_id) {
            return res.status(400).json({
                success: false,
                message: 'Missing student_id or quest_id'
            });
        }

        const { error } = await supabase
            .from('quest_progress')
            .delete()
            .eq('student_id', student_id)
            .eq('quest_id', quest_id);

        if (error) {
            throw error;
        }

        res.status(200).json({
            success: true,
            message: 'Progress reset successfully'
        });

    } catch (error) {
        console.error('Error resetting progress:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to reset progress',
            error: error.message
        });
    }
};

// Reset all progress (delete all student_progress and challenge_attempts)
export const resetAllProgress = async (req, res) => {
    try {
        const { student_id } = req.body;

        if (!student_id) {
            return res.status(400).json({
                success: false,
                message: 'Missing student_id'
            });
        }

        console.log('Resetting all progress for student:', student_id);

        // Delete all student_progress records
        const { error: progressError } = await supabase
            .from('student_progress')
            .delete()
            .eq('student_id', student_id);

        if (progressError) {
            console.error('Error deleting student_progress:', progressError);
            throw progressError;
        }

        // Delete all challenge_attempts records
        const { error: attemptsError } = await supabase
            .from('challenge_attempts')
            .delete()
            .eq('student_id', student_id);

        if (attemptsError) {
            console.error('Error deleting challenge_attempts:', attemptsError);
            throw attemptsError;
        }

        console.log('All progress reset successfully');

        res.status(200).json({
            success: true,
            message: 'All progress reset successfully'
        });

    } catch (error) {
        console.error('Error resetting all progress:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to reset all progress',
            error: error.message
        });
    }
};