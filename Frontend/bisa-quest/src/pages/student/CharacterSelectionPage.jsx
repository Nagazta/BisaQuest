import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { updateCharacter } from "../../services/playerServices";
import { getPlayerId, saveCharacter } from "../../utils/playerStorage";
import Button from "../../components/Button";
import CharacterCard from "../../components/CharacterCard";
import ParticleEffects from "../../components/ParticleEffects";
import Boy from "../../assets/images/characters/Boy.png";
import Girl from "../../assets/images/characters/Girl.png";
import "../../pages/Student/CharacterSelectionPage.css";

const CharacterSelectionPage = () => {
    const navigate  = useNavigate();
    const { setCharacter } = useAuth(); // updates AuthContext state

    const characters = [
        { id: "roberto", gender: "Roberto", image: Boy  },
        { id: "roberta", gender: "Roberta", image: Girl }
    ];

    const handleBack = () => {
        navigate("/dashboard");
    };

    const handleProceed = async (characterId) => {
        try {
            const playerId = getPlayerId();
            if (!playerId) throw new Error("No player ID found. Please restart the app.");

            // Save to DB
            await updateCharacter(playerId, characterId);

            // Cache in localStorage + update context
            saveCharacter(characterId);
            setCharacter(characterId);

            navigate("/dashboard");

        } catch (err) {
            console.error("Error saving character:", err);
            alert("Failed to save character. Please try again.");
        }
    };

    return (
        <div className="character-selection-container">
            <ParticleEffects enableMouseTrail={false} />

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
                                    onClick={() => handleProceed(character.id)}
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