import app from './app.js';
import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`🚀 BisaQuest backend running on http://localhost:${PORT}`);
    console.log(`🎮 Player API:   http://localhost:${PORT}/api/player`);
    console.log(`🗺️  Lobby API:    http://localhost:${PORT}/api/lobby`);
    console.log(`🏘️  Village API:  http://localhost:${PORT}/api/village`);
    console.log(`🌲 Forest API:   http://localhost:${PORT}/api/forest`);
    console.log(`🏰 Castle API:   http://localhost:${PORT}/api/castle`);
});