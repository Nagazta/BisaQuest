import completionService from '../services/completionService.js';
import { supabase } from '../config/supabaseClient.js';

const completionController = {
  async checkCompletion(req, res) {
    try {
      const { studentId, moduleId } = req.params;

      if (!studentId || !moduleId) {
        return res.status(400).json({
          success: false,
          message: 'Missing studentId or moduleId'
        });
      }

      const completionStatus = await completionService.checkModuleCompletion(
        studentId,
        parseInt(moduleId)
      );

      res.status(200).json({
        success: true,
        data: completionStatus
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to check completion',
        error: error.message
      });
    }
  },

  async recordCompletion(req, res) {
    try {
      const { studentId, moduleId } = req.body;

      if (!studentId || !moduleId) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields'
        });
      }

      const completionData = await completionService.calculateCompletionData(
        studentId,
        moduleId
      );

      const completion = await completionService.recordModuleCompletion(
        studentId,
        moduleId,
        completionData
      );

      res.status(200).json({
        success: true,
        message: 'Module completion recorded successfully',
        data: completion
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to record completion',
        error: error.message
      });
    }
  },

  async getModuleSummary(req, res) {
    try {
      const { studentId, moduleId } = req.params;

      if (!studentId || !moduleId) {
        return res.status(400).json({
          success: false,
          message: 'Missing studentId or moduleId'
        });
      }

      const summary = await completionService.getModuleSummary(
        studentId,
        parseInt(moduleId)
      );

      res.status(200).json({
        success: true,
        data: summary
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch module summary',
        error: error.message
      });
    }
  },

  async getStudentCompletions(req, res) {
    try {
      const { studentId } = req.params;

      if (!studentId) {
        return res.status(400).json({
          success: false,
          message: 'Missing studentId'
        });
      }

      const { data, error } = await supabase
        .from('module_completions')
        .select('*')
        .eq('student_id', studentId)
        .order('completed_at', { ascending: false });

      if (error) throw error;

      res.status(200).json({
        success: true,
        data: data || []
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch student completions',
        error: error.message
      });
    }
  },

  async testData(req, res) {
    try {
      const { studentId } = req.params;

      // Check challenge_attempts
      const { data: attempts, error: attemptsError } = await supabase
        .from('challenge_attempts')
        .select('*')
        .eq('student_id', studentId)
        .eq('completed', true);

      if (attemptsError) throw attemptsError;

      // Check student_progress
      const { data: progress, error: progressError } = await supabase
        .from('student_progress')
        .select('*')
        .eq('student_id', studentId);

      if (progressError) throw progressError;

      res.json({
        success: true,
        studentId,
        attempts: attempts || [],
        progress: progress || [],
        summary: {
          totalAttempts: attempts?.length || 0,
          progressRecords: progress?.length || 0
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
};

export default completionController;