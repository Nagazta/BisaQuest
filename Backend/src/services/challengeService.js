import { supabase } from '../config/supabaseClient.js';

const ITEMS_PER_ROUND = 4;

class ChallengeService {

  // Returns ALL quests where npc_id matches — simple query, no joins that could silently fail
  async getQuestsByNpc(npcId) {
    const { data, error } = await supabase
      .from('quests')
      .select('quest_id, npc_id, title, content_type, game_mechanic, scene_type, instructions')
      .eq('npc_id', npcId)
      .order('quest_id');
    if (error) throw error;
    return data;
  }

  async getQuestMeta(questId) {
    const { data, error } = await supabase
      .from('quests')
      .select('quest_id, npc_id, title, content_type, game_mechanic, scene_type, instructions')
      .eq('quest_id', questId)
      .single();
    if (error) throw error;
    return data;
  }

  // ── GET challenge_items ───────────────────────────────────────────────────
  // randomize=true  (default) → drag_drop: randomly picks 4 from the pool of 12.
  //                             Guarantees 1 item per zone so game is solvable.
  // randomize=false           → item_association: returns ALL items ordered by
  //                             round_number so frontend can group by round.
  //
  // The select now includes round_number, round_prompt, round_reprompt, hint
  // so item_association has everything it needs in one call.
  async getChallengeItems(questId, randomize = true) {
    const { data, error } = await supabase
      .from('challenge_items')
      .select(
        'item_id, quest_id, label, image_key, word_left, word_right,' +
        'correct_zone, is_correct, display_order,' +
        'round_number, round_prompt, round_reprompt, hint'   // ← added
      )
      .eq('quest_id', questId)
      .order('round_number')      // ← sort by round first so grouping works
      .order('display_order');
    if (error) throw error;
    if (!data || data.length === 0) return [];

    // If pool is smaller than or equal to items per round, return all shuffled
    if (data.length <= ITEMS_PER_ROUND) {
      return data.sort(() => Math.random() - 0.5);
    }

    // ① Group items by zone
    const byZone  = {};
    for (const item of data) {
      const z = item.correct_zone;
      if (!byZone[z]) byZone[z] = [];
      byZone[z].push(item);
    }
    const selected = [];
    const usedIds  = new Set();

    for (const zone of Object.keys(byZone)) {
      const pool = byZone[zone];
      const pick = pool[Math.floor(Math.random() * pool.length)];
      selected.push(pick);
      usedIds.add(pick.item_id);
      if (selected.length >= ITEMS_PER_ROUND) break;
    }

    const remaining = data
      .filter(item => !usedIds.has(item.item_id))
      .sort(() => Math.random() - 0.5);

    const needed = ITEMS_PER_ROUND - selected.length;
    selected.push(...remaining.slice(0, needed));

    return selected.sort(() => Math.random() - 0.5);
  }

  // ALL items in order — used by ForestScenePage backpack (scenario game)
  async getAllChallengeItems(questId) {
    const { data, error } = await supabase
      .from('challenge_items')
      .select('item_id, quest_id, label, image_key, word_left, word_right, correct_zone, is_correct, display_order')
      .eq('quest_id', questId)
      .order('display_order');
    if (error) throw error;
    return data || [];
  }

  async getDialogues(questId) {
    const { data, error } = await supabase
      .from('npc_dialogues')
      .select('dialogue_id, quest_id, step_order, speaker, dialogue_text, language, flow_type')
      .eq('quest_id', questId)
      .order('step_order');
    if (error) throw error;
    return data;
  }

  async submitChallenge({ playerId, questId, npcId, score, maxScore, passed }) {
    const now = new Date().toISOString();

    // 1. Upsert player_npc_progress
    const { data: existing } = await supabase
      .from('player_npc_progress')
      .select('*').eq('player_id', playerId).eq('npc_id', npcId).single();

    if (existing) {
      const { error } = await supabase.from('player_npc_progress').update({
        encounters: existing.encounters + 1,
        best_score: Math.max(score, existing.best_score),
        is_completed: passed || existing.is_completed,
        completed_at: passed && !existing.is_completed ? now : existing.completed_at,
        last_attempted: now,
      }).eq('player_id', playerId).eq('npc_id', npcId);
      if (error) throw error;
    } else {
      const { error } = await supabase.from('player_npc_progress').insert({
        player_id: playerId, npc_id: npcId, quest_id: questId, encounters: 1,
        best_score: score, is_completed: passed, completed_at: passed ? now : null, last_attempted: now,
      });
      if (error) throw error;
    }

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

    await this.recalculateEnvironmentProgress(playerId, npcId);
    return { attempt, passed, score, maxScore };
  }

  // ── GET player_npc_progress (single NPC) ─────────────────────────────────
  async getNPCProgress(playerId, npcId) {
    const { data, error } = await supabase.from('player_npc_progress')
      .select('*').eq('player_id', playerId).eq('npc_id', npcId).single();
    if (error && error.code !== 'PGRST116') throw error;
    return data || null;
  }

  // ── GET player_environment_progress ──────────────────────────────────────
  async getEnvironmentProgress(playerId, environmentName) {
    const { data, error } = await supabase.from('player_environment_progress')
      .select('*').eq('player_id', playerId).eq('environment_name', environmentName).single();
    if (error && error.code !== 'PGRST116') throw error;
    return data || null;
  }

  // ── GET player_quest_attempts (history) ───────────────────────────────────
  async getAttemptHistory(playerId, npcId, limit = 10) {
    let query = supabase.from('player_quest_attempts')
      .select('*').eq('player_id', playerId)
      .order('attempted_at', { ascending: false }).limit(limit);
    if (npcId) query = query.eq('npc_id', npcId);
    const { data, error } = await query;
    if (error) throw error;
    return data;
  }

  // ── INTERNAL: recalculate environment completion % ───────────────────────
  // Called after every submitChallenge. Counts completed NPCs in the
  // environment, updates player_environment_progress, and unlocks the
  // next environment at 100%.
  async recalculateEnvironmentProgress(playerId, npcId) {
    const { data: npc, error: npcErr } = await supabase.from('npcs').select('environment_name').eq('npc_id', npcId).single();
    if (npcErr) throw npcErr;
    const environmentName = npc.environment_name;

    const { data: envNPCs } = await supabase.from('npcs').select('npc_id').eq('environment_name', environmentName);
    const totalNPCs = envNPCs?.length || 1;
    const envNpcIds = envNPCs?.map(n => n.npc_id) || [];

    const { data: doneNPCs } = await supabase.from('player_npc_progress')
      .select('npc_id').eq('player_id', playerId).eq('is_completed', true).in('npc_id', envNpcIds);
    const percentage = Math.round(((doneNPCs?.length || 0) / totalNPCs) * 100);
    const isCompleted = percentage === 100;
    const now = new Date().toISOString();

    const { error: upsertErr } = await supabase.from('player_environment_progress').upsert(
      { player_id: playerId, environment_name: environmentName, completion_percentage: percentage, is_completed: isCompleted, last_updated: now },
      { onConflict: 'player_id,environment_name' }
    );
    if (upsertErr) throw upsertErr;

    if (isCompleted) {
      const NEXT = { village: 'forest', forest: 'castle' };
      const next = NEXT[environmentName];
      if (next) {
        await supabase.from('player_environment_progress').upsert(
          { player_id: playerId, environment_name: next, completion_percentage: 0, is_completed: false, is_unlocked: true, last_updated: now },
          { onConflict: 'player_id,environment_name' }
        );
      }
    }
  }
}

export default new ChallengeService();