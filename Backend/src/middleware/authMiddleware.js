import { supabase } from '../config/supabaseClient.js';

export const authenticateToken = async (req, res, next) => {
    try {
        console.log('=== Auth Middleware Debug ===');
        console.log('Headers:', req.headers);
        
        const authHeader = req.headers.authorization;
        console.log('Authorization header:', authHeader);
        
        if (!authHeader) {
            console.log('❌ No authorization header found');
            return res.status(401).json({ success: false, error: 'No token provided' });
        }

        const token = authHeader.replace('Bearer ', '');
        console.log('Extracted token (first 20 chars):', token.substring(0, 20) + '...');
        console.log('Token length:', token.length);
        
        const { data: { user }, error } = await supabase.auth.getUser(token);

        if (error) {
            console.error('❌ Supabase auth error:', error.message);
            console.error('Error code:', error.code);
            console.error('Error status:', error.status);
            throw error;
        }

        if (!user) {
            console.log('❌ No user found for token');
            return res.status(401).json({ success: false, error: 'User not found' });
        }

        console.log('✅ User authenticated:', user.id);
        req.user = { id: user.id };
        next();
    } catch (error) {
        console.error('❌ Auth middleware error:', error);
        res.status(401).json({ success: false, error: 'Invalid token', details: error.message });
    }
};