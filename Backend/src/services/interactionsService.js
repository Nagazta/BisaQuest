import { supabase } from '../config/supabaseClient.js';

class InteractionService {
  // Start interaction with NPC
  async startInteraction(studentId, npcId, challengeType = 'word_matching') {
    try {
      // Check if student has existing progress
      const { data: progress, error: progressError } = await supabase
        .from('student_progress')
        .select('*')
        .eq('student_id', studentId)
        .eq('npc_id', npcId)
        .eq('challenge_type', challengeType)
        .single();

      if (progressError && progressError.code !== 'PGRST116') {
        throw progressError;
      }

      // If no progress exists, create new record
      if (!progress) {
        const { data: newProgress, error: createError } = await supabase
          .from('student_progress')
          .insert({
            student_id: studentId,
            npc_id: npcId,
            challenge_type: challengeType,
            encounters_completed: 0,
            current_session: {
              is_active: true,
              started_at: new Date().toISOString()
            }
          })
          .select()
          .single();

        if (createError) throw createError;
        return { progress: newProgress, isNewInteraction: true };
      }

      // Update existing session
      const { data: updatedProgress, error: updateError } = await supabase
        .from('student_progress')
        .update({
          current_session: {
            is_active: true,
            started_at: new Date().toISOString()
          },
          last_interaction: new Date().toISOString()
        })
        .eq('id', progress.id)
        .select()
        .single();

      if (updateError) throw updateError;

      return { 
        progress: updatedProgress, 
        isNewInteraction: false,
        canContinue: updatedProgress.encounters_completed < 3
      };
    } catch (error) {
      console.error('Error starting interaction:', error);
      throw error;
    }
  }
}

export default new InteractionService();