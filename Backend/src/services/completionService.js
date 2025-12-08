import { supabase } from '../config/supabaseClient.js';

class CompletionService {
  /**
   * Check if student has completed Module 1 (Village/Vocabulary Quest)
   */
  async checkModuleCompletion(studentId, moduleId = 1) {
    try {
      const challenges = this.getChallengesForModule(moduleId);

      const progressPromises = challenges.map(({ npcId, challengeType }) =>
        supabase
          .from('student_progress')
          .select('*')
          .eq('student_id', studentId)
          .eq('npc_id', npcId)
          .eq('challenge_type', challengeType)
          .single()
          .then(({ data, error }) => {
            if (error && error.code === 'PGRST116') return null;
            if (error) throw error;
            return data;
          })
      );

      const progressResults = await Promise.all(progressPromises);

      const allCompleted = progressResults.every(
        progress => progress && progress.encounters_completed > 0
      );

      return {
        isComplete: allCompleted,
        progress: progressResults
      };
    } catch (error) {
      console.error('Error checking module completion:', error);
      throw error;
    }
  }

  /**
   * Record module completion
   */
  async recordModuleCompletion(studentId, moduleId, completionData) {
    try {
        console.log('Recording module completion:', { studentId, moduleId, completionData });
        
        const { npcBreakdown, totalScore, totalQuestions, timeSpent } = completionData;

        // Ensure we don't divide by zero and have valid percentage
        const completionPercentage = totalQuestions > 0 
        ? Math.round((totalScore / totalQuestions) * 100) 
        : 0;

        console.log('Calculated completion percentage:', completionPercentage);

        // Check if completion already exists
        const { data: existingCompletion, error: checkError } = await supabase
        .from('module_completions')
        .select('id')
        .eq('student_id', studentId)
        .eq('module_id', moduleId)
        .single();

        if (checkError && checkError.code !== 'PGRST116') {
        console.error('Error checking existing completion:', checkError);
        }

        const completionRecord = {
        total_score: totalScore || 0,
        total_questions: totalQuestions || 0,
        completion_percentage: completionPercentage,
        time_spent: timeSpent || 0,
        npc_breakdown: npcBreakdown || {},
        updated_at: new Date().toISOString()
        };

        if (existingCompletion) {
        console.log('Completion already exists, updating...');
        const { data, error } = await supabase
            .from('module_completions')
            .update(completionRecord)
            .eq('student_id', studentId)
            .eq('module_id', moduleId)
            .select()
            .single();

        if (error) {
            console.error('Error updating completion:', error);
            throw error;
        }

        await this.updateStudentModuleProgress(studentId, moduleId);
        return data;
        } else {
        console.log('Creating new completion...');
        const { data, error } = await supabase
            .from('module_completions')
            .insert({
            student_id: studentId,
            module_id: moduleId,
            module_name: this.getModuleName(moduleId),
            ...completionRecord,
            completed_at: new Date().toISOString()
            })
            .select()
            .single();

        if (error) {
            console.error('Error inserting completion:', error);
            throw error;
        }

        await this.updateStudentModuleProgress(studentId, moduleId);
        return data;
        }
    } catch (error) {
        console.error('Error in recordModuleCompletion:', error);
        throw error;
    }
    }

  /**
   * Update student's overall module progress
   */
  async updateStudentModuleProgress(studentId, moduleId) {
    try {
        const { data: student, error: fetchError } = await supabase
        .from('student') // Changed from 'students' to 'student'
        .select('module_progress')
        .eq('student_id', studentId) // Changed from 'user_id' to 'student_id'
        .single();

        if (fetchError) throw fetchError;

        const moduleProgress = student.module_progress || {};
        moduleProgress[`module_${moduleId}`] = {
        completed: true,
        completed_at: new Date().toISOString(),
        percentage: 100
        };

        const { error: updateError } = await supabase
        .from('student') // Changed from 'students' to 'student'
        .update({
            module_progress: moduleProgress,
            updated_at: new Date().toISOString()
        })
        .eq('student_id', studentId); // Changed from 'user_id' to 'student_id'

        if (updateError) throw updateError;

        return moduleProgress;
    } catch (error) {
        console.error('Error updating student module progress:', error);
        throw error;
    }
    }

