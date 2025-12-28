import { supabase } from '../config/supabaseClient.js';
import { jwtUtils } from '../utils/jwtUtils.js';

export const authenticateToken = async (req, res, next) => {
    try {
        // ⚠️ SKIP AUTHENTICATION for auto-user routes
        if (req.path.startsWith('/api/auto-user') || req.originalUrl.includes('/auto-user')) {
            console.log('🔓 Skipping auth for auto-user route:', req.path);
            return next();
        }

        const authHeader = req.headers.authorization;
        
        if (!authHeader) {
            return res.status(401).json({ success: false, error: 'No token provided' });
        }

        const token = authHeader.replace('Bearer ', '');

        // Try JWT verification first (for students)
        try {
            const decoded = jwtUtils.verifyToken(token);
            
            req.user = {
                id: decoded.user_id,
                student_id: decoded.student_id,
                role: decoded.role,
                class_code: decoded.class_code
            };
            
            console.log('✅ JWT auth successful for student:', decoded.user_id);
            return next();
        } catch (jwtError) {
            console.log('⚠️ JWT verification failed, trying Supabase auth...');
            
            // If JWT fails, try Supabase auth (for teachers)
            const { data: { user }, error } = await supabase.auth.getUser(token);

            if (error) {
                throw new Error('Invalid token');
            }

            if (!user) {
                return res.status(401).json({ success: false, error: 'User not found' });
            }

            req.user = { id: user.id, role: 'teacher' };
            console.log('✅ Supabase auth successful for teacher:', user.id);
            return next();
        }
    } catch (error) {
        console.error('❌ Auth error:', error.message);
        res.status(401).json({ 
            success: false, 
            error: 'Invalid token',
            details: error.message 
        });
    }
};