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

// ── Story intro images ────────────────────────────────────────────────────────
import intro1 from "../../../assets/images/cutscene/intro/intro_1.png";
import intro2 from "../../../assets/images/cutscene/intro/intro_2.png";
import intro3 from "../../../assets/images/cutscene/intro/intro_3.png";
import intro4 from "../../../assets/images/cutscene/intro/intro_4.png";
import intro5 from "../../../assets/images/cutscene/intro/intro_5.png";
import intro6 from "../../../assets/images/cutscene/intro/intro_6.png";
import intro7 from "../../../assets/images/cutscene/intro/intro_7.png";
import intro8 from "../../../assets/images/cutscene/intro/intro_8.png";

// ── Village artwork ───────────────────────────────────────────────────────────
import villageEntry1 from "../../../assets/images/cutscene/village/village_1.png";
import villageEntry2 from "../../../assets/images/cutscene/village/village_2.png";
import villageEntry3 from "../../../assets/images/cutscene/village/village_3.png";
import villageEntry4 from "../../../assets/images/cutscene/village/village_4.png";
import villageEntry5 from "../../../assets/images/cutscene/village/village_5.png";
import villageEntry6 from "../../../assets/images/cutscene/village/village_6.png";
import villageEntry7 from "../../../assets/images/cutscene/village/village_7.png";
import villageEntry8 from "../../../assets/images/cutscene/village/village_8.png";
import villageEntry9 from "../../../assets/images/cutscene/village/village_9.png";
import villageEntry10 from "../../../assets/images/cutscene/village/village_10.png";


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
        key: undefined,
        destination: "/dashboard",
        finalLabel: "Begin Quest →",
        fogColor: "#ffffff",
        slides: [
            { image: intro1, text: "The Grand Fiesta sa mga Pulong is drawing near. It is a celebration of language, knowledge, and community." },
            { image: intro2, text: "Ang Village na Baryo Bulawan kay nag-andam na." },
            { image: intro3, text: "But just a week before the Festival Day... In the Castle..." },
            { image: intro4, text: "Naay usa ka duwende nga si Gulo. For some reason, nakasulod siya sa Castle Library, nakatutok sa Libro sa mga Pulong - the magical Book of Words that holds the wisdom of the land." },
            { image: intro5, text: "This playful duwende stole the book. As he flees, the book pages start to scatter." },
            { image: intro6, text: "Shortly after, naka bantay ang mga tao sa library. But it's too late... and they panic." },
            { image: intro7, text: "Eventually, the book breaks apart. Many fragments sa book kay na punta sa lain-lain na lugar. In the Village, Forest, and some remained in the Castle." },
            { image: intro8, text: "Without the book, the people slowly fall into confusion, forget words, and lose belongings..." },
        ],
    },

    // ── Village entry (first visit → /student/village) ───────────────────────
    village_entry: {
        key: "village_entry",
        destination: "/student/village",
        finalLabel: "Enter Village →",
        fogColor: "#e8d5a3",
        slides: [
            {
                image: villageEntry1,
                text: "Welcome to Baryo Bulawan — usa ka gamay, masayanong village nestled between golden fields ug sa daplin sa karaang forest.",
            },
            {
                image: villageEntry2,
                text: "But something is wrong. Ang baryo kay gubot. Houses are cluttered, ang mga tindahan kay nagkagubot, ug ang mga tools kay nagkatag bisan asa.",
            },
            {
                image: villageEntry3,
                text: '"Anak," says Lolo Tasyo, stepping out from the shade of the acacia tree. "Ang mga pahina sa karaang Libro kay nagkatibulaag across the village. The words are lost — ug uban niini, ang kahusay mismo."',
            },
            {
                image: villageEntry4,
                text: '"Tulo sa imong mga silingan ang nagkinahanglan sa imong tabang — si Ligaya, Nando, and Vicente. Help them restore their places, ug makita nimo ang mga nangawala nga pages sa Libro."',
            },
            {
                image: villageEntry5,
                text: "The journey begins here, sa pamilyar nga karsada sa balay. Talk to your neighbors, tun-i ang mga pulong, and bring back the knowledge that was lost.",
            },
        ],
    },

    // ── Village complete (all 3 NPCs done → /student/forest) ─────────────────
    village_complete: {
        key: "village_complete",
        destination: "/student/forest",
        finalLabel: "Enter the Forest →",
        fogColor: "#c8e6c9",
        slides: [
            {
                image: villageEntry6,
                text: "Ang kataposang scattered page kay nahulog gikan sa atop sa kamalig ni Nando. You catch it gently. May nagtangdog sa hangin — something ancient stirs.",
            },
            {
                image: villageEntry7,
                text: '"Salamat, Bayani! Limpyo na ang balay, ang tindahan is sorted, ug andam na ang uma. We couldn\'t have done it without you."',
            },
            {
                image: villageEntry8,
                text: 'Migawas si Lolo Tasyo gikan sa landong sa karaang akasya, nagkidlap ang iyang mga mata. "You have done it, anak. Ang Village Fragment sa Libro — whole again."',
            },
            {
                image: villageEntry9,
                text: '"Ingon ni Nando, beyond the tree line naa pay mas lawom nga mystery. Sa Enchanted Forest, ang mga pulong kay naglibog — words that look alike but lain ang buot ipasabot."',
            },
            {
                image: villageEntry10,
                text: 'He points toward the dark tree line. "Ang Forest Fragment nagpaabut. The path is open now — but only para sa mga brave enough to follow." Nabuak ang mga kahoy. A soft light beckons from within.',
            },
        ],
    },


};