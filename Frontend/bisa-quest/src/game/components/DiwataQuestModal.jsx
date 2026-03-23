import BloomRevivalGame from "./minigames/BloomRevivalGame";
import CaveLightGame from "./minigames/CaveLightGame";
import RiverFlowGame from "./minigames/RiverFlowGame";
import LanternGuideGame from "./minigames/LanternGuideGame";

import {
  BLOOM_DATA,
  CAVE_DATA,
  RIVER_DATA,
  LANTERN_DATA,
} from "../../pages/Forest/data/diwataData";

// Map each glow item id → mini-game config
const GLOW_QUESTS = {
  bulak: {
    mechanic: "bloom_revival",
    ...BLOOM_DATA,
  },
  langob: {
    mechanic: "cave_light",
    ...CAVE_DATA,
  },
  suba: {
    mechanic: "river_flow",
    ...RIVER_DATA,
  },
  lampara: {
    mechanic: "lantern_guide",
    ...LANTERN_DATA,
  },
};

const DiwataQuestModal = ({ item, npcName, npcImage, onClose, onComplete }) => {
  const quest = GLOW_QUESTS[item.id];

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
    case "bloom_revival":
      return <BloomRevivalGame  {...sharedProps} />;
    case "cave_light":
      return <CaveLightGame     {...sharedProps} />;
    case "river_flow":
      return <RiverFlowGame     {...sharedProps} />;
    case "lantern_guide":
      return <LanternGuideGame  {...sharedProps} />;
    default:
      return null;
  }
};

export default DiwataQuestModal;
