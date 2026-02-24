import challengeService from '../services/challengeService.js';

class ChallengeController {

  // ── GET /npc/:npcId/quest ─────────────────────────────────────────────────
  // Returns all quests for an NPC ordered by quest_id.
  // VillagePage calls this to resolve the real quest_id before navigating.
  async getQuestsByNpc(req, res) {
    try {
      const { npcId } = req.params;
      const data = await challengeService.getQuestsByNpc(npcId);
      res.json({ success: true, data });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to fetch quests for NPC', error: error.message });
    }
  }

  // ── GET /quest/:questId ───────────────────────────────────────────────────
  // Returns quest meta — title, instructions, content_type, game_mechanic.
  // Used by DragAndDrop.jsx on load to get the instructions text.
  async getQuestMeta(req, res) {
    try {
      const { questId } = req.params;
      const data = await challengeService.getQuestMeta(questId);
      res.json({ success: true, data });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to fetch quest meta', error: error.message });
    }
  }

  // ── GET /quest/:questId/items ─────────────────────────────────────────────
  // Returns all challenge_items for the quest ordered by display_order.
  // Used by DragAndDrop.jsx and ItemAssociation.jsx on page load.
  async getChallengeItems(req, res) {
    try {
      const { questId } = req.params;

      if (!questId) {
        return res.status(400).json({ success: false, message: 'questId is required' });
      }

      const data = await challengeService.getChallengeItems(questId);
      res.json({ success: true, data });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to fetch challenge items', error: error.message });
    }
  }

  // ── GET /quest/:questId/dialogues ─────────────────────────────────────────
  // Returns ordered dialogue steps for the NPC dialogue screen (UC-3.1).
  // Used by HousePage on load.
  async getDialogues(req, res) {
    try {
      const { questId } = req.params;

      if (!questId) {
        return res.status(400).json({ success: false, message: 'questId is required' });
      }

      const data = await challengeService.getDialogues(questId);
      res.json({ success: true, data });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to fetch dialogues', error: error.message });
    }
  }

  // ── POST /quest/submit ────────────────────────────────────────────────────
  // Called when player clicks Complete after finishing a challenge.
  // Writes to player_npc_progress, player_quest_attempts, and recalculates
  // player_environment_progress.
  async submitChallenge(req, res) {
    try {
      const { playerId, questId, npcId, score, maxScore, passed } = req.body;

      if (!playerId || !questId || !npcId || score === undefined || !maxScore) {
        return res.status(400).json({
          success: false,
          message: 'playerId, questId, npcId, score, and maxScore are required'
        });
      }

      const result = await challengeService.submitChallenge({
        playerId,
        questId,
        npcId,
        score,
        maxScore,
        passed: passed ?? score === maxScore,
      });

      res.json({ success: true, data: result });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to submit challenge', error: error.message });
    }
  }

  // ── GET /progress/npc/:npcId ──────────────────────────────────────────────
  // Returns player_npc_progress for one NPC.
  async getNPCProgress(req, res) {
    try {
      const { npcId }   = req.params;
      const playerId    = req.user?.player_id || req.query.playerId;

      const data = await challengeService.getNPCProgress(playerId, npcId);
      res.json({ success: true, data });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to fetch NPC progress', error: error.message });
    }
  }

  // ── GET /progress/environment/:environmentName ────────────────────────────
  // Returns player_environment_progress for one environment.
  async getEnvironmentProgress(req, res) {
    try {
      const { environmentName } = req.params;
      const playerId            = req.user?.player_id || req.query.playerId;

      const data = await challengeService.getEnvironmentProgress(playerId, environmentName);
      res.json({ success: true, data });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to fetch environment progress', error: error.message });
    }
  }

  // ── GET /progress/history ─────────────────────────────────────────────────
  // Returns player_quest_attempts rows for the player (most recent first).
  async getAttemptHistory(req, res) {
    try {
      const playerId              = req.user?.player_id || req.query.playerId;
      const { npcId, limit = 10 } = req.query;

      const data = await challengeService.getAttemptHistory(playerId, npcId, parseInt(limit));
      res.json({ success: true, data });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to fetch attempt history', error: error.message });
    }
  }
}

export default new ChallengeController();