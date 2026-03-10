// ─────────────────────────────────────────────────────────────────────────────
//  ProtectedRoute — blocks unauthenticated / character-less players
// ─────────────────────────────────────────────────────────────────────────────

import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import securityImg from "../assets/images/environments/scenario/security.png";
import "./ProtectedRoute.css";

const ProtectedRoute = ({ children }) => {
    const { player } = useAuth();
    const navigate = useNavigate();

    // Not logged in OR no character selected → show guard
    if (!player || !player.character) {
        return (
            <div className="guard-container">
                <img
                    src={securityImg}
                    alt="Guard"
                    className="guard-bg"
                    draggable={false}
                />

                <div className="guard-content">
                    <div className="guard-speech">
                        <div className="guard-speech-border">
                            <p className="guard-speech-text">
                                Please login or create a character first!
                            </p>
                        </div>
                    </div>

                    <button
                        className="guard-btn"
                        onClick={() => navigate("/login")}
                    >
                        Go to Login
                    </button>
                </div>
            </div>
        );
    }

    return children;
};

export default ProtectedRoute;
