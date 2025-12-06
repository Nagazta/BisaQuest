import interactionService from '../services/interactionService.js';
import progressTrackingService from '../services/progressTrackingService.js';

class NPCInteractionController {
  // Start NPC interaction
  async startInteraction(req, res) {
    try {
      console.log('=== START INTERACTION REQUEST ===');
      console.log('Request body:', JSON.stringify(req.body, null, 2));
      console.log('User from token:', JSON.stringify(req.user, null, 2));

      const { npcId, challengeType = 'word_matching' } = req.body;
      const studentId = req.user.id;

      console.log('Extracted values:', { npcId, challengeType, studentId });

      if (!npcId) {
        console.log('❌ Missing npcId');
        return res.status(400).json({
          success: false,
          message: 'NPC ID is required'
        });
      }

      console.log('Step 1: Starting interaction service...');
      // Start interaction and get progress
      const { progress, isNewInteraction, canContinue } =
        await interactionService.startInteraction(studentId, npcId, challengeType);

      console.log('Step 1 Complete - Interaction started:', {
        progress: progress?.id,
        isNewInteraction,
        canContinue
      });

      console.log('Step 2: Getting latest attempt...');
      // Get latest attempt (if any)
      const latestAttempt = await progressTrackingService.getLatestAttempt(
        studentId,
        npcId,
        challengeType
      );

      console.log('Step 2 Complete - Latest attempt:', latestAttempt ? 'Found' : 'None');
      if (latestAttempt) {
        console.log('Latest attempt details:', {
          score: latestAttempt.score,
          totalQuestions: latestAttempt.total_questions,
          timeSpent: latestAttempt.time_spent
        });
      }

      const responseData = {
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
      };

      console.log('✅ SUCCESS - Sending response:', JSON.stringify(responseData, null, 2));
      res.json(responseData);
    } catch (error) {
      console.error('=== START INTERACTION ERROR ===');
      console.error('Error type:', error.constructor.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);

      if (error.code) {
        console.error('Error code:', error.code);
      }

      if (error.details) {
        console.error('Error details:', error.details);
      }

      res.status(500).json({
        success: false,
        message: 'Failed to start interaction',
        error: error.message,
        errorType: error.constructor.name,
        errorCode: error.code || 'UNKNOWN'
      });
    }
  }

  // Submit challenge completion
  async submitChallenge(req, res) {
    try {
      console.log('=== SUBMIT CHALLENGE REQUEST ===');
      console.log('Request body:', JSON.stringify(req.body, null, 2));

      const { npcId, challengeType, score, totalQuestions, timeSpent, completed } = req.body;
      const studentId = req.user.id;

      console.log('Extracted values:', { npcId, challengeType, score, totalQuestions, timeSpent, completed, studentId });

      if (!npcId || !challengeType || score === undefined || !totalQuestions) {
        console.log('❌ Missing required fields');
        return res.status(400).json({
          success: false,
          message: 'Missing required fields: npcId, challengeType, score, totalQuestions'
        });
      }

      console.log('Step 1: Recording attempt...');
      // Record attempt
      const attempt = await progressTrackingService.recordAttempt(
        studentId,
        npcId,
        challengeType,
        { score, totalQuestions, timeSpent, completed }
      );

      console.log('Step 1 Complete - Attempt recorded:', attempt.id);

      // Update progress if completed
      let updatedProgress = null;
      if (completed) {
        console.log('Step 2: Updating progress (completed=true)...');
        updatedProgress = await progressTrackingService.updateProgress(
          studentId,
          npcId,
          challengeType,
          score
        );
        console.log('Step 2 Complete - Progress updated:', updatedProgress.id);
      }

      const responseData = {
        success: true,
        data: {
          attempt,
          progress: updatedProgress,
          message: completed ? 'Challenge completed successfully!' : 'Attempt recorded'
        }
      };

      console.log('✅ SUCCESS - Sending response');
      res.json(responseData);
    } catch (error) {
      console.error('=== SUBMIT CHALLENGE ERROR ===');
      console.error('Error type:', error.constructor.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);

      if (error.code) {
        console.error('Error code:', error.code);
      }

      res.status(500).json({
        success: false,
        message: 'Failed to submit challenge',
        error: error.message,
        errorType: error.constructor.name
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

  // Get environment progress
  async getEnvironmentProgress(req, res) {
    try {
      console.log('=== GET ENVIRONMENT PROGRESS ===');
      const studentId = req.user.id;
      const { environmentType = 'village' } = req.query;

      console.log('Request params:', { studentId, environmentType });

      const progress = await progressTrackingService.getEnvironmentProgress(
        studentId,
        environmentType
      );

      console.log('✅ Environment progress fetched:', progress);
      res.json({
        success: true,
        data: progress
      });
    } catch (error) {
      console.error('=== GET ENVIRONMENT PROGRESS ERROR ===');
      console.error('Error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch environment progress',
        error: error.message
      });
    }
  }
}

export default new NPCInteractionController();
