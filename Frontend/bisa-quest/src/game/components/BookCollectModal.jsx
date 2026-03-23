import { useEffect } from "react";
import "./BookCollectModal.css";

const BookCollectModal = ({
    isOpen,
    npcName = "Ligaya",
    pageNumber = 1,       // which page number this is (1–9)
    totalPages = 1,       // total pages collected so far (for "X / 9")
    environment = "sala",
    onClose,
    autoDismiss = 4000,    // auto-close after ms (0 = manual only)
}) => {
    // Auto-dismiss
    useEffect(() => {
        if (!isOpen || !autoDismiss) return;
        const t = setTimeout(() => onClose?.(), autoDismiss);
        return () => clearTimeout(t);
    }, [isOpen, autoDismiss, onClose]);

    if (!isOpen) return null;

    const ENV_LABEL = {
        village: "Village Fragment",
        sala: "Sala Fragment",
        kusina: "Kusina Fragment",
        kwarto: "Kwarto Fragment",
        forest: "Forest Fragment",
        castle: "Castle Fragment",
    };

    return (
        <div className="book-collect-overlay" onClick={onClose}>
            <div className="book-collect-modal" onClick={e => e.stopPropagation()}>

                {/* Header bar */}
                <div className="book-collect-header">
                    ✦ {ENV_LABEL[environment] || "Fragment"} ✦
                </div>

                {/* Body */}
                <div className="book-collect-body">

                    {/* Book icon */}
                    <div className="book-collect-icon">📖</div>

                    {/* Main punchy line */}
                    <h2 className="book-collect-title">
                        Maayo! You collected a page!
                    </h2>

                    {/* Sub line */}
                    <p className="book-collect-npc">
                        Ang kahibalo ni {npcName} has been restored to the Libro.
                    </p>

                    {/* Divider */}
                    <div className="book-collect-divider" />

                    {/* Page counter */}
                    <div className="book-collect-counter">
                        📚 Pages collected: <span className="book-collect-counter-num">{totalPages} / 9</span>
                    </div>

                    {/* Progress pips */}
                    <div className="book-collect-pips">
                        {[...Array(9)].map((_, i) => (
                            <div key={i} className={`book-collect-pip ${i < totalPages ? "book-collect-pip--done" : ""}`} />
                        ))}
                    </div>

                    {/* Button */}
                    <button className="book-collect-btn" onClick={onClose}>
                        Padayon →
                    </button>

                    <p className="book-collect-dismiss">Tap anywhere to continue</p>
                </div>
            </div>
        </div>
    );
};

export default BookCollectModal;