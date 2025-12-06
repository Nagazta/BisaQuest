import { supabase } from '../config/supabaseClient.js';
import { jwtUtils } from '../utils/jwtUtils.js';

export const authenticateToken = async (req, res, next) => {
    try {
        console.log('=== Dual Auth Middleware Debug ===');
        
        const authHeader = req.headers.authorization;
        
        if (!authHeader) {
            console.log('❌ No authorization header found');
            return res.status(401).json({ success: false, error: 'No token provided' });
        }

        const token = authHeader.replace('Bearer ', '');
        console.log('Token received (first 20 chars):', token.substring(0, 20) + '...');

        // Try JWT verification first (for students)
        try {
            const decoded = jwtUtils.verifyToken(token);
            console.log('✅ JWT Token verified (Student):', decoded.user_id);
            
            req.user = {
                id: decoded.user_id,
                student_id: decoded.student_id,
                role: decoded.role,
                class_code: decoded.class_code
            };
            
            return next();
        } catch (jwtError) {
            console.log('JWT verification failed, trying Supabase auth (Teacher)...');
            
            // If JWT fails, try Supabase auth (for teachers)
            const { data: { user }, error } = await supabase.auth.getUser(token);

            if (error) {
                console.error('❌ Both JWT and Supabase auth failed');
                throw new Error('Invalid token');
            }

            if (!user) {
                return res.status(401).json({ success: false, error: 'User not found' });
            }

            console.log('✅ Supabase Token verified (Teacher):', user.id);
            req.user = { id: user.id, role: 'teacher' };
            return next();
        }
    } catch (error) {
        console.error('❌ Auth middleware error:', error.message);
        res.status(401).json({ 
            success: false, 
            error: 'Invalid token',
            details: error.message 
        });
    }
};