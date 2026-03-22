import React from "react";
import { useNavigate } from "react-router-dom";
import { getLearnedWords } from "../../utils/playerStorage";
import "../../pages/Village/HousePage.css";

const VillageSummaryModal = ({ isOpen, onClose, onProceed }) => {
    const navigate = useNavigate();

    if (!isOpen) return null;

    const learnedData = getLearnedWords('village');
    const allWords = Array.from(new Set(learnedData.flatMap(d => d.words)));

    return (
        <div className="house-door-overlay" onClick={onClose} style={{ zIndex: 1000 }}>
          <div className="house-door-modal" style={{ maxWidth: '500px' }} onClick={e => e.stopPropagation()}>
            <h2 className="house-door-title" style={{ fontSize: '28px' }}>
              Village Completed! 🎉
            </h2>
            <div className="house-door-subtitle" style={{ marginBottom: '20px' }}>
              Here are the words you learned:
            </div>
            
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center', marginBottom: '30px', maxHeight: '200px', overflowY: 'auto' }}>
                {allWords.length > 0 ? allWords.map(word => (
                    <span key={word} style={{ 
                        background: '#fcd765', padding: '5px 12px', borderRadius: '15px', 
                        fontFamily: "'Pixelify Sans', sans-serif", fontWeight: 'bold', border: '2px solid #3a2010',
                        color: '#3a2010'
                    }}>
                        {word}
                    </span>
                )) : (
                    <span style={{ fontStyle: 'italic', color: '#666' }}>You explored the village!</span>
                )}
            </div>

            <div className="house-door-options">
                <button
                    className="house-door-btn"
                    style={{ background: "#4caf50", borderColor: "#1b5e20", color: "#fff", boxShadow: "0 6px 0 #2e7d32" }}
                    onClick={() => {
                        if (onProceed) onProceed();
                        else navigate("/student/forest");
                        if (onClose) onClose();
                    }}
                >
                    Continue to Forest 🌲
                </button>
            </div>
          </div>
        </div>
    );
};

export default VillageSummaryModal;
