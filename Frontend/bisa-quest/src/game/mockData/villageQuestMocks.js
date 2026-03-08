// =============================================================================
//  villageQuestMocks.js — Hardcoded test data for new Village quests
//
//  Usage: Pass one of the mock quest IDs below as `questId` in navigation
//  state. The quest pages (FarmPage, MarketStallPage, HousePage) will
//  intercept these IDs and use this data instead of fetching from the API.
//
//  Mock Quest IDs:
//    "mock_ligaya_trapo"    → Ligaya – TRAPO / RAG    (HousePage, living_room_dirty)
//    "mock_ligaya_timba"    → Ligaya – TIMBA / BUCKET (HousePage, living_room)
//    "mock_ligaya_mop"      → Ligaya – MOP            (HousePage, living_room_dirty)
//    "mock_nando_ia"        → Nando  – Farm Tool IA   (FarmPage,  farm)
//    "mock_vicente_ia2"     → Vicente – Fruit IA Rd2  (MarketStallPage, market_stall)
//
//  API response shape each page expects:
//    meta:      { quest_id, npc_id, title, content_type, scene_type, game_mechanic, instructions }
//    dialogues: [{ dialogue_id, quest_id, flow_type, step_order, speaker, dialogue_text }]
//    items:     [{ item_id, quest_id, round_number, label, image_key, is_correct,
//                  belongs_to, correct_zone, position_x, position_y, display_order }]
// =============================================================================

// ─── Helper: auto-increment IDs so keys are unique ───────────────────────────
let _did = 9000;
let _iid = 9000;
const D = () => ++_did;
const I = () => ++_iid;

// =============================================================================
//  LIGAYA — TRAPO / RAG   (drag_drop, living_room_dirty)
// =============================================================================
const TRAPO_META = {
    quest_id: 'mock_ligaya_trapo',
    npc_id: 'village_npc_2',
    title: 'Trapo / Rag',
    content_type: 'scenario',
    scene_type: 'living_room_dirty',
    game_mechanic: 'drag_drop',
    instructions: 'I-drag ang husto nga pulong sa hulagway sa TRAPO!',
};

const TRAPO_DIALOGUES = [
    // ── STORY ──
    { dialogue_id: D(), quest_id: 'mock_ligaya_trapo', flow_type: 'main', step_order: 1, speaker: 'Ligaya', dialogue_text: 'Ay! Natumpag ang tubig sa sala! May basa nga salog diri!' },
    { dialogue_id: D(), quest_id: 'mock_ligaya_trapo', flow_type: 'main', step_order: 2, speaker: 'Narration', dialogue_text: 'A puddle of water glistens on the sala floor. Ligaya looks worried.' },
    { dialogue_id: D(), quest_id: 'mock_ligaya_trapo', flow_type: 'main', step_order: 3, speaker: 'Ligaya', dialogue_text: 'Para sa basa nga salog, kinahanglan nako ang TRAPO — or in English, a RAG!' },
    { dialogue_id: D(), quest_id: 'mock_ligaya_trapo', flow_type: 'main', step_order: 4, speaker: 'Ligaya', dialogue_text: 'Ang TRAPO kay usa ka piraso nga panapton nga gamiton para sa pagpunas ug basa o hugaw sa salog ug mga gamit sa balay! Dili siya mag-sweep, mag-puno siya sa tubig!' },
    { dialogue_id: D(), quest_id: 'mock_ligaya_trapo', flow_type: 'main', step_order: 5, speaker: 'Ligaya', dialogue_text: 'Gamiton mo siya pinaagi sa pagbutang sa trapo sa ibabaw sa basa, then i-punas! Importante siya para sa paglimpyo sa basa nga surface!' },
    { dialogue_id: D(), quest_id: 'mock_ligaya_trapo', flow_type: 'main', step_order: 6, speaker: 'Ligaya', dialogue_text: 'So unsa man ang buhaton sa TRAPO sa basa nga salog?' },

    // ── COMPREHENSION BRANCHES ──
    { dialogue_id: D(), quest_id: 'mock_ligaya_trapo', flow_type: 'correct_comp', step_order: 1, speaker: 'Ligaya', dialogue_text: 'Tama! Ang TRAPO para sa pagpunas ug basa o hugaw! Maayo kaayo ka!' },
    { dialogue_id: D(), quest_id: 'mock_ligaya_trapo', flow_type: 'wrong_sweep', step_order: 1, speaker: 'Ligaya', dialogue_text: 'Dili na! Ang pag-sweep para sa walis! Ang TRAPO para sa pagpunas ug basa, dili para sa uga nga abog! Try again!' },

    // ── FEEDBACK BRANCHES ──
    { dialogue_id: D(), quest_id: 'mock_ligaya_trapo', flow_type: 'correct', step_order: 1, speaker: 'Ligaya', dialogue_text: 'Perpekto! TRAPO in Cebuano, RAG in English! Mao gyud na!' },
    { dialogue_id: D(), quest_id: 'mock_ligaya_trapo', flow_type: 'correct', step_order: 2, speaker: 'Narration', dialogue_text: 'Ligaya wipes up the spill quickly with the trapo. The floor is dry again.' },
    { dialogue_id: D(), quest_id: 'mock_ligaya_trapo', flow_type: 'correct', step_order: 3, speaker: 'Ligaya', dialogue_text: 'Salamat! Maayo na ang sala! Dili na basa ang salog!' },
    { dialogue_id: D(), quest_id: 'mock_ligaya_trapo', flow_type: 'wrong_walis', step_order: 1, speaker: 'Ligaya', dialogue_text: 'Walis? Dili na! Ang walis para sa pag-sweep ug uga nga abog, dili para sa basa! Ang TRAPO ang sakto diri!' },
    { dialogue_id: D(), quest_id: 'mock_ligaya_trapo', flow_type: 'wrong_walis', step_order: 2, speaker: 'Player', dialogue_text: 'Oh right! Lahi gyud ang ilang gamit!' },
    { dialogue_id: D(), quest_id: 'mock_ligaya_trapo', flow_type: 'wrong_mop', step_order: 1, speaker: 'Ligaya', dialogue_text: 'Mop? Ang mop mas dako nga basa cleaner, pero ang TRAPO ang gamay ug portable! Try again!' },
    { dialogue_id: D(), quest_id: 'mock_ligaya_trapo', flow_type: 'wrong_mop', step_order: 2, speaker: 'Player', dialogue_text: 'Ah okay! Dagko ang difference!' },
];

const TRAPO_ITEMS = [
    // Comprehension (round 0)
    { item_id: I(), quest_id: 'mock_ligaya_trapo', round_number: 0, label: 'Pagpunas sa basa nga salog', image_key: 'rag', is_correct: true, belongs_to: null, correct_zone: null, position_x: 35, position_y: 35, display_order: 1 },
    { item_id: I(), quest_id: 'mock_ligaya_trapo', round_number: 0, label: 'Pag-sweep sa uga nga abog', image_key: 'walis', is_correct: false, belongs_to: 'wrong_sweep', correct_zone: null, position_x: 65, position_y: 35, display_order: 2 },
    // Drag & Drop (round 1)
    { item_id: I(), quest_id: 'mock_ligaya_trapo', round_number: 1, label: 'TRAPO', image_key: 'trapo', is_correct: true, belongs_to: null, correct_zone: 'planggana', position_x: 25, position_y: 48, display_order: 1 },
    { item_id: I(), quest_id: 'mock_ligaya_trapo', round_number: 1, label: 'RAG', image_key: 'rag', is_correct: true, belongs_to: null, correct_zone: 'planggana', position_x: 50, position_y: 48, display_order: 2 },
    { item_id: I(), quest_id: 'mock_ligaya_trapo', round_number: 1, label: 'WALIS', image_key: 'walis', is_correct: false, belongs_to: 'wrong_walis', correct_zone: null, position_x: 30, position_y: 65, display_order: 3 },
    { item_id: I(), quest_id: 'mock_ligaya_trapo', round_number: 1, label: 'MOP', image_key: 'mop', is_correct: false, belongs_to: 'wrong_mop', correct_zone: null, position_x: 62, position_y: 65, display_order: 4 },
];

// =============================================================================
//  LIGAYA — TIMBA / BUCKET  (drag_drop, living_room)
// =============================================================================
const TIMBA_META = {
    quest_id: 'mock_ligaya_timba',
    npc_id: 'village_npc_2',
    title: 'Timba / Bucket',
    content_type: 'scenario',
    scene_type: 'living_room',
    game_mechanic: 'drag_drop',
    instructions: 'I-drag ang husto nga pulong sa hulagway sa TIMBA!',
};

const TIMBA_DIALOGUES = [
    { dialogue_id: D(), quest_id: 'mock_ligaya_timba', flow_type: 'main', step_order: 1, speaker: 'Ligaya', dialogue_text: 'Kinahanglan nako og dakong tubig para limpyohon ang sala!' },
    { dialogue_id: D(), quest_id: 'mock_ligaya_timba', flow_type: 'main', step_order: 2, speaker: 'Narration', dialogue_text: 'Ligaya walks toward the kitchen, looking for something to carry water in.' },
    { dialogue_id: D(), quest_id: 'mock_ligaya_timba', flow_type: 'main', step_order: 3, speaker: 'Ligaya', dialogue_text: 'Kini ang akong gamiton! Gitawag ni og TIMBA — or in English, a BUCKET!' },
    { dialogue_id: D(), quest_id: 'mock_ligaya_timba', flow_type: 'main', step_order: 4, speaker: 'Ligaya', dialogue_text: 'Ang TIMBA kay usa ka bilog ug hataas nga sudlanan. Gigamit kini para sa pagsudlod ug paghakot ug dako nga gidaghanon sa tubig!' },
    { dialogue_id: D(), quest_id: 'mock_ligaya_timba', flow_type: 'main', step_order: 5, speaker: 'Ligaya', dialogue_text: 'Gamiton mo siya pinaagi sa pagpuno ug tubig, then i-dala ngadto sa lugar nga kinahanglan limpyohon. Importante kini kung kinahanglan og dako nga tubig!' },
    { dialogue_id: D(), quest_id: 'mock_ligaya_timba', flow_type: 'main', step_order: 6, speaker: 'Ligaya', dialogue_text: 'So unsa man ang kinabuhi sa TIMBA sa balay?' },

    { dialogue_id: D(), quest_id: 'mock_ligaya_timba', flow_type: 'correct_comp', step_order: 1, speaker: 'Ligaya', dialogue_text: 'Tama! Ang TIMBA para sa paghakot ug dako nga tubig! Klaro nakadungog ka!' },
    { dialogue_id: D(), quest_id: 'mock_ligaya_timba', flow_type: 'wrong_sweep', step_order: 1, speaker: 'Ligaya', dialogue_text: 'Dili na! Ang sweeping para sa walis! Ang TIMBA para sa paghakot ug tubig! Try again!' },

    { dialogue_id: D(), quest_id: 'mock_ligaya_timba', flow_type: 'correct', step_order: 1, speaker: 'Ligaya', dialogue_text: 'Maayo! TIMBA in Cebuano, BUCKET in English! Sakto gyud!' },
    { dialogue_id: D(), quest_id: 'mock_ligaya_timba', flow_type: 'correct', step_order: 2, speaker: 'Narration', dialogue_text: 'Ligaya fills the timba and carries it across the sala with ease.' },
    { dialogue_id: D(), quest_id: 'mock_ligaya_timba', flow_type: 'correct', step_order: 3, speaker: 'Ligaya', dialogue_text: 'Salamat! Puno na ang timba! Listo na ta mag-limpyo!' },
    { dialogue_id: D(), quest_id: 'mock_ligaya_timba', flow_type: 'wrong_trapo', step_order: 1, speaker: 'Ligaya', dialogue_text: 'Trapo? Ang trapo gagmay ug para ra sa pagpunas! Dili kaya og dako nga tubig! Ang TIMBA ang para sa pag-hakot!' },
    { dialogue_id: D(), quest_id: 'mock_ligaya_timba', flow_type: 'wrong_trapo', step_order: 2, speaker: 'Player', dialogue_text: 'Oh right! Dili kaya sa trapo ang dako nga tubig!' },
    { dialogue_id: D(), quest_id: 'mock_ligaya_timba', flow_type: 'wrong_walis', step_order: 1, speaker: 'Ligaya', dialogue_text: 'Hahaha! Ang walis dili para sa paghakot ug tubig! Para sa pag-sweep! Ang TIMBA ang angay diri!' },
    { dialogue_id: D(), quest_id: 'mock_ligaya_timba', flow_type: 'wrong_walis', step_order: 2, speaker: 'Player', dialogue_text: 'Ay tama! Nagkalibog ko!' },
];

