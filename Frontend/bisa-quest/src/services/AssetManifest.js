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

import houseBackground from "../assets/images/environments/scenario/house.png";
import bedroomBackground from "../assets/images/environments/scenario/bedroom.png";
import kitchenBackground from "../assets/images/environments/scenario/kitchen.png";
import livingRoomSpill from "../assets/images/environments/scenario/living_room_spill.png";
import livingRoomDirty from "../assets/images/environments/scenario/dirtyLivingRoom.PNG";
import pictureFrame from "../assets/images/environments/scenario/pciture_frame.jpeg";
import LigayaSweating from "../assets/images/characters/Ligaya_gealimut-an.png";
import LigayaWorried from "../assets/images/characters/Ligaya_worried.png";
import bookshelfBg from "../assets/images/environments/scenario/booksfelf.jpg";
import plangganaWater from '../assets/items/planggana_water.png';
import bagPng from '../assets/images/environments/scenario/bag.png';
import kitchenSinkImg from "../assets/images/environments/scenario/kitchen_sink.jpeg";
import kitchenStoveBg from "../assets/images/environments/scenario/kitchen_stove.png";
import kitchenStoveFireBg from "../assets/images/environments/scenario/kitchen_stove_fire.png";
import barrelEmptyBg from "../assets/images/environments/scenario/kitchen_water_barrel_empty.png";
import barrelFillBg from "../assets/images/environments/scenario/kitchen_water_barrel_fill.png";
import basketBg from "../assets/images/environments/scenario/basket.png";
import cauldronImg from "../assets/items/couldron.jpg";
import plateWashImg from "../assets/items/plate_new.png";
import spoonImg from "../assets/items/spoon.jpg";
import kahoyImg from "../assets/items/kahoy.png";
import sugaOn from "../assets/images/environments/scenario/suga_on.jpeg";
import sugaOff from "../assets/images/environments/scenario/suga_off.jpeg";
import dustFeatherImg from "../assets/items/dust_feather.jpg";
import ironBoardImg from "../assets/images/environments/scenario/iron_board.png";
import ironImg from "../assets/items/iron.jpg";

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

