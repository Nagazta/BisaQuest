import express from 'express';
import {
    register,
    login,
    logout,
    getSession,
    createStudent
} from '../controllers/authController.js';

const router = express.Router();

// Teacher registration
router.post('/register', register);

// Login (both teacher and student)
router.post('/login', login);

// Logout
router.post('/logout', logout);

// Get current session
router.get('/session', getSession);

// Create student (teacher only)
router.post('/create-student', createStudent);

export default router;