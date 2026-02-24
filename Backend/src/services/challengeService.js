import { supabase } from '../config/supabaseClient.js';

class ChallengeService {

  // ── GET quests by NPC ─────────────────────────────────────────────────────
  // Returns all quests for an NPC ordered by quest_id.
  // VillagePage uses this to resolve the real quest_id before navigating
  // to HousePage → DragAndDrop.
  async getQuestsByNpc(npcId) {
    const { data, error } = await supabase
      .from('quests')
      .select('quest_id, title, content_type, game_mechanic, instructions')
      .eq('npc_id', npcId)
      .order('quest_id');

    if (error) throw error;
    return data;
  }

  // ── GET quest meta ────────────────────────────────────────────────────────
  // Returns title, instructions, content_type, game_mechanic for one quest.
  // Used by DragAndDrop.jsx to get the instructions text shown in DialogueBox.
  async getQuestMeta(questId) {
    const { data, error } = await supabase
      .from('quests')
      .select('quest_id, npc_id, title, content_type, game_mechanic, instructions')
      .eq('quest_id', questId)
      .single();

    if (error) throw error;
    return data;
  }

  // ── GET challenge_items ───────────────────────────────────────────────────
  // Fetches all items for a quest, ordered by display_order.
  // Works for all 4 game mode combinations since challenge_items is universal.
  //
  //  drag_drop        → uses label + correct_zone
  //  item_association → uses label + is_correct
  //  synonym_antonym  → uses word_left + word_right + is_correct
  //  compound_words   → uses word_left + word_right + is_correct
  async getChallengeItems(questId) {
    const { data, error } = await supabase
      .from('challenge_items')
      .select('item_id, quest_id, label, image_key, word_left, word_right, correct_zone, is_correct, display_order')
      .eq('quest_id', questId)
      .order('display_order');

    if (error) throw error;
    return data;
  }

  // ── GET npc_dialogues ─────────────────────────────────────────────────────
  // Fetches ordered dialogue steps for the NPC dialogue screen (UC-3.1).
  async getDialogues(questId) {
    const { data, error } = await supabase
      .from('npc_dialogues')
      .select('dialogue_id, quest_id, step_order, speaker, dialogue_text, language')
      .eq('quest_id', questId)
      .order('step_order');

    if (error) throw error;
    return data;
  }

  // ── POST submit challenge ─────────────────────────────────────────────────
  // Called on challenge completion. Writes to:
  //   1. player_npc_progress  — upsert (best score, encounters, completion flag)
  //   2. player_quest_attempts — insert (immutable attempt log)
  //   3. player_environment_progress — recalculated automatically
  async submitChallenge({ playerId, questId, npcId, score, maxScore, passed }) {
    const now = new Date().toISOString();

    // 1. Upsert player_npc_progress
    const { data: existing } = await supabase
      .from('player_npc_progress')
      .select('*')
      .eq('player_id', playerId)
      .eq('npc_id', npcId)
      .single();

    if (existing) {
      const { error: updateError } = await supabase
        .from('player_npc_progress')
        .update({
          encounters:     existing.encounters + 1,
          best_score:     Math.max(score, existing.best_score),
          is_completed:   passed || existing.is_completed,
          completed_at:   passed && !existing.is_completed ? now : existing.completed_at,
          last_attempted: now,
        })
        .eq('player_id', playerId)
        .eq('npc_id', npcId);

      if (updateError) throw updateError;
    } else {
      const { error: insertError } = await supabase
        .from('player_npc_progress')
        .insert({
          player_id:      playerId,
          npc_id:         npcId,
          quest_id:       questId,
          encounters:     1,
          best_score:     score,
          is_completed:   passed,
          completed_at:   passed ? now : null,
          last_attempted: now,
        });

      if (insertError) throw insertError;
    }

    // 2. Insert attempt log (always — never update)
    const { data: attempt, error: attemptError } = await supabase
      .from('player_quest_attempts')
      .insert({
        player_id:    playerId,
        quest_id:     questId,
        npc_id:       npcId,
        score,
        max_score:    maxScore,
        passed,
        attempted_at: now,
      })
      .select()
      .single();

    if (attemptError) throw attemptError;

    // 3. Recalculate environment progress
    await this.recalculateEnvironmentProgress(playerId, npcId);

    return { attempt, passed, score, maxScore };
  }

