import { useState, useEffect, useRef } from "react";
import "./Login.css";
import "./GlobalEffects.css";
import boy from "../assets/images/characters/Boy.png";
import girl from "../assets/images/characters/Girl.png";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import ParticleEffects from "../components/ParticleEffects";
import SaveProgressModal from "../components/progress/SaveProgressModal";
import { hasExistingPlayer, getSavedPlayer } from "../utils/playerStorage";

const Login = () => {
    const navigate = useNavigate();
    const { player, createNewPlayer, startNewGame } = useAuth();

    const [nickname,         setNickname]         = useState("");
    const [loading,          setLoading]           = useState(false);
    const [error,            setError]             = useState("");
    const [showAccountModal, setShowAccountModal]  = useState(false);
    const [savedPlayer,      setSavedPlayer]       = useState(null);

    // Track whether this component initiated a new player creation
    // so the auto-navigate effect doesn't fire mid-flow
    const isCreatingPlayer = useRef(false);

    // ── UC-1.2: Check localStorage once on mount only ─────────────────────────
    useEffect(() => {
        if (hasExistingPlayer()) {
            const saved = getSavedPlayer();
            setSavedPlayer(saved);
            setShowAccountModal(true);
            console.log('🔍 Existing player found:', saved.nickname);
        }
    }, []); // ← empty dep array: runs once, never again

    // ── Auto-navigate ONLY for returning players (not mid-creation flow) ──────
    useEffect(() => {
        if (player && !showAccountModal && !isCreatingPlayer.current) {
            console.log('✅ Player loaded, navigating to dashboard');
            navigate("/dashboard");
        }
    }, [player, showAccountModal, navigate]);

    // ── UC-1.1: Create new player ─────────────────────────────────────────────
    const handlePlayNow = async (e) => {
        e.preventDefault();
        setError("");

        if (!nickname.trim()) {
            setError('Please enter your name to start playing!');
            return;
        }

        setLoading(true);
        isCreatingPlayer.current = true; // block auto-navigate

        try {
            const result = await createNewPlayer(nickname.trim());

            if (!result.success) {
                setError(result.error || 'Failed to create player. Please try again!');
                isCreatingPlayer.current = false;
                return;
            }

            console.log('✅ Player created, navigating to character selection...');
            navigate("/student/characterSelection");

        } catch (err) {
            console.error("❌ Error starting game:", err);
            setError("Something went wrong. Please try again!");
            isCreatingPlayer.current = false;
        } finally {
            setLoading(false);
        }
    };

    // ── UC-1.2: Continue — just close modal and go to dashboard ───────────────
    const handleContinueExisting = () => {
        console.log('✅ Continuing as:', savedPlayer?.nickname);
        setShowAccountModal(false);
        navigate("/dashboard");
    };

    // ── UC-1.2: New Game — wipe everything, show nickname form ────────────────
    const handleNewGame = () => {
        console.log('🆕 New game — clearing player data');
        startNewGame();
        setShowAccountModal(false);
        setSavedPlayer(null);
    };

    // ── Save Progress Modal (UC-1.2) ──────────────────────────────────────────
    if (showAccountModal) {
        return (
            <div className="login-page">
                <div className="login-background"></div>
                <ParticleEffects enableMouseTrail={true} />
                <SaveProgressModal
                    isOpen={showAccountModal}
                    onContinue={handleContinueExisting}
                    onNewGame={handleNewGame}
                    onClose={() => {}}
                />
            </div>
        );
    }

    // ── UC-1.1: Enter Name screen ─────────────────────────────────────────────
    return (
        <div className="login-page">
            <div className="login-background"></div>
            <ParticleEffects enableMouseTrail={true} />

            <div className="character-container">
                <img src={boy}  alt="Boy Character"  className="character boy-character" />
                <img src={girl} alt="Girl Character" className="character girl-character" />
            </div>

            <div className="login-card-wrapper">
                <div className="login-card">
                    <h1 className="login-title">BisaQuest</h1>

                    {error && (
                        <div className="error-message-box">{error}</div>
                    )}

                    <p className="welcome-subtitle">
                        Start your Cebuano learning adventure!
                    </p>

                    <form onSubmit={handlePlayNow} className="login-form-container">
                        <div className="form-group">
                            <label htmlFor="nickname" className="form-label">
                                Enter Your Name
                            </label>
                            <input
                                type="text"
                                id="nickname"
                                name="nickname"
                                value={nickname}
                                onChange={(e) => setNickname(e.target.value)}
                                className="form-input-login"
                                placeholder="Your name here"
                                maxLength={50}
                                autoFocus
                                disabled={loading}
                            />
                        </div>

                        <button
                            type="submit"
                            className="login-button"
                            disabled={loading || !nickname.trim()}
                        >
                            {loading ? "Creating..." : "Play Now"}
                        </button>
                    </form>

                    <div className="game-info">
                        <p className="info-text">
                            Your progress will be saved automatically
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;