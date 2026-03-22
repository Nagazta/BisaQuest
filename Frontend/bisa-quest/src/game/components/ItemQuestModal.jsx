// ─────────────────────────────────────────────────────────────────────────────
//  ItemQuestModal.jsx
// ─────────────────────────────────────────────────────────────────────────────
import React, { useState, useCallback } from "react";
import { ITEM_IMAGE_MAP } from "../dragDropConstants";
import AssetManifest from "../../services/AssetManifest";
import "./ItemQuestModal.css";

import { buildQuestDialogue } from "./questHelpers";
import SceneDragGame from "./minigames/SceneDragGame";
import WashAndMopGame from "./minigames/WashAndMopGame";
import SceneDragDropGame from "./minigames/SceneDragDropGame";
import WipePlayerGame from "./minigames/WipePlayerGame";
import AlphabeticalSortGame from "./minigames/AlphabeticalSortGame";
import PackBagGame from "./minigames/PackBagGame";
import AdjustClockGame from "./minigames/AdjustClockGame";
import CalendarView from "./minigames/CalendarView";
import ScheduleEventGame from "./minigames/ScheduleEventGame";
import WashDishesGame from "./minigames/WashDishesGame";
import DragToZoneGame from "./minigames/DragToZoneGame";
import LightLampGame from "./minigames/LightLampGame";
import FanSpeedGame from "./minigames/FanSpeedGame";
import CookingGame from "./minigames/CookingGame";
import WaterBarrelGame from "./minigames/WaterBarrelGame";
import ToggleLightGame from "./minigames/ToggleLightGame";
import IroningGame from "./minigames/IroningGame";
import WateringPlantGame from "./minigames/WateringPlantGame";
import HammerGame from "./minigames/HammerGame";
import SofaRepairGame from "./minigames/SofaRepairGame";
import MultiWashGame from "./minigames/MultiWashGame";
import PolishAndSweepGame from "./minigames/PolishAndSweepGame";






