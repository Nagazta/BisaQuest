import express from 'express';
import { getDashboardData, createStudent } from '../controllers/teacherController.js';
import { authenticateToken } from '../middleware/dualAuthMiddleware.js';

const router = express.Router();

router.get('/dashboard', authenticateToken, getDashboardData);
router.post('/create-student', authenticateToken, createStudent);

export default router;