// services/AssetManifest.js
// Centralized asset registry — all Vite-resolved URLs in one place
// Group assets by environment so we can preload per-level

// ── Animation sprites ────────────────────────────────────────────────────────
import boyDown1 from "../assets/animation/boy_down_1.png";
import boyDown2 from "../assets/animation/boy_down_2.png";
import boyLeft1 from "../assets/animation/boy_left_1.png";
import boyLeft2 from "../assets/animation/boy_left_2.png";
import boyRight1 from "../assets/animation/boy_right_1.png";
import boyRight2 from "../assets/animation/boy_right_2.png";
import girlDown1 from "../assets/animation/girl_down_1.png";
import girlDown2 from "../assets/animation/girl_down_2.png";
import girlLeft1 from "../assets/animation/girl_left_1.png";
import girlLeft2 from "../assets/animation/girl_left_2.png";
import girlRight1 from "../assets/animation/girl_right_1.png";
import girlRight2 from "../assets/animation/girl_right_2.png";

// ── Characters ───────────────────────────────────────────────────────────────
import BoyCharacter from "../assets/images/characters/Boy.png";
import GirlCharacter from "../assets/images/characters/Girl.png";

// ── Village assets ───────────────────────────────────────────────────────────
import VillageBackground from "../assets/images/environments/Vocabulary/village-bg.png";
import LigayaCharacter from "../assets/images/characters/vocabulary/Village_Quest_NPC_2.png";
import NandoCharacter from "../assets/images/characters/vocabulary/Village_Quest_NPC_3.png";
import VicenteCharacter from "../assets/images/characters/vocabulary/Village_Quest_NPC_1.png";

import marketBackground from "../assets/images/environments/scenario/market_stall.png";
import houseBackground from "../assets/images/environments/scenario/house.jpg";
import livingRoomSpill from "../assets/images/environments/scenario/living_room_spill.png";
import livingRoomDirty from "../assets/images/environments/scenario/dirtyLivingRoom.PNG";
import farmBackground from "../assets/images/environments/scenario/farm.png";
import emptyFarmBg from "../assets/items/emptyFarm.png";
import LigayaSweating from "../assets/images/characters/Ligaya_gealimut-an.png";
import LigayaWorried from "../assets/images/characters/Ligaya_worried.png";

// ── Forest assets ────────────────────────────────────────────────────────────
import ForestBackground from "../assets/images/environments/Forest.png";
import DiwataCharacter from "../assets/images/characters/diwata.png";
import ForestGuardianCharacter from "../assets/images/characters/forest_guardian.png";
import WanderingBardCharacter from "../assets/images/characters/wandering_bard.png";
import DeerCharacter from "../assets/images/characters/deer.png";

import forestSceneImg from "../assets/images/environments/scenario/forest-scene.png";
import forkedPathImg from "../assets/images/environments/scenario/forked-path.png";
import forestRiverImg from "../assets/images/environments/scenario/forest-river.png";
import forestPondImg from "../assets/images/environments/scenario/forest-pond.png";
import forestGlowImg from "../assets/images/environments/scenario/forest-glow.png";

// ── Castle assets ────────────────────────────────────────────────────────────
import CastleBackground from "../assets/images/environments/castle.png";
import ManongKwillImg from "../assets/images/characters/castle-manong-kwill.png";
import GuloImg from "../assets/images/characters/gulo.png";
import PrincessHaraImg from "../assets/images/characters/castle-princess-hara.png";

import castleLibraryImg from "../assets/images/environments/scenario/castle-library.png";
import castleLibraryLitImg from "../assets/images/environments/scenario/castle-library-light.png";
import castleGardenImg from "../assets/images/environments/scenario/castle-garden.fountain.png";
import castleNightGardenImg from "../assets/images/environments/scenario/castle-night-garden.png";
import castleCourtyardImg from "../assets/images/environments/scenario/castle-courtyard.png";
import castleFirewoodImg from "../assets/images/environments/scenario/castle-firewood.png";
import castleFireworkImg from "../assets/images/environments/scenario/castle-firework.png";
import castleMoonlightRoomImg from "../assets/images/environments/scenario/castle-moonlight-room.png";
import castleRainbowImg from "../assets/images/environments/scenario/castle-rainbow.png";

