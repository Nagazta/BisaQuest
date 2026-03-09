import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import challengeRoutes from './routes/challengeRoutes.js';
import playerRoutes from './routes/playerRoutes.js';
// ── Environment routes ────────────────────────────────────────────────────────
import lobbyRoutes from './routes/lobbyRoutes.js';
import villageRoutes from './routes/villageRoutes.js';
import forestRoutes from './routes/forestRoutes.js';
import castleRoutes from './routes/castleRoutes.js';

dotenv.config();

const app = express();

app.use(cors({
    origin: (origin, callback) => callback(null, true), // Dynamically allows the requesting origin, bypassing the '*'/credentials conflict
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const apiRouter = express.Router();

// ── PUBLIC — no auth ──────────────────────────────────────────────────────────
apiRouter.use('/player', playerRoutes);   // UC-1.1, 1.2, 1.3

// ── Environment routes (player_id based) ──────────────────────────────────────
apiRouter.use('/lobby', lobbyRoutes);    // UC-2.1
apiRouter.use('/village', villageRoutes);  // UC-2.2
apiRouter.use('/forest', forestRoutes);   // UC-2.3
apiRouter.use('/castle', castleRoutes);   // UC-2.4

// ── Game / progress routes ────────────────────────────────────────────────────
apiRouter.use('/challenge', challengeRoutes);

// ── Health / root ─────────────────────────────────────────────────────────────
apiRouter.get('/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

// Mount the router on both the local dev path and the Netlify Serverless Function path
app.use('/api', apiRouter);
app.use('/.netlify/functions/api', apiRouter);

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
    }
}));

app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({ success: false, error: err.message || 'Internal server error' });
});

app.use((req, res) => {
    res.status(404).json({ success: false, error: 'Endpoint not found' });
});

export default app;
