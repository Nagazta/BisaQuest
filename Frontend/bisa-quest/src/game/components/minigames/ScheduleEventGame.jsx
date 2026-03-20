import React, { useState } from "react";
import { MONTHS } from "./calendarConstants";

const CALENDAR_QUESTS = [
    {
        monthIndex: 9, // October
        targetDate: 11,
        bisaya: "Magsimba ta karong ika-duha (2) nga Domingo sa Oktubre. Asa na dapita?",
        english: "Let's go to church this second (2nd) Sunday of October. Where is that?"
    },
    {
        monthIndex: 11, // December
        targetDate: 25,
        bisaya: "Mag-selebrar tas Pasko inig ka baynte-singko (25) sa Disyembre. Asa na sa kalendaryo?",
        english: "We celebrate Christmas on the 25th of December. Where is it on the calendar?"
    },
    {
        monthIndex: 0, // January
        targetDate: 1,
        bisaya: "Ang Bag-ong Tuig kay sa unang (1) adlaw sa Enero. Pangitaa palihog.",
        english: "New Year is on the first (1st) day of January. Please find it."
    },
    {
        monthIndex: 3, // April
        targetDate: 15,
        bisaya: "Naa tay pulong karong ikatulo (3) nga Miyerkules sa Abril. Pakipili sa petsa.",
        english: "We have a meeting this third (3rd) Wednesday of April. Please select the date."
    },
    {
        monthIndex: 8, // September
        targetDate: 8,
        bisaya: "Adlawng natawhan sa akong higala inig ka walo (8) sa Septyembre. Asa nang petsaha?",
        english: "My friend's birthday is on the 8th of September. Which date is that?"
    }
];