const TIMBA_ITEMS = [
    { item_id: I(), quest_id: 'mock_ligaya_timba', round_number: 0, label: 'Paghakot ug dako nga tubig', image_key: 'bucket', is_correct: true, belongs_to: null, correct_zone: null, position_x: 35, position_y: 35, display_order: 1 },
    { item_id: I(), quest_id: 'mock_ligaya_timba', round_number: 0, label: 'Pag-sweep sa abog', image_key: 'walis', is_correct: false, belongs_to: 'wrong_sweep', correct_zone: null, position_x: 65, position_y: 35, display_order: 2 },
    { item_id: I(), quest_id: 'mock_ligaya_timba', round_number: 1, label: 'TIMBA', image_key: 'bucket', is_correct: true, belongs_to: null, correct_zone: 'planggana', position_x: 25, position_y: 48, display_order: 1 },
    { item_id: I(), quest_id: 'mock_ligaya_timba', round_number: 1, label: 'BUCKET', image_key: 'bucket', is_correct: true, belongs_to: null, correct_zone: 'planggana', position_x: 50, position_y: 48, display_order: 2 },
    { item_id: I(), quest_id: 'mock_ligaya_timba', round_number: 1, label: 'TRAPO', image_key: 'trapo', is_correct: false, belongs_to: 'wrong_trapo', correct_zone: null, position_x: 30, position_y: 65, display_order: 3 },
    { item_id: I(), quest_id: 'mock_ligaya_timba', round_number: 1, label: 'WALIS', image_key: 'walis', is_correct: false, belongs_to: 'wrong_walis', correct_zone: null, position_x: 62, position_y: 65, display_order: 4 },
];

// =============================================================================
//  LIGAYA — MOP  (drag_drop, living_room_dirty)
// =============================================================================
const MOP_META = {
    quest_id: 'mock_ligaya_mop',
    npc_id: 'village_npc_2',
    title: 'MOP — Deep Floor Cleaning',
    content_type: 'scenario',
    scene_type: 'living_room_dirty',
    game_mechanic: 'drag_drop',
    instructions: 'I-drag ang pulong MOP sa hulagway!',
};

const MOP_DIALOGUES = [
    { dialogue_id: D(), quest_id: 'mock_ligaya_mop', flow_type: 'main', step_order: 1, speaker: 'Ligaya', dialogue_text: 'Ay! Ang salog dirtyo kaayo! Ang walis dili na igo para ani!' },
    { dialogue_id: D(), quest_id: 'mock_ligaya_mop', flow_type: 'main', step_order: 2, speaker: 'Narration', dialogue_text: 'Ligaya examines the grimy floor. It needs a serious deep clean.' },
    { dialogue_id: D(), quest_id: 'mock_ligaya_mop', flow_type: 'main', step_order: 3, speaker: 'Ligaya', dialogue_text: 'Para sa grabe nga hugaw sa salog, kinahanglan ang MOP! Same ang pulong sa Cebuano ug English — MOP!' },
    { dialogue_id: D(), quest_id: 'mock_ligaya_mop', flow_type: 'main', step_order: 4, speaker: 'Ligaya', dialogue_text: 'Ang MOP kay usa ka hataas nga gamit nga naa\'y basa nga strands sa ubos! Gigamit kini para sa deep cleaning sa salog pinaagi sa pag-wipe gamit ang basa nga cloth strands! Mas epektibo siya sa walis para sa basa ug grease!' },
    { dialogue_id: D(), quest_id: 'mock_ligaya_mop', flow_type: 'main', step_order: 5, speaker: 'Ligaya', dialogue_text: 'Gamiton mo siya pinaagi sa pag-dip sa mop head sa tubig, then i-push-pull sa tibuok salog.' },
    { dialogue_id: D(), quest_id: 'mock_ligaya_mop', flow_type: 'main', step_order: 6, speaker: 'Ligaya', dialogue_text: 'So unsa man ang kalainan sa MOP ug WALIS?' },

    { dialogue_id: D(), quest_id: 'mock_ligaya_mop', flow_type: 'correct_comp', step_order: 1, speaker: 'Ligaya', dialogue_text: 'Tama! Ang MOP gigamit para sa basa ug greasy nga salog, mas lisod limpyohon sa walis!' },
    { dialogue_id: D(), quest_id: 'mock_ligaya_mop', flow_type: 'wrong_dry', step_order: 1, speaker: 'Ligaya', dialogue_text: 'Dili na! Ang MOP mas espesyal sa basa ug greasy nga salog, dili para ra sa uga nga abog! Try again!' },

    { dialogue_id: D(), quest_id: 'mock_ligaya_mop', flow_type: 'correct', step_order: 1, speaker: 'Ligaya', dialogue_text: 'Nindot! MOP — same ang pulong sa duha ka pinulongan! Mao gyud na!' },
    { dialogue_id: D(), quest_id: 'mock_ligaya_mop', flow_type: 'correct', step_order: 2, speaker: 'Narration', dialogue_text: 'The mop glides smoothly across the floor. The sala looks spotless.' },
    { dialogue_id: D(), quest_id: 'mock_ligaya_mop', flow_type: 'correct', step_order: 3, speaker: 'Ligaya', dialogue_text: 'Salamat! Limpyo na kaayo ang salog! Ready na para sa bisita!' },
    { dialogue_id: D(), quest_id: 'mock_ligaya_mop', flow_type: 'wrong_walis', step_order: 1, speaker: 'Ligaya', dialogue_text: 'Walis? Ang walis para sa uga nga abog! Para sa basa ug greasy nga salog, ang MOP ang mas epektibo!' },
    { dialogue_id: D(), quest_id: 'mock_ligaya_mop', flow_type: 'wrong_walis', step_order: 2, speaker: 'Player', dialogue_text: 'Oh! Mas ayo diay ang MOP para ana!' },
    { dialogue_id: D(), quest_id: 'mock_ligaya_mop', flow_type: 'wrong_trapo', step_order: 1, speaker: 'Ligaya', dialogue_text: 'Trapo? Ang trapo gagmay ra, dili kaya ang tibuok salog! Ang MOP ang sakto para sa deep cleaning!' },
    { dialogue_id: D(), quest_id: 'mock_ligaya_mop', flow_type: 'wrong_trapo', step_order: 2, speaker: 'Player', dialogue_text: 'Ah right! Mas dako ang MOP para sa salog!' },
];

const MOP_ITEMS = [
    { item_id: I(), quest_id: 'mock_ligaya_mop', round_number: 0, label: 'Basa ug greasy nga salog', image_key: 'mop', is_correct: true, belongs_to: null, correct_zone: null, position_x: 35, position_y: 35, display_order: 1 },
    { item_id: I(), quest_id: 'mock_ligaya_mop', round_number: 0, label: 'Uga nga abog sa suluk', image_key: 'walis', is_correct: false, belongs_to: 'wrong_dry', correct_zone: null, position_x: 65, position_y: 35, display_order: 2 },
    { item_id: I(), quest_id: 'mock_ligaya_mop', round_number: 1, label: 'MOP', image_key: 'mop', is_correct: true, belongs_to: null, correct_zone: 'planggana', position_x: 35, position_y: 48, display_order: 1 },
    { item_id: I(), quest_id: 'mock_ligaya_mop', round_number: 1, label: 'WALIS', image_key: 'walis', is_correct: false, belongs_to: 'wrong_walis', correct_zone: null, position_x: 25, position_y: 65, display_order: 2 },
    { item_id: I(), quest_id: 'mock_ligaya_mop', round_number: 1, label: 'TRAPO', image_key: 'trapo', is_correct: false, belongs_to: 'wrong_trapo', correct_zone: null, position_x: 58, position_y: 65, display_order: 3 },
];

// =============================================================================
//  NANDO — Farm Tool IA  (item_association, farm)
//  Round 1: water plants  → Regadera correct (Pala wrong)
//  Round 2: dig new soil  → Pala correct    (Regadera wrong)
//  Round 3: water seedlings → Regadera correct (Pala wrong)
// =============================================================================
const NANDO_IA_META = {
    quest_id: 'mock_nando_ia',
    npc_id: 'village_npc_3',
    title: 'Pala ug Regadera — Unsay Gamiton?',
    content_type: 'scenario',
    scene_type: 'farm',
    game_mechanic: 'item_association',
    instructions: 'Pilia ang husto nga gamit sa uma para sa matag trabaho!',
};