// ── UI assets ────────────────────────────────────────────────────────────────
import DashboardBg from "../assets/images/bg-dashboard.png";
import DashboardMapImg from "../assets/images/environments/Dashboard.png";
import LoginBg from "../assets/images/bg-login.png";
import BisaTitle from "../assets/images/bisaquest-title.png";
import VillageCard from "../assets/images/cardsImage/village.png";
import ForestCard from "../assets/images/cardsImage/forest.png";
import KingdomCard from "../assets/images/cardsImage/kingdom.png";
import ArrowImg from "../assets/images/signs/arrow.png";
import GuardImg from "../assets/images/environments/scenario/security.png";
import LoadingBoyImg from "../assets/images/characters/loading_screen_boy.png";

/**
 * All assets organized by category / environment.
 * Each key maps to a Vite-resolved URL string.
 */
const AssetManifest = {
    // ── Player animation sprites ─────────────────────────────────────────────
    animation: {
        boy: {
            down: [boyDown1, boyDown2],
            left: [boyLeft1, boyLeft2],
            right: [boyRight1, boyRight2],
        },
        girl: {
            down: [girlDown1, girlDown2],
            left: [girlLeft1, girlLeft2],
            right: [girlRight1, girlRight2],
        },
    },

    // ── Player characters (static) ───────────────────────────────────────────
    characters: {
        boy: BoyCharacter,
        girl: GirlCharacter,
    },

    // ── Village ──────────────────────────────────────────────────────────────
    village: {
        background: VillageBackground,
        npcs: {
            ligaya: LigayaCharacter,
            ligaya_sweating: LigayaSweating,
            ligaya_worried: LigayaWorried,
            nando: NandoCharacter,
            vicente: VicenteCharacter,
        },
        scenarios: {
            market: marketBackground,
            house: houseBackground,
            livingRoomSpill: livingRoomSpill,
            farm: farmBackground,
            emptyFarm: emptyFarmBg,
            livingRoomDirty: livingRoomDirty,
        }
    },

    // ── Forest ───────────────────────────────────────────────────────────────
    forest: {
        background: ForestBackground,
        npcs: {
            diwata: DiwataCharacter,
            forest_guardian: ForestGuardianCharacter,
            wandering_bard: WanderingBardCharacter,
            deer: DeerCharacter,
        },
        scenarios: {
            forestScene: forestSceneImg,
            forkedPath: forkedPathImg,
            river: forestRiverImg,
            pond: forestPondImg,
            glow: forestGlowImg,
        }
    },

    // ── Castle ───────────────────────────────────────────────────────────────
    castle: {
        background: CastleBackground,
        npcs: {
            manong_kwill: ManongKwillImg,
            gulo: GuloImg,
            princess_hara: PrincessHaraImg,
        },
        scenarios: {
            library: castleLibraryImg,
            libraryLit: castleLibraryLitImg,
            garden: castleGardenImg,
            nightGarden: castleNightGardenImg,
            courtyard: castleCourtyardImg,
            firewood: castleFirewoodImg,
            firework: castleFireworkImg,
            moonlightRoom: castleMoonlightRoomImg,
            rainbow: castleRainbowImg,
        }
    },

    // ── UI ────────────────────────────────────────────────────────────────────
    ui: {
        dashboardBg: DashboardBg,
        dashboardMap: DashboardMapImg,
        loginBg: LoginBg,
        title: BisaTitle,
        villageCard: VillageCard,
        forestCard: ForestCard,
        kingdomCard: KingdomCard,
        arrow: ArrowImg,
        guard: GuardImg,
        loadingBoy: LoadingBoyImg,
    },
};

// ── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Flatten an object tree into an array of URL strings.
 * Recurses into nested objects/arrays.
 */
function flattenUrls(obj) {
    const urls = [];
    for (const value of Object.values(obj)) {
        if (typeof value === "string") {
            urls.push(value);
        } else if (Array.isArray(value)) {
            value.forEach((v) => {
                if (typeof v === "string") urls.push(v);
            });
        } else if (typeof value === "object" && value !== null) {
            urls.push(...flattenUrls(value));
        }
    }
    return urls;
}

/**
 * Get all asset URLs for a given environment (for preloading).
 * Also includes animation sprites and player characters.
 *
 * @param {"village"|"forest"|"castle"} env
 * @returns {string[]}
 */
export function getAssetsForEnvironment(env) {
    const urls = [];

    // Environment-specific assets
    if (AssetManifest[env]) {
        urls.push(...flattenUrls(AssetManifest[env]));
    }

    // Always include animation sprites + player characters
    urls.push(...flattenUrls(AssetManifest.animation));
    urls.push(...flattenUrls(AssetManifest.characters));

    return [...new Set(urls)]; // Deduplicate
}

/**
 * Get all asset URLs from every category.
 * @returns {string[]}
 */
export function getAllAssets() {
    return [...new Set(flattenUrls(AssetManifest))];
}

export default AssetManifest;
