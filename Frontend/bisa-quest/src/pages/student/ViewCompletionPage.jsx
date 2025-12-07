import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import ProgressBar from "../../components/ProgressBar";
import GuideDialogueBox from "../../components/GuideDialogueBox";
import Button from "../../components/Button";
import ParticleEffects from "../../components/ParticleEffects";
import "./styles/ViewCompletionPage.css";

// Import background image
import VillageBackground from "../../assets/images/environments/village.png";

const ViewCompletionPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [summaryData, setSummaryData] = useState(null);
  const [loading, setLoading] = useState(true);

  const {
    showSummary = false,
    environmentProgress = 0,
    returnTo = "/student/village",
  } = location.state || {};

  useEffect(() => {
    if (!showSummary) {
      navigate("/student/village");
      return;
    }

    fetchSummaryData();
  }, [showSummary]);

  const fetchSummaryData = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/npc/environment-progress?environmentType=village`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const result = await response.json();

      if (result.success) {
        setSummaryData(result.data);
      }
    } catch (error) {
      console.error("Error fetching summary:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleReturn = () => {
    navigate(returnTo, { state: { completed: true } });
  };

  const handleProceedToNext = () => {
    // Navigate to next module or instructions
    navigate("/dashboard", {
      state: {
        summaryCompleted: true,
        returnTo: "/student/village",
      },
    });
  };

  // Calculate total scores
  const calculateTotalScore = () => {
    if (!summaryData) return { correct: 0, total: 0 };

    let totalCorrect = 0;
    let totalQuestions = 0;

    summaryData.npcProgress.forEach((npc) => {
      if (npc.bestScore !== null) {
        totalCorrect += npc.bestScore;
        // Assuming each NPC has fixed number of questions (adjust as needed)
        totalQuestions += 5; // or get from backend
      }
    });

    return { correct: totalCorrect, total: totalQuestions };
  };

  const getNPCDisplayName = (npcId) => {
    const names = {
      nando: "Nando (Word Matching)",
      ligaya: "Ligaya (Picture Association)",
      vicente: "Vicente (Sentence Completion)",
    };
    return names[npcId] || npcId;
  };

  if (loading) {
    return (
      <div className="view-completion-page">
        <div
          className="completion-background"
          style={{ backgroundImage: `url(${VillageBackground})` }}
        />
        <div className="loading-message">Loading Summary...</div>
      </div>
    );
  }

  const { correct, total } = calculateTotalScore();
  const finalScore = total > 0 ? Math.round((correct / total) * 100) : 0;

  return (
    <div className="view-completion-page">
      <ParticleEffects enableMouseTrail={false} />

      {/* Background */}
      <div
        className="completion-background"
        style={{ backgroundImage: `url(${VillageBackground})` }}
      />

      {/* Progress Bar */}
      <ProgressBar
        progress={environmentProgress}
        variant="summary"
        showLabel={true}
      />

      {/* Main Content - Centered Summary Box */}
      <div className="completion-content-centered">
        <div className="completion-summary-box">
          <h2 className="summary-title">Summary Performance</h2>

          <div className="summary-overall">
            <p className="summary-stat">Words Correct: {correct}/{total}</p>
            <p className="summary-stat">Final Score: {finalScore}</p>
          </div>

          {/* Game Breakdown */}
          <div className="game-breakdown">
            <h3 className="breakdown-title">Quest Breakdown:</h3>
            {summaryData?.npcProgress.map((npc) => (
              <div key={npc.npcId} className="breakdown-item">
                <span className="breakdown-npc-name">
                  {getNPCDisplayName(npc.npcId)}
                </span>
                <div className="breakdown-stats">
                  <span className="breakdown-stat">
                    Attempts: {npc.encounters}/3
                  </span>
                  <span className="breakdown-stat">
                    Best Score: {npc.bestScore !== null ? npc.bestScore : "N/A"}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <Button onClick={handleReturn} variant="primary" className="return-button">
            Return
          </Button>
        </div>
      </div>

      {/* Bottom Dialogue Box */}
      <div className="completion-dialogue-wrapper">
        <GuideDialogueBox
          name="The Guide"
          text={
            environmentProgress >= 100
              ? "Excellent work! You've mastered all the village quests. You're ready for the next adventure!"
              : environmentProgress >= 75
              ? "Great progress! You've completed most of the challenges. Keep going to master them all!"
              : "You're making good progress. Complete more quests to unlock the next area!"
          }
        />
      </div>

      {/* Optional: Proceed Button if progress >= 75% */}
      {environmentProgress >= 75 && (
        <Button
          onClick={handleProceedToNext}
          variant="primary"
          className="proceed-next-button"
        >
          Proceed to Dashboard →
        </Button>
      )}

      {/* Decorative grass */}
      <div className="grass-decoration-completion" />
    </div>
  );
};

export default ViewCompletionPage;