import express from 'express';
import challengeController from '../controllers/challengeController.js';
import { authenticateToken } from '../middleware/dualAuthMiddleware.js';

const router = express.Router();

// Public
router.get('/npc/:npcId/quest', challengeController.getQuestsByNpc);
router.get('/quest/:questId', challengeController.getQuestMeta);
router.get('/quest/:questId/dialogues', challengeController.getDialogues);
router.get('/quest/:questId/items', challengeController.getChallengeItems);    // random sample (drag-to-zone)
router.get('/quest/:questId/all-items', challengeController.getAllChallengeItems); // all items in order (scenario)

// Protected
router.use(authenticateToken);
router.post('/quest/submit', challengeController.submitChallenge);
router.get('/progress/npc/:npcId', challengeController.getNPCProgress);
router.get('/progress/environment/:environmentName', challengeController.getEnvironmentProgress);
router.get('/progress/history', challengeController.getAttemptHistory);

export default router;