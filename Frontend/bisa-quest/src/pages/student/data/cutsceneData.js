// src/data/cutsceneData.js
// ─────────────────────────────────────────────────────────────────────────────
//  All cutscene slide definitions for BisaQuest.
//  Import the CUTSCENES object into StoryCutscene.jsx.
//
//  To add artwork when ready:
//    1. Import your image at the top of this file
//    2. Set  image: yourImport  on the relevant slide
//    3. Remove bg + emoji (or leave — they're ignored when image is set)
// ─────────────────────────────────────────────────────────────────────────────

// ── Story intro images (already exist) ───────────────────────────────────────
import slide1 from "../../../assets/images/cutscene/slide_1.png";
import slide2 from "../../../assets/images/cutscene/slide_2.png";
import slide3 from "../../../assets/images/cutscene/slide_3.png";
import slide4 from "../../../assets/images/cutscene/slide_4.png";

// ── Village artwork — uncomment when ready ────────────────────────────────────
import villageEntry1    from "../../../assets/images/cutscene/village/village_1.png";
import villageEntry2    from "../../../assets/images/cutscene/village/village_2.png";
import villageEntry3    from "../../../assets/images/cutscene/village/village_3.png";
import villageEntry4    from "../../../assets/images/cutscene/village/village_4.png";
import villageEntry5    from "../../../assets/images/cutscene/village/village_5.png";
import villageEntry6    from "../../../assets/images/cutscene/village/village_6.png";
import villageEntry7    from "../../../assets/images/cutscene/village/village_7.png";
import villageEntry8    from "../../../assets/images/cutscene/village/village_8.png";
import villageEntry9    from "../../../assets/images/cutscene/village/village_9.png";
import villageEntry10   from "../../../assets/images/cutscene/village/village_10.png";


// ─────────────────────────────────────────────────────────────────────────────
//  CUTSCENES map
//
//  Each entry:
//    key         {string|undefined}  localStorage flag key. undefined = legacy global flag.
//    destination {string}            route to navigate AFTER fog clears
//    finalLabel  {string}            last-slide button label
//    fogColor    {string}            fog wipe color (default white)
//    slides      {Array}             slide objects (see shape below)
//
//  Slide shape:
//    image   {import|null}   actual artwork; null shows bg+emoji placeholder
//    bg      {string}        CSS background color when no image
//    emoji   {string}        large emoji shown when no image
//    speaker {string|null}   NPC name shown above caption (optional)
//    text    {string}        narration / dialogue text
// ─────────────────────────────────────────────────────────────────────────────

export const CUTSCENES = {

    // ── Story intro (after character creation → /dashboard) ──────────────────
    story: {
        key:         undefined,
        destination: "/dashboard",
        finalLabel:  "Begin Quest →",
        fogColor:    "#ffffff",
        slides: [
            { image: slide1, text: "Long ago, in the vibrant islands of the Visayas, the people spoke a language rich with wisdom and beauty — Bisaya." },
            { image: slide2, text: "But as time passed, the younger generations began to forget the old words. An ancient book of knowledge was scattered across the land…" },
            { image: slide3, text: "Three mystical realms hold the lost knowledge — the Village, the enchanted Forest, and the mighty Castle. Each one guards a piece of the language." },
            { image: slide4, text: "Now, a new hero rises. That hero is YOU. Embark on your quest, learn the words, and restore the language of your ancestors!" },
        ],
    },

    // ── Village entry (first visit → /student/village) ───────────────────────
    village_entry: {
        key:         "village_entry",
        destination: "/student/village",
        finalLabel:  "Enter Village →",
        fogColor:    "#e8d5a3",   // warm golden dust
        slides: [
            {
                image: villageEntry1, 
                text: "Welcome to Baryo Bulawan — a small, cheerful village nestled between golden fields and the edge of the ancient forest.",
            },
            {
                image: villageEntry2, 
                text: "But something is wrong. The village is in gentle chaos. Houses are cluttered, market stalls are in disarray, and tools lie scattered everywhere.",
            },
            {
                image: villageEntry3,
                text: '"Anak," says Lolo Tasyo, stepping out from the shade of the acacia tree. "Pages from the ancient Libro have been scattered across the village. The words are lost — and with them, order itself."',
            },
            {
                image: villageEntry4, 
                text: '"Three of your neighbors need your help — Ligaya, Nando, and Vicente. Help them restore their places, and you will find the scattered pages of the Libro."',
            },
            {
                image: villageEntry5,
                text: "The journey begins here, in the familiar streets of home. Talk to your neighbors, learn the words, and bring back the knowledge that was lost.",
            },
        ],
    },

    // ── Village complete (all 3 NPCs done → /student/forest) ─────────────────
    village_complete: {
        key:         "village_complete",
        destination: "/student/forest",
        finalLabel:  "Enter the Forest →",
        fogColor:    "#c8e6c9",   // soft forest green
        slides: [
            {
                image: villageEntry6, 
                text: "The last of the scattered pages flutters down from Nando's barn roof. You catch it gently. Something ancient stirs in the air.",
            },
            {
                image: villageEntry7,
                text: '"Salamat, Bayani! The house is clean, the stall is sorted, and the farm is ready. We couldn\'t have done it without you."',
            },
            {
                image: villageEntry8,
                text: 'Lolo Tasyo emerges from the shade of the old acacia tree, eyes twinkling. "You have done it, anak. The Village Fragment of the Libro — it\'s whole again."',
            },
            {
                image: villageEntry9, 
                text: '"Nando says, beyond the tree line lies a deeper mystery. In the enchanted Forest, the words grow twisted — words that look alike but mean different things."',
            },
            {
                image: villageEntry10, 
                text: 'He points toward the dark tree line. "The Forest Fragment awaits. The path is open now — but only for those brave enough to follow." The trees part. A soft light beckons from within.',
            },
        ],
    },

  
};