// ─────────────────────────────────────────────────────────────────────────────
//  PondQuestModal.jsx — Routes to the correct forest-pond mini-game
//  Mirrors ItemQuestModal.jsx but for Lunti's synonym/antonym games.
// ─────────────────────────────────────────────────────────────────────────────
import FishPairGame from "./minigames/FishPairGame";
import SquirrelSortGame from "./minigames/SquirrelSortGame";
import FrogBridgeGame from "./minigames/FrogBridgeGame";
import FireflyPairGame from "./minigames/FireflyPairGame";
import TurtleShellGame from "./minigames/TurtleShellGame";

import {
  FISH_FAMILIES_DATA,
  SQUIRREL_ANTONYM_PAIRS,
  FROG_PATH_DATA,
  FIREFLY_SYNONYM_PAIRS,
  TURTLE_SYNONYM_PAIRS,
} from "../../pages/Forest/data/pondData";

// Map each pond item id to its mini-game config
const POND_QUESTS = {
  isda: {
    mechanic: "fish_families",
    ...FISH_FAMILIES_DATA,
  },
  // key matches POND_ITEMS id: "laksoy"
  laksoy: {
    mechanic: "squirrel_sort",
    data: SQUIRREL_ANTONYM_PAIRS,
    instructionBisaya: "I-drag ang bunga sa hollow nga may kabaliktaran nga pulong!",
    instructionEnglish: "Drag each nut to the hollow with the opposite word!",
  },
  baki: {
    mechanic: "frog_path",
    ...FROG_PATH_DATA,
  },
  alitaptap: {
    mechanic: "firefly_pair",
    pairs: FIREFLY_SYNONYM_PAIRS,
    instructionBisaya: "I-click ang duha ka alitaptap nga pareho og kahulogan!",
    instructionEnglish: "Click two fireflies that mean the same thing!",
  },
  pawikan: {
    mechanic: "turtle_shell",
    pairs: TURTLE_SYNONYM_PAIRS,
    instructionBisaya: "I-drag ang katunga sa bao paduol sa pawikan nga pareho og kahulogan!",
    instructionEnglish: "Drag the shell half to the turtle with the synonym!",
  },
};

const PondQuestModal = ({ item, npcName, npcImage, onClose, onComplete }) => {
  const quest = POND_QUESTS[item.id];

  if (!quest) {
    return (
      <div className="iqm-overlay" onClick={onClose}>
        <div className="iqm-modal">
          <button className="iqm-close" onClick={onClose}>✕</button>
          <p style={{ padding: 30, textAlign: "center", color: "#888" }}>
            Mini-game for "{item.labelEnglish}" is coming soon!
          </p>
        </div>
      </div>
    );
  }

  const sharedProps = { quest, item, npcName, npcImage, onClose, onComplete };

  switch (quest.mechanic) {
    case "fish_families":
      return <FishPairGame {...sharedProps} />;
    case "squirrel_sort":
      return <SquirrelSortGame {...sharedProps} />;
    case "frog_path":
      return <FrogBridgeGame {...sharedProps} />;
    case "firefly_pair":
      return <FireflyPairGame {...sharedProps} />;
    case "turtle_shell":
      return <TurtleShellGame {...sharedProps} />;
    default:
      return null;
  }
};

export default PondQuestModal;
