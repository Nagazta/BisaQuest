import challengeService from '../services/challengeService.js';

class ChallengeController {
  async getQuestsByNpc(req, res) {
    try {
      const { npcId } = req.params;
      const data = await challengeService.getQuestsByNpc(npcId);
      res.json({ success: true, data });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to fetch quests for NPC', error: error.message });
    }
  }

  async getQuestMeta(req, res) {
    try {
      const data = await challengeService.getQuestMeta(req.params.questId);
      res.json({ success: true, data });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to fetch quest meta', error: error.message });
    }
  }

  // Random sample — for drag-to-zone games (DragAndDrop.jsx)
  async getChallengeItems(req, res) {
    try {
      const { questId } = req.params;
      if (!questId) return res.status(400).json({ success: false, message: 'questId is required' });
      const data = await challengeService.getChallengeItems(questId);
      res.json({ success: true, data });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to fetch challenge items', error: error.message });
    }
  }

  // All items — for scenario/backpack games (ForestScenePage)
  async getAllChallengeItems(req, res) {
    try {
      const { questId } = req.params;
      if (!questId) return res.status(400).json({ success: false, message: 'questId is required' });
      const data = await challengeService.getAllChallengeItems(questId);
      res.json({ success: true, data });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to fetch all challenge items', error: error.message });
    }
  }

  async getDialogues(req, res) {
    try {
      const { questId } = req.params;
      if (!questId) return res.status(400).json({ success: false, message: 'questId is required' });
      const data = await challengeService.getDialogues(questId);
      res.json({ success: true, data });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to fetch dialogues', error: error.message });
    }
  }

  async submitChallenge(req, res) {
    try {
      const { playerId, questId, npcId, score, maxScore, passed } = req.body;
      if (!playerId || !questId || !npcId || score === undefined || !maxScore)
        return res.status(400).json({ success: false, message: 'playerId, questId, npcId, score, and maxScore are required' });
      const result = await challengeService.submitChallenge({ playerId, questId, npcId, score, maxScore, passed: passed ?? score === maxScore });
      res.json({ success: true, data: result });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to submit challenge', error: error.message });
    }
  }

  async getNPCProgress(req, res) {
    try {
      const playerId = req.user?.player_id || req.query.playerId;
      const data = await challengeService.getNPCProgress(playerId, req.params.npcId);
      res.json({ success: true, data });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to fetch NPC progress', error: error.message });
    }
  }

  async getEnvironmentProgress(req, res) {
    try {
      const playerId = req.user?.player_id || req.query.playerId;
      const data = await challengeService.getEnvironmentProgress(playerId, req.params.environmentName);
      res.json({ success: true, data });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to fetch environment progress', error: error.message });
    }
  }

  async getAttemptHistory(req, res) {
    try {
      const playerId = req.user?.player_id || req.query.playerId;
      const { npcId, limit = 10 } = req.query;
      const data = await challengeService.getAttemptHistory(playerId, npcId, parseInt(limit));
      res.json({ success: true, data });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to fetch attempt history', error: error.message });
    }
  }
}

export default new ChallengeController();