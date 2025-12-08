import { supabase } from '../config/supabaseClient.js';
import { jwtUtils } from '../utils/jwtUtils.js';

export const authenticateToken = async (req, res, next) => {
    try {        
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
            
            return next();
        } catch (jwtError) {
            
            // If JWT fails, try Supabase auth (for teachers)
            const { data: { user }, error } = await supabase.auth.getUser(token);

            if (error) {
                throw new Error('Invalid token');
            }

            if (!user) {
                return res.status(401).json({ success: false, error: 'User not found' });
            }

            req.user = { id: user.id, role: 'teacher' };
            return next();
        }
    } catch (error) {
        res.status(401).json({ 
            success: false, 
            error: 'Invalid token',
            details: error.message 
        });
    }
};