  /**
   * Get module completion summary
   */
  async getModuleSummary(studentId, moduleId) {
    try {
      const { data, error } = await supabase
        .from('module_completions')
        .select('*')
        .eq('student_id', studentId)
        .eq('module_id', moduleId)
        .order('completed_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code === 'PGRST116') {
        return null;
      }
      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Error fetching module summary:', error);
      throw error;
    }
  }

  async calculateCompletionData(studentId, moduleId) {
    try {
        console.log('=== CALCULATING COMPLETION DATA ===');
        console.log('Student ID:', studentId);
        console.log('Module ID:', moduleId);
        
        const challenges = this.getChallengesForModule(moduleId);
        console.log('Challenges for module:', challenges);
        
        let totalScore = 0;
        let totalQuestions = 0;
        let totalTimeSpent = 0;
        const npcBreakdown = {};

        for (const { npcId, challengeType } of challenges) {
        console.log(`Fetching attempts for ${npcId} (${challengeType})...`);
        
        const { data: attempts, error } = await supabase
            .from('challenge_attempts')
            .select('*')
            .eq('student_id', studentId)
            .eq('npc_id', npcId)
            .eq('challenge_type', challengeType)
            .eq('completed', true)
            .order('score', { ascending: false });

        if (error) {
            console.error(`Error fetching attempts for ${npcId}:`, error);
            throw error;
        }

        console.log(`Found ${attempts?.length || 0} attempts for ${npcId}`);

        if (attempts && attempts.length > 0) {
            const bestAttempt = attempts[0];
            console.log(`Best attempt for ${npcId}:`, {
            score: bestAttempt.score,
            total: bestAttempt.total_questions
            });
            
            totalScore += bestAttempt.score || 0;
            totalQuestions += bestAttempt.total_questions || 0;
            
            const totalTime = attempts.reduce((sum, att) => sum + (att.time_spent || 0), 0);
            totalTimeSpent += totalTime;

            npcBreakdown[npcId] = {
            score: bestAttempt.score || 0,
            total: bestAttempt.total_questions || 0,
            attempts: attempts.length,
            bestScore: bestAttempt.score || 0,
            totalTime: totalTime
            };
        } else {
            console.warn(`No attempts found for ${npcId}`);
            // Add default values even if no attempts found
            npcBreakdown[npcId] = {
            score: 0,
            total: 0,
            attempts: 0,
            bestScore: 0,
            totalTime: 0
            };
        }
        }

        console.log('Final calculation:', {
        totalScore,
        totalQuestions,
        totalTimeSpent,
        npcBreakdown
        });

        // Ensure we have valid data
        if (totalQuestions === 0) {
        console.warn('No questions found! Setting default values.');
        // Set minimum values to prevent null
        totalQuestions = challenges.length * 5; // Assume 5 questions per NPC
        }

        return {
        npcBreakdown,
        totalScore,
        totalQuestions,
        timeSpent: totalTimeSpent
        };
    } catch (error) {
        console.error('Error calculating completion data:', error);
        throw error;
    }
    }

  getModuleName(moduleId) {
    const names = {
      1: 'Vocabulary Quest',
      2: 'Synonyms & Antonyms Quest',
      3: 'Compound Quest',
      4: 'Narrative Problem Solving Quest'
    };
    return names[moduleId] || 'Unknown Quest';
  }

  getChallengesForModule(moduleId) {
    const challenges = {
      1: [
        { npcId: 'nando', challengeType: 'word_matching' },
        { npcId: 'ligaya', challengeType: 'word_association' },
        { npcId: 'vicente', challengeType: 'sentence_completion' }
      ]
    };
    return challenges[moduleId] || [];
  }
}

export default new CompletionService();