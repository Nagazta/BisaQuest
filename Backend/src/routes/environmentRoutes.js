import express from "express";
import {
  initializeEnvironment,
  logInstructionEntry,
  logNPCInteraction,
} from "../controllers/environmentController.js";
import { authenticateToken } from '../middleware/dualAuthMiddleware.js';

const router = express.Router();

router.post('/initialize', authenticateToken, initializeEnvironment);
router.post('/log-instruction', authenticateToken, logInstructionEntry);
router.post('/log-npc-interaction', authenticateToken, logNPCInteraction);

export default router;
