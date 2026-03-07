// ─────────────────────────────────────────────────────────────────────────────
//  EnvironmentCompleteModal.jsx  —  Parchment popup shown when all NPC quests
//  in an environment are complete.
//
//  Generic — works for Village, Forest, Castle by changing props.
//
//  Props:
//    isOpen       {boolean}
//    environment  {string}   'village' | 'forest' | 'castle'
//    learnedWords {Array}    [{ npcName, words: ['PALA','SHOVEL',...] }]
//    nextEnv      {string}   label for the advance button e.g. 'Forest'
//    onStay       {fn}       player chooses to keep exploring
//    onAdvance    {fn}       player chooses to go to next environment
// ─────────────────────────────────────────────────────────────────────────────

import "./EnvironmentCompleteModal.css";

const ENV_CONFIG = {
  village: {
    title:       "Baryo Kompleto! 🎉",
    subtitle:    "Natapos nimo ang tanan nga quest sa Baryo!",
    advanceIcon: "🌲",
    stayIcon:    "🏡",
    stayLabel:   "Magpabilin sa Baryo",
    bgClass:     "ecm-parchment--village",
  },
  forest: {
    title:       "Kagubatan Kompleto! 🌳",
    subtitle:    "Natapos nimo ang tanan nga quest sa Kagubatan!",
    advanceIcon: "🏰",
    stayIcon:    "🌲",
    stayLabel:   "Magpabilin sa Kagubatan",
    bgClass:     "ecm-parchment--forest",
  },
  castle: {
    title:       "Kastilyo Kompleto! 🏰",
    subtitle:    "Natapos nimo ang tanan nga quest sa Kastilyo!",
    advanceIcon: "⭐",
    stayIcon:    "🏰",
    stayLabel:   "Magpabilin sa Kastilyo",
    bgClass:     "ecm-parchment--castle",
  },
};

const EnvironmentCompleteModal = ({
  isOpen,
  environment  = "village",
  learnedWords = [],
  nextEnv      = "Forest",
  onStay,
  onAdvance,
}) => {
  if (!isOpen) return null;

  const cfg = ENV_CONFIG[environment] || ENV_CONFIG.village;

  // Total word count across all NPCs
  const totalWords = learnedWords.reduce((acc, npc) => acc + npc.words.length, 0);

  return (
    <div className="ecm-overlay" onClick={onStay}>
      <div
        className={`ecm-parchment ${cfg.bgClass}`}
        onClick={e => e.stopPropagation()}
      >
        {/* ── Decorative top seal ── */}
        <div className="ecm-seal">⭐</div>

        {/* ── Title ── */}
        <h2 className="ecm-title">{cfg.title}</h2>
        <p className="ecm-subtitle">{cfg.subtitle}</p>

        <div className="ecm-divider" />

        {/* ── Word count badge ── */}
        <div className="ecm-count-badge">
          🗒️ Natun-an nimo ang <strong>{totalWords}</strong> nga mga pulong!
        </div>

        {/* ── Words learned per NPC ── */}
        {learnedWords.length > 0 && (
          <div className="ecm-word-list">
            {learnedWords.map((npc, i) => (
              <div key={i} className="ecm-npc-row">
                <span className="ecm-npc-name">👤 {npc.npcName}</span>
                <div className="ecm-chips">
                  {npc.words.map((word, j) => (
                    <span key={j} className="ecm-chip">{word}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="ecm-divider" />

        {/* ── Action buttons ── */}
        <div className="ecm-actions">
          <button className="ecm-btn ecm-btn--stay" onClick={onStay}>
            {cfg.stayIcon} {cfg.stayLabel}
          </button>
          <button className="ecm-btn ecm-btn--advance" onClick={onAdvance}>
            {cfg.advanceIcon} Adto sa {nextEnv}!
          </button>
        </div>
      </div>
    </div>
  );
};

export default EnvironmentCompleteModal;