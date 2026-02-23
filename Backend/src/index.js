import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import preferenceRoutes from './routes/preferenceRoutes.js';
import progressRoutes from './routes/progressRoutes.js';
import environmentRoutes from './routes/environmentRoutes.js';
import npcInteractionRoutes from './routes/npcInteractionRoutes.js';
import completionRoutes from './routes/completionRoutes.js';
import debugRoutes from './routes/debugRoutes.js';
import languagePreferenceRoutes from './routes/languagePreferenceRoutes.js';
import playerRoutes from './routes/playerRoutes.js'; // ← replaces userRoutes + studentRoutes

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ============================================
// PUBLIC ROUTES (NO AUTHENTICATION REQUIRED)
// ============================================

// ⚠️ IMPORTANT: Player routes MUST be public - no auth middleware!
app.use('/api/player', playerRoutes);

// ============================================
// PROTECTED ROUTES (MAY HAVE AUTH MIDDLEWARE)
// ============================================

app.use('/api/auth', authRoutes);
app.use('/api/preferences', preferenceRoutes);
app.use('/api/language-preferences', languagePreferenceRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api', environmentRoutes);
app.use('/api', npcInteractionRoutes);
app.use('/api/completion', completionRoutes);
app.use('/api/debug', debugRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        message: 'Backend server is running',
        timestamp: new Date().toISOString()
    });
});

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        message: 'BisaQuest API',
        version: '1.0.0',
        endpoints: {
            health: '/api/health',
            auth: '/api/auth',
            player: '/api/player',
            teacher: '/api/teacher',
            preferences: '/api/preferences',
            progress: '/api/progress',
            npc: '/api/npc'
        }
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({
        success: false,
        error: err.message || 'Internal server error'
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: 'Endpoint not found'
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 BisaQuest backend running on http://localhost:${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
    console.log(`🎮 Player API:   http://localhost:${PORT}/api/player`);
    console.log(`🔐 Auth API:     http://localhost:${PORT}/api/auth`);
    console.log(`⚙️  Preferences:  http://localhost:${PORT}/api/preferences`);
    console.log(`📊 Progress API: http://localhost:${PORT}/api/progress`);
});