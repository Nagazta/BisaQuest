import express from 'express';
import completionController from '../controllers/completionController.js';
import { authenticateToken } from '../middleware/dualAuthMiddleware.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/check/:studentId/:moduleId', completionController.checkCompletion);
router.post('/record', completionController.recordCompletion);
router.get('/summary/:studentId/:moduleId', completionController.getModuleSummary);
router.get('/student/:studentId', completionController.getStudentCompletions);

export default router;