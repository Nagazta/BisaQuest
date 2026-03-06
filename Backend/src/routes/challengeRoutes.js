import express from 'express';
import challengeController from '../controllers/challengeController.js';

const router = express.Router();

// Public
router.get('/npc/:npcId/quest', challengeController.getQuestsByNpc);
router.get('/quest/:questId', challengeController.getQuestMeta);
router.get('/quest/:questId/dialogues', challengeController.getDialogues);
router.get('/quest/:questId/items', challengeController.getChallengeItems);
router.get('/quest/:questId/all-items', challengeController.getAllChallengeItems);

// Player-based (no JWT)
router.post('/quest/submit', challengeController.submitChallenge);
router.get('/progress/npc/:npcId', challengeController.getNPCProgress);
router.get('/progress/environment/:environmentName', challengeController.getEnvironmentProgress);
router.get('/progress/history', challengeController.getAttemptHistory);

export default router;