const ITEM_QUESTS = {
    // ── Silhig — scene drag game ───────────────────────────────────────────────
    silhig: {
        mechanic: "scene_drag",
        background: "dirty",
        backgroundClean: "clean",
        instructionBisaya: "I-drag ang silhig sa mga hugaw sa salog!",
        instructionEnglish: "Drag the broom to sweep the dirt on the floor!",
        draggable: {
            id: "broom_item",
            label: "Silhig",
            imageKey: "walis",
            startX: 20,
            startY: 55,
        },
        dirtSpots: [
            { id: "paper_1", x: 28, y: 72, w: 7, h: 6 },
            { id: "paper_2", x: 34, y: 88, w: 7, h: 6 },
            { id: "paper_3", x: 44, y: 69, w: 6, h: 5 },
            { id: "paper_4", x: 52, y: 63, w: 5, h: 5 },
            { id: "paper_5", x: 55, y: 63, w: 5, h: 5 },
            { id: "chips", x: 44, y: 84, w: 10, h: 8 },
            { id: "candy_1", x: 58, y: 80, w: 7, h: 6 },
            { id: "candy_2", x: 68, y: 86, w: 8, h: 6 },
            { id: "candy_3", x: 80, y: 65, w: 6, h: 5 },
            { id: "can", x: 73, y: 73, w: 6, h: 6 },
            { id: "crumbs_1", x: 39, y: 78, w: 6, h: 5 },
            { id: "crumbs_2", x: 62, y: 84, w: 8, h: 6 },
            { id: "paper_6", x: 84, y: 84, w: 8, h: 6 },
        ],
    },
    mop: {
        mechanic: "scene_drag",
        background: "spill",
        backgroundClean: "clean",
        instructionBisaya: "I-mop ang mga tubig-tubig sa salog!",
        instructionEnglish: "Mop up the water spills on the floor!",
        draggable: {
            id: "mop_item",
            label: "Mop",
            imageKey: "mop",
            startX: 20,
            startY: 55,
        },
        dirtSpots: [
            { id: "spill_1", x: 30, y: 85, w: 10, h: 8 },
            { id: "spill_2", x: 45, y: 88, w: 12, h: 8 },
            { id: "spill_3", x: 60, y: 85, w: 12, h: 8 },
            { id: "spill_4", x: 75, y: 80, w: 10, h: 8 },
            { id: "spill_5", x: 40, y: 75, w: 9, h: 6 },
            { id: "spill_6", x: 52, y: 77, w: 9, h: 6 },
            { id: "spill_7", x: 65, y: 71, w: 8, h: 6 },
            { id: "spill_8", x: 35, y: 65, w: 8, h: 6 },
            { id: "spill_9", x: 48, y: 64, w: 8, h: 6 },
        ],
    },

    // ── Planggana ──────────────────────────────────────────────────────────────
    planggana: {
        mechanic: "multi_wash",
        instructionBisaya: "Hugasi ang banig, trapo, ug paspas sa planggana!",
        instructionEnglish: "Wash the rug, rag, and dust feather in the basin!",
        washItems: ["alfombra", "rag", "dust_feather"],
        basinImage: "plangganaWater",
    },

    baldi: {
        mechanic: "wash_and_mop",
        instructionBisaya: "Hugasi ang mop sa baldi ug limpyohi ang salog!",
        instructionEnglish: "Wash the mop in the bucket and clean the floor!",
        washStage: {
            background: "house",
            basinImage: "bucket",
            basinX: 50, basinY: 60, basinW: 24, basinH: 15,
            mopStartX: 20, mopStartY: 40,
        },
        mopStage: {
            background: "spill",
            dirtSpots: [
                { id: "floor_1", x: 30, y: 85, w: 10, h: 8 },
                { id: "floor_2", x: 45, y: 88, w: 12, h: 8 },
                { id: "floor_3", x: 60, y: 85, w: 12, h: 8 },
            ],
        },
    },

    salog: {
        mechanic: "polish_and_sweep",
        instructionBisaya: "Lampasohi ang salog ug silhigi ang abog!",
        instructionEnglish: "Polish the floor and sweep away the dust!",
    },

    doormat: {
        mechanic: "wipe",
        instructionBisaya: "Pahiri ang imong sapatos sa talamakan!",
        instructionEnglish: "Wipe your shoes on the doormat!",
        draggable: {
            id: "shoes_item",
            label: "Sapatos",
            imageKey: "shoes",
            startX: 40,
            startY: 40,
        },
        wipeStage: {
            label: "Shoe Wiping",
            hideBaseBackground: true,
            dirtyImage: AssetManifest.village.scenarios.house,
            cleanImage: AssetManifest.village.scenarios.house,
            dirtSpots: [
                { id: "dirt_1", x: 6, y: 84, w: 4, h: 4 },
                { id: "dirt_2", x: 10, y: 86, w: 4, h: 4 },
                { id: "dirt_3", x: 4, y: 88, w: 4, h: 4 },
            ],
            successLabel: "Limpyo Na!",
        },
    },

    toalya: {
        mechanic: "wipe",
        instructionBisaya: "Trapohi ang singot ni Ligaya gamit ang toalya!",
        instructionEnglish: "Wipe Ligaya's sweat using the towel!",
        draggable: {
            id: "towel_item",
            label: "Toalya",
            imageKey: "towel",
            startX: 20,
            startY: 50,
        },
        wipeStage: {
            label: "Wipe the Sweat",
            dirtyImage: AssetManifest.village.npcs.ligaya_sweating,
            cleanImage: AssetManifest.village.npcs.ligaya,
            successLabel: "Presko Na!",
            successBisaya: "Presko na siya! Maayo kaayo! 🎉",
            successEnglish: "She's fresh now! Well done! 🎉",
            remainingBisaya: (count) => `${count} ka singot pa ang nahibilin! Pahiri na!`,
            remainingEnglish: (count) => `${count} more sweat spots to wipe!`,
            noDust: true,
            isSweat: true,
            dirtSpots: [
                { id: "sweat_1", x: 45, y: 35, w: 10, h: 10 },
                { id: "sweat_2", x: 55, y: 40, w: 10, h: 10 },
                { id: "sweat_3", x: 40, y: 45, w: 10, h: 10 },
                { id: "sweat_4", x: 50, y: 55, w: 10, h: 10 },
                { id: "sweat_5", x: 48, y: 25, w: 10, h: 10 },
            ],
        },
    },
    bulak: {
        mechanic: "watering_plant",
        instructionBisaya: "Bisbisi ang tanum gamit ang regadera!",
        instructionEnglish: "Water the plant using the watering can!",
        successBisaya: "Presko na ang tanum! Maayo kaayo! 🎉",
        successEnglish: "The plant is fresh now! Well done! 🎉",
        wateringCan: {
            id: "watering_can_item",
            label: "Watering Can",
            imageKey: "watering_can",
            startX: 20,
            startY: 70,
        },
        plantZone: { x: 13.5, y: 26.5, w: 10, h: 10 }, // Zone over the plant
    },
    sopa: {
        mechanic: "sofa_repair",
        instructionBisaya: "Ibutang una ang kahoy, dayon ang lansang, ug i-martelyo kini!",
        instructionEnglish: "Place the wood first, then the nails, and hammer them down!",
        repairStage: {
            background: AssetManifest.village.scenarios.houseSofaGuba,
            successBisaya: "Nindot na usab ang sopa! Maayo kaayo! 🎉",
            successEnglish: "The sofa looks good as new! Well done! 🎉",
            repairSpots: [
                { id: "s_leg_l", x: 30, y: 70 },
                { id: "s_leg_r", x: 70, y: 70 },
                { id: "s_cushion", x: 50, y: 55 },
            ],
        },
    },


    kurtina: {
        mechanic: "wipe",
        instructionBisaya: "Limpyohi ang kurtina gamit ang paspas!",
        instructionEnglish: "Clean the curtain using the dust feather!",
        draggable: {
            id: "paspas_item",
            label: "Paspas",
            imageKey: "paspas",
            startX: 20, startY: 60,
        },
        wipeStage: {
            label: "Clean the Curtain",
            hideBaseBackground: true,
            dirtyImage: AssetManifest.village.scenarios.houseWindow,
            cleanImage: AssetManifest.village.scenarios.houseWindow,
            successLabel: "Limpyo Na'ng Kurtina!",
            successBisaya: "Limpyo na ang kurtina! Maayo kaayo! 🎉",
            successEnglish: "The curtain is clean! Well done! 🎉",
            remainingBisaya: (count) => `${count} ka dapit pa ang hugaw!`,
            remainingEnglish: (count) => `${count} more spots to clean!`,
            dirtSpots: [
                { id: "curtain_l1", x: 37, y: 30, w: 5, h: 18 },
                { id: "curtain_l2", x: 39, y: 50, w: 4, h: 10 },
                { id: "curtain_r1", x: 60, y: 30, w: 5, h: 18 },
                { id: "curtain_r2", x: 62, y: 50, w: 4, h: 10 },
            ],

        },

    },

    bintana: {
        mechanic: "wipe",
        instructionBisaya: "Pahiran ang bintana aron malimpyo!",
        instructionEnglish: "Wipe the window to clean it!",
        draggable: {
            id: "rag_item",
            label: "Trapo",
            imageKey: "rag",
            startX: 20, startY: 60,
        },
        wipeStage: {
            label: "Wipe the Window",
            hideBaseBackground: true,
            dirtyImage: AssetManifest.village.scenarios.houseWindow,
            cleanImage: AssetManifest.village.scenarios.houseWindow,
            successLabel: "Hayag Na!",
            successBisaya: "Hayag na ang bintana! Maayo kaayo! 🎉",
            successEnglish: "The window is bright now! Well done! 🎉",
            remainingBisaya: (count) => `${count} ka spots pa ang hugaw!`,
            remainingEnglish: (count) => `${count} more spots to wipe!`,
            dirtSpots: [
                { id: "win_1", x: 32, y: 35, w: 6, h: 20 }, // Left Shutter
                { id: "win_2", x: 65, y: 35, w: 6, h: 20 }, // Right Shutter
                { id: "win_3", x: 50, y: 62, w: 12, h: 5 }, // Bottom Sill
            ],

        },

    },
    atop: {
        mechanic: "hammer_repair",
        instructionBisaya: "Ayoha ang atop gamit ang martelyo ug lansang!",
        instructionEnglish: "Fix the ceiling using the hammer and nails!",
        repairStage: {
            background: AssetManifest.village.scenarios.houseCeiling,
            successBisaya: "Naayo na ang atop! Dili na kini motulo. Maayo kaayo! 🎉",
            successEnglish: "The ceiling is fixed! It won't leak anymore. Well done! 🎉",
            repairSpots: [
                { id: "leak_1", x: 35, y: 30 },
                { id: "leak_2", x: 45, y: 25 },
                { id: "leak_3", x: 55, y: 30 },
                { id: "leak_4", x: 40, y: 45 },
                { id: "leak_5", x: 50, y: 40 },
                { id: "leak_6", x: 60, y: 45 },
            ],
        },
    },



    bag: {
        mechanic: "pack_bag",
        bagImage: AssetManifest.village.scenarios.bagScene,
        bayongImage: AssetManifest.village.items.bag,
        instructionBisaya: "I-hipos ang mga gamit sa bag!",
        instructionEnglish: "Pack the items into the bag!",
        draggableItems: [
            { id: "pack_book", imageKey: "book", startX: 15, startY: 80 },
            { id: "pack_towel", imageKey: "towel", startX: 85, startY: 80 },
            { id: "pack_shirt", imageKey: "baro", startX: 15, startY: 20 },
        ],
        bagZone: { x: 25, y: 20, w: 50, h: 60 },
    },

    lababo: {
        mechanic: "wash_dishes",
        instructionBisaya: "Hugasan nato ang mga hugaw nga plato ug uban pa!",
        instructionEnglish: "Let's wash the dirty dishes and other things!",
    },

    // ── LIVING ROOM — drag-to-zone games ──────────────────────────────────────
    estante_wall: {
        mechanic: "drag_to_zone",
        background: AssetManifest.village.scenarios.house,
        instructionBisaya: "Ibutang ang mga gamit sa estante!",
        instructionEnglish: "Put the items on the shelf!",
        successText: "Awesome!",
        draggableItems: [
            { id: "dz_book", imageKey: "book", label: "Libro", startX: 20, startY: 80 },
            { id: "dz_plant", imageKey: "potted_plant", label: "Tanum", startX: 75, startY: 82 },
        ],
        dropZone: { x: 12, y: 28, w: 20, h: 14, emoji: "📚", label: "Estante" },
    },
    aparador: {
        mechanic: "drag_to_zone",
        background: AssetManifest.village.scenarios.house,
        instructionBisaya: "Ibutang ang sinina sa aparador!",
        instructionEnglish: "Put the clothes in the cabinet!",
        successText: "Napuno na ang Aparador!",
        draggableItems: [
            { id: "dz_shirt", imageKey: "baro", label: "Baro", startX: 15, startY: 80 },
            { id: "dz_pants", imageKey: "sinina", label: "Sinina", startX: 50, startY: 82 },
            { id: "dz_dress", imageKey: "dress", label: "Dress", startX: 85, startY: 78 },
        ],
        dropZone: { x: 75, y: 52, w: 14, h: 20, emoji: "🗄️", label: "Aparador" },
    },
    lamesa: {
        mechanic: "drag_to_zone",
        background: AssetManifest.village.scenarios.house,
        instructionBisaya: "Andama ang pagkaon sa lamesa!",
        instructionEnglish: "Set the table with food and dishes!",
        successText: "Andam na ang Lamesa!",
        draggableItems: [
            { id: "dz_plate", imageKey: "plato", label: "Plato", startX: 15, startY: 80 },
            { id: "dz_cup", imageKey: "tasa", label: "Tasa", startX: 50, startY: 82 },
            { id: "dz_spoon", imageKey: "plate", label: "Kutsara", startX: 85, startY: 78 },
        ],
        dropZone: { x: 48, y: 56, w: 20, h: 14, emoji: "🍽️", label: "Lamesa" },
    },
    alfombra: {
        mechanic: "wash_and_mop",
        instructionBisaya: "Hugasi ang banig sa planggana!",
        instructionEnglish: "Wash the rug in the basin!",
        washStage: {
            background: "houseRugGuba",
            basinImage: "plangganaWater",
            basinX: 50, basinY: 60, basinW: 24, basinH: 15,
            mopStartX: 20, mopStartY: 40,
            toolKey: "alfombra",
            washOnly: true,
        },
        mopStage: {
            background: "houseRugGuba",
            dirtSpots: [],
        },
    },
    trapo: {
        mechanic: "wash_and_mop",
        instructionBisaya: "Hugasi ang trapo ug limpyohi ang salog!",
        instructionEnglish: "Wash the door mat and clean the floor!",
        washStage: {
            background: "none",
            basinImage: "plangganaWater",
            basinX: 50, basinY: 60, basinW: 24, basinH: 15,
            mopStartX: 20, mopStartY: 40,
        },
        mopStage: {
            background: "spill",
            dirtSpots: [
                { id: "mat_1", x: 30, y: 78, w: 10, h: 7 },
                { id: "mat_2", x: 45, y: 82, w: 12, h: 8 },
                { id: "mat_3", x: 60, y: 78, w: 12, h: 8 },
                { id: "mat_4", x: 38, y: 68, w: 8, h: 6 },
                { id: "mat_5", x: 55, y: 72, w: 8, h: 6 },
            ],
        },
    },
    litrato: {
        mechanic: "wipe",
        instructionBisaya: "Limpyohi ang litrato gamit ang trapo!",
        instructionEnglish: "Clean the picture frame using the rag!",
        draggable: {
            id: "rag_item",
            label: "Trapo",
            imageKey: "rag",
            startX: 20, startY: 60,
        },
        wipeStage: {
            label: "Wipe the Dust",
            hideBaseBackground: true,
            dirtyImage: AssetManifest.village.scenarios.pictureFrame,
            cleanImage: AssetManifest.village.scenarios.pictureFrame,
            successLabel: "Limpyo Na!",
            successBisaya: "Limpyo na ang litrato! Maayo kaayo! 🎉",
            successEnglish: "The picture frame is clean! Well done! 🎉",
            remainingBisaya: (count) => `${count} ka abog pa ang nahibilin! Pahiri na!`,
            remainingEnglish: (count) => `${count} more dust spots to wipe!`,
            dirtSpots: [
                { id: "dust_1", x: 62, y: 48, w: 6, h: 4 },
                { id: "dust_2", x: 68, y: 52, w: 6, h: 4 },
                { id: "dust_3", x: 64, y: 55, w: 6, h: 4 },
                { id: "dust_4", x: 58, y: 51, w: 6, h: 4 },
                { id: "dust_5", x: 61, y: 53, w: 5, h: 3 },
                { id: "dust_6", x: 66, y: 49, w: 6, h: 4 },
                { id: "dust_7", x: 60, y: 56, w: 6, h: 4 },
                { id: "dust_8", x: 70, y: 50, w: 6, h: 4 },
            ],
        },
    },

    // ── KITCHEN — drag-to-zone games ──────────────────────────────────────────
    dapogan: {
        mechanic: "cooking_game",
        instructionBisaya: "Magluto ta sa dapogan!",
        instructionEnglish: "Let's cook on the stove!",
    },
    drumin: {
        mechanic: "water_barrel_game",
        instructionBisaya: "Punoa ang drumin og tubig!",
        instructionEnglish: "Fill the barrel with water!",
    },
    lamesa_kitchen: {
        mechanic: "drag_to_zone",
        background: AssetManifest.village.scenarios.kitchen,
        instructionBisaya: "Andama ang plato sa lamesa!",
        instructionEnglish: "Prepare the food on the plate!",
        successText: "Andam na ang Pagkaon!",
        draggableItems: [
            { id: "dz_kplate", imageKey: "plato", label: "Plato", startX: 80, startY: 78 },
            { id: "dz_kcup", imageKey: "tasa", label: "Tasa", startX: 85, startY: 40 },
            { id: "dz_kladle", imageKey: "sandok", label: "Sandok", startX: 12, startY: 80 },
        ],
        dropZone: { x: 18, y: 50, w: 28, h: 22, emoji: "🍽️", label: "Lamesa" },
    },
    estante_wala: {
        mechanic: "drag_to_zone",
        background: AssetManifest.village.scenarios.kitchen,
        instructionBisaya: "Ibutang ang mga plato sa estante!",
        instructionEnglish: "Put the plates on the shelves!",
        successText: "Napuno na ang Estante!",
        draggableItems: [
            { id: "dz_eplate", imageKey: "plato", label: "Plato", startX: 15, startY: 78 },
            { id: "dz_ecup", imageKey: "tasa", label: "Tasa", startX: 50, startY: 82 },
            { id: "dz_epot", imageKey: "kaldero", label: "Kaldero", startX: 85, startY: 75 },
        ],
        dropZone: { x: 23, y: 25, w: 22, h: 20, emoji: "🍽️", label: "Estante" },
    },
    basket_kitchen: {
        mechanic: "drag_to_zone",
        background: AssetManifest.village.scenarios.basket,
        instructionBisaya: "Ibutang ang mga prutas ug gulay sa bukag!",
        instructionEnglish: "Put the fruits and vegetables in the basket!",
        successText: "Napuno na ang Bukag!",
        draggableItems: [
            { id: "dz_carrot", imageKey: "carrot", label: "Karot", startX: 15, startY: 80 },
            { id: "dz_potato", imageKey: "potato", label: "Patatas", startX: 50, startY: 82 },
            { id: "dz_onion", imageKey: "onion", label: "Sibuyas", startX: 85, startY: 78 },
        ],
        dropZone: { x: 50, y: 50, w: 40, h: 35, emoji: "🧺", label: "Bukag" },
    },
    estante_tuo: {
        mechanic: "drag_to_zone",
        background: AssetManifest.village.scenarios.kitchen,
        instructionBisaya: "Ibutang ang mga dako nga gamit sa dakong estante!",
        instructionEnglish: "Put the big items on the large shelf!",
        successText: "Napuno na ang Estante!",
        draggableItems: [
            { id: "dz_tpot", imageKey: "kaldero", label: "Kaldero", startX: 15, startY: 78 },
            { id: "dz_tpan", imageKey: "kawali", label: "Kawali", startX: 45, startY: 82 },
        ],
        dropZone: { x: 78, y: 22, w: 20, h: 38, emoji: "🗄️", label: "Estante" },
    },

    // ── BEDROOM — drag-to-zone games ──────────────────────────────────────────
    katre: {
        mechanic: "drag_to_zone",
        background: AssetManifest.village.scenarios.bedroom,
        instructionBisaya: "Ayoha ang katre! Ibutang ang unan ug habol!",
        instructionEnglish: "Fix the bed! Place the pillow and blanket!",
        successText: "Limpyo na ang Katre!",
        draggableItems: [
            { id: "dz_pillow", imageKey: "pillow", label: "Unan", startX: 15, startY: 80 },
            { id: "dz_habol", imageKey: "habol", label: "Habol", startX: 75, startY: 82 },
        ],
        dropZone: { x: 22, y: 52, w: 36, h: 18, emoji: "🛏️", label: "Katre" },
    },
    drawer_bedroom: {
        mechanic: "drag_to_zone",
        background: AssetManifest.village.scenarios.bedroom,
        instructionBisaya: "Ibutang ang sinina sa kahon!",
        instructionEnglish: "Put the clothes in the drawer!",
        successText: "Napuno na ang Kahon!",
        draggableItems: [
            { id: "dz_dshirt", imageKey: "baro", label: "Baro", startX: 50, startY: 82 },
            { id: "dz_dpants", imageKey: "sinina", label: "Sinina", startX: 80, startY: 78 },
        ],
        dropZone: { x: 15, y: 58, w: 12, h: 20, emoji: "🗄️", label: "Kahon" },
    },
    aparador_bedroom: {
        mechanic: "drag_to_zone",
        background: AssetManifest.village.scenarios.bedroom,
        instructionBisaya: "Ibutang ang sinina sa aparador!",
        instructionEnglish: "Put the clothes in the cabinet!",
        successText: "Napuno na ang Aparador!",
        draggableItems: [
            { id: "dz_adress", imageKey: "dress", label: "Dress", startX: 15, startY: 80 },
            { id: "dz_atowel", imageKey: "towel", label: "Tuwalya", startX: 50, startY: 82 },
            { id: "dz_ashoes", imageKey: "shoes", label: "Sapatos", startX: 85, startY: 78 },
        ],
        dropZone: { x: 68, y: 50, w: 14, h: 24, emoji: "🗄️", label: "Aparador" },
    },
    bentilador_bedroom: {
        mechanic: "fan_speed",
        instructionBisaya: "Pilia ang husto nga speed sa bentilador!",
        instructionEnglish: "Choose the correct fan speed!",
        rounds: [
            { target: 3, bisaya: "Pindota ang numero 3 — Kusog!", english: "Press number 3 — High speed!" },
            { target: 1, bisaya: "Pindota ang numero 1 — Hinay!", english: "Press number 1 — Low speed!" },
            { target: 0, bisaya: "Patya ang bentilador!", english: "Turn off the fan!" },
        ],
    },
    bukag_bedroom: {
        mechanic: "drag_to_zone",
        background: AssetManifest.village.scenarios.bedroom,
        instructionBisaya: "I-butang ang hugaw nga sinina sa bukag!",
        instructionEnglish: "Put the dirty clothes in the laundry basket!",
        successText: "Napuno na ang Bukag!",
        draggableItems: [
            { id: "dz_lshirt", imageKey: "baro", label: "Baro", startX: 30, startY: 40 },
            { id: "dz_lpants", imageKey: "sinina", label: "Sinina", startX: 55, startY: 35 },
            { id: "dz_ltowel", imageKey: "towel", label: "Tuwalya", startX: 40, startY: 78 },
        ],
        dropZone: { x: 80, y: 62, w: 16, h: 24, emoji: "🧺", label: "Bukag" },
    },
    paspas: {
        mechanic: "wipe",
        instructionBisaya: "Limpyohi ang mga souk2 sa kwarto!",
        instructionEnglish: "Clean the corners of the room!",
        draggable: {
            id: "paspas_item",
            label: "Paspas",
            imageKey: "paspas",
            startX: 20, startY: 60,
        },
        wipeStage: {
            label: "Clean the Corners (Souk2)",
            hideBaseBackground: true,
            dirtyImage: AssetManifest.village.scenarios.bedroom,
            cleanImage: AssetManifest.village.scenarios.bedroom,
            successLabel: "Limpyo Na'ng Souk2!",
            successBisaya: "Limpyo na ang mga souk2! Maayo kaayo! 🎉",
            successEnglish: "The corners are clean! Well done! 🎉",
            remainingBisaya: (count) => `${count} ka souk2 pa ang hugaw!`,
            remainingEnglish: (count) => `${count} more corners to clean!`,
            dirtSpots: [
                { id: "souk_tl", x: 4, y: 15, w: 12, h: 12 },   // Top Left Corner
                { id: "souk_tr", x: 88, y: 15, w: 10, h: 12 },  // Top Right Corner
                { id: "souk_bl", x: 5, y: 80, w: 15, h: 15 },   // Bottom Left Corner
                { id: "souk_br", x: 85, y: 80, w: 12, h: 15 },  // Bottom Right Corner
                { id: "souk_under", x: 45, y: 75, w: 15, h: 10 }, // Area near floor/bed corner
            ],
        },
    },
    bintana_bedroom: {
        mechanic: "wipe",
        instructionBisaya: "Pahiran ang bintana aron malimpyo!",
        instructionEnglish: "Wipe the window to clean it!",
        draggable: {
            id: "rag_item",
            label: "Trapo",
            imageKey: "rag",
            startX: 20, startY: 60,
        },
        wipeStage: {
            label: "Wipe the Window",
            hideBaseBackground: true,
            dirtyImage: AssetManifest.village.scenarios.bedroom,
            cleanImage: AssetManifest.village.scenarios.bedroom,
            successLabel: "Hayag Na!",
            successBisaya: "Hayag na ang bintana! Maayo kaayo! 🎉",
            successEnglish: "The window is bright now! Well done! 🎉",
            remainingBisaya: (count) => `${count} ka spots pa ang nahibilin!`,
            remainingEnglish: (count) => `${count} more spots to wipe!`,
            dirtSpots: [
                { id: "spot_1", x: 48, y: 35, w: 10, h: 18 }, // Window pane area
                { id: "spot_2", x: 52, y: 40, w: 6, h: 10 },
                { id: "spot_3", x: 45, y: 45, w: 8, h: 12 },
                { id: "spot_4", x: 55, y: 30, w: 8, h: 12 },
                { id: "spot_5", x: 50, y: 25, w: 10, h: 15 },
            ],
        },
    },

    suga_bedroom: {
        mechanic: "toggle_light",
        instructionBisaya: "I-test ang suga sa kisame!",
        instructionEnglish: "Test the ceiling light!",
    },
    plantsa_bedroom: {
        mechanic: "ironing_game",
        instructionBisaya: "Plantsaha ang mga sinina aron mahapsay!",
        instructionEnglish: "Iron the clothes to make them neat!",
    },
    relo: {
        mechanic: "adjust_clock",
        targetTimes: [
            { hour: 3, minute: 0, labelBisaya: "Alas tres", labelEnglish: "Three o'clock" },
            { hour: 7, minute: 30, labelBisaya: "Alas siyete y medya", labelEnglish: "Half past seven" },
            { hour: 12, minute: 0, labelBisaya: "Udto / Alas dose", labelEnglish: "Twelve o'clock" },
            { hour: 6, minute: 15, labelBisaya: "Alas says y kwarto", labelEnglish: "Quarter past six" },
            { hour: 9, minute: 45, labelBisaya: "Kwarto para alas dies", labelEnglish: "Quarter to ten" },
            { hour: 1, minute: 0, labelBisaya: "Ala una", labelEnglish: "One o'clock" },
        ],
    },

    kalendaryo: {
        mechanic: "schedule_event",
    },

    kalendaryo_bedroom: {
        mechanic: "schedule_event",
    },


    lampara: {
        mechanic: "light_lamp",
        instructionBisaya: "Sindiri ang lampara gamit ang posporo!",
        instructionEnglish: "Light the lamp using the match!",
    },

    bookshelf: {
        mechanic: "alphabetical_sort",
        background: AssetManifest.village.scenarios.bookshelf,
        instructionBisaya: "I-drag ang mga libro pinasubay sa alpabeto (A, B, C, D)!",
        instructionEnglish: "Drag the books in alphabetical order (A, B, C, D)!",
        dropZones: [
            { id: "slot_A", x: 45.5, y: 25, w: 5, h: 14 },
            { id: "slot_B", x: 50.5, y: 25, w: 5, h: 14 },
            { id: "slot_C", x: 55.5, y: 25, w: 5, h: 14 },
            { id: "slot_D", x: 60.5, y: 25, w: 5, h: 14 },
        ],
        draggableItems: [
            { id: "book_A", letter: "A", startX: 20, startY: 80, correctZone: "slot_A" },
            { id: "book_B", letter: "B", startX: 80, startY: 82, correctZone: "slot_B" },
            { id: "book_C", letter: "C", startX: 35, startY: 78, correctZone: "slot_C" },
            { id: "book_D", letter: "D", startX: 65, startY: 85, correctZone: "slot_D" },
        ],
    },

    book: {
        mechanic: "scene_drag_drop",
        background: AssetManifest.village.scenarios.house,
        instructionBisaya: "I-hipos ang mga nakakalat nga libro sa estante!",
        instructionEnglish: "Organize the scattered books onto the shelf!",
        dropZones: [
            { id: "bookshelf", x: 80, y: 30, w: 18, h: 55 },
        ],
        draggableItems: [
            { id: "book_1", imageKey: "book", startX: 30, startY: 85, correctZone: "bookshelf" },
            { id: "book_2", imageKey: "book", startX: 45, startY: 88, correctZone: "bookshelf" },
            { id: "book_3", imageKey: "book", startX: 60, startY: 85, correctZone: "bookshelf" },
            { id: "book_4", imageKey: "book", startX: 75, startY: 80, correctZone: "bookshelf" },
            { id: "book_5", imageKey: "book", startX: 35, startY: 70, correctZone: "bookshelf" },
        ],
    },

    _default: {
        mechanic: "item_association",
        instructionBisaya: "Pilia ang husto nga tubag!",
        instructionEnglish: "Choose the correct answer!",
        items: [
            { id: "q_broom", label: "Silhig", imageKey: "walis", isCorrect: true },
            { id: "q_pot", label: "Kaldero", imageKey: "kaldero", isCorrect: false },
            { id: "q_pillow", label: "Unan", imageKey: "pillow", isCorrect: false },
            { id: "q_towel", label: "Toalya", imageKey: "towel", isCorrect: false },
        ],
    },
};

