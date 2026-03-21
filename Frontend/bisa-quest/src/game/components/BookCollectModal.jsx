// src/components/BookCollectModal.jsx
// ─────────────────────────────────────────────────────────────────────────────
//  Shown for ~3 seconds when a player collects a Libro page fragment.
//  Call it from HousePage after saveNPCProgress.
//
//  Usage:
//    const [showPageModal, setShowPageModal] = useState(false);
//    const [collectedPage, setCollectedPage] = useState(null);
//
//    // after quest passes:
//    const isNew = awardLibroPage(environment, npcId);
//    if (isNew) {
//        setCollectedPage({ npcName, pageNumber });
//        setShowPageModal(true);
//    }
//
//    <BookCollectModal
//        isOpen={showPageModal}
//        npcName={collectedPage?.npcName}
//        pageNumber={collectedPage?.pageNumber}
//        totalPages={getLibroPageCount()}
//        onClose={() => setShowPageModal(false)}
//    />
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect } from "react";
import "./BookCollectModal.css";

const BookCollectModal = ({
    isOpen,
    npcName      = "Your neighbor",
    pageNumber   = 1,       // which page number this is (1–9)
    totalPages   = 1,       // total pages collected so far (for "X / 9")
    environment  = "village",
    onClose,
    autoDismiss  = 4000,    // auto-close after ms (0 = manual only)
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
        forest:  "Forest Fragment",
        castle:  "Castle Fragment",
    };

    const PAGE_COLOR = {
        village: "#c8a96e",
        forest:  "#7aaa6e",
        castle:  "#9e8ec8",
    };

    return (
        <div className="book-collect-overlay" onClick={onClose}>
            <div
                className="book-collect-modal"
                style={{ "--page-color": PAGE_COLOR[environment] || "#c8a96e" }}
                onClick={e => e.stopPropagation()}
            >
                {/* Floating pages animation */}
                <div className="book-collect-pages-burst">
                    {[...Array(5)].map((_, i) => (
                        <span key={i} className={`burst-page burst-page--${i + 1}`}>📄</span>
                    ))}
                </div>

                {/* Book icon */}
                <div className="book-collect-icon">
                    <span className="book-icon-emoji">📖</span>
                    <div className="book-collect-glow" />
                </div>

                {/* Text */}
                <div className="book-collect-text">
                    <p className="book-collect-subtitle">A scattered page found!</p>
                    <h2 className="book-collect-title">
                        {ENV_LABEL[environment]} — Page {pageNumber}
                    </h2>
                    <p className="book-collect-npc">
                        {npcName}'s knowledge has been restored to the Libro.
                    </p>
                    <p className="book-collect-counter">
                        📚 Pages collected: <strong>{totalPages} / 9</strong>
                    </p>
                </div>

                <button className="book-collect-btn" onClick={onClose}>
                    Continue →
                </button>

                <p className="book-collect-dismiss">Tap anywhere to continue</p>
            </div>
        </div>
    );
};

export default BookCollectModal;