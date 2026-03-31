/**
 * sceneDataService.js
 * Fetches scene exploration data (items + dialogues) from the backend API.
 * Replaces hardcoded data imports from the local data files.
 */

const BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '' : 'http://localhost:5000');

// ── Quest IDs for each scene ─────────────────────────────────────────────────
export const SCENE_QUEST_IDS = {
  // Village
  living_room: 100,
  kitchen:     101,
  bedroom:     102,
  // Forest
  pond:        103,
  glow:        104,
  // Castle
  gate:        105,
  courtyard:   106,
  library:     107,
  // Forest mini-game data
  fishing:     108,
  turtle:      109,
};

// ── Fetch scene items (challenge_items) ──────────────────────────────────────
export const fetchSceneItems = async (questId) => {
  try {
    const res = await fetch(`${BASE_URL}/api/challenge/quest/${questId}/all-items`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const result = await res.json();
    if (!result.success) throw new Error(result.message || 'Failed to fetch scene items');
    return result.data || [];
  } catch (err) {
    console.error(`[sceneDataService] fetchSceneItems(${questId}) failed:`, err);
    return [];
  }
};

// ── Fetch dialogues ──────────────────────────────────────────────────────────
export const fetchSceneDialogues = async (questId) => {
  try {
    const res = await fetch(`${BASE_URL}/api/challenge/quest/${questId}/dialogues`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const result = await res.json();
    if (!result.success) throw new Error(result.message || 'Failed to fetch dialogues');
    return result.data || [];
  } catch (err) {
    console.error(`[sceneDataService] fetchSceneDialogues(${questId}) failed:`, err);
    return [];
  }
};

// ── Display image keys that differ from the item ID ─────────────────────────
// In the original data files, some items have imageKey ≠ id.
// id is the ITEM_QUESTS key; imageKey is the display asset.
const DISPLAY_IMAGE_OVERRIDES = {
  // Living room
  lampara:     'lamp',
  silhig:      'walis',
  lamesa:      'lamesa_sala',
  // Bedroom
  suga_bedroom:       'kisame',
  kalendaryo_bedroom:  'kalendaryo',
  aparador_bedroom:    'aparador',
  bentilador_bedroom:  'Bentilador',
  bukag_bedroom:       'laundry_basket',
  // Kitchen
  lamesa_kitchen:  'lamesa',
  estante_wala:    'shelf',
  estante_tuo:     'big_shelf',
  basket_kitchen:  'red_crate',
};

// ── Transform DB items → frontend label format ──────────────────────────────
// Maps challenge_items rows to the shape expected by HousePage, KitchenPage, etc.
export const toSceneLabels = (dbItems) => {
  return dbItems.map((item, index) => {
    const id = item.image_key;
    return {
      id,
      labelBisaya:       item.label,
      labelEnglish:      item.hint || '',
      descriptionBisaya: item.round_prompt || '',
      descriptionEnglish:item.round_reprompt || '',
      imageKey:          DISPLAY_IMAGE_OVERRIDES[id] || id,
      x:                 item.position_x ?? 0,
      y:                 item.position_y ?? 0,
      w:                 item.width_percent ?? 10,
      h:                 item.height_percent ?? 10,
      // Castle compound word fields
      ...(item.word_left && item.word_right ? {
        compoundWord: {
          word1:  item.word_left,
          word2:  item.word_right,
          result: item.correct_zone || `${item.word_left}${item.word_right}`,
          bisayaResult: item.label,
        }
      } : {}),
    };
  });
};

// ── Transform DB dialogues → bilingual intro array ──────────────────────────
// Groups by step_order, merges ceb+en into a single object per step
export const toIntroDialogue = (dbDialogues) => {
  const introLines = dbDialogues.filter(d => d.flow_type === 'intro');
  const grouped = {};
  for (const line of introLines) {
    if (!grouped[line.step_order]) {
      grouped[line.step_order] = { speaker: line.speaker };
    }
    if (line.language === 'ceb') {
      grouped[line.step_order].bisayaText = line.dialogue_text;
    } else {
      grouped[line.step_order].englishText = line.dialogue_text;
    }
  }
  return Object.keys(grouped)
    .sort((a, b) => Number(a) - Number(b))
    .map(k => grouped[k]);
};

// ── Transform fishing game rounds from DB ────────────────────────────────────
export const toFishingRounds = (dbItems) => {
  const rounds = {};
  for (const item of dbItems) {
    const rn = item.round_number;
    if (!rounds[rn]) {
      rounds[rn] = { wrongWords: [] };
    }
    if (item.is_correct) {
      rounds[rn].targetWord = item.word_left;
      rounds[rn].targetEnglish = item.hint;
      rounds[rn].questionType = item.correct_zone === 'antonym' ? 'Antonym' : 'Synonym';
      rounds[rn].questionTypeBisaya = item.correct_zone === 'antonym' ? 'Kabaliktaran' : 'Parehas';
      rounds[rn].correctWord = item.word_right;
    } else {
      rounds[rn].wrongWords.push(item.label);
    }
  }
  return Object.keys(rounds)
    .sort((a, b) => Number(a) - Number(b))
    .map(k => rounds[k]);
};

// ── Transform turtle synonym pairs from DB ───────────────────────────────────
export const toTurtlePairs = (dbItems) => {
  return dbItems.map(item => ({
    turtleWord:    item.word_left,
    turtleMeaning: item.hint,
    shellWord:     item.word_right,
    shellMeaning:  item.hint, // approximate
  }));
};
