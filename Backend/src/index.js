import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import progressRoutes from './routes/progressRoutes.js';
import challengeRoutes from './routes/challengeRoutes.js';
import completionRoutes from './routes/completionRoutes.js';
import playerRoutes from './routes/playerRoutes.js';
// ── Environment routes ────────────────────────────────────────────────────────
import lobbyRoutes from './routes/lobbyRoutes.js';
import villageRoutes from './routes/villageRoutes.js';
import forestRoutes from './routes/forestRoutes.js';
import castleRoutes from './routes/castleRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── PUBLIC — no auth ──────────────────────────────────────────────────────────
app.use('/api/player', playerRoutes);   // UC-1.1, 1.2, 1.3

// ── Environment routes (player_id based) ──────────────────────────────────────
app.use('/api/lobby', lobbyRoutes);    // UC-2.1
app.use('/api/village', villageRoutes);  // UC-2.2
app.use('/api/forest', forestRoutes);   // UC-2.3
app.use('/api/castle', castleRoutes);   // UC-2.4

// ── Game / progress routes ────────────────────────────────────────────────────
app.use('/api/progress', progressRoutes);
app.use('/api/challenge', challengeRoutes);
app.use('/api/completion', completionRoutes);

// ── Health / root ─────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

app.get('/', (req, res) => res.json({
    message: 'BisaQuest API',
    version: '1.0.0',
    endpoints: {
        player: '/api/player',
        lobby: '/api/lobby',
        village: '/api/village',
        forest: '/api/forest',
        castle: '/api/castle',
        progress: '/api/progress',
        challenge: '/api/challenge',
        completion: '/api/completion',
    }
}));

app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({ success: false, error: err.message || 'Internal server error' });
});

app.use((req, res) => {
    res.status(404).json({ success: false, error: 'Endpoint not found' });
});

app.listen(PORT, () => {
    console.log(`🚀 BisaQuest backend running on http://localhost:${PORT}`);
    console.log(`🎮 Player API:   http://localhost:${PORT}/api/player`);
    console.log(`🗺️  Lobby API:    http://localhost:${PORT}/api/lobby`);
    console.log(`🏘️  Village API:  http://localhost:${PORT}/api/village`);
    console.log(`🌲 Forest API:   http://localhost:${PORT}/api/forest`);
    console.log(`🏰 Castle API:   http://localhost:${PORT}/api/castle`);
});