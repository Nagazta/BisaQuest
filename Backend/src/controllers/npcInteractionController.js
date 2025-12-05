import interactionService from '../services/interactionService.js';

class npcInteractionController {
  // Start NPC interaction
  async startInteraction(req, res) {
    try {
      const { npcId, challengeType = 'word_matching' } = req.body;
      const studentId = req.user.id; // From auth middleware

      // Validate input
      if (!npcId) {
        return res.status(400).json({
          success: false,
          message: 'NPC ID is required'
        });
      }

      // Start interaction and get progress
      const { progress, isNewInteraction, canContinue } = 
        await interactionService.startInteraction(studentId, npcId, challengeType);

      // Check if student can continue (max 3 encounters)
      if (!canContinue && !isNewInteraction) {
        return res.status(403).json({
          success: false,
          message: 'Maximum encounters reached for this NPC',
          data: { progress }
        });
      }

      // Frontend will handle dialogues and word sets
      res.json({
        success: true,
        data: {
          npcId,
          challengeType,
          progress,
          isNewInteraction,
          encountersRemaining: 3 - progress.encounters_completed
        }
      });
    } catch (error) {
      console.error('Error in startInteraction:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to start interaction',
        error: error.message
      });
    }
  }

  // Submit challenge completion
  async submitChallenge(req, res) {
    try {
      const { npcId, challengeType, score, totalQuestions, timeSpent, completed } = req.body;
      const studentId = req.user.id;

      // Validate input
      if (!npcId || !challengeType || score === undefined || !totalQuestions) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields: npcId, challengeType, score, totalQuestions'
        });
      }

      // Record attempt
      const attempt = await progressTrackingService.recordAttempt(
        studentId,
        npcId,
        challengeType,
        { score, totalQuestions, timeSpent, completed }
      );

      // Update progress if completed
      let updatedProgress = null;
      if (completed) {
        updatedProgress = await progressTrackingService.updateProgress(
          studentId,
          npcId,
          challengeType
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
      console.error('Error in submitChallenge:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to submit challenge',
        error: error.message
      });
    }
  }

  // Get student progress
  async getProgress(req, res) {
    try {
      const studentId = req.user.id;
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

  // Get attempt history
  async getAttemptHistory(req, res) {
    try {
      const studentId = req.user.id;
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
}

export default new npcInteractionController();