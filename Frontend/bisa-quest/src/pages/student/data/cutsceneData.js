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
            { image: intro1, textBisaya: "Ang Dakong Pista sa mga Pulong nagkaduol na. Kini usa ka kasaulogan sa pinulongan, kahibalo, ug komunidad.", textEnglish: "The Grand Fiesta of Words is drawing near. It is a celebration of language, knowledge, and community." },
            { image: intro2, textBisaya: "Ang Baryo Bulawan nangandam na.", textEnglish: "The Village of Baryo Bulawan is now preparing." },
            { image: intro3, textBisaya: "Apan usa ka semana sa wala pa ang Adlaw sa Pista... Didto sa Kastilyo...", textEnglish: "But just a week before the Festival Day... In the Castle..." },
            { image: intro4, textBisaya: "Adunay usa ka duwende nga ginganlag Gulo. Wala damha, nakasulod siya sa librarya sa kastilyo ug gitutokan ang Libro sa mga Pulong - ang mahika nga libro nga naghupot sa kinaadman sa yuta.", textEnglish: "There was a dwarf named Gulo. For some reason, he entered the Castle Library and stared at the Book of Words - the magical book that holds the wisdom of the land." },
            { image: intro5, textBisaya: "Kining kiat nga duwende nangawat sa libro. Samtang siya nagdagan, ang mga panid sa libro nagsugod og katag.", textEnglish: "This playful dwarf stole the book. As he flees, the book pages start to scatter." },
            { image: intro6, textBisaya: "Sa wala madugay, nabantayan sa mga tawo sa librarya. Apan ulahi na ang tanan... ug nag-panic sila.", textEnglish: "Shortly after, the people in the library noticed. But it's too late... and they panic." },
            { image: intro7, textBisaya: "Sa kadugayan, ang libro nabungkag. Daghang mga tipik sa libro ang niadto sa lain-laing mga lugar. Sa Baryo, Lasang, ug ang uban nagpabilin sa Kastilyo.", textEnglish: "Eventually, the book breaks apart. Many fragments of the book went to different places. In the Village, Forest, and some remained in the Castle." },
            { image: intro8, textBisaya: "Kung wala ang libro, ang mga tawo hinayhinay nga naglibog, nakalimot sa mga pulong, ug nangawala ang kagamitan...", textEnglish: "Without the book, the people slowly fall into confusion, forget words, and lose belongings..." },
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
                textBisaya: "Welcome sa Baryo Bulawan — usa ka gamay, malipayong baryo nga nahimutang taliwala sa bulawanong umahan ug daplin sa karaang lasang.",
                textEnglish: "Welcome to Baryo Bulawan — a small, joyful village nestled between golden fields and the edge of the ancient forest.",
            },
            {
                image: villageEntry2,
                textBisaya: "Apan adunay sayop. Ang baryo kay gubot. Ang mga balay kay nagkayamukat, ang mga tindahan kay nagkagubot, ug ang mga gamit kay nagkatag bisan asa.",
                textEnglish: "But something is wrong. The village is in chaos. Houses are cluttered, the stores are messy, and the tools are scattered everywhere.",
            },
            {
                image: villageEntry3,
                textBisaya: '"Anak," matod pa ni Lolo Tasyo, migawas gikan sa landong sa punoan sa akasya. "Ang mga panid sa karaang Libro nagkatibulaag sa tibuuk baryo. Nawala ang mga pulong — ug uban niini, ang mismong kahusay."',
                textEnglish: '"Child," says Lolo Tasyo, stepping out from the shade of the acacia tree. "The pages of the ancient Book have been scattered across the village. The words are lost — and with them, order itself."',
            },
            {
                image: villageEntry4,
                textBisaya: '"Ang imong silingan nga si Ligaya nagkinahanglan sa imong tabang. Tabangi siya aron mabalik ang kaanindot sa iyang balay, ug makita nimo ang mga nangawala nga panid sa Libro."',
                textEnglish: '"Your neighbor Ligaya needs your help. Help her restore her place, and you will find the missing pages of the Book."',
            },
            {
                image: villageEntry5,
                textBisaya: "Ang panaw magsugod dinhi, sa pamilyar nga karsada padulong sa balay. Pakig-estorya sa imong mga silingan, tun-i ang mga pulong, ug ibalik ang kahibalo nga nawala.",
                textEnglish: "The journey begins here, on the familiar streets near home. Talk to your neighbors, learn the words, and bring back the knowledge that was lost.",
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
                textBisaya: "Ang kataposang nagkatag nga panid nahulog gikan sa sulod sa balay ni Ligaya. Imo kining gisalo og hinayhinay. Adunay mihuyop nga hangin — usa ka karaan nga butang naglihok.",
                textEnglish: "The last scattered page falls from inside Ligaya's house. You catch it gently. A breeze blows — something ancient stirs.",
            },
            {
                image: villageEntry7,
                textBisaya: '"Salamat, Bayani! Limpyo na ang balay, naayo na ang tindahan, ug andam na ang uma. Dili namo kini mahimo kung wala ka."',
                textEnglish: '"Thank you, Hero! The house is clean, the shop is sorted, and the farm is ready. We couldn\'t have done it without you."',
            },
            {
                image: villageEntry8,
                textBisaya: 'Migawas si Lolo Tasyo gikan sa landong sa karaang akasya, nagkidlap ang iyang mga mata. "Nahimo nimo, anak. Ang tibuok Tipik sa Libro gikan sa Baryo — nakompleto na pag-usab."',
                textEnglish: 'Lolo Tasyo stepped out from the shade of the ancient acacia, his eyes twinkling. "You have done it, child. The Village Fragment of the Book — whole again."',
            },
            {
                image: villageEntry9,
                textBisaya: '"Sama sa giingon ni Ligaya, luyo sa kakahoyan aduna pay mas lawom nga misteryo. Sa Enchanted Forest, naglibog ang mga pulong — mga pulong nga parehas tan-awon apan lahi og buot ipasabot."',
                textEnglish: '"Ligaya said, beyond the tree line there is a deeper mystery. In the Enchanted Forest, the words are confusing — words that look alike but mean differently."',
            },
            {
                image: villageEntry10,
                textBisaya: 'Gitudlo niya ang ngitngit nga kakahoyan. "Ang Tipik gikan sa Lasang naghulat. Ang agianan abli na karon — apan para lamang sa madasigon nga mosunod." Niabli ang mga kahoy. Ug usa ka hayag ang nagtawag gikan sa sulod.',
                textEnglish: 'He points toward the dark tree line. "The Forest Fragment awaits. The path is open now — but only for those brave enough to follow." The trees part. A soft light beckons from within.',
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
            { image: castle4, textBisaya: "Miabot ka na sa Kastilyo — ang pinakamahal nga lugar sa Baryo Bulawan. Dako ug tag-as ang mga tore niini, ug ang bato nga pader kay nagpasiga sa kahayag sa gabii.", textEnglish: "You have arrived at the Castle — the most wondrous place in Baryo Bulawan. Its towers are prominent and tall, and its stone walls shine in the light of the night." },
            { image: castle1, textBisaya: "Dinhi sa Kastilyo, gitigom ang labing bililhon nga mga pulong. Apan tungod ni Gulo, nagkatag ang mga panid sa Libro — ang mga compound words nahisagol ug nawagtang.", textEnglish: "Here in the Castle, the most precious words are gathered. But because of Gulo, the pages of the Book have scattered — the compound words got mixed up and lost." },
            { image: castle3, textBisaya: "Ang mga pulong sa atong kastilyo nakalimtan. Kinahanglan nimo ipares ang mga pulong aron mabawi ang ilang kahulogan.", textEnglish: "The words in our castle are a mess. You need to match the words to recover their meanings." },
            { image: castle3, textBisaya: "Tulo ka tawo ang nanginahanglan sa imong tabang dinhi — si Princess Hara, Manong Kwill, ug si Gulo mismo. Tabangan sila ug sulbaron ang mga compound words aron mabalik ang mga panid sa Libro.", textEnglish: "Three people need your help here — Princess Hara, Manong Kwill, and Gulo himself. Help them and solve the compound words to return the pages of the Book." },
        ],
    },


    // Castle complete (all 3 NPCs done → /dashboard)
    castle_complete: {
        key: "castle_complete",
        destination: "/dashboard",
        finalLabel: "Return to Dashboard →",
        fogColor: "#c8a96e",
        slides: [
            { image: castle1, textBisaya: "Nahuman na! Ang tanan nga mga compound words sa Kastilyo kay nabalik na sa Libro. Ang mga panid naporma na pag-usab.", textEnglish: "It's done! All the compound words in the Castle have returned to the Book. The pages have reassembled once more." },
            { image: castle2, textBisaya: "Ang Kastilyo nahimong malinawon pag-usab — ang mga pulong nabuhi na usab.", textEnglish: "The Castle is peaceful again — the words have come alive." },
            { image: castle3, textBisaya: "Ang Libro sa mga Pulong kompleto na. Ang tanan nga tipik gikan sa Baryo, Lasang, ug Kastilyo natigom na, ug nalipay na usab ang mga tawo.", textEnglish: "The Book of Words is complete. All fragments from the Village, Forest, and Castle are gathered, and the people are happy once again." },
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