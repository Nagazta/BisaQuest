// services/interactionService.js
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
        console.error('❌ Unexpected error from Supabase:', progressError);
        throw progressError;
      }

      // If no progress exists, create new record
      if (!progress) {
        const newProgressData = {
          student_id: studentId,
          npc_id: npcId,
          challenge_type: challengeType,
          encounters_completed: 0,
          current_session: {
            is_active: true,
            started_at: new Date().toISOString()
          }
        };
                
        const { data: newProgress, error: createError } = await supabase
          .from('student_progress')
          .insert(newProgressData)
          .select()
          .single();

        if (createError) {
          console.error('❌ Error creating progress:', {
            message: createError.message,
            code: createError.code,
            details: createError.details,
            hint: createError.hint
          });
          throw createError;
        }
        
        return { 
          progress: newProgress, 
          isNewInteraction: true,
          canContinue: true
        };
      }

      // Update existing session
      const updateData = {
        current_session: {
          is_active: true,
          started_at: new Date().toISOString()
        },
        last_interaction: new Date().toISOString()
      };
            
      const { data: updatedProgress, error: updateError } = await supabase
        .from('student_progress')
        .update(updateData)
        .eq('id', progress.id)
        .select()
        .single();

      if (updateError) {
        console.error('❌ Error updating progress:', {
          message: updateError.message,
          code: updateError.code,
          details: updateError.details
        });
        throw updateError;
      }

      return { 
        progress: updatedProgress, 
        isNewInteraction: false,
        canContinue: updatedProgress.encounters_completed < 3
      };
    } catch (error) {
      console.error('=== INTERACTION SERVICE ERROR ===');
      console.error('Error type:', error.constructor.name);
      console.error('Error message:', error.message);
      console.error('Full error:', error);
      throw error;
    }
  }
}

export default new InteractionService();