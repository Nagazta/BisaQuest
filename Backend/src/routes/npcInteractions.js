import express from 'express';
import { authenticateToken } from '../middleware/authMiddleware.js';

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

export default router;