const NANDO_IA_DIALOGUES = [
    { dialogue_id: D(), quest_id: 'mock_nando_ia', flow_type: 'main', step_order: 1, speaker: 'Nando', dialogue_text: 'Daghan kaayo og buhaton sa uma karon! Duha ka importanteng gamit ang akong gamiton!' },
    { dialogue_id: D(), quest_id: 'mock_nando_ia', flow_type: 'main', step_order: 2, speaker: 'Narration', dialogue_text: 'Nando points to two tools on the farm wall — a PALA and a REGADERA.' },
    { dialogue_id: D(), quest_id: 'mock_nando_ia', flow_type: 'main', step_order: 3, speaker: 'Nando', dialogue_text: 'Ang PALA para sa pag-gisi ug yuta. Ang REGADERA para sa pagtubig sa tanum!' },
    { dialogue_id: D(), quest_id: 'mock_nando_ia', flow_type: 'main', step_order: 4, speaker: 'Nando', dialogue_text: 'Kinahanglan nako mahibaw-an kung KANUS-A gamiton ang matag usa! Paminawa pag-ayo unsa ang kinahanglan sa matag sitwasyon!' },

    // Round 1 — water plants → Regadera
    { dialogue_id: D(), quest_id: 'mock_nando_ia', flow_type: 'r1_intro', step_order: 1, speaker: 'Nando', dialogue_text: 'Pagkainit! Ang tanum nalantang na! Kinahanglan dayon og tubig!' },
    { dialogue_id: D(), quest_id: 'mock_nando_ia', flow_type: 'r1_intro', step_order: 2, speaker: 'Narration', dialogue_text: 'The plants are wilting under the hot afternoon sun.' },
    { dialogue_id: D(), quest_id: 'mock_nando_ia', flow_type: 'r1_intro', step_order: 3, speaker: 'Nando', dialogue_text: 'Ang tanum kinahanglan og TUBIG — dili kwaon ang yuta! Unsay husto nga gamiton?' },

    { dialogue_id: D(), quest_id: 'mock_nando_ia', flow_type: 'r1_correct', step_order: 1, speaker: 'Nando', dialogue_text: 'Tama! Ang REGADERA ang para sa pagtubig sa tanum!' },
    { dialogue_id: D(), quest_id: 'mock_nando_ia', flow_type: 'r1_correct', step_order: 2, speaker: 'Nando', dialogue_text: 'REGADERA in Cebuano, WATERING CAN in English!' },
    { dialogue_id: D(), quest_id: 'mock_nando_ia', flow_type: 'r1_correct', step_order: 3, speaker: 'Narration', dialogue_text: 'Nando gently waters the wilting plants. They slowly perk back up.' },

    { dialogue_id: D(), quest_id: 'mock_nando_ia', flow_type: 'r1_wrong_pala', step_order: 1, speaker: 'Nando', dialogue_text: 'Pala? Dili na! Ang pala para sa pag-gisi sa yuta, dili para sa tanum nga uhaw!' },
    { dialogue_id: D(), quest_id: 'mock_nando_ia', flow_type: 'r1_wrong_pala', step_order: 2, speaker: 'Nando', dialogue_text: 'Ang REGADERA lang ang husto! Try again!' },

    // Round 2 — dig new soil → Pala
    { dialogue_id: D(), quest_id: 'mock_nando_ia', flow_type: 'r2_intro', step_order: 1, speaker: 'Nando', dialogue_text: 'Karon, kinahanglan mag-andam og bag-ong lugar para sa tanum! Ang yuta gahi pa ug kinahanglan i-gisi!' },
    { dialogue_id: D(), quest_id: 'mock_nando_ia', flow_type: 'r2_intro', step_order: 2, speaker: 'Narration', dialogue_text: 'A hard patch of untilled soil waits at the edge of the farm.' },
    { dialogue_id: D(), quest_id: 'mock_nando_ia', flow_type: 'r2_intro', step_order: 3, speaker: 'Nando', dialogue_text: 'Kinahanglan GASITON ang yuta — dili tubigan! Unsay husto nga gamiton?' },

    { dialogue_id: D(), quest_id: 'mock_nando_ia', flow_type: 'r2_correct', step_order: 1, speaker: 'Nando', dialogue_text: 'Sakto! Ang PALA ang para sa pag-gisi ug pag-liko sa yuta!' },
    { dialogue_id: D(), quest_id: 'mock_nando_ia', flow_type: 'r2_correct', step_order: 2, speaker: 'Nando', dialogue_text: 'PALA in Cebuano, SHOVEL in English!' },
    { dialogue_id: D(), quest_id: 'mock_nando_ia', flow_type: 'r2_correct', step_order: 3, speaker: 'Narration', dialogue_text: 'Nando thrusts the pala into the earth, turning it over with ease.' },

    { dialogue_id: D(), quest_id: 'mock_nando_ia', flow_type: 'r2_wrong_reg', step_order: 1, speaker: 'Nando', dialogue_text: 'Regadera? Dili na! Ang regadera para sa tubig, dili para sa paggisi sa yuta!' },
    { dialogue_id: D(), quest_id: 'mock_nando_ia', flow_type: 'r2_wrong_reg', step_order: 2, speaker: 'Nando', dialogue_text: 'Ang PALA ang sakto diri! Try again!' },

    // Round 3 — water seedlings → Regadera
    { dialogue_id: D(), quest_id: 'mock_nando_ia', flow_type: 'r3_intro', step_order: 1, speaker: 'Nando', dialogue_text: 'Naa kay mga bag-ong seeding diri! Kinahanglan sila og malumo nga tubig!' },
    { dialogue_id: D(), quest_id: 'mock_nando_ia', flow_type: 'r3_intro', step_order: 2, speaker: 'Narration', dialogue_text: 'Tiny new seedlings peek out from the freshly tilled soil.' },
    { dialogue_id: D(), quest_id: 'mock_nando_ia', flow_type: 'r3_intro', step_order: 3, speaker: 'Nando', dialogue_text: 'Ang mga seeding kay nipis pa ug dili kaya ang pag-gisi! Unsay dapat gamiton?' },

    { dialogue_id: D(), quest_id: 'mock_nando_ia', flow_type: 'r3_correct', step_order: 1, speaker: 'Nando', dialogue_text: 'Perpekto! Ang REGADERA ang para sa malumo nga pagtubig sa mga seeding!' },
    { dialogue_id: D(), quest_id: 'mock_nando_ia', flow_type: 'r3_correct', step_order: 2, speaker: 'Nando', dialogue_text: 'REGADERA — Watering Can. Para sa tanum, labi na ang gagmay!' },
    { dialogue_id: D(), quest_id: 'mock_nando_ia', flow_type: 'r3_correct', step_order: 3, speaker: 'Narration', dialogue_text: 'Nando gently waters each seedling. They stand upright and happy.' },

    { dialogue_id: D(), quest_id: 'mock_nando_ia', flow_type: 'r3_wrong_pala', step_order: 1, speaker: 'Nando', dialogue_text: 'Ay! Dili! Ang pala makalaglag sa mga gamay nga seeding!' },
    { dialogue_id: D(), quest_id: 'mock_nando_ia', flow_type: 'r3_wrong_pala', step_order: 2, speaker: 'Nando', dialogue_text: 'Ang REGADERA ang para sa malumo nga pagtubig! Try again!' },

    // Final
    { dialogue_id: D(), quest_id: 'mock_nando_ia', flow_type: 'final', step_order: 1, speaker: 'Nando', dialogue_text: 'Maayo kaayo! Nakat-on ta og duha ka importanteng gamit sa uma!' },
    { dialogue_id: D(), quest_id: 'mock_nando_ia', flow_type: 'final', step_order: 2, speaker: 'Nando', dialogue_text: 'PALA (Shovel) — para sa pag-gisi ug pag-liko sa yuta!' },
    { dialogue_id: D(), quest_id: 'mock_nando_ia', flow_type: 'final', step_order: 3, speaker: 'Nando', dialogue_text: 'REGADERA (Watering Can) — para sa malumo nga pagtubig sa tanum!' },
    { dialogue_id: D(), quest_id: 'mock_nando_ia', flow_type: 'final', step_order: 4, speaker: 'Nando', dialogue_text: 'Sakto ang paggamit ana nagpabilin hinungdanon sa uma! Salamat!' },
];

const NANDO_IA_ITEMS = [
    // Round 1: water plants → Regadera correct
    { item_id: I(), quest_id: 'mock_nando_ia', round_number: 1, label: 'REGADERA', image_key: 'regadera', is_correct: true, belongs_to: null, position_x: 33, position_y: 60, display_order: 1 },
    { item_id: I(), quest_id: 'mock_nando_ia', round_number: 1, label: 'PALA', image_key: 'pala', is_correct: false, belongs_to: 'r1_wrong_pala', position_x: 66, position_y: 60, display_order: 2 },
    // Round 2: dig soil → Pala correct
    { item_id: I(), quest_id: 'mock_nando_ia', round_number: 2, label: 'PALA', image_key: 'pala', is_correct: true, belongs_to: null, position_x: 33, position_y: 60, display_order: 1 },
    { item_id: I(), quest_id: 'mock_nando_ia', round_number: 2, label: 'REGADERA', image_key: 'regadera', is_correct: false, belongs_to: 'r2_wrong_reg', position_x: 66, position_y: 60, display_order: 2 },
    // Round 3: water seedlings → Regadera correct
    { item_id: I(), quest_id: 'mock_nando_ia', round_number: 3, label: 'REGADERA', image_key: 'regadera', is_correct: true, belongs_to: null, position_x: 33, position_y: 60, display_order: 1 },
    { item_id: I(), quest_id: 'mock_nando_ia', round_number: 3, label: 'PALA', image_key: 'pala', is_correct: false, belongs_to: 'r3_wrong_pala', position_x: 66, position_y: 60, display_order: 2 },
];

// =============================================================================
//  VICENTE — Fruit Market Round 2 IA  (item_association, market_stall)
//  Round 1: Mangga | Round 2: Saging | Round 3: Pakwan
// =============================================================================
const VICENTE_IA2_META = {
    quest_id: 'mock_vicente_ia2',
    npc_id: 'village_npc_1',
    title: 'Mangga, Saging, ug Pakwan',
    content_type: 'scenario',
    scene_type: 'market_stall',
    game_mechanic: 'item_association',
    instructions: 'Pilia ang sakto nga prutas para sa matag customer sa merkado!',
};

