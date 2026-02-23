// routes/forestRoutes.js
// UC-2.3

import express from 'express';
import { getForestProgress, updateForestProgress } from '../controllers/forestController.js';

const router = express.Router();

router.get( '/:playerId',          getForestProgress);
router.put( '/:playerId/progress', updateForestProgress);

export default router;