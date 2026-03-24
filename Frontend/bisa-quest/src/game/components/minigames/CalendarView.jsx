import React, { useState } from "react";
import { MONTHS } from "./calendarConstants";

const CalendarView = ({ npcName, npcImage, onClose, item }) => {
    const [monthIndex, setMonthIndex] = useState(9); // Start at October (Oktubre)
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

    const handlePrevMonth = () => setMonthIndex(prev => (prev === 0 ? 11 : prev - 1));
    const handleNextMonth = () => setMonthIndex(prev => (prev === 11 ? 0 : prev + 1));

    return (
        <div className="iqm-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className="iqm-modal iqm-modal--scene" style={{ maxWidth: 650 }}>
                <button className="iqm-close" onClick={onClose}>✕</button>
                <div className="iqm-header">
                    <span className="iqm-header-bisaya">{item.labelBisaya}</span>
                    <span className="iqm-header-english">{item.labelEnglish}</span>
                    <span className="iqm-mechanic-badge" style={{ backgroundColor: "#4a90e2" }}>View Dates</span>
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

                        {Array.from({ length: currentMonth.days }, (_, i) => i + 1).map(date => (
                            <div key={date}
                                style={{
                                    background: "#fff",
                                    border: "2px solid #e0d5b5",
                                    borderRadius: "8px",
                                    padding: "12px 0",
                                    fontSize: "18px",
                                    fontWeight: "bold",
                                    color: "#301b0d",
                                    cursor: "pointer",
                                    transition: "all 0.15s ease",
                                }}
                                onMouseEnter={e => {
                                    e.currentTarget.style.transform = 'scale(1.1)';
                                    e.currentTarget.style.borderColor = '#fcd765';
                                    e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.style.transform = 'scale(1)';
                                    e.currentTarget.style.borderColor = '#e0d5b5';
                                    e.currentTarget.style.boxShadow = 'none';
                                }}
                            >
                                {date}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="iqm-dialogue-row">
                    <img src={npcImage} alt={npcName} className="iqm-npc-img" draggable={false} />
                    <div className="iqm-dialogue-bubble">
                        <div className="iqm-dialogue-speaker">{npcName}</div>
                        <div className="iqm-dialogue-text">
                            <span className="iqm-dialogue-bisaya">Kini ang kalendaryo. Dinhi nato makita ang mga adlaw!</span>
                            <span className="iqm-dialogue-english">This is the calendar. Here we can see the dates!</span>
                        </div>
                        <button className="iqm-next-btn" onClick={onClose}>✓</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CalendarView;
