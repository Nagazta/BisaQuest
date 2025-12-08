import interactionService from '../services/interactionService.js';
import progressTrackingService from '../services/progressTrackingService.js';

class NPCInteractionController {
  async startInteraction(req, res) {
    try {
      console.log('=== START INTERACTION REQUEST ===');
      console.log('Token payload:', req.user);

      const { npcId, challengeType = 'word_matching' } = req.body;
      const studentId = req.user.student_id; // ← CHANGED from req.user.id

      console.log('Using student_id:', studentId);

      if (!npcId || !studentId) {
        return res.status(400).json({
          success: false,
          message: 'NPC ID is required'
        });
      }

      const { progress, isNewInteraction, canContinue } =
        await interactionService.startInteraction(studentId, npcId, challengeType);

      const latestAttempt = await progressTrackingService.getLatestAttempt(
        studentId,
        npcId,
        challengeType
      );

      res.json({
        success: true,
        data: {
          npcId,
          challengeType,
          progress,
          isNewInteraction,
          encountersRemaining: 3 - progress.encounters_completed,
          latestAttempt: latestAttempt ? {
            score: latestAttempt.score,
            totalQuestions: latestAttempt.total_questions,
            completedAt: latestAttempt.created_at,
            timeSpent: latestAttempt.time_spent
          } : null
        }
      });
    } catch (error) {
      console.error('❌ ERROR in startInteraction:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to start interaction',
        error: error.message
      });
    }
  }

  async submitChallenge(req, res) {
    try {
      console.log('=== SUBMIT CHALLENGE REQUEST ===');
      const { npcId, challengeType, score, totalQuestions, timeSpent, completed } = req.body;
      const studentId = req.user.student_id; // ← CHANGED from req.user.id

      console.log('Using student_id:', studentId);

      if (!npcId || !challengeType || score === undefined || !totalQuestions) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields'
        });
      }

      const attempt = await progressTrackingService.recordAttempt(
        studentId,
        npcId,
        challengeType,
        { score, totalQuestions, timeSpent, completed }
      );

      let updatedProgress = null;
      if (completed) {
        updatedProgress = await progressTrackingService.updateProgress(
          studentId,
          npcId,
          challengeType,
          score
        );
      }

      res.json({
        success: true,
        data: {
          attempt,
          progress: updatedProgress,
          message: completed ? 'Challenge completed successfully!' : 'Attempt recorded'
        }
      });
    } catch (error) {
      console.error('❌ ERROR in submitChallenge:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to submit challenge',
        error: error.message
      });
    }
  }

  async getProgress(req, res) {
    try {
      const studentId = req.user.student_id; // ← CHANGED
      const { npcId, challengeType } = req.query;

      let progress;
      if (npcId && challengeType) {
        progress = await progressTrackingService.getNPCProgress(
          studentId,
          npcId,
          challengeType
        );
      } else {
        progress = await progressTrackingService.getStudentProgress(studentId);
      }

      res.json({
        success: true,
        data: progress
      });
    } catch (error) {
      console.error('Error in getProgress:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch progress',
        error: error.message
      });
    }
  }

  async getAttemptHistory(req, res) {
    try {
      const studentId = req.user.student_id; // ← CHANGED
      const { npcId, limit = 10 } = req.query;

      const history = await progressTrackingService.getAttemptHistory(
        studentId,
        npcId,
        parseInt(limit)
      );

      res.json({
        success: true,
        data: history
      });
    } catch (error) {
      console.error('Error in getAttemptHistory:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch attempt history',
        error: error.message
      });
    }
  }

  async getEnvironmentProgress(req, res) {
    try {
      const studentId = req.user.student_id; // ← CHANGED
      const { environmentType = 'village' } = req.query;

      console.log('Fetching environment progress for student_id:', studentId);

      const progress = await progressTrackingService.getEnvironmentProgress(
        studentId,
        environmentType
      );

      res.json({
        success: true,
        data: progress
      });
    } catch (error) {
      console.error('❌ ERROR in getEnvironmentProgress:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch environment progress',
        error: error.message
      });
    }
  }
}

export default new NPCInteractionController();