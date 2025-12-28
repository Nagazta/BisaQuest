import express from 'express';
import {
    createAutoUser,
    getAutoUser,
    updateNickname,
    getProgress,
    updateProgress,
    getStats,
    resetProgress
} from '../controllers/userController.js';

const router = express.Router();

// Create auto user (no login)
router.post('/create', createAutoUser);

// Get user info
router.get('/:userId', getAutoUser);

// Update nickname
router.put('/:userId/nickname', updateNickname);

// Get progress
router.get('/:userId/progress', getProgress);

// Update progress
router.put('/:userId/progress', updateProgress);

// Get stats
router.get('/:userId/stats', getStats);

// Reset progress
router.delete('/:userId/reset', resetProgress);

export default router;