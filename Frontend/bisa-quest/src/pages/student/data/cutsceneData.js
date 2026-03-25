//Story intro images
import intro1 from "../../../assets/images/cutscene/intro/intro_1.png";
import intro2 from "../../../assets/images/cutscene/intro/intro_2.png";
import intro3 from "../../../assets/images/cutscene/intro/intro_3.png";
import intro4 from "../../../assets/images/cutscene/intro/intro_4.png";
import intro5 from "../../../assets/images/cutscene/intro/intro_5.png";
import intro6 from "../../../assets/images/cutscene/intro/intro_6.png";
import intro7 from "../../../assets/images/cutscene/intro/intro_7.png";
import intro8 from "../../../assets/images/cutscene/intro/intro_8.png";

//Village artwork
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

//Forest artwork
import guloHideout from "../../../assets/images/cutscene/forest/gulo-hideout.png";

//Castle artwork
import castle1 from "../../../assets/images/cutscene/castle/castle_1.png";
import castle2 from "../../../assets/images/cutscene/castle/castle_2.png";
import castle3 from "../../../assets/images/cutscene/castle/castle_3.png";
import castle4 from "../../../assets/images/cutscene/castle/castle_4.png";

export const CUTSCENES = {

    //Story intro (after character creation → /dashboard)
    story: {
        key: undefined,
        destination: "/dashboard",
        finalLabel: "Begin Quest →",
        fogColor: "#ffffff",
        slides: [
            { image: intro1, textBisaya: "Ang Dakong Pista sa mga Pulong hapit na! Kini usa ka selebrasyon sa pinulongan ug kahibalo sa komunidad.", textEnglish: "The Grand Fiesta of Words is almost here! It is a celebration of language and learning in the community." },
            { image: intro2, textBisaya: "Ang Baryo Bulawan nangandam na.", textEnglish: "The Village of Baryo Bulawan is now preparing." },
            { image: intro3, textBisaya: "Apan usa ka semana sa wala pa ang Adlaw sa Pista... Didto sa Kastilyo...", textEnglish: "But just a week before the Festival Day... In the Castle..." },
            { image: intro4, textBisaya: "Adunay usa ka duwende nga ginganlag Gulo. Misulod siya sa librarya sa kastilyo ug nakita ang Libro sa mga Pulong — ang espesyal nga libro nga puno sa kahibalo.", textEnglish: "There was a dwarf named Gulo. He entered the Castle Library and found the Book of Words — a special book full of knowledge." },
            { image: intro5, textBisaya: "Gikawat ni Gulo ang libro. Samtang siya nagdagan, ang mga panid nagsugod og katag sa lain-laing lugar.", textEnglish: "Gulo stole the book. As he ran away, the pages started falling and scattering everywhere." },
            { image: intro6, textBisaya: "Nakita sa mga tawo sa librarya ang nahitabo. Apan ulahi na — nanghadlok ug nangibog sila.", textEnglish: "The people in the library saw what happened. But it was too late — they were scared and confused." },
            { image: intro7, textBisaya: "Ang libro nabungkag. Ang mga panid nakatag sa Baryo, sa Lasang, ug sa Kastilyo.", textEnglish: "The book broke apart. The pages scattered in the Village, the Forest, and the Castle." },
            { image: intro8, textBisaya: "Kung wala ang libro, ang mga tawo naglibog, nakalimot sa mga pulong, ug nawad-an sa ilang mga gamit.", textEnglish: "Without the book, the people got confused, forgot words, and lost their belongings." },
        ],
    },

    // Village entry (first visit → /student/village)
    village_entry: {
        key: "village_entry",
        destination: "/student/village",
        finalLabel: "Enter Village →",
        fogColor: "#e8d5a3",
        slides: [
            {
                image: villageEntry1,
                textBisaya: "Miabot ka na sa Baryo Bulawan — usa ka gamay ug malipayon nga baryo. Puno kini og bulawanong uma ug karaang lasang sa palibot.",
                textEnglish: "You have arrived at Baryo Bulawan — a small and happy village. It is surrounded by golden fields and an old forest.",
            },
            {
                image: villageEntry2,
                textBisaya: "Apan adunay sayop. Ang baryo kay gubot. Ang mga balay kay dili limpyo, ang mga tindahan kay walay ayos, ug ang mga gamit kay nagkatag bisan asa.",
                textEnglish: "But something is wrong. The village is messy. The houses are not clean, the shops are out of order, and things are scattered everywhere.",
            },
            {
                image: villageEntry3,
                textBisaya: '"Anak," matod pa ni Lolo Tasyo. "Ang mga panid sa karaang Libro nagkatag sa tibuuk baryo. Nawala ang mga pulong — ug ang baryo nahimong gubot."',
                textEnglish: '"Child," says Lolo Tasyo. "The pages of the old Book have scattered all over the village. The words are gone — and the village became messy."',
            },
            {
                image: villageEntry4,
                textBisaya: '"Ang imong silingan nga si Ligaya nanginahanglan sa imong tabang. Tabangi siya aron maayo ang iyang balay, ug makita nimo ang mga nangawala nga panid sa Libro."',
                textEnglish: '"Your neighbor Ligaya needs your help. Help her fix her home, and you will find the missing pages of the Book."',
            },
            {
                image: villageEntry5,
                textBisaya: "Ang imong panaw magsugod dinhi. Pakig-estorya sa imong mga silingan, tun-i ang mga pulong, ug ibalik ang nawala nga kahibalo.",
                textEnglish: "Your journey starts here. Talk to your neighbors, learn the words, and bring back the lost knowledge.",
            },
        ],
    },

    // Village complete (all 3 NPCs done → /student/forest)
    village_complete: {
        key: "village_complete",
        destination: "/student/forest",
        finalLabel: "Enter the Forest →",
        fogColor: "#c8e6c9",
        slides: [
            {
                image: villageEntry6,
                textBisaya: "Ang huling panid sa libro nahulog gikan sa balay ni Ligaya. Gisalo mo kini. Usa ka hangin ang humuyop — may nagbag-o sa palibot.",
                textEnglish: "The last page of the book fell from Ligaya's house. You caught it. A breeze blew — something changed around you.",
            },
            {
                image: villageEntry7,
                textBisaya: '"Salamat, Bayani! Limpyo na ang balay, naayo na ang tindahan, ug andam na ang uma. Dili namo kini mahimo kung wala ka."',
                textEnglish: '"Thank you, Hero! The house is clean, the shop is fixed, and the farm is ready. We could not have done it without you."',
            },
            {
                image: villageEntry8,
                textBisaya: 'Migawas si Lolo Tasyo ug nalipay siya. "Nahimo nimo, anak. Ang mga panid sa Libro gikan sa Baryo — kompleto na pag-usab."',
                textEnglish: 'Lolo Tasyo came out and was happy. "You did it, child. The pages of the Book from the Village — whole again."',
            },
            {
                image: villageEntry9,
                textBisaya: '"Sa sulod sa lasang, adunay lain pang misteryo. Ang mga pulong didto magmurag-parehas apan lahi ang buot ipasabot."',
                textEnglish: '"Inside the forest, there is another mystery. The words there may look alike, but they have different meanings."',
            },
            {
                image: villageEntry10,
                textBisaya: 'Gitudlo ni Lolo Tasyo ang lasang. "Ang mga panid gikan sa Lasang naghulat. Ang dalan bukas na — lakaw na, Bayani!" Naabli ang mga kahoy. Usa ka hayag ang nagtawag gikan sa sulod.',
                textEnglish: 'Lolo Tasyo pointed to the forest. "The pages from the Forest are waiting. The path is open — go now, Hero!" The trees parted. A soft light called from within.',
            },
        ],
    },


    // Castle entry (first visit → /student/castle)
    castle_entry: {
        key: "castle_entry",
        destination: "/student/castle",
        finalLabel: "Enter the Castle →",
        fogColor: "#c8a96e",
        slides: [
            { image: castle4, textBisaya: "Miabot ka na sa Kastilyo — ang pinaka-nindot nga lugar sa Baryo Bulawan. Dako ug hayag ang mga tore niini, ug ang bato nga pader kay sinaw sa kahayag sa gabii.", textEnglish: "You have arrived at the Castle — the most beautiful place in Baryo Bulawan. Its towers are big and bright, and the stone walls shine in the night." },
            { image: castle1, textBisaya: "Dinhi gitipigan ang mga espesyal nga pulong sa tibuok baryo. Apan tungod ni Gulo, nagkatag ang mga panid sa Libro — ang mga compound words nahisagol ug nawala.", textEnglish: "This is where the village's special words are kept. But because of Gulo, the pages of the Book scattered — the compound words got mixed up and lost." },
            { image: castle3, textBisaya: "Ang mga pulong sa Kastilyo nagkagubot. Kinahanglan nimo ipares ang mga pulong aron mahibaloan pag-usab ang ilang kahulogan.", textEnglish: "The words in the Castle are all mixed up. You need to match the words to bring back their meanings." },
            { image: castle3, textBisaya: "Tulo ka tawo ang nanginahanglan sa imong tabang — si Princess Hara, tabangi siya ug ibalik ang mga panid sa Libro!", textEnglish: "Three people need your help — Princess Hara, Manong Kwill, and Gulo himself. Help them and return the pages of the Book!" },
        ],
    },


    // Castle complete (all 3 NPCs done → /dashboard)
    castle_complete: {
        key: "castle_complete",
        destination: "/dashboard",
        finalLabel: "Return to Dashboard →",
        fogColor: "#c8a96e",
        slides: [
            { image: castle1, textBisaya: "Nahuman na! Ang tanan nga compound words sa Kastilyo nabalik na sa Libro. Ang mga panid natigom na pag-usab.", textEnglish: "It is done! All the compound words in the Castle have returned to the Book. The pages are whole once more." },
            { image: castle2, textBisaya: "Ang Kastilyo nahimong malinawon pag-usab — ang mga pulong buhi na usab. Nalipay ang tanan.", textEnglish: "The Castle is peaceful again — the words are alive once more. Everyone is happy." },
            { image: castle3, textBisaya: "Ang Libro sa mga Pulong kompleto na. Ang tanan nga tipik gikan sa Baryo, Lasang, ug Kastilyo natigom na, ug nalipay na usab ang mga tawo.", textEnglish: "The Book of Words is complete. All the pieces from the Village, Forest, and Castle are now together, and the people are happy once again." },
        ],
    },


    // Forest complete (all 4 NPCs done → /student/castle)
    forest_complete: {
        key: "forest_complete",
        destination: "/student/castle",
        finalLabel: "Enter the Castle →",
        fogColor: "#a8d5e2",
        slides: [
            {
                image: guloHideout,
                textBisaya: "Sa pagtigom nimo sa mga tipik sa libro sa lasang ug nagpadayon sa imong panaw, nakakita ka og nagkagubot nga tagoanan... [TBA]",
                textEnglish: "As you collected those book fragments in the forest and continued on your journey, you find a messy little hideout... [TBA]",
            },
        ],
    },


};