const VICENTE_IA2_DIALOGUES = [
    { dialogue_id: D(), quest_id: 'mock_vicente_ia2', flow_type: 'main', step_order: 1, speaker: 'Narration', dialogue_text: 'The afternoon market is still busy. Vicente\'s stall is packed with colorful fruits.' },
    { dialogue_id: D(), quest_id: 'mock_vicente_ia2', flow_type: 'main', step_order: 2, speaker: 'Vicente', dialogue_text: 'Maayong hapon! Puno pa ang akong tindahan og prutas karon!' },
    { dialogue_id: D(), quest_id: 'mock_vicente_ia2', flow_type: 'main', step_order: 3, speaker: 'Narration', dialogue_text: 'Three more customers line up at Vicente\'s fruit stall.' },
    { dialogue_id: D(), quest_id: 'mock_vicente_ia2', flow_type: 'main', step_order: 4, speaker: 'Vicente', dialogue_text: 'Tabangi ko usab karon ha! Tulo ka customers diri nga nagpaborda og prutas!' },
    { dialogue_id: D(), quest_id: 'mock_vicente_ia2', flow_type: 'main', step_order: 5, speaker: 'Vicente', dialogue_text: 'Paminawa pag-ayo unsa ilang gusto!' },

    // Round 1 — wants Mangga
    { dialogue_id: D(), quest_id: 'mock_vicente_ia2', flow_type: 'r1_intro', step_order: 1, speaker: 'Customer 1', dialogue_text: 'Vicente! Papalita ko og duha ka kilong Mangga, hinog ha!' },
    { dialogue_id: D(), quest_id: 'mock_vicente_ia2', flow_type: 'r1_intro', step_order: 2, speaker: 'Narration', dialogue_text: 'Mangga is a large oval fruit — green skin when unripe, yellow when ripe. Sweet and fragrant.' },
    { dialogue_id: D(), quest_id: 'mock_vicente_ia2', flow_type: 'r1_intro', step_order: 3, speaker: 'Vicente', dialogue_text: 'Ang MANGGA kay oval, yellow kung hinog, ug matamis kaayo! In English, MANGO! Pilia ang sakto!' },

    { dialogue_id: D(), quest_id: 'mock_vicente_ia2', flow_type: 'r1_correct', step_order: 1, speaker: 'Vicente', dialogue_text: 'Sakto! Mao gyud na ang MANGGA! Hinog ug yellow!' },
    { dialogue_id: D(), quest_id: 'mock_vicente_ia2', flow_type: 'r1_correct', step_order: 2, speaker: 'Vicente', dialogue_text: 'MANGGA sa Cebuano, MANGO sa English!' },
    { dialogue_id: D(), quest_id: 'mock_vicente_ia2', flow_type: 'r1_correct', step_order: 3, speaker: 'Customer 1', dialogue_text: 'Salamat nimo Vicente! Nindot kaayo ang imong mga mangga!' },

    { dialogue_id: D(), quest_id: 'mock_vicente_ia2', flow_type: 'r1_wrong_saging', step_order: 1, speaker: 'Vicente', dialogue_text: 'Oops! Dili na Mangga. Ang Saging kay long ug curved! Ang Mangga kay oval ug yellow. Try again!' },
    { dialogue_id: D(), quest_id: 'mock_vicente_ia2', flow_type: 'r1_wrong_pakwan', step_order: 1, speaker: 'Vicente', dialogue_text: 'Pakwan? Dako ra kaayo na! Ang Pakwan kay dako ug bilog, green ang gawas! Lahi sa Mangga! Try again!' },

    // Round 2 — wants Saging
    { dialogue_id: D(), quest_id: 'mock_vicente_ia2', flow_type: 'r2_intro', step_order: 1, speaker: 'Customer 2', dialogue_text: 'Maayong hapon! Pila ang Saging nimo? Palihog og isa ka tandan!' },
    { dialogue_id: D(), quest_id: 'mock_vicente_ia2', flow_type: 'r2_intro', step_order: 2, speaker: 'Narration', dialogue_text: 'Saging are long curved yellow fruits that grow in a bunch called a tandan.' },
    { dialogue_id: D(), quest_id: 'mock_vicente_ia2', flow_type: 'r2_intro', step_order: 3, speaker: 'Vicente', dialogue_text: 'Ang SAGING kay long, curved, ug yellow kung hinog! Sa English, BANANA! Pilia ang sakto!' },

    { dialogue_id: D(), quest_id: 'mock_vicente_ia2', flow_type: 'r2_correct', step_order: 1, speaker: 'Vicente', dialogue_text: 'Nindot! Mao gyud na ang SAGING!' },
    { dialogue_id: D(), quest_id: 'mock_vicente_ia2', flow_type: 'r2_correct', step_order: 2, speaker: 'Vicente', dialogue_text: 'SAGING sa Cebuano, BANANA sa English!' },
    { dialogue_id: D(), quest_id: 'mock_vicente_ia2', flow_type: 'r2_correct', step_order: 3, speaker: 'Customer 2', dialogue_text: 'Salamat Vicente! Paborito nako ang saging!' },

    { dialogue_id: D(), quest_id: 'mock_vicente_ia2', flow_type: 'r2_wrong_mangga', step_order: 1, speaker: 'Vicente', dialogue_text: 'Dili na! Ang Mangga kay oval ug dili curved! Ang Saging kay long ug curved. Try again!' },
    { dialogue_id: D(), quest_id: 'mock_vicente_ia2', flow_type: 'r2_wrong_pakwan', step_order: 1, speaker: 'Vicente', dialogue_text: 'Pakwan? Hahaha dako gyud kaayo na! Ang Saging kay gamay ug curved! Try again!' },

    // Round 3 — wants Pakwan
    { dialogue_id: D(), quest_id: 'mock_vicente_ia2', flow_type: 'r3_intro', step_order: 1, speaker: 'Customer 3', dialogue_text: 'Vicente! Naa kay Pakwan? Gusto ko og usa ka dako!' },
    { dialogue_id: D(), quest_id: 'mock_vicente_ia2', flow_type: 'r3_intro', step_order: 2, speaker: 'Narration', dialogue_text: 'Pakwan is a large round fruit — dark green outside, bright red and sweet inside.' },
    { dialogue_id: D(), quest_id: 'mock_vicente_ia2', flow_type: 'r3_intro', step_order: 3, speaker: 'Vicente', dialogue_text: 'Ang PAKWAN kay dako, bilog, green ang panit, ug pula ang sulod! Sa English, WATERMELON! Pilia ang sakto!' },

    { dialogue_id: D(), quest_id: 'mock_vicente_ia2', flow_type: 'r3_correct', step_order: 1, speaker: 'Vicente', dialogue_text: 'Maayo! Mao gyud na ang PAKWAN!' },
    { dialogue_id: D(), quest_id: 'mock_vicente_ia2', flow_type: 'r3_correct', step_order: 2, speaker: 'Vicente', dialogue_text: 'PAKWAN sa Cebuano, WATERMELON sa English!' },
    { dialogue_id: D(), quest_id: 'mock_vicente_ia2', flow_type: 'r3_correct', step_order: 3, speaker: 'Narration', dialogue_text: 'The customer carries the big watermelon happily.' },
    { dialogue_id: D(), quest_id: 'mock_vicente_ia2', flow_type: 'r3_correct', step_order: 4, speaker: 'Vicente', dialogue_text: 'Salamat sa imong tabang pagbaligya!' },

    { dialogue_id: D(), quest_id: 'mock_vicente_ia2', flow_type: 'r3_wrong_mangga', step_order: 1, speaker: 'Vicente', dialogue_text: 'Mangga? Dili na Pakwan. Ang Pakwan dako ug bilog, green ang panit. Ang Mangga oval ug yellow! Try again!' },
    { dialogue_id: D(), quest_id: 'mock_vicente_ia2', flow_type: 'r3_wrong_saging', step_order: 1, speaker: 'Vicente', dialogue_text: 'Saging? Dako kaayo ang kalainan! Ang Saging kay long ug curved. Ang Pakwan dako ug bilog! Try again!' },

    // Final
    { dialogue_id: D(), quest_id: 'mock_vicente_ia2', flow_type: 'final', step_order: 1, speaker: 'Vicente', dialogue_text: 'Maayo kaayo! Nakat-on ta og tulo ka prutas!' },
    { dialogue_id: D(), quest_id: 'mock_vicente_ia2', flow_type: 'final', step_order: 2, speaker: 'Vicente', dialogue_text: 'MANGGA — Mango! Oval, yellow, matamis!' },
    { dialogue_id: D(), quest_id: 'mock_vicente_ia2', flow_type: 'final', step_order: 3, speaker: 'Vicente', dialogue_text: 'SAGING — Banana! Long, curved, yellow!' },
    { dialogue_id: D(), quest_id: 'mock_vicente_ia2', flow_type: 'final', step_order: 4, speaker: 'Vicente', dialogue_text: 'PAKWAN — Watermelon! Dako, bilog, pula ang sulod!' },
    { dialogue_id: D(), quest_id: 'mock_vicente_ia2', flow_type: 'final', step_order: 5, speaker: 'Vicente', dialogue_text: 'Salamat sa imong tabang karon sa tindahan!' },
];

const VICENTE_IA2_ITEMS = [
    // Round 1: Mangga correct
    { item_id: I(), quest_id: 'mock_vicente_ia2', round_number: 1, label: 'Mangga', image_key: 'mangga', is_correct: true, belongs_to: null, position_x: 33, position_y: 60, display_order: 1 },
    { item_id: I(), quest_id: 'mock_vicente_ia2', round_number: 1, label: 'Saging', image_key: 'saging', is_correct: false, belongs_to: 'r1_wrong_saging', position_x: 66, position_y: 60, display_order: 2 },
    { item_id: I(), quest_id: 'mock_vicente_ia2', round_number: 1, label: 'Pakwan', image_key: 'pakwan', is_correct: false, belongs_to: 'r1_wrong_pakwan', position_x: 50, position_y: 60, display_order: 3 },
    // Round 2: Saging correct
    { item_id: I(), quest_id: 'mock_vicente_ia2', round_number: 2, label: 'Saging', image_key: 'saging', is_correct: true, belongs_to: null, position_x: 33, position_y: 60, display_order: 1 },
    { item_id: I(), quest_id: 'mock_vicente_ia2', round_number: 2, label: 'Mangga', image_key: 'mangga', is_correct: false, belongs_to: 'r2_wrong_mangga', position_x: 66, position_y: 60, display_order: 2 },
    { item_id: I(), quest_id: 'mock_vicente_ia2', round_number: 2, label: 'Pakwan', image_key: 'pakwan', is_correct: false, belongs_to: 'r2_wrong_pakwan', position_x: 50, position_y: 60, display_order: 3 },
    // Round 3: Pakwan correct
    { item_id: I(), quest_id: 'mock_vicente_ia2', round_number: 3, label: 'Pakwan', image_key: 'pakwan', is_correct: true, belongs_to: null, position_x: 33, position_y: 60, display_order: 1 },
    { item_id: I(), quest_id: 'mock_vicente_ia2', round_number: 3, label: 'Mangga', image_key: 'mangga', is_correct: false, belongs_to: 'r3_wrong_mangga', position_x: 66, position_y: 60, display_order: 2 },
    { item_id: I(), quest_id: 'mock_vicente_ia2', round_number: 3, label: 'Saging', image_key: 'saging', is_correct: false, belongs_to: 'r3_wrong_saging', position_x: 50, position_y: 60, display_order: 3 },
];

// =============================================================================
//  LIGAYA BATCH 2 — SANDOK / KALDERO / UNAN
// =============================================================================

