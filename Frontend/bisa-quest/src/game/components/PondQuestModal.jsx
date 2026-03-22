// ─────────────────────────────────────────────────────────────────────────────
//  PondQuestModal.jsx — Routes to the correct forest-pond mini-game
//  Mirrors ItemQuestModal.jsx but for Lunti's synonym/antonym games.
// ─────────────────────────────────────────────────────────────────────────────
import FishPairGame from "./minigames/FishPairGame";
import FrogBridgeGame from "./minigames/FrogBridgeGame";
import TurtleShellGame from "./minigames/TurtleShellGame";
import FishingGame from "./minigames/FishingGame";
import CampfireCookingGame from "./minigames/CampfireCookingGame";
import FlowerBloomingGame from "./minigames/FlowerBloomingGame";

import {
  FISH_FAMILIES_DATA,
  FROG_PATH_DATA,
  TURTLE_SYNONYM_PAIRS,
  FISHING_GAME_DATA,
  TURTLE_SHELL_DATA,
  CAMPFIRE_GAME_DATA,
  FLOWER_GAME_DATA,
} from "../../pages/Forest/data/pondData";

// Map each pond item id to its mini-game config
const POND_QUESTS = {
  tubig: {
    mechanic: "fishing_game",
    ...FISHING_GAME_DATA,
  },
  isda: {
    mechanic: "fish_families",
    ...FISH_FAMILIES_DATA,
  },
  baki: {
    mechanic: "frog_path",
    ...FROG_PATH_DATA,
  },
  pawikan: {
    mechanic: "turtle_shell_repair",
    ...TURTLE_SHELL_DATA,
  },
  kalayo: {
    mechanic: "campfire_cooking",
    ...CAMPFIRE_GAME_DATA,
  },
  bulaklak: {
    mechanic: "flower_blooming",
    ...FLOWER_GAME_DATA,
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
    case "frog_path":
      return <FrogBridgeGame {...sharedProps} />;
    case "turtle_shell_repair":
      return <TurtleShellGame {...sharedProps} />;
    case "fishing_game":
      return <FishingGame {...sharedProps} />;
    case "campfire_cooking":
      return <CampfireCookingGame {...sharedProps} />;
    case "flower_blooming":
      return <FlowerBloomingGame {...sharedProps} />;
    default:
      return null;
  }
};

export default PondQuestModal;