// ── StandardModalGame ─────────────────────────────────────────────────────────

const StandardModalGame = ({ quest, item, npcName, npcImage, onClose, onComplete }) => {
    // ── Standard modal for drag_drop / item_association ───────────────────────
    const dialogue = buildQuestDialogue(quest, item);

    const [stage, setStage] = useState("intro");
    const [introStep, setIntroStep] = useState(0);
    const [selectedId, setSelectedId] = useState(null);
    const [draggedId, setDraggedId] = useState(null);
    const [shake, setShake] = useState(null);
    const [dropHover, setDropHover] = useState(null);
    const [placed, setPlaced] = useState({});

    const handleIntroNext = () => {
        if (introStep < dialogue.length - 1) setIntroStep(s => s + 1);
        else setStage("playing");
    };

    const handleIAClick = useCallback((clickedItem) => {
        if (stage !== "playing") return;
        setSelectedId(clickedItem.id);
        if (clickedItem.isCorrect) {
            setStage("success");
        } else {
            setStage("fail");
            setTimeout(() => { setStage("playing"); setSelectedId(null); }, 1000);
        }
    }, [stage]);

    const handleDragStart = (card, e) => {
        if (placed[card.id]) return;
        e.dataTransfer.setData("cardId", card.id);
        setDraggedId(card.id);
    };

    const handleDrop = useCallback((zoneId, e) => {
        e.preventDefault();
        setDropHover(null);
        const cardId = e.dataTransfer.getData("cardId");
        setDraggedId(null);
        const card = quest.items.find(c => c.id === cardId);
        if (!card) return;
        if (card.isCorrect && card.correctZone === zoneId) {
            setPlaced(p => {
                const nextPlaced = { ...p, [cardId]: zoneId };
                const requiredItems = quest.items.filter(c => c.isCorrect);
                if (requiredItems.every(c => nextPlaced[c.id] === c.correctZone)) setStage("success");
                return nextPlaced;
            });
        } else {
            setShake(cardId);
            setStage("fail");
            setTimeout(() => { setShake(null); setStage("playing"); }, 900);
        }
    }, [quest]);

    const dialogueText = (() => {
        if (stage === "intro") return dialogue[introStep];
        if (stage === "success") return { bisayaText: "Tama! Maayo kaayo! 🎉", englishText: "Correct! Well done! 🎉" };
        if (stage === "fail") return { bisayaText: "Sayop! Sulayi pag-usab!", englishText: "Wrong! Try again!" };
        return { bisayaText: quest.instructionBisaya, englishText: quest.instructionEnglish };
    })();

    return (
        <div className="iqm-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className="iqm-modal">
                <button className="iqm-close" onClick={onClose}>✕</button>
                <div className="iqm-header">
                    <span className="iqm-header-bisaya">{item.labelBisaya}</span>
                    <span className="iqm-header-english">{item.labelEnglish}</span>
                    <span className={`iqm-mechanic-badge iqm-mechanic-badge--${quest.mechanic}`}>
                        {quest.mechanic === "drag_drop" ? "Drag & Drop" : "Choose the Answer"}
                    </span>
                </div>
                <div className="iqm-game-area">
                    {stage !== "intro" && quest.mechanic === "item_association" && (
                        <div className="iqm-ia-grid">
                            {quest.items.map(qItem => {
                                const img = ITEM_IMAGE_MAP[qItem.imageKey] || null;
                                const isSelected = selectedId === qItem.id;
                                const stateClass = isSelected
                                    ? stage === "success" ? "iqm-ia-card--correct" : "iqm-ia-card--wrong"
                                    : "";
                                return (
                                    <button key={qItem.id} className={`iqm-ia-card ${stateClass}`}
                                        onClick={() => handleIAClick(qItem)} disabled={stage !== "playing"}>
                                        {img ? <img src={img} alt={qItem.label} className="iqm-ia-img" draggable={false} /> : <span className="iqm-ia-emoji">🖼️</span>}
                                        <span className="iqm-ia-label">{qItem.label}</span>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                    {stage !== "intro" && quest.mechanic === "drag_drop" && (
                        <div className="iqm-dd-area">
                            <div className="iqm-dd-cards">
                                {quest.items.map(card => {
                                    const img = ITEM_IMAGE_MAP[card.imageKey] || null;
                                    const isPlaced = !!placed[card.id];
                                    return (
                                        <div key={card.id}
                                            className={["iqm-dd-card", isPlaced ? "iqm-dd-card--placed" : "", shake === card.id ? "iqm-dd-card--shake" : "", draggedId === card.id ? "iqm-dd-card--dragging" : ""].filter(Boolean).join(" ")}
                                            draggable={!isPlaced}
                                            onDragStart={(e) => handleDragStart(card, e)}
                                            onDragEnd={() => setDraggedId(null)}
                                        >
                                            {img ? <img src={img} alt={card.label} className="iqm-dd-card-img" draggable={false} /> : <span className="iqm-dd-card-emoji">🖼️</span>}
                                            <span className="iqm-dd-card-label">{card.label}</span>
                                        </div>
                                    );
                                })}
                            </div>
                            <div className="iqm-dd-zones">
                                {quest.zones.map(zone => {
                                    const placedCards = quest.items.filter(c => placed[c.id] === zone.id);
                                    return (
                                        <div key={zone.id}
                                            className={["iqm-dd-zone", dropHover === zone.id ? "iqm-dd-zone--hover" : "", placedCards.length ? "iqm-dd-zone--filled" : ""].filter(Boolean).join(" ")}
                                            onDragOver={(e) => { e.preventDefault(); setDropHover(zone.id); }}
                                            onDragLeave={() => setDropHover(null)}
                                            onDrop={(e) => handleDrop(zone.id, e)}
                                        >
                                            <span className="iqm-dd-zone-label">{zone.label}</span>
                                            {placedCards.map(c => {
                                                const img = ITEM_IMAGE_MAP[c.imageKey] || null;
                                                return img
                                                    ? <img key={c.id} src={img} alt={c.label} className="iqm-dd-zone-img" draggable={false} />
                                                    : <span key={c.id} className="iqm-dd-chip">{c.label}</span>;
                                            })}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                    {stage === "intro" && (
                        <div className="iqm-intro-placeholder">
                            <div className={`iqm-intro-icon iqm-intro-icon--${quest.mechanic}`}>
                                {quest.mechanic === "drag_drop" ? "↕" : "?"}
                            </div>
                        </div>
                    )}
                </div>
                <div className="iqm-dialogue-row">
                    <img src={npcImage} alt={npcName} className="iqm-npc-img" draggable={false} />
                    <div className="iqm-dialogue-bubble">
                        <div className="iqm-dialogue-speaker">{npcName}</div>
                        <div className="iqm-dialogue-text">
                            <span className="iqm-dialogue-bisaya">{dialogueText.bisayaText}</span>
                            <span className="iqm-dialogue-english">{dialogueText.englishText}</span>
                        </div>
                    </div>
                    {stage === "intro" && <button className="iqm-next-btn" onClick={handleIntroNext}>▶</button>}
                    {stage === "success" && <button className="iqm-next-btn" onClick={() => onComplete(item)}>✓</button>}
                </div>
            </div>
        </div>
    );
};

// ── ItemQuestModal — router ───────────────────────────────────────────────────
const ItemQuestModal = ({ item, npcName, npcImage, onClose, onComplete }) => {
    const quest = ITEM_QUESTS[item.id] || ITEM_QUESTS._default;

    if (quest.mechanic === "scene_drag") {
        return <SceneDragGame quest={quest} item={item} npcName={npcName} npcImage={npcImage} onClose={onClose} onComplete={onComplete} />;
    }
    if (quest.mechanic === "scene_drag_drop") {
        return <SceneDragDropGame quest={quest} item={item} npcName={npcName} npcImage={npcImage} onClose={onClose} onComplete={onComplete} />;
    }
    if (quest.mechanic === "alphabetical_sort") {
        return <AlphabeticalSortGame quest={quest} item={item} npcName={npcName} npcImage={npcImage} onClose={onClose} onComplete={onComplete} />;
    }
    if (quest.mechanic === "wash_and_mop") {
        return <WashAndMopGame quest={quest} item={item} npcName={npcName} npcImage={npcImage} onClose={onClose} onComplete={onComplete} />;
    }
    if (quest.mechanic === "wipe" || quest.mechanic === "wipe_character") {
        return <WipePlayerGame quest={quest} item={item} npcName={npcName} npcImage={npcImage} onClose={onClose} onComplete={onComplete} />;
    }
    if (quest.mechanic === "pack_bag") {
        return <PackBagGame quest={quest} item={item} npcName={npcName} npcImage={npcImage} onClose={onClose} onComplete={onComplete} />;
    }
    if (quest.mechanic === "adjust_clock") {
        return <AdjustClockGame quest={quest} item={item} npcName={npcName} npcImage={npcImage} onClose={onClose} onComplete={onComplete} />;
    }
    if (quest.mechanic === "calendar_view") {
        return <CalendarView item={item} npcName={npcName} npcImage={npcImage} onClose={onClose} />;
    }
    if (quest.mechanic === "schedule_event") {
        return <ScheduleEventGame item={item} npcName={npcName} npcImage={npcImage} onClose={onClose} onComplete={onComplete} />;
    }
    if (quest.mechanic === "wash_dishes") {
        return <WashDishesGame quest={quest} item={item} npcName={npcName} npcImage={npcImage} onClose={onClose} onComplete={onComplete} />;
    }

    if (quest.mechanic === "drag_to_zone") {
        return <DragToZoneGame quest={quest} item={item} npcName={npcName} npcImage={npcImage} onClose={onClose} onComplete={onComplete} />;
    }
    if (quest.mechanic === "light_lamp") {
        return <LightLampGame quest={quest} item={item} npcName={npcName} npcImage={npcImage} onClose={onClose} onComplete={onComplete} />;
    }
    if (quest.mechanic === "fan_speed") {
        return <FanSpeedGame quest={quest} item={item} npcName={npcName} npcImage={npcImage} onClose={onClose} onComplete={onComplete} />;
    }
    if (quest.mechanic === "cooking_game") {
        return <CookingGame quest={quest} item={item} npcName={npcName} npcImage={npcImage} onClose={onClose} onComplete={onComplete} />;
    }
    if (quest.mechanic === "water_barrel_game") {
        return <WaterBarrelGame quest={quest} item={item} npcName={npcName} npcImage={npcImage} onClose={onClose} onComplete={onComplete} />;
    }
    if (quest.mechanic === "toggle_light") {
        return <ToggleLightGame quest={quest} item={item} npcName={npcName} npcImage={npcImage} onClose={onClose} onComplete={onComplete} />;
    }
    if (quest.mechanic === "ironing_game") {
        return <IroningGame quest={quest} item={item} npcName={npcName} npcImage={npcImage} onClose={onClose} onComplete={onComplete} />;
    }
    if (quest.mechanic === "hammer_repair") {
        return <HammerGame quest={quest} item={item} npcName={npcName} npcImage={npcImage} onClose={onClose} onComplete={onComplete} />;
    }
    if (quest.mechanic === "sofa_repair") {
        return <SofaRepairGame quest={quest} item={item} npcName={npcName} npcImage={npcImage} onClose={onClose} onComplete={onComplete} />;
    }
    if (quest.mechanic === "watering_plant") {


        return <WateringPlantGame quest={quest} item={item} npcName={npcName} npcImage={npcImage} onClose={onClose} onComplete={onComplete} />;
    }


    if (quest.mechanic === "multi_wash") {
        return <MultiWashGame quest={quest} item={item} npcName={npcName} npcImage={npcImage} onClose={onClose} onComplete={onComplete} />;
    }
    if (quest.mechanic === "polish_and_sweep") {
        return <PolishAndSweepGame quest={quest} item={item} npcName={npcName} npcImage={npcImage} onClose={onClose} onComplete={onComplete} />;
    }

    return <StandardModalGame quest={quest} item={item} npcName={npcName} npcImage={npcImage} onClose={onClose} onComplete={onComplete} />;
};

export default ItemQuestModal;