import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { updateCharacter } from "../../services/playerServices";
import { getPlayerId, saveCharacter, hasCutsceneSeen } from "../../utils/playerStorage";
import Button from "../../components/Button";
import CharacterCard from "../../components/CharacterCard";
import ParticleEffects from "../../components/ParticleEffects";
import FogTransition from "../../components/FogTransition";
import Boy from "../../assets/images/characters/Boy.png";
import Girl from "../../assets/images/characters/Girl.png";
import "./CharacterSelectionPage.css";

const CharacterSelectionPage = () => {
    const navigate = useNavigate();
    const { setCharacter } = useAuth();

    const [fogActive, setFogActive] = useState(false);
    const [nextRoute, setNextRoute] = useState(null);
    const [loadingCharId, setLoadingCharId] = useState(null);

    const characters = [
        { id: "roberto", gender: "Roberto", image: Boy },
        { id: "roberta", gender: "Roberta", image: Girl },
    ];

    const handleBack = () => navigate("/dashboard");

    const handleProceed = async (characterId) => {
        try {
            setLoadingCharId(characterId);
            const playerId = getPlayerId();
            if (!playerId) throw new Error("No player ID found. Please restart the app.");

            await updateCharacter(playerId, characterId);
            saveCharacter(characterId);
            setCharacter(characterId);

            // Decide destination — fog fires first, then navigates there
            const destination = hasCutsceneSeen()
                ? "/dashboard"
                : "/cutscene/story";

            setNextRoute(destination);
            setFogActive(true);             // ← fog wipe starts here

        } catch (err) {
            console.error("Error saving character:", err);
            alert("Failed to save character. Please try again.");
            setLoadingCharId(null);
        }
    };

    // Called by FogTransition at the ~900ms midpoint
    const handleFogDone = () => {
        navigate(nextRoute, { replace: true });
    };

    return (
        <div className="character-selection-container">
            <ParticleEffects enableMouseTrail={false} />

            {/* Fog fires after character is chosen */}
            <FogTransition active={fogActive} onDone={handleFogDone} label="✨ Starting your quest..." />

            <div className="decorative-clouds">
                <div className="cloud cloud-1"></div>
                <div className="cloud cloud-2"></div>
                <div className="cloud cloud-3"></div>
            </div>

            <div className="main-content">
                <Button variant="back" className="back-button" onClick={handleBack}>
                    ← Back
                </Button>

                <div className="selection-content">
                    <h2 className="selection-prompt">Please Choose a Character</h2>

                    <div className="characters-container">
                        {characters.map((character) => (
                            <div key={character.id} className="character-option">
                                <CharacterCard
                                    character={character}
                                    onClick={() => !fogActive && handleProceed(character.id)}
                                    disabled={fogActive || loadingCharId !== null}
                                />
                                <div className="character-name">{character.gender}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CharacterSelectionPage;