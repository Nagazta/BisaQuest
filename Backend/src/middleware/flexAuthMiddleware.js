// middleware/flexAuthMiddleware.js
// Supports both JWT (teachers) and direct student_id (loginless students)

import { jwtUtils } from '../utils/jwtUtils.js';
import { supabase } from '../config/supabaseClient.js';

const flexAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>

    // ── Path 1: JWT token present (teacher or old student flow) ──
    if (token) {
      try {
        const decoded = jwtUtils.verifyToken(token);
        req.user = decoded;
        return next();
      } catch {
        // Token present but invalid — fall through to student_id check
      }
    }

    // ── Path 2: Loginless student — student_id from body or query ──
    const studentId =
      req.body?.studentId ||
      req.query?.studentId ||
      req.body?.student_id ||
      req.query?.student_id;

    if (studentId) {
      // Verify this student actually exists in the database
      const { data, error } = await supabase
        .from('student')
        .select('student_id')
        .eq('student_id', studentId)
        .single();

      if (error || !data) {
        return res.status(401).json({
          success: false,
          message: 'Invalid student ID',
        });
      }

      // Set req.user so all existing controllers work unchanged
      req.user = { student_id: studentId };
      return next();
    }

    // ── Neither token nor student_id provided ──
    return res.status(401).json({
      success: false,
      message: 'Authentication required. Provide a token or student_id.',
    });

  } catch (error) {
    console.error('flexAuth middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Auth middleware error',
    });
  }
};

export default flexAuth;