import castleGateImg from "../assets/images/environments/scenario/castle-gate.png";
import castleLibraryImg from "../assets/images/environments/scenario/castle-library.png";
import castleLibraryLitImg from "../assets/images/environments/scenario/castle-library-light.png";
import castleGardenImg from "../assets/images/environments/scenario/castle-garden.fountain.png";
import castleNightGardenImg from "../assets/images/environments/scenario/castle-night-garden.png";
import castleCourtyardImg from "../assets/images/environments/scenario/castle-courtyard-new.png";
import castleFirewoodImg from "../assets/images/environments/scenario/castle-firewood.png";
import castleFireworkImg from "../assets/images/environments/scenario/castle-firework.png";
import castleMoonlightRoomImg from "../assets/images/environments/scenario/castle-moonlight-room.png";
import castleRainbowImg from "../assets/images/environments/scenario/castle-rainbow.png";
import castleLockedImg from "../assets/images/environments/scenario/castle-locked.png";
import castleUnlockedImg from "../assets/images/environments/scenario/castle-unlocked.png";
import castleKeyImg from "../assets/images/environments/scenario/castle-key.png";
import castleStoneImg from "../assets/images/environments/scenario/castle-stone.png";
import castleStoneworkImg from "../assets/images/environments/scenario/castle-stonework.png";
import castleWaterImg from "../assets/images/environments/scenario/castle-water.png";
import castleWayImg from "../assets/images/environments/scenario/castle-way.png";
import castleWaterwayImg from "../assets/images/environments/scenario/castle-waterway.png";
import castleFootprintImg from "../assets/images/environments/scenario/castle-footprint.png";
import castlePathImg from "../assets/images/environments/scenario/castle-path.png";
import castlePathwayImg from "../assets/images/environments/scenario/castle-pathway.png";
import castleGrassImg from "../assets/images/environments/scenario/castle-grass.png";
import castleLandImg from "../assets/images/environments/scenario/castle-land.png";
import castleGrasslandImg from "../assets/images/environments/scenario/castle-grassland.png";
import castleHammerImg from "../assets/images/environments/scenario/castle-hammer.png";
import castleDrawImg from "../assets/images/environments/scenario/castle-draw.png";
import castleBrokenBridgeImg from "../assets/images/environments/scenario/castle-broken-bridge.png";
import castleFlagImg from "../assets/images/environments/scenario/castle-flag.png";
import castleFlagPoleImg from "../assets/images/environments/scenario/castle-flag-pole.png";
import castlePoleImg from "../assets/images/environments/scenario/castle-pole.png";
import castleFlagpoleImg from "../assets/images/environments/scenario/castle-flagpole.png";
import castleNoCourtyardImg from "../assets/images/environments/scenario/castle-no-courtyard.png";
import castleRoofImg from "../assets/images/environments/scenario/castle-roof.png";
import castleNoRooftopImg from "../assets/images/environments/scenario/castle-no-rooftop.png";
import castleNoLightImg from "../assets/images/environments/scenario/castle-no-light.png";
import castleSunlightImg from "../assets/images/environments/scenario/castle-sunlight.png";
import castleArchImg from "../assets/images/environments/scenario/castle-arch.png";
import castleArchWayImg from "../assets/images/environments/scenario/castle-arch-way.png";
import castleCourtImg from "../assets/images/environments/scenario/castle-court.png";
import castleYardImg from "../assets/images/environments/scenario/castle-yard.png";
import castleSunImg from "../assets/images/environments/scenario/castle-sun.png";
import castleDoorOpenImg from "../assets/images/environments/scenario/castle-door-open.png";
import castleDoorImg from "../assets/images/environments/scenario/castle-door.png";
import castleDoorwayImg from "../assets/images/environments/scenario/castle-doorway.png";

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
        },
        scenarios: {
            house: houseBackground,
            bedroom: bedroomBackground,
            kitchen: kitchenBackground,
            livingRoomSpill: livingRoomSpill,
            livingRoomDirty: livingRoomDirty,
            pictureFrame: pictureFrame,
            bookshelf: bookshelfBg,
            kitchenSink: kitchenSinkImg,
            kitchenStove: kitchenStoveBg,
            kitchenStoveFire: kitchenStoveFireBg,
            barrelEmpty: barrelEmptyBg,
            barrelFill: barrelFillBg,
            basket: basketBg,
            sugaOn: sugaOn,
            sugaOff: sugaOff,
            dustFeather: dustFeatherImg,
            ironBoard: ironBoardImg,
        },
        items: {
            plangganaWater: plangganaWater,
            bag: bagPng,
            cauldron: cauldronImg,
            plateWashing: plateWashImg,
            spoon: spoonImg,
            kahoy: kahoyImg,
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
            gate: castleGateImg,
            library: castleLibraryImg,
            libraryLit: castleLibraryLitImg,
            garden: castleGardenImg,
            nightGarden: castleNightGardenImg,
            courtyard: castleCourtyardImg,
            firewood: castleFirewoodImg,
            firework: castleFireworkImg,
            moonlightRoom: castleMoonlightRoomImg,
            rainbow: castleRainbowImg,
            locked: castleLockedImg,
            unlocked: castleUnlockedImg,
            key: castleKeyImg,
            stone: castleStoneImg,
            stonework: castleStoneworkImg,
            water: castleWaterImg,
            way: castleWayImg,
            waterway: castleWaterwayImg,
            footprint: castleFootprintImg,
            path: castlePathImg,
            pathway: castlePathwayImg,
            grass: castleGrassImg,
            land: castleLandImg,
            grassland: castleGrasslandImg,
            hammer: castleHammerImg,
            draw: castleDrawImg,
            brokenBridge: castleBrokenBridgeImg,
            flag: castleFlagImg,
            flagPole: castleFlagPoleImg,
            pole: castlePoleImg,
            flagpole: castleFlagpoleImg,
            noCourtyard: castleNoCourtyardImg,
            roof: castleRoofImg,
            noRooftop: castleNoRooftopImg,
            noLight: castleNoLightImg,
            sunlight: castleSunlightImg,
            arch: castleArchImg,
            archWay: castleArchWayImg,
            court: castleCourtImg,
            yard: castleYardImg,
            sun: castleSunImg,
            doorOpen: castleDoorOpenImg,
            door: castleDoorImg,
            doorway: castleDoorwayImg,
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
