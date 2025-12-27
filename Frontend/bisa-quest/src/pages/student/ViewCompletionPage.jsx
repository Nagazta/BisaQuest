import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import ProgressBar from "../../components/ProgressBar";
import GuideDialogueBox from "../../components/GuideDialogueBox";
import Button from "../../components/Button";
import ParticleEffects from "../../components/ParticleEffects";
import "./ViewCompletionPage.css";
import "../../components/QuestStartModal.css"; // Import QuestStartModal styles

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
    } finally {
      setLoading(false);
    }
  };

  const handleReturn = () => {
    navigate(returnTo, { state: { completed: true } });
  };

  const handleProceedToNext = async () => {
    try {
      const token = localStorage.getItem("token");
      const sessionData = JSON.parse(localStorage.getItem("session"));

      if (!sessionData?.user?.id || !token) {
        navigate("/dashboard");
        return;
      }

      const studentResponse = await fetch(
        `${import.meta.env.VITE_API_URL}/api/student/by-user/${sessionData.user.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!studentResponse.ok) {
        throw new Error("Failed to fetch student data");
      }

      const studentData = await studentResponse.json();
      const studentId = studentData.data.student_id;

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/completion/record`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            studentId: studentId,
            moduleId: 1
          })
        }
      );

      const result = await response.json();

      if (result.success) {
        setTimeout(() => {
          navigate("/dashboard", {
            state: {
              moduleCompleted: true,
              moduleId: 1
            }
          });
        }, 500);
      } else {
        navigate("/dashboard");
      }
    } catch (error) {
      navigate("/dashboard");
    }
  };

  const calculateTotalScore = () => {
    if (!summaryData) return { correct: 0, total: 0 };

    let totalCorrect = 0;
    let totalQuestions = 0;

    summaryData.npcProgress.forEach((npc) => {
      if (npc.bestScore !== null) {
        totalCorrect += npc.bestScore;
        totalQuestions += 5;
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

      <div
        className="completion-background"
        style={{ backgroundImage: `url(${VillageBackground})` }}
      />

      <ProgressBar
        progress={environmentProgress}
        variant="summary"
        showLabel={true}
      />

      {/* Using QuestStartModal classes */}
      <div className="completion-content-centered">
        <div className="quest-modal-scroll summary">
          <div className="scroll-content">
            <h2 className="quest-modal-title">Quest Complete!</h2>

            <div className="quest-modal-divider"></div>

            <div className="quest-modal-quest-name">
              {finalScore}%
            </div>

            <p className="quest-modal-instructions">
              Words Correct: {correct}/{total} | Progress: {environmentProgress}%
            </p>

            <div className="quest-modal-divider"></div>

            <p className="quest-modal-message">Quest Breakdown:</p>

            <div className="completion-npc-list">
              {summaryData?.npcProgress.map((npc) => (
                <div key={npc.npcId} className="completion-breakdown-item">
                  <div className="breakdown-row">
                    <span className="breakdown-npc-name">
                      {getNPCDisplayName(npc.npcId)}
                    </span>
                    <span className={`breakdown-status ${npc.completed ? 'completed' : 'incomplete'}`}>
                      {npc.completed ? '✓' : '○'}
                    </span>
                  </div>
                  <div className="breakdown-stats">
                    <span>Attempts: {npc.encounters}/3</span>
                    <span>Best Score: {npc.bestScore !== null ? `${npc.bestScore}/5` : "N/A"}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="quest-modal-divider"></div>

            <p className="quest-modal-encouragement">
              {environmentProgress >= 100
                ? "Excellent work! You've mastered all the village quests!"
                : environmentProgress >= 75
                ? "Great progress! Keep going to master them all!"
                : "You're making good progress. Complete more quests!"}
            </p>

            <Button
              onClick={handleReturn}
              variant="primary"
              className="quest-modal-button"
            >
              Return to Village
            </Button>

            {environmentProgress >= 75 && (
              <Button
                onClick={handleProceedToNext}
                variant="primary"
                className="quest-modal-button completion-dashboard-btn"
              >
                Go to Dashboard →
              </Button>
            )}
          </div>
        </div>
      </div>

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

      <div className="grass-decoration-completion" />
    </div>
  );
};

export default ViewCompletionPage;