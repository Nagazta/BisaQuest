// services/progressTrackingService.js
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

  // Update progress after completion - KEEP BEST SCORE
  async updateProgress(studentId, npcId, challengeType, newScore) {
    try {
      // Get current progress
      const { data: currentProgress, error: fetchError } = await supabase
        .from('student_progress')
        .select('encounters_completed, current_session')
        .eq('student_id', studentId)
        .eq('npc_id', npcId)
        .eq('challenge_type', challengeType)
        .single();

      if (fetchError) throw fetchError;

      // Increment encounters_completed (max 3)
      const newCount = Math.min(currentProgress.encounters_completed + 1, 3);

      // Get best score from previous attempts
      const { data: bestAttempt } = await supabase
        .from('challenge_attempts')
        .select('score')
        .eq('student_id', studentId)
        .eq('npc_id', npcId)
        .eq('challenge_type', challengeType)
        .order('score', { ascending: false })
        .limit(1)
        .single();

      const bestScore = bestAttempt?.score || newScore;

      const { data, error } = await supabase
        .from('student_progress')
        .update({
          encounters_completed: newCount,
          current_session: {
            is_active: false,
            completed_at: new Date().toISOString(),
            best_score: Math.max(bestScore, newScore)
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

  // NEW: Get latest completed attempt for specific NPC
  async getLatestAttempt(studentId, npcId, challengeType) {
    try {
      const { data, error } = await supabase
        .from('challenge_attempts')
        .select('*')
        .eq('student_id', studentId)
        .eq('npc_id', npcId)
        .eq('challenge_type', challengeType)
        .eq('completed', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data || null;
    } catch (error) {
      console.error('Error fetching latest attempt:', error);
      return null;
    }
  }

  // Get environment progress (all challenges in an environment)
  async getEnvironmentProgress(studentId, environmentType = 'village') {
    try {
      // Define challenges per environment with their challenge types
      const environmentChallenges = {
        village: [
          { npcId: 'nando', challengeType: 'word_matching' },
          { npcId: 'ligaya', challengeType: 'word_association' },
          { npcId: 'vicente', challengeType: 'sentence_completion' }
        ]
        // Add more environments as needed
      };

      const challenges = environmentChallenges[environmentType] || [];
      
      if (challenges.length === 0) {
        return { totalChallenges: 0, completedChallenges: 0, progress: 0, npcProgress: [] };
      }

      // Get progress for all NPCs in this environment
      // We need to fetch each NPC individually since they have different challenge types
      const progressPromises = challenges.map(({ npcId, challengeType }) =>
        supabase
          .from('student_progress')
          .select('npc_id, challenge_type, encounters_completed, current_session')
          .eq('student_id', studentId)
          .eq('npc_id', npcId)
          .eq('challenge_type', challengeType)
          .single()
          .then(({ data, error }) => {
            // Return null if no data found (PGRST116 error)
            if (error && error.code === 'PGRST116') return null;
            if (error) throw error;
            return data;
          })
      );

      const progressResults = await Promise.all(progressPromises);

      const totalChallenges = challenges.length;
      const completedChallenges = progressResults.filter(p => p && p.encounters_completed > 0).length;
      const progressPercentage = Math.round((completedChallenges / totalChallenges) * 100);

      return {
        totalChallenges,
        completedChallenges,
        progress: progressPercentage,
        npcProgress: challenges.map(({ npcId, challengeType }, index) => {
          const npcData = progressResults[index];
          return {
            npcId,
            challengeType,
            completed: npcData ? npcData.encounters_completed > 0 : false,
            encounters: npcData ? npcData.encounters_completed : 0,
            bestScore: npcData?.current_session?.best_score || 0
          };
        })
      };
    } catch (error) {
      console.error('Error fetching environment progress:', error);
      throw error;
    }
  }
}

export default new ProgressTrackingService();