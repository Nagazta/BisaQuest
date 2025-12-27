import { useNavigate } from "react-router-dom";
import Button from "../../components/Button";
import CharacterCard from "../../components/CharacterCard";
import ParticleEffects from "../../components/ParticleEffects";
import Boy from "../../assets/images/characters/Boy.png";
import Girl from "../../assets/images/characters/Girl.png";
import "../../pages/Student/CharacterSelectionPage.css";

const CharacterSelectionPage = () => {
  const navigate = useNavigate();

  const characters = [
    {
      id: "male",
      gender: "Roberto",
      image: Boy,
    },
    {
      id: "female",
      gender: "Roberta",
      image: Girl,
    },
  ];

  const handleBack = () => {
    navigate("/dashboard");
  };

  const handleProceed = async (characterId) => {
    try {
      const sessionData = JSON.parse(localStorage.getItem("session"));
      const studentResponse = await fetch(
        `http://localhost:5000/api/student/by-user/${sessionData.user.id}`
      );
      const studentData = await studentResponse.json();
      const student_id = studentData.data.student_id;

      const response = await fetch(
        "http://localhost:5000/api/preferences/character",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            student_id: student_id,
            quest_id: 1,
            character_gender: characterId,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to save character preference");
      }

      // ADD THIS LINE - Update the cache
      localStorage.setItem('quest_1_character', characterId);

      navigate("/student/languageSelection");
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
          <h2 className="selection-prompt">Please Choose a character</h2>

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