// ── SANDOK ──
const SANDOK_META = { quest_id: 'mock_ligaya_sandok', npc_id: 'village_npc_2', title: 'Sandok / Ladle', content_type: 'scenario', scene_type: 'kitchen', game_mechanic: 'drag_drop', instructions: 'I-drag ang husto nga pulong sa hulagway sa SANDOK!' };
const SANDOK_DIALOGUES = [
    { dialogue_id: D(), quest_id: 'mock_ligaya_sandok', flow_type: 'main', step_order: 1, speaker: 'Ligaya', dialogue_text: 'Naluto na ang sabaw pero kinahanglan ko kuhaan og tubig gikan sa kaldero!' },
    { dialogue_id: D(), quest_id: 'mock_ligaya_sandok', flow_type: 'main', step_order: 2, speaker: 'Narration', dialogue_text: 'A pot of steaming soup sits on Ligaya\'s kitchen stove.' },
    { dialogue_id: D(), quest_id: 'mock_ligaya_sandok', flow_type: 'main', step_order: 3, speaker: 'Ligaya', dialogue_text: 'Para ana, kinahanglan ang SANDOK — or in English, a LADLE!' },
    { dialogue_id: D(), quest_id: 'mock_ligaya_sandok', flow_type: 'main', step_order: 4, speaker: 'Ligaya', dialogue_text: 'Ang SANDOK kay usa ka hataas nga gamit nga naa\'y bilog ug dako nga bowl sa ubos! Gigamit kini para mag-scoop ug sopas!' },
    { dialogue_id: D(), quest_id: 'mock_ligaya_sandok', flow_type: 'main', step_order: 5, speaker: 'Ligaya', dialogue_text: 'Gamiton mo siya pinaagi sa pagkuha sa hawak, then i-dip sa sopas, ug i-pour sa plato!' },
    { dialogue_id: D(), quest_id: 'mock_ligaya_sandok', flow_type: 'main', step_order: 6, speaker: 'Ligaya', dialogue_text: 'So unsa man ang trabaho sa SANDOK sa kusina?' },

    { dialogue_id: D(), quest_id: 'mock_ligaya_sandok', flow_type: 'correct_comp', step_order: 1, speaker: 'Ligaya', dialogue_text: 'Tama! Ang SANDOK para sa pag-scoop ug sopas o sabaw! Maayo kaayo!' },
    { dialogue_id: D(), quest_id: 'mock_ligaya_sandok', flow_type: 'wrong_cut', step_order: 1, speaker: 'Ligaya', dialogue_text: 'Dili na! Ang pagputol para sa kutsilyo! Ang SANDOK para sa pag-scoop ug liquid! Try again!' },

    { dialogue_id: D(), quest_id: 'mock_ligaya_sandok', flow_type: 'correct', step_order: 1, speaker: 'Ligaya', dialogue_text: 'Perpekto! SANDOK in Cebuano, LADLE in English!' },
    { dialogue_id: D(), quest_id: 'mock_ligaya_sandok', flow_type: 'correct', step_order: 2, speaker: 'Narration', dialogue_text: 'Ligaya scoops the warm soup into the bowl beautifully.' },
    { dialogue_id: D(), quest_id: 'mock_ligaya_sandok', flow_type: 'correct', step_order: 3, speaker: 'Ligaya', dialogue_text: 'Salamat! Listo na ang sabaw para sa igsoong!' },
    { dialogue_id: D(), quest_id: 'mock_ligaya_sandok', flow_type: 'wrong_kutsilyo', step_order: 1, speaker: 'Ligaya', dialogue_text: 'Kutsilyo? Panganib na! Ang kutsilyo para sa pagputol, dili para sa pag-scoop!' },
    { dialogue_id: D(), quest_id: 'mock_ligaya_sandok', flow_type: 'wrong_kawali', step_order: 1, speaker: 'Ligaya', dialogue_text: 'Kawali? Dili na! Ang kawali para sa pag-fry, dili para sa pag-scoop sa sabaw!' },
];
const SANDOK_ITEMS = [
    { item_id: I(), quest_id: 'mock_ligaya_sandok', round_number: 0, label: 'Pag-scoop sa sopas', image_key: 'sandok_new', is_correct: true, belongs_to: null, position_x: 35, position_y: 35, display_order: 1 },
    { item_id: I(), quest_id: 'mock_ligaya_sandok', round_number: 0, label: 'Pagputol sa utanon', image_key: 'kutsilyo', is_correct: false, belongs_to: 'wrong_cut', position_x: 65, position_y: 35, display_order: 2 },
    { item_id: I(), quest_id: 'mock_ligaya_sandok', round_number: 1, label: 'SANDOK', image_key: 'sandok_new', is_correct: true, belongs_to: null, correct_zone: 'stove', position_x: 25, position_y: 45, display_order: 1 },
    { item_id: I(), quest_id: 'mock_ligaya_sandok', round_number: 1, label: 'LADLE', image_key: 'sandok_new', is_correct: true, belongs_to: null, correct_zone: 'stove', position_x: 52, position_y: 45, display_order: 2 },
    { item_id: I(), quest_id: 'mock_ligaya_sandok', round_number: 1, label: 'KUTSILYO', image_key: 'kutsilyo', is_correct: false, belongs_to: 'wrong_kutsilyo', position_x: 30, position_y: 65, display_order: 3 },
    { item_id: I(), quest_id: 'mock_ligaya_sandok', round_number: 1, label: 'KAWALI', image_key: 'kawali', is_correct: false, belongs_to: 'wrong_kawali', position_x: 62, position_y: 65, display_order: 4 },
];

// ── KALDERO ──
const KALDERO_META = { quest_id: 'mock_ligaya_kaldero', npc_id: 'village_npc_2', title: 'Kaldero / Pot', content_type: 'scenario', scene_type: 'kitchen', game_mechanic: 'drag_drop', instructions: 'I-drag ang husto nga pulong sa hulagway sa KALDERO!' };
const KALDERO_DIALOGUES = [
    { dialogue_id: D(), quest_id: 'mock_ligaya_kaldero', flow_type: 'main', step_order: 1, speaker: 'Ligaya', dialogue_text: 'Kinahanglan ko magluto og bugas para sa paniudto!' },
    { dialogue_id: D(), quest_id: 'mock_ligaya_kaldero', flow_type: 'main', step_order: 2, speaker: 'Narration', dialogue_text: 'Ligaya looks at the uncooked rice, ready to start cooking.' },
    { dialogue_id: D(), quest_id: 'mock_ligaya_kaldero', flow_type: 'main', step_order: 3, speaker: 'Ligaya', dialogue_text: 'Para sa pagluto, kinahanglan ang KALDERO — or in English, a POT!' },
    { dialogue_id: D(), quest_id: 'mock_ligaya_kaldero', flow_type: 'main', step_order: 4, speaker: 'Ligaya', dialogue_text: 'Ang KALDERO kay usa ka halapad ug hataas nga sudlanan nga puthaw o aluminum! Gigamit kini para sa pagluto sa bugas, sopas, o uban pang pagkaon!' },
    { dialogue_id: D(), quest_id: 'mock_ligaya_kaldero', flow_type: 'main', step_order: 5, speaker: 'Ligaya', dialogue_text: 'Ibutang ang bugas ug tubig sa kaldero, i-sa-kalan, ug hulaton nga maluto!' },
    { dialogue_id: D(), quest_id: 'mock_ligaya_kaldero', flow_type: 'main', step_order: 6, speaker: 'Ligaya', dialogue_text: 'So unsa man ang kasagaran nga giluto sa KALDERO?' },
    { dialogue_id: D(), quest_id: 'mock_ligaya_kaldero', flow_type: 'correct_comp', step_order: 1, speaker: 'Ligaya', dialogue_text: 'Tama! Ang kaldero para sa pagluto sa bugas ug sopas! Maayo kaayo ka!' },
    { dialogue_id: D(), quest_id: 'mock_ligaya_kaldero', flow_type: 'wrong_fry', step_order: 1, speaker: 'Ligaya', dialogue_text: 'Dili na! Ang pag-fry para sa kawali, dili sa kaldero!' },
    { dialogue_id: D(), quest_id: 'mock_ligaya_kaldero', flow_type: 'correct', step_order: 1, speaker: 'Ligaya', dialogue_text: 'Maayo! KALDERO in Cebuano, POT in English!' },
    { dialogue_id: D(), quest_id: 'mock_ligaya_kaldero', flow_type: 'correct', step_order: 2, speaker: 'Narration', dialogue_text: 'Steam rises from the kaldero as the rice cooks perfectly.' },
    { dialogue_id: D(), quest_id: 'mock_ligaya_kaldero', flow_type: 'correct', step_order: 3, speaker: 'Ligaya', dialogue_text: 'Salamat! Puto na ang bugas para sa paniudto!' },
    { dialogue_id: D(), quest_id: 'mock_ligaya_kaldero', flow_type: 'wrong_kawali', step_order: 1, speaker: 'Ligaya', dialogue_text: 'Kawali? Ang kawali mas nipis ug flat! Para sa pagprito, dili sa pagluto og bugas.' },
    { dialogue_id: D(), quest_id: 'mock_ligaya_kaldero', flow_type: 'wrong_plato', step_order: 1, speaker: 'Ligaya', dialogue_text: 'Plato? Hahaha! Ang plato para sa pagkaon, dili para sa pagluto!' },
];
const KALDERO_ITEMS = [
    { item_id: I(), quest_id: 'mock_ligaya_kaldero', round_number: 0, label: 'Pagluto sa bugas ug sopas', image_key: 'kaldero_new', is_correct: true, belongs_to: null, position_x: 35, position_y: 35, display_order: 1 },
    { item_id: I(), quest_id: 'mock_ligaya_kaldero', round_number: 0, label: 'Pagprito sa isda', image_key: 'kawali', is_correct: false, belongs_to: 'wrong_fry', position_x: 65, position_y: 35, display_order: 2 },
    { item_id: I(), quest_id: 'mock_ligaya_kaldero', round_number: 1, label: 'KALDERO', image_key: 'kaldero_new', is_correct: true, belongs_to: null, correct_zone: 'stove', position_x: 25, position_y: 45, display_order: 1 },
    { item_id: I(), quest_id: 'mock_ligaya_kaldero', round_number: 1, label: 'POT', image_key: 'kaldero_new', is_correct: true, belongs_to: null, correct_zone: 'stove', position_x: 52, position_y: 45, display_order: 2 },
    { item_id: I(), quest_id: 'mock_ligaya_kaldero', round_number: 1, label: 'KAWALI', image_key: 'kawali', is_correct: false, belongs_to: 'wrong_kawali', position_x: 30, position_y: 65, display_order: 3 },
    { item_id: I(), quest_id: 'mock_ligaya_kaldero', round_number: 1, label: 'PLATO', image_key: 'plato', is_correct: false, belongs_to: 'wrong_plato', position_x: 62, position_y: 65, display_order: 4 },
];