  // ── GET player_npc_progress (single NPC) ─────────────────────────────────
  async getNPCProgress(playerId, npcId) {
    const { data, error } = await supabase
      .from('player_npc_progress')
      .select('*')
      .eq('player_id', playerId)
      .eq('npc_id', npcId)
      .single();

    // PGRST116 = row not found — fine, just means no attempts yet
    if (error && error.code !== 'PGRST116') throw error;
    return data || null;
  }

  // ── GET player_environment_progress ──────────────────────────────────────
  async getEnvironmentProgress(playerId, environmentName) {
    const { data, error } = await supabase
      .from('player_environment_progress')
      .select('*')
      .eq('player_id', playerId)
      .eq('environment_name', environmentName)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data || null;
  }

  // ── GET player_quest_attempts (history) ───────────────────────────────────
  async getAttemptHistory(playerId, npcId, limit = 10) {
    let query = supabase
      .from('player_quest_attempts')
      .select('*')
      .eq('player_id', playerId)
      .order('attempted_at', { ascending: false })
      .limit(limit);

    if (npcId) query = query.eq('npc_id', npcId);

    const { data, error } = await query;
    if (error) throw error;
    return data;
  }

  // ── INTERNAL: recalculate environment completion % ────────────────────────
  // Called automatically after every submitChallenge.
  // Counts completed NPCs in the environment and updates player_environment_progress.
  // Flips is_unlocked on the next environment when completion reaches 100%.
  async recalculateEnvironmentProgress(playerId, npcId) {
    // Get the environment this NPC belongs to
    const { data: npc, error: npcError } = await supabase
      .from('npcs')
      .select('environment_name')
      .eq('npc_id', npcId)
      .single();

    if (npcError) throw npcError;
    const environmentName = npc.environment_name;

    // Get all NPC IDs in this environment
    const { data: envNPCs } = await supabase
      .from('npcs')
      .select('npc_id')
      .eq('environment_name', environmentName);

    const totalNPCs   = envNPCs?.length || 1;
    const envNpcIds   = envNPCs?.map(n => n.npc_id) || [];

    // Count how many the player has completed
    const { data: completedNPCs } = await supabase
      .from('player_npc_progress')
      .select('npc_id')
      .eq('player_id', playerId)
      .eq('is_completed', true)
      .in('npc_id', envNpcIds);

    const completedCount = completedNPCs?.length || 0;
    const percentage     = Math.round((completedCount / totalNPCs) * 100);
    const isCompleted    = percentage === 100;
    const now            = new Date().toISOString();

    // Upsert player_environment_progress
    const { error: upsertError } = await supabase
      .from('player_environment_progress')
      .upsert({
        player_id:             playerId,
        environment_name:      environmentName,
        completion_percentage: percentage,
        is_completed:          isCompleted,
        last_updated:          now,
      }, { onConflict: 'player_id,environment_name' });

    if (upsertError) throw upsertError;

    // If just completed, unlock the next environment
    if (isCompleted) {
      const UNLOCK_ORDER = { village: 'forest', forest: 'castle' };
      const nextEnv      = UNLOCK_ORDER[environmentName];

      if (nextEnv) {
        await supabase
          .from('player_environment_progress')
          .upsert({
            player_id:             playerId,
            environment_name:      nextEnv,
            completion_percentage: 0,
            is_completed:          false,
            is_unlocked:           true,
            last_updated:          now,
          }, { onConflict: 'player_id,environment_name' });
      }
    }
  }
}

export default new ChallengeService();