// ─────────────────────────────────────────────────────────────────────────────
//  MockTestPage.jsx  —  DEV ONLY
//  Quick launcher for all new mock village quests.
//  Accessible at /dev/mock-quests (register this route in App.jsx for testing)
// ─────────────────────────────────────────────────────────────────────────────
import { useNavigate } from "react-router-dom";

const MOCK_QUESTS = [
    {
        id: "mock_ligaya_trapo",
        label: "Ligaya — TRAPO / RAG",
        route: "/student/house",
        npcId: "village_npc_2",
        npcName: "Ligaya",
        returnTo: "/student/village",
    },
    {
        id: "mock_ligaya_timba",
        label: "Ligaya — TIMBA / BUCKET",
        route: "/student/house",
        npcId: "village_npc_2",
        npcName: "Ligaya",
        returnTo: "/student/village",
    },
    {
        id: "mock_ligaya_mop",
        label: "Ligaya — MOP",
        route: "/student/house",
        npcId: "village_npc_2",
        npcName: "Ligaya",
        returnTo: "/student/village",
    },
    {
        id: "mock_nando_ia",
        label: "Nando — Farm Tool IA (Pala vs Regadera)",
        route: "/student/farm",
        npcId: "village_npc_3",
        npcName: "Nando",
        returnTo: "/student/village",
    },
    {
        id: "mock_vicente_ia2",
        label: "Vicente — Fruit Market IA Round 2 (Mangga/Saging/Pakwan)",
        route: "/student/market",
        npcId: "village_npc_1",
        npcName: "Vicente",
        returnTo: "/student/village",
    },
    // ───── BATCH 2 (New Images) ─────
    {
        id: "mock_ligaya_sandok",
        label: "Ligaya — SANDOK / LADLE",
        route: "/student/house",
        npcId: "village_npc_2",
        npcName: "Ligaya",
        returnTo: "/student/village",
    },
    {
        id: "mock_ligaya_kaldero",
        label: "Ligaya — KALDERO / POT",
        route: "/student/house",
        npcId: "village_npc_2",
        npcName: "Ligaya",
        returnTo: "/student/village",
    },
    {
        id: "mock_ligaya_unan",
        label: "Ligaya — UNAN / PILLOW",
        route: "/student/house",
        npcId: "village_npc_2",
        npcName: "Ligaya",
        returnTo: "/student/village",
    },
    {
        id: "mock_nando_binhi",
        label: "Nando — BINHI / SEEDS",
        route: "/student/farm",
        npcId: "village_npc_3",
        npcName: "Nando",
        returnTo: "/student/village",
    },
    {
        id: "mock_vicente_ia_batch2",
        label: "Vicente — Fruit Market IA (Lansones/Santol/Saging)",
        route: "/student/market",
        npcId: "village_npc_1",
        npcName: "Vicente",
        returnTo: "/student/village",
    },
    // ───── BATCH 3 (More Item Association) ─────
    {
        id: "mock_ligaya_kitchen_ia",
        label: "Ligaya — KITCHEN IA (Kutsara/Tinidor/Baso)",
        route: "/student/house",
        npcId: "village_npc_2",
        npcName: "Ligaya",
        returnTo: "/student/village",
    },
    {
        id: "mock_nando_veg_ia",
        label: "Nando — VEGGIES IA (Kamatis/Talong/Kalabasa)",
        route: "/student/farm",
        npcId: "village_npc_3",
        npcName: "Nando",
        returnTo: "/student/village",
    },
    {
        id: "mock_vicente_root_ia",
        label: "Vicente — MARKET ROOT IA (Sibuyas/Ahos/Kamote)",
        route: "/student/market",
        npcId: "village_npc_1",
        npcName: "Vicente",
        returnTo: "/student/village",
    },
];


const MockTestPage = () => {
    const navigate = useNavigate();

    const launch = (q) => {
        navigate(q.route, {
            state: {
                questId: q.id,
                npcId: q.npcId,
                npcName: q.npcName,
                returnTo: q.returnTo,
                questSequence: [],
                sequenceIndex: 0,
            },
        });
    };

    return (
        <div style={{
            minHeight: "100vh",
            background: "#1a0a00",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "'Fredoka One', cursive",
            color: "#f5d89a",
            padding: 32,
            gap: 16,
        }}>
            <h1 style={{ fontSize: 28, marginBottom: 8, color: "#fbbf24" }}>
                🧪 Mock Quest Launcher (Dev Only)
            </h1>
            <p style={{ fontSize: 14, color: "#9ca3af", marginBottom: 24 }}>
                These quests use hardcoded data — no database needed.
            </p>

            {MOCK_QUESTS.map((q) => (
                <button
                    key={q.id}
                    onClick={() => launch(q)}
                    style={{
                        padding: "14px 32px",
                        borderRadius: 12,
                        border: "2px solid #d97706",
                        background: "linear-gradient(180deg, #92400e, #78350f)",
                        color: "#fef3c7",
                        fontSize: 16,
                        cursor: "pointer",
                        minWidth: 380,
                        textAlign: "left",
                        transition: "transform 0.15s",
                    }}
                    onMouseEnter={e => e.currentTarget.style.transform = "scale(1.03)"}
                    onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
                >
                    ▶ {q.label}
                    <span style={{ float: "right", fontSize: 12, opacity: 0.65 }}>{q.id}</span>
                </button>
            ))}

            <button
                onClick={() => navigate("/student/village")}
                style={{
                    marginTop: 24,
                    padding: "10px 24px",
                    borderRadius: 8,
                    border: "2px solid #6b7280",
                    background: "transparent",
                    color: "#9ca3af",
                    fontSize: 14,
                    cursor: "pointer",
                }}
            >
                ← Back to Village
            </button>
        </div>
    );
};

export default MockTestPage;
