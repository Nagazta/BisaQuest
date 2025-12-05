import { supabase } from '../config/supabaseClient.js';

class ProgressTrackingService {
  // Record challenge attempt
  async recordAttempt(studentId, npcId, challengeType, attemptData) {
    try {
      const { data, error } = await supabase
        .from('challenge_attempts')
        .insert({
          student_id: studentId,
          npc_id: npcId,
          challenge_type: challengeType,
          score: attemptData.score,
          total_questions: attemptData.totalQuestions,
          time_spent: attemptData.timeSpent,
          completed: attemptData.completed
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error recording attempt:', error);
      throw error;
    }
  }

  // Update progress after completion
  async updateProgress(studentId, npcId, challengeType) {
    try {
      // Get current progress
      const { data: currentProgress, error: fetchError } = await supabase
        .from('student_progress')
        .select('encounters_completed')
        .eq('student_id', studentId)
        .eq('npc_id', npcId)
        .eq('challenge_type', challengeType)
        .single();

      if (fetchError) throw fetchError;

      // Increment encounters_completed (max 3)
      const newCount = Math.min(currentProgress.encounters_completed + 1, 3);

      const { data, error } = await supabase
        .from('student_progress')
        .update({
          encounters_completed: newCount,
          current_session: {
            is_active: false,
            completed_at: new Date().toISOString()
          },
          last_interaction: new Date().toISOString()
        })
        .eq('student_id', studentId)
        .eq('npc_id', npcId)
        .eq('challenge_type', challengeType)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating progress:', error);
      throw error;
    }
  }

  // Get student's overall progress
  async getStudentProgress(studentId) {
    try {
      const { data, error } = await supabase
        .from('student_progress')
        .select('*')
        .eq('student_id', studentId);

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching student progress:', error);
      throw error;
    }
  }

  // Get student's progress for specific NPC
  async getNPCProgress(studentId, npcId, challengeType) {
    try {
      const { data, error } = await supabase
        .from('student_progress')
        .select('*')
        .eq('student_id', studentId)
        .eq('npc_id', npcId)
        .eq('challenge_type', challengeType)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data || null;
    } catch (error) {
      console.error('Error fetching NPC progress:', error);
      throw error;
    }
  }

  // Get student's attempt history
  async getAttemptHistory(studentId, npcId = null, limit = 10) {
    try {
      let query = supabase
        .from('challenge_attempts')
        .select('*')
        .eq('student_id', studentId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (npcId) {
        query = query.eq('npc_id', npcId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching attempt history:', error);
      throw error;
    }
  }
}

export default new ProgressTrackingService();