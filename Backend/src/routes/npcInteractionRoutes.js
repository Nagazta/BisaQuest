import express from 'express';
import npcInteractionController from '../controllers/npcInteractionController.js';
import { authenticateToken } from '../middleware/dualAuthMiddleware.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Start interaction with NPC
router.post('/npc/start', npcInteractionController.startInteraction);

// Submit challenge completion
router.post('/npc/submit', npcInteractionController.submitChallenge);

// Get student progress
router.get('/npc/progress', npcInteractionController.getProgress);

// Get attempt history
router.get('/npc/history', npcInteractionController.getAttemptHistory);

// Get environment progress
router.get('/npc/environment-progress', npcInteractionController.getEnvironmentProgress);

export default router;