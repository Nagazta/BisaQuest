// routes/villageRoutes.js
// UC-2.2

import express from 'express';
import { getVillageProgress, updateVillageProgress } from '../controllers/villageController.js';

const router = express.Router();

router.get( '/:playerId',          getVillageProgress);
router.put( '/:playerId/progress', updateVillageProgress);

export default router;