const ScheduleEventGame = ({ npcName, npcImage, item, onClose, onComplete }) => {
    const [targetQuest] = useState(() => CALENDAR_QUESTS[Math.floor(Math.random() * CALENDAR_QUESTS.length)]);
    const [monthIndex, setMonthIndex] = useState(0); // Player has to navigate
    const [success, setSuccess] = useState(false);
    const [errorDate, setErrorDate] = useState(null);

    const currentMonth = MONTHS[monthIndex];
    const days = [
        { en: "Sunday", bi: "Domingo" },
        { en: "Monday", bi: "Lunes" },
        { en: "Tuesday", bi: "Martes" },
        { en: "Wednesday", bi: "Miyerkules" },
        { en: "Thursday", bi: "Huwebes" },
        { en: "Friday", bi: "Biyernes" },
        { en: "Saturday", bi: "Sabado" },
    ];

    const handlePrevMonth = () => { if (!success) setMonthIndex(prev => (prev === 0 ? 11 : prev - 1)); };
    const handleNextMonth = () => { if (!success) setMonthIndex(prev => (prev === 11 ? 0 : prev + 1)); };

    const handleDateClick = (date) => {
        if (success) return;

        if (monthIndex === targetQuest.monthIndex && date === targetQuest.targetDate) {
            setSuccess(true);
            setTimeout(() => {
                onComplete(item);
            }, 2500);
        } else {
            setErrorDate(date);
            setTimeout(() => setErrorDate(null), 500);
        }
    };

    return (
        <div className="iqm-overlay">
            {success && <div className="iqm-success-flash" />}

            <div className={`iqm-modal iqm-modal--scene ${success ? "iqm-success-pop" : ""}`} style={{ maxWidth: 650 }}>
                {!success && <button className="iqm-close" onClick={onClose}>✕</button>}
                <div className="iqm-header">
                    <span className="iqm-header-bisaya">{item.labelBisaya}</span>
                    <span className="iqm-header-english">{item.labelEnglish}</span>
                    <span className="iqm-mechanic-badge">Schedule Event</span>
                </div>

                <div style={{ padding: "20px", background: "#fdf8e4", borderRadius: "12px", margin: "15px", border: "3px solid #3a2010", flex: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px", borderBottom: "2px solid #3a2010", paddingBottom: "10px" }}>
                        <button onClick={handlePrevMonth} style={{ background: "#fcd765", border: "2px solid #3a2010", borderRadius: "8px", padding: "4px 16px", cursor: "pointer", fontSize: "18px", boxShadow: "0 3px 0 #d4a72c" }}>◀</button>

                        <div style={{ textAlign: "center" }}>
                            <h2 style={{ margin: 0, color: "#a93c3c", fontSize: "28px", fontFamily: "Fredoka One, cursive", minWidth: "150px" }}>
                                {currentMonth.bi} <span style={{ fontSize: "16px", color: "#666", fontWeight: "normal" }}>{currentMonth.en}</span>
                            </h2>
                        </div>

                        <button onClick={handleNextMonth} style={{ background: "#fcd765", border: "2px solid #3a2010", borderRadius: "8px", padding: "4px 16px", cursor: "pointer", fontSize: "18px", boxShadow: "0 3px 0 #d4a72c" }}>▶</button>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "8px", textAlign: "center", marginBottom: "10px" }}>
                        {days.map(d => (
                            <div key={d.en} style={{ background: "#3a2010", color: "#fcd765", padding: "8px 2px", borderRadius: "6px", overflow: "hidden" }}>
                                <div style={{ fontWeight: "bold", fontSize: "11px", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>{d.bi}</div>
                                <div style={{ fontSize: "9px", opacity: 0.8, whiteSpace: "nowrap", textOverflow: "ellipsis" }}>{d.en}</div>
                            </div>
                        ))}
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "8px", textAlign: "center" }}>
                        {Array.from({ length: currentMonth.startDay }).map((_, i) => <div key={`empty-${i}`} />)}

                        {Array.from({ length: currentMonth.days }, (_, i) => i + 1).map(date => {
                            const isError = errorDate === date;
                            const isCorrect = success && date === targetQuest.targetDate && monthIndex === targetQuest.monthIndex;

                            return (
                                <div key={date}
                                    onClick={() => handleDateClick(date)}
                                    className={isError ? "iqm-error-shake" : ""}
                                    style={{
                                        background: isCorrect ? "#4CAF50" : (isError ? "#ffcccc" : "#fff"),
                                        border: isCorrect ? "2px solid #2E7D32" : (isError ? "2px solid #e74c3c" : "2px solid #e0d5b5"),
                                        borderRadius: "8px",
                                        padding: "12px 0",
                                        fontSize: "18px",
                                        fontWeight: "bold",
                                        color: isCorrect ? "#fff" : (isError ? "#e74c3c" : "#301b0d"),
                                        cursor: success ? "default" : "pointer",
                                        transition: "all 0.15s ease",
                                        position: "relative"
                                    }}
                                    onMouseEnter={e => {
                                        if (success || isError) return;
                                        e.currentTarget.style.transform = 'scale(1.1)';
                                        e.currentTarget.style.borderColor = '#fcd765';
                                        e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';
                                    }}
                                    onMouseLeave={e => {
                                        if (success || isError) return;
                                        e.currentTarget.style.transform = 'scale(1)';
                                        e.currentTarget.style.borderColor = '#e0d5b5';
                                        e.currentTarget.style.boxShadow = 'none';
                                    }}
                                >
                                    {date}
                                    {isCorrect && (
                                        <div style={{ position: "absolute", top: -10, right: -10, fontSize: "24px", animation: "iqm-bounce 0.5s infinite" }}>⭐</div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="iqm-dialogue-row">
                    <img src={npcImage} alt={npcName} className="iqm-npc-img" draggable={false} />
                    <div className="iqm-dialogue-bubble">
                        <div className="iqm-dialogue-speaker">{npcName}</div>
                        <div className="iqm-dialogue-text">
                            {success ? (
                                <>
                                    <span className="iqm-dialogue-bisaya" style={{ color: "#2E7D32", fontWeight: "bold" }}>Husto! Maayo kaayo! ✨</span>
                                    <span className="iqm-dialogue-english">Correct! Very good! ✨</span>
                                </>
                            ) : errorDate ? (
                                <>
                                    <span className="iqm-dialogue-bisaya" style={{ color: "#c0392b", fontWeight: "bold" }}>Mura og sayop na dapita. Suwayi gihapon!</span>
                                    <span className="iqm-dialogue-english">Hmm, that doesn't seem right. Try again!</span>
                                </>
                            ) : (
                                <>
                                    <span className="iqm-dialogue-bisaya">{targetQuest.bisaya}</span>
                                    <span className="iqm-dialogue-english">{targetQuest.english}</span>
                                </>
                            )}
                        </div>
                        {success && (
                            <button className="iqm-next-btn" onClick={() => onComplete(item)}>✓</button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ScheduleEventGame;
