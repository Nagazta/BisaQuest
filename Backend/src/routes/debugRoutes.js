import express from 'express';
import { authenticateToken } from '../middleware/dualAuthMiddleware.js';
import { supabase } from '../config/supabaseClient.js';

const router = express.Router();

router.get('/debug/token', authenticateToken, async (req, res) => {
  try {
    const studentId = req.user.student_id;
    
    // Check what's in challenge_attempts
    const { data: attempts, error: attemptsError } = await supabase
      .from('challenge_attempts')
      .select('*')
      .eq('student_id', studentId);

    // Check what's in student_progress
    const { data: progress, error: progressError } = await supabase
      .from('student_progress')
      .select('*')
      .eq('student_id', studentId);

    // Check student record
    const { data: student, error: studentError } = await supabase
      .from('student')
      .select('*')
      .eq('student_id', studentId);

    res.json({
      success: true,
      tokenPayload: req.user,
      database: {
        student: student || [],
        attempts: attempts || [],
        progress: progress || [],
        errors: {
          attemptsError: attemptsError?.message,
          progressError: progressError?.message,
          studentError: studentError?.message
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;