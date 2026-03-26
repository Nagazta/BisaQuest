// routes/playerRoutes.js

import express from 'express';
import {
    createPlayer,
    getPlayer,
    updateNickname,
    updateCharacter
} from '../controllers/playerController.js';

const router = express.Router();

// Create a new anonymous player (no login required)
router.post('/create', createPlayer);

// Get player by playerId
router.get('/:playerId', getPlayer);

// Update nickname
router.put('/:playerId/nickname', updateNickname);

// Update character selection
router.put('/:playerId/character', updateCharacter);

export default router;