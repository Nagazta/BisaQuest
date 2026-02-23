// routes/castleRoutes.js
// UC-2.4

import express from 'express';
import { getCastleProgress, updateCastleProgress } from '../controllers/castleController.js';

const router = express.Router();

router.get( '/:playerId',          getCastleProgress);
router.put( '/:playerId/progress', updateCastleProgress);

export default router;