// ── UNAN ──
const UNAN_META = { quest_id: 'mock_ligaya_unan', npc_id: 'village_npc_2', title: 'Unan / Pillow', content_type: 'scenario', scene_type: 'bedroom', game_mechanic: 'drag_drop', instructions: 'I-drag ang husto nga pulong sa hulagway sa UNAN!' };
const UNAN_DIALOGUES = [
    { dialogue_id: D(), quest_id: 'mock_ligaya_unan', flow_type: 'main', step_order: 1, speaker: 'Ligaya', dialogue_text: 'Ah! Ang higdaanan kinahanglan i-ayos para sa bisita!' },
    { dialogue_id: D(), quest_id: 'mock_ligaya_unan', flow_type: 'main', step_order: 2, speaker: 'Narration', dialogue_text: 'The bedroom bed looks disheveled and needs tidying up.' },
    { dialogue_id: D(), quest_id: 'mock_ligaya_unan', flow_type: 'main', step_order: 3, speaker: 'Ligaya', dialogue_text: 'Importante kaayo ang UNAN — or in English, a PILLOW!' },
    { dialogue_id: D(), quest_id: 'mock_ligaya_unan', flow_type: 'main', step_order: 4, speaker: 'Ligaya', dialogue_text: 'Ang UNAN kay usa ka malambo nga sudlanan nga puno og cotton o foam! Kini ang gibutangan sa ulo kung nagtulog!' },
    { dialogue_id: D(), quest_id: 'mock_ligaya_unan', flow_type: 'main', step_order: 5, speaker: 'Ligaya', dialogue_text: 'I-butang ang unan sa ibabaw sa higdaanan, ug tabunan og pillowcase para limpyo siya!' },
    { dialogue_id: D(), quest_id: 'mock_ligaya_unan', flow_type: 'main', step_order: 6, speaker: 'Ligaya', dialogue_text: 'So unsa man ang gamit sa UNAN sa pagtulog?' },
    { dialogue_id: D(), quest_id: 'mock_ligaya_unan', flow_type: 'correct_comp', step_order: 1, speaker: 'Ligaya', dialogue_text: 'Tama! Ang UNAN para sa komportableng pagtulog! Maayo kaayo ka!' },
    { dialogue_id: D(), quest_id: 'mock_ligaya_unan', flow_type: 'wrong_cover', step_order: 1, speaker: 'Ligaya', dialogue_text: 'Dili na! Ang pagtabon sa lawas para sa kumot o habol! Ang UNAN para sa ulo!' },
    { dialogue_id: D(), quest_id: 'mock_ligaya_unan', flow_type: 'correct', step_order: 1, speaker: 'Ligaya', dialogue_text: 'Nindot! UNAN in Cebuano, PILLOW in English!' },
    { dialogue_id: D(), quest_id: 'mock_ligaya_unan', flow_type: 'correct', step_order: 2, speaker: 'Narration', dialogue_text: 'Ligaya fluffs the pillow and places it neatly on the bed.' },
    { dialogue_id: D(), quest_id: 'mock_ligaya_unan', flow_type: 'correct', step_order: 3, speaker: 'Ligaya', dialogue_text: 'Salamat! Komportable na ang higdaanan para sa bisita!' },
    { dialogue_id: D(), quest_id: 'mock_ligaya_unan', flow_type: 'wrong_habol', step_order: 1, speaker: 'Ligaya', dialogue_text: 'Habol? Ang habol para sa pagtabon sa tibuok lawas, dili para sa ulo!' },
    { dialogue_id: D(), quest_id: 'mock_ligaya_unan', flow_type: 'wrong_tuwalya', step_order: 1, speaker: 'Ligaya', dialogue_text: 'Tuwalya? Hehehe! Ang tuwalya para sa papahiran, dili para sa pagtulog!' },
];
const UNAN_ITEMS = [
    { item_id: I(), quest_id: 'mock_ligaya_unan', round_number: 0, label: 'Support sa ulo kung nagtulog', image_key: 'unan_new', is_correct: true, belongs_to: null, position_x: 35, position_y: 35, display_order: 1 },
    { item_id: I(), quest_id: 'mock_ligaya_unan', round_number: 0, label: 'Pagtabon sa tibuok lawas', image_key: 'habol', is_correct: false, belongs_to: 'wrong_cover', position_x: 65, position_y: 35, display_order: 2 },
    { item_id: I(), quest_id: 'mock_ligaya_unan', round_number: 1, label: 'UNAN', image_key: 'unan_new', is_correct: true, belongs_to: null, correct_zone: 'higdaanan', position_x: 25, position_y: 45, display_order: 1 },
    { item_id: I(), quest_id: 'mock_ligaya_unan', round_number: 1, label: 'PILLOW', image_key: 'unan_new', is_correct: true, belongs_to: null, correct_zone: 'higdaanan', position_x: 52, position_y: 45, display_order: 2 },
    { item_id: I(), quest_id: 'mock_ligaya_unan', round_number: 1, label: 'HABOL', image_key: 'habol', is_correct: false, belongs_to: 'wrong_habol', position_x: 30, position_y: 65, display_order: 3 },
    { item_id: I(), quest_id: 'mock_ligaya_unan', round_number: 1, label: 'TUWALYA', image_key: 'tuwalya', is_correct: false, belongs_to: 'wrong_tuwalya', position_x: 62, position_y: 65, display_order: 4 },
];

// ── NANDO BINHI ──
const BINHI_META = { quest_id: 'mock_nando_binhi', npc_id: 'village_npc_3', title: 'Binhi / Seeds', content_type: 'scenario', scene_type: 'farm', game_mechanic: 'drag_drop', instructions: 'I-drag ang husto nga pulong sa hulagway sa BINHI!' };
const BINHI_DIALOGUES = [
    { dialogue_id: D(), quest_id: 'mock_nando_binhi', flow_type: 'main', step_order: 1, speaker: 'Nando', dialogue_text: 'Karon, kinahanglan akong mag-tanom! Pero dili pa ko makasugod kung wala pa koy…' },
    { dialogue_id: D(), quest_id: 'mock_nando_binhi', flow_type: 'main', step_order: 2, speaker: 'Narration', dialogue_text: 'Nando holds out his palm showing tiny round seeds.' },
    { dialogue_id: D(), quest_id: 'mock_nando_binhi', flow_type: 'main', step_order: 3, speaker: 'Nando', dialogue_text: 'BINHI! Sa English, SEEDS! Mao kini ang sugod sa tanan nga tanum!' },
    { dialogue_id: D(), quest_id: 'mock_nando_binhi', flow_type: 'main', step_order: 4, speaker: 'Nando', dialogue_text: 'Ang BINHI kay gagmay kaayong butang gikan sa tanum! Kung itanom mo kini sa yuta ug tubigan, motubo kini ug mahimong bag-ong tanum!' },
    { dialogue_id: D(), quest_id: 'mock_nando_binhi', flow_type: 'main', step_order: 5, speaker: 'Nando', dialogue_text: 'Gamiton mo kini pinaagi sa pag-gisi sa yuta gamit ang pala, i-drop ang binhi sa buho, then tabunan og yuta ug tubigan!' },
    { dialogue_id: D(), quest_id: 'mock_nando_binhi', flow_type: 'main', step_order: 6, speaker: 'Nando', dialogue_text: 'So unsa man ang binhi ug unsa ang iyang buhaton kung itanom?' },
    { dialogue_id: D(), quest_id: 'mock_nando_binhi', flow_type: 'correct_comp', step_order: 1, speaker: 'Nando', dialogue_text: 'Tama! Ang binhi motubo nga bag-ong tanum kung itanom ug tubigan! Maayo ka!' },
    { dialogue_id: D(), quest_id: 'mock_nando_binhi', flow_type: 'wrong_tool', step_order: 1, speaker: 'Nando', dialogue_text: 'Dili na! Ang binhi mismo ang gamiton nga motubo! Ang pala ug regadera ang mga gamit!' },
    { dialogue_id: D(), quest_id: 'mock_nando_binhi', flow_type: 'correct', step_order: 1, speaker: 'Nando', dialogue_text: 'Maayo gyud! BINHI in Cebuano, SEEDS in English!' },
    { dialogue_id: D(), quest_id: 'mock_nando_binhi', flow_type: 'correct', step_order: 2, speaker: 'Narration', dialogue_text: 'Nando carefully places the seeds into the prepared soil.' },
    { dialogue_id: D(), quest_id: 'mock_nando_binhi', flow_type: 'correct', step_order: 3, speaker: 'Nando', dialogue_text: 'Salamat! Tanom na ang binhi! Hulaton ta og bag-ong tanum!' },
    { dialogue_id: D(), quest_id: 'mock_nando_binhi', flow_type: 'wrong_pala', step_order: 1, speaker: 'Nando', dialogue_text: 'Pala? Ang pala gamit para mabuhoan ang yuta, dili kini ang itanom!' },
    { dialogue_id: D(), quest_id: 'mock_nando_binhi', flow_type: 'wrong_reg', step_order: 1, speaker: 'Nando', dialogue_text: 'Regadera? Ang regadera ginabubo sa tanum para mabuhi, pero dili kini ang itanom!' },
];
const BINHI_ITEMS = [
    { item_id: I(), quest_id: 'mock_nando_binhi', round_number: 0, label: 'Motubo nga tanum kung itanom', image_key: 'binhi_new', is_correct: true, belongs_to: null, position_x: 35, position_y: 35, display_order: 1 },
    { item_id: I(), quest_id: 'mock_nando_binhi', round_number: 0, label: 'Gamit para sa pag-gisi', image_key: 'pala', is_correct: false, belongs_to: 'wrong_tool', position_x: 65, position_y: 35, display_order: 2 },
    { item_id: I(), quest_id: 'mock_nando_binhi', round_number: 1, label: 'BINHI', image_key: 'binhi_new', is_correct: true, belongs_to: null, correct_zone: 'soil_patch_1', position_x: 28, position_y: 45, display_order: 1 },
    { item_id: I(), quest_id: 'mock_nando_binhi', round_number: 1, label: 'SEEDS', image_key: 'binhi_new', is_correct: true, belongs_to: null, correct_zone: 'soil_patch_2', position_x: 52, position_y: 45, display_order: 2 },
    { item_id: I(), quest_id: 'mock_nando_binhi', round_number: 1, label: 'PALA', image_key: 'pala', is_correct: false, belongs_to: 'wrong_pala', position_x: 30, position_y: 65, display_order: 3 },
    { item_id: I(), quest_id: 'mock_nando_binhi', round_number: 1, label: 'REGADERA', image_key: 'regadera', is_correct: false, belongs_to: 'wrong_reg', position_x: 63, position_y: 65, display_order: 4 },
];

// ── VICENTE IA BATCH 2 ──
const VICENTE_IA_BATCH2_META = { quest_id: 'mock_vicente_ia_batch2', npc_id: 'village_npc_1', title: 'Lansones, Santol, ug Saging', content_type: 'scenario', scene_type: 'market_stall', game_mechanic: 'item_association', instructions: 'Pilia ang sakto nga prutas para sa matag customer!' };
const VICENTE_IA_BATCH2_DIALOGUES = [
    { dialogue_id: D(), quest_id: 'mock_vicente_ia_batch2', flow_type: 'main', step_order: 1, speaker: 'Narration', dialogue_text: 'Market day again! Vicente\'s stall gleams with fresh tropical fruit.' },
    { dialogue_id: D(), quest_id: 'mock_vicente_ia_batch2', flow_type: 'main', step_order: 2, speaker: 'Vicente', dialogue_text: 'Maayong buntag! Tulo ka customers na naa diri — tabangi ko!' },
    { dialogue_id: D(), quest_id: 'mock_vicente_ia_batch2', flow_type: 'main', step_order: 3, speaker: 'Vicente', dialogue_text: 'Matag isa gustong lain-laing prutas. Paminawa ug pag-ayo!' },

    { dialogue_id: D(), quest_id: 'mock_vicente_ia_batch2', flow_type: 'r1_intro', step_order: 1, speaker: 'Customer 1', dialogue_text: 'Vicente! Palihog og isa ka kumpol nga Lansones!' },
    { dialogue_id: D(), quest_id: 'mock_vicente_ia_batch2', flow_type: 'r1_intro', step_order: 2, speaker: 'Vicente', dialogue_text: 'Ang LANSONES / LANZONES kay gagmay, bilog, ug paha-paha nga motubo sa kumpol! Pilia ang sakto!' },
    { dialogue_id: D(), quest_id: 'mock_vicente_ia_batch2', flow_type: 'r1_correct', step_order: 1, speaker: 'Vicente', dialogue_text: 'Tama! Mao gyud na ang LANSONES! LANZONES sa English!' },
    { dialogue_id: D(), quest_id: 'mock_vicente_ia_batch2', flow_type: 'r1_wrong_santol', step_order: 1, speaker: 'Vicente', dialogue_text: 'Dili na! Ang Santol kay usa ra ka prutas, bilog ug may baga nga panit. Ang Lansones gagmay ug daghan sa kumpol! Try again!' },
    { dialogue_id: D(), quest_id: 'mock_vicente_ia_batch2', flow_type: 'r1_wrong_saging', step_order: 1, speaker: 'Vicente', dialogue_text: 'Saging? Lahi kaayo! Ang saging long ug curved! Ang Lansones gagmay ug bilog! Try again!' },

    { dialogue_id: D(), quest_id: 'mock_vicente_ia_batch2', flow_type: 'r2_intro', step_order: 1, speaker: 'Customer 2', dialogue_text: 'Maayong buntag! Papalita ko og tulo ka Santol!' },
    { dialogue_id: D(), quest_id: 'mock_vicente_ia_batch2', flow_type: 'r2_intro', step_order: 2, speaker: 'Vicente', dialogue_text: 'Ang SANTOL kay bilog ug medyo baga ang panit! Sa English, COTTON FRUIT! Pilia ang sakto!' },
    { dialogue_id: D(), quest_id: 'mock_vicente_ia_batch2', flow_type: 'r2_correct', step_order: 1, speaker: 'Vicente', dialogue_text: 'Sakto! Mao gyud na ang SANTOL!' },
    { dialogue_id: D(), quest_id: 'mock_vicente_ia_batch2', flow_type: 'r2_wrong_lansones', step_order: 1, speaker: 'Vicente', dialogue_text: 'Lansones? Dili na! Ang lansones gagmay ug kumpol! Ang Santol usa ra ka bilog nga prutas! Try again!' },
    { dialogue_id: D(), quest_id: 'mock_vicente_ia_batch2', flow_type: 'r2_wrong_saging', step_order: 1, speaker: 'Vicente', dialogue_text: 'Saging? Dali kaayo! Ang saging long ug curved, ang Santol bilog ra! Try again!' },

    { dialogue_id: D(), quest_id: 'mock_vicente_ia_batch2', flow_type: 'r3_intro', step_order: 1, speaker: 'Customer 3', dialogue_text: 'Vicente! Naa bay Saging? Gusto ko og usa ka tandan!' },
    { dialogue_id: D(), quest_id: 'mock_vicente_ia_batch2', flow_type: 'r3_intro', step_order: 2, speaker: 'Vicente', dialogue_text: 'Ang SAGING kay long, curved, ug yellow kung hinog! Sa English, BANANA! Pilia ang sakto!' },
    { dialogue_id: D(), quest_id: 'mock_vicente_ia_batch2', flow_type: 'r3_correct', step_order: 1, speaker: 'Vicente', dialogue_text: 'Maayo! Mao gyud na ang SAGING! BANANA sa English!' },
    { dialogue_id: D(), quest_id: 'mock_vicente_ia_batch2', flow_type: 'r3_wrong_lansones', step_order: 1, speaker: 'Vicente', dialogue_text: 'Lansones? Gagmay ra kaayo na! Ang saging long ug curved! Try again!' },
    { dialogue_id: D(), quest_id: 'mock_vicente_ia_batch2', flow_type: 'r3_wrong_santol', step_order: 1, speaker: 'Vicente', dialogue_text: 'Santol? Close pero dili! Ang santol bilog ra, ang saging long ug curved! Try again!' },

    { dialogue_id: D(), quest_id: 'mock_vicente_ia_batch2', flow_type: 'final', step_order: 1, speaker: 'Vicente', dialogue_text: 'Angayan gyud ka sa tindahan! Maayo kaayo!' },
    { dialogue_id: D(), quest_id: 'mock_vicente_ia_batch2', flow_type: 'final', step_order: 2, speaker: 'Vicente', dialogue_text: 'LANSONES — Lanzones! SANTOL — Cotton Fruit! SAGING — Banana! Wala gyud ka masayop!' },
];
const VICENTE_IA_BATCH2_ITEMS = [
    { item_id: I(), quest_id: 'mock_vicente_ia_batch2', round_number: 1, label: 'Lansones', image_key: 'lansones', is_correct: true, belongs_to: null, position_x: 33, position_y: 60, display_order: 1 },
    { item_id: I(), quest_id: 'mock_vicente_ia_batch2', round_number: 1, label: 'Santol', image_key: 'santol', is_correct: false, belongs_to: 'r1_wrong_santol', position_x: 66, position_y: 60, display_order: 2 },
    { item_id: I(), quest_id: 'mock_vicente_ia_batch2', round_number: 1, label: 'Saging', image_key: 'saging', is_correct: false, belongs_to: 'r1_wrong_saging', position_x: 50, position_y: 60, display_order: 3 },
    { item_id: I(), quest_id: 'mock_vicente_ia_batch2', round_number: 2, label: 'Santol', image_key: 'santol', is_correct: true, belongs_to: null, position_x: 33, position_y: 60, display_order: 1 },
    { item_id: I(), quest_id: 'mock_vicente_ia_batch2', round_number: 2, label: 'Lansones', image_key: 'lansones', is_correct: false, belongs_to: 'r2_wrong_lansones', position_x: 66, position_y: 60, display_order: 2 },
    { item_id: I(), quest_id: 'mock_vicente_ia_batch2', round_number: 2, label: 'Saging', image_key: 'saging', is_correct: false, belongs_to: 'r2_wrong_saging', position_x: 50, position_y: 60, display_order: 3 },
    { item_id: I(), quest_id: 'mock_vicente_ia_batch2', round_number: 3, label: 'Saging', image_key: 'saging', is_correct: true, belongs_to: null, position_x: 33, position_y: 60, display_order: 1 },
    { item_id: I(), quest_id: 'mock_vicente_ia_batch2', round_number: 3, label: 'Lansones', image_key: 'lansones', is_correct: false, belongs_to: 'r3_wrong_lansones', position_x: 66, position_y: 60, display_order: 2 },
    { item_id: I(), quest_id: 'mock_vicente_ia_batch2', round_number: 3, label: 'Santol', image_key: 'santol', is_correct: false, belongs_to: 'r3_wrong_santol', position_x: 50, position_y: 60, display_order: 3 },
];

// =============================================================================
//  BATCH 3 — MORE ITEM ASSOCIATION 
// =============================================================================

// ── LIGAYA KITCHEN IA (Kutsara, Tinidor, Baso) ──
const LIGAYA_KITCHEN_IA_META = { quest_id: 'mock_ligaya_kitchen_ia', npc_id: 'village_npc_2', title: 'Kutsara, Tinidor, ug Baso', content_type: 'scenario', scene_type: 'kitchen', game_mechanic: 'drag_drop', instructions: 'I-drag ang husto nga gamit para sa pagkaon ibabaw sa lamesa!' };
const LIGAYA_KITCHEN_IA_DIALOGUES = [
    { dialogue_id: D(), quest_id: 'mock_ligaya_kitchen_ia', flow_type: 'main', step_order: 1, speaker: 'Ligaya', dialogue_text: 'Oras na para mokaon! Tabangi ko pag-set sa lamesa!' },
    { dialogue_id: D(), quest_id: 'mock_ligaya_kitchen_ia', flow_type: 'main', step_order: 2, speaker: 'Narration', dialogue_text: 'Ligaya brings out plates of food and needs utensils.' },
    { dialogue_id: D(), quest_id: 'mock_ligaya_kitchen_ia', flow_type: 'main', step_order: 3, speaker: 'Ligaya', dialogue_text: 'Tulo ka importanteng gamit: Kutsara, Tinidor, ug Baso! I-drag kini sa lamesa!' },
    { dialogue_id: D(), quest_id: 'mock_ligaya_kitchen_ia', flow_type: 'wrong', step_order: 1, speaker: 'Ligaya', dialogue_text: 'Dili na labut kay set ra man inig kaon atong gipangita, dili na gamitun ang sandok pag hungit. Try again!' },
    { dialogue_id: D(), quest_id: 'mock_ligaya_kitchen_ia', flow_type: 'correct', step_order: 1, speaker: 'Ligaya', dialogue_text: 'Kumpleto na ang lamesa! Kutsara (Spoon), Tinidor (Fork), ug Baso (Glass)! Salamat mangaon na ta!' },
];
const LIGAYA_KITCHEN_IA_ITEMS = [
    { item_id: I(), quest_id: 'mock_ligaya_kitchen_ia', round_number: 1, label: 'KUTSARA', image_key: 'kutsara_new', is_correct: true, belongs_to: null, correct_zone: 'lamesa', position_x: 20, position_y: 80, display_order: 1 },
    { item_id: I(), quest_id: 'mock_ligaya_kitchen_ia', round_number: 1, label: 'TINIDOR', image_key: 'tinidor_new', is_correct: true, belongs_to: null, correct_zone: 'lamesa', position_x: 40, position_y: 80, display_order: 2 },
    { item_id: I(), quest_id: 'mock_ligaya_kitchen_ia', round_number: 1, label: 'SANDOK', image_key: 'sandok_new', is_correct: false, belongs_to: null, correct_zone: null, position_x: 60, position_y: 80, display_order: 3 },
    { item_id: I(), quest_id: 'mock_ligaya_kitchen_ia', round_number: 1, label: 'BASO', image_key: 'baso_new', is_correct: true, belongs_to: null, correct_zone: 'lamesa', position_x: 80, position_y: 80, display_order: 4 },
];

// ── NANDO VEGGIES IA (Kamatis, Talong, Kalabasa) ──
const NANDO_VEG_IA_META = { quest_id: 'mock_nando_veg_ia', npc_id: 'village_npc_3', title: 'Kamatis, Talong, ug Kalabasa', content_type: 'scenario', scene_type: 'farm', game_mechanic: 'drag_drop', instructions: 'I-drag ang tanan utanon sa imong basket!' };
const NANDO_VEG_IA_DIALOGUES = [
    { dialogue_id: D(), quest_id: 'mock_nando_veg_ia', flow_type: 'main', step_order: 1, speaker: 'Nando', dialogue_text: 'Panahon na para mag-harvest sa akong mga utanon!' },
    { dialogue_id: D(), quest_id: 'mock_nando_veg_ia', flow_type: 'main', step_order: 2, speaker: 'Narration', dialogue_text: 'Nando points to the lush vegetable beds.' },
    { dialogue_id: D(), quest_id: 'mock_nando_veg_ia', flow_type: 'main', step_order: 3, speaker: 'Nando', dialogue_text: 'Gusto ko tulo ka utanon: Kamatis, Talong, ug Kalabasa! I-drag sila padulong sa buhing basket arun ma-harvest!' },
    { dialogue_id: D(), quest_id: 'mock_nando_veg_ia', flow_type: 'wrong', step_order: 1, speaker: 'Nando', dialogue_text: 'Dili na labut sa atung harvest run because puros na utanon akong gipangita, dili prutas! Try again!' },
    { dialogue_id: D(), quest_id: 'mock_nando_veg_ia', flow_type: 'correct', step_order: 1, speaker: 'Nando', dialogue_text: 'Kumpleto ang harvest! Kamatis (Tomato), Talong (Eggplant), ug Kalabasa (Squash)! Salamat!' },
];
const NANDO_VEG_IA_ITEMS = [
    { item_id: I(), quest_id: 'mock_nando_veg_ia', round_number: 1, label: 'KAMATIS', image_key: 'kamatis_new', is_correct: true, belongs_to: null, correct_zone: 'basket_farm', position_x: 20, position_y: 80, display_order: 1 },
    { item_id: I(), quest_id: 'mock_nando_veg_ia', round_number: 1, label: 'SAGING', image_key: 'saging', is_correct: false, belongs_to: null, correct_zone: null, position_x: 40, position_y: 80, display_order: 2 },
    { item_id: I(), quest_id: 'mock_nando_veg_ia', round_number: 1, label: 'TALONG', image_key: 'talong_new', is_correct: true, belongs_to: null, correct_zone: 'basket_farm', position_x: 60, position_y: 80, display_order: 3 },
    { item_id: I(), quest_id: 'mock_nando_veg_ia', round_number: 1, label: 'KALABASA', image_key: 'kalabasa_new', is_correct: true, belongs_to: null, correct_zone: 'basket_farm', position_x: 80, position_y: 80, display_order: 4 },
];

// ── VICENTE MARKET ROOT IA (Sibuyas, Ahos, Kamote) ──
const VICENTE_ROOT_IA_META = { quest_id: 'mock_vicente_root_ia', npc_id: 'village_npc_1', title: 'Sibuyas, Ahos, ug Kamote', content_type: 'scenario', scene_type: 'market_stall', game_mechanic: 'item_association', instructions: 'Pilia ang sakto nga produkto!' };
const VICENTE_ROOT_IA_DIALOGUES = [
    { dialogue_id: D(), quest_id: 'mock_vicente_root_ia', flow_type: 'main', step_order: 1, speaker: 'Narration', dialogue_text: 'Market day! Vicente is selling a new batch of root crops and spices.' },
    { dialogue_id: D(), quest_id: 'mock_vicente_root_ia', flow_type: 'main', step_order: 2, speaker: 'Vicente', dialogue_text: 'Maayong adlaw! Naa koy bag-ong baligya: Sibuyas, Ahos, ug Kamote! Tabangi ko og pili!' },
    { dialogue_id: D(), quest_id: 'mock_vicente_root_ia', flow_type: 'r1_intro', step_order: 1, speaker: 'Customer', dialogue_text: 'Vicente, papalita kug katong pula ang panit nga makapahilak inig hiwa!' },
    { dialogue_id: D(), quest_id: 'mock_vicente_root_ia', flow_type: 'r1_intro', step_order: 2, speaker: 'Narration', dialogue_text: 'The customer is looking for a bulb that makes your eyes water when sliced.' },
    { dialogue_id: D(), quest_id: 'mock_vicente_root_ia', flow_type: 'r1_correct', step_order: 1, speaker: 'Vicente', dialogue_text: 'Tama! SIBUYAS! Sa English, ONION!' },
    { dialogue_id: D(), quest_id: 'mock_vicente_root_ia', flow_type: 'r1_wrong_ahos', step_order: 1, speaker: 'Vicente', dialogue_text: 'Ahos? Dili kana makapahilak. Sibuyas ang husto! Try again!' },
    { dialogue_id: D(), quest_id: 'mock_vicente_root_ia', flow_type: 'r1_wrong_kamote', step_order: 1, speaker: 'Vicente', dialogue_text: 'Kamote? Bug-at na nga gamot. Ang Sibuyas ang pula ug makapahilak! Try again!' },
    { dialogue_id: D(), quest_id: 'mock_vicente_root_ia', flow_type: 'r2_intro', step_order: 1, speaker: 'Customer', dialogue_text: 'Dayon, palit pud ko atong puti nga liso-liso nga isagol paggisa. Humot kaayo ni basi pa man layo!' },
    { dialogue_id: D(), quest_id: 'mock_vicente_root_ia', flow_type: 'r2_intro', step_order: 2, speaker: 'Narration', dialogue_text: 'The customer needs a pungent bulb with white skin divided into cloves.' },
    { dialogue_id: D(), quest_id: 'mock_vicente_root_ia', flow_type: 'r2_correct', step_order: 1, speaker: 'Vicente', dialogue_text: 'Sakto! AHOS! Sa English, GARLIC!' },
    { dialogue_id: D(), quest_id: 'mock_vicente_root_ia', flow_type: 'r2_wrong_sibuyas', step_order: 1, speaker: 'Vicente', dialogue_text: 'Sibuyas? Close, pero ang Ahos ang puti nga liso-liso! Try again!' },
    { dialogue_id: D(), quest_id: 'mock_vicente_root_ia', flow_type: 'r2_wrong_kamote', step_order: 1, speaker: 'Vicente', dialogue_text: 'Kamote? Para snack na, dili para gisa nga inana kaisog! Ahos ang sakto! Try again!' },
    { dialogue_id: D(), quest_id: 'mock_vicente_root_ia', flow_type: 'r3_intro', step_order: 1, speaker: 'Customer', dialogue_text: 'Lastly, palit ko og lamiang gamot para islan sa bugas, katong murag patatas pero mas matamis!' },
    { dialogue_id: D(), quest_id: 'mock_vicente_root_ia', flow_type: 'r3_intro', step_order: 2, speaker: 'Narration', dialogue_text: 'The customer wants a sweet, starchy root crop with red-purple skin.' },
    { dialogue_id: D(), quest_id: 'mock_vicente_root_ia', flow_type: 'r3_correct', step_order: 1, speaker: 'Vicente', dialogue_text: 'Perpekto! KAMOTE! Sa English, SWEET POTATO! Busog kaayo ka ani!' },
    { dialogue_id: D(), quest_id: 'mock_vicente_root_ia', flow_type: 'r3_wrong_ahos', step_order: 1, speaker: 'Vicente', dialogue_text: 'Ahos? Dili pwede himoong snack ang ahos nga ing-ana kadaghan! Kamote ang sakto! Try again!' },
    { dialogue_id: D(), quest_id: 'mock_vicente_root_ia', flow_type: 'r3_wrong_sibuyas', step_order: 1, speaker: 'Vicente', dialogue_text: 'Sibuyas? Halang na himoong puli sa bugas! Ang Kamote ang matamis nga gamot! Try again!' },
    { dialogue_id: D(), quest_id: 'mock_vicente_root_ia', flow_type: 'final', step_order: 1, speaker: 'Vicente', dialogue_text: 'Salamat sa tabang! SIBUYAS (Onion), AHOS (Garlic), ug KAMOTE (Sweet Potato). Sold out na ta!' },
];
const VICENTE_ROOT_IA_ITEMS = [
    { item_id: I(), quest_id: 'mock_vicente_root_ia', round_number: 1, label: 'Sibuyas', image_key: 'sibuyas_new', is_correct: true, belongs_to: null, position_x: 33, position_y: 60, display_order: 1 },
    { item_id: I(), quest_id: 'mock_vicente_root_ia', round_number: 1, label: 'Ahos', image_key: 'ahos_new', is_correct: false, belongs_to: 'r1_wrong_ahos', position_x: 66, position_y: 60, display_order: 2 },
    { item_id: I(), quest_id: 'mock_vicente_root_ia', round_number: 1, label: 'Kamote', image_key: 'kamote_new', is_correct: false, belongs_to: 'r1_wrong_kamote', position_x: 50, position_y: 60, display_order: 3 },
    { item_id: I(), quest_id: 'mock_vicente_root_ia', round_number: 2, label: 'Ahos', image_key: 'ahos_new', is_correct: true, belongs_to: null, position_x: 33, position_y: 60, display_order: 1 },
    { item_id: I(), quest_id: 'mock_vicente_root_ia', round_number: 2, label: 'Sibuyas', image_key: 'sibuyas_new', is_correct: false, belongs_to: 'r2_wrong_sibuyas', position_x: 66, position_y: 60, display_order: 2 },
    { item_id: I(), quest_id: 'mock_vicente_root_ia', round_number: 2, label: 'Kamote', image_key: 'kamote_new', is_correct: false, belongs_to: 'r2_wrong_kamote', position_x: 50, position_y: 60, display_order: 3 },
    { item_id: I(), quest_id: 'mock_vicente_root_ia', round_number: 3, label: 'Kamote', image_key: 'kamote_new', is_correct: true, belongs_to: null, position_x: 33, position_y: 60, display_order: 1 },
    { item_id: I(), quest_id: 'mock_vicente_root_ia', round_number: 3, label: 'Ahos', image_key: 'ahos_new', is_correct: false, belongs_to: 'r3_wrong_ahos', position_x: 66, position_y: 60, display_order: 2 },
    { item_id: I(), quest_id: 'mock_vicente_root_ia', round_number: 3, label: 'Sibuyas', image_key: 'sibuyas_new', is_correct: false, belongs_to: 'r3_wrong_sibuyas', position_x: 50, position_y: 60, display_order: 3 },
];

// =============================================================================
//  EXPORTED MOCK DATA MAP
//  Key = mock questId string
//  Value = { meta, dialogues, items }
// =============================================================================
export const MOCK_QUEST_DATA = {
    // Batch 1
    mock_ligaya_trapo: { meta: TRAPO_META, dialogues: TRAPO_DIALOGUES, items: TRAPO_ITEMS },
    mock_ligaya_timba: { meta: TIMBA_META, dialogues: TIMBA_DIALOGUES, items: TIMBA_ITEMS },
    mock_ligaya_mop: { meta: MOP_META, dialogues: MOP_DIALOGUES, items: MOP_ITEMS },
    mock_nando_ia: { meta: NANDO_IA_META, dialogues: NANDO_IA_DIALOGUES, items: NANDO_IA_ITEMS },
    mock_vicente_ia2: { meta: VICENTE_IA2_META, dialogues: VICENTE_IA2_DIALOGUES, items: VICENTE_IA2_ITEMS },

    // Batch 2 (New images)
    mock_ligaya_sandok: { meta: SANDOK_META, dialogues: SANDOK_DIALOGUES, items: SANDOK_ITEMS },
    mock_ligaya_kaldero: { meta: KALDERO_META, dialogues: KALDERO_DIALOGUES, items: KALDERO_ITEMS },
    mock_ligaya_unan: { meta: UNAN_META, dialogues: UNAN_DIALOGUES, items: UNAN_ITEMS },
    mock_nando_binhi: { meta: BINHI_META, dialogues: BINHI_DIALOGUES, items: BINHI_ITEMS },
    mock_vicente_ia_batch2: { meta: VICENTE_IA_BATCH2_META, dialogues: VICENTE_IA_BATCH2_DIALOGUES, items: VICENTE_IA_BATCH2_ITEMS },

    // Batch 3
    mock_ligaya_kitchen_ia: { meta: LIGAYA_KITCHEN_IA_META, dialogues: LIGAYA_KITCHEN_IA_DIALOGUES, items: LIGAYA_KITCHEN_IA_ITEMS },
    mock_nando_veg_ia: { meta: NANDO_VEG_IA_META, dialogues: NANDO_VEG_IA_DIALOGUES, items: NANDO_VEG_IA_ITEMS },
    mock_vicente_root_ia: { meta: VICENTE_ROOT_IA_META, dialogues: VICENTE_ROOT_IA_DIALOGUES, items: VICENTE_ROOT_IA_ITEMS },
};

/**
 * Returns { meta, dialogues, items } for a mock questId, or null if not found.
 * @param {string} questId
 */
export const getMockQuestData = (questId) => MOCK_QUEST_DATA[questId] ?? null;
