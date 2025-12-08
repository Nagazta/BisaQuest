import express from 'express';
import {
    saveLanguagePreference,
    getLanguagePreference,
    getAllLanguagePreferences,
    updateLanguagePreference,
    deleteLanguagePreference
} from '../controllers/languagePreferenceController.js';

const router = express.Router();

// POST /api/language-preferences - Save language preference for a quest
router.post('/', saveLanguagePreference);

// GET /api/language-preferences?student_id=xxx&quest_id=1 - Get preference for specific quest
router.get('/', getLanguagePreference);

// GET /api/language-preferences/all?student_id=xxx - Get all preferences for a student
router.get('/all', getAllLanguagePreferences);

// PUT /api/language-preferences - Update language preference
router.put('/', updateLanguagePreference);

// DELETE /api/language-preferences - Delete language preference (reset to default)
router.delete('/', deleteLanguagePreference);

export default router;