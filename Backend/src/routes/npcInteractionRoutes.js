import express from 'express';
import npcInteractionController from '../controllers/npcInteractionController.js';
import { authenticateToken } from '../middleware/dualAuthMiddleware.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Start interaction with NPC
router.post('/start', npcInteractionController.startInteraction);

// Submit challenge completion
router.post('/submit', npcInteractionController.submitChallenge);

// Get student progress
router.get('/progress', npcInteractionController.getProgress);

// Get attempt history
router.get('/history', npcInteractionController.getAttemptHistory);

// Get Progress
router.get('/environment-progress', npcInteractionController.getEnvironmentProgress);

export default router;