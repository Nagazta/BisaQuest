// components/ChallengeCounter.jsx
// UC-2.2: Shows X/total NPCs completed as a HUD element on the map

const ChallengeCounter = ({ completed = 0, total = 0, label = "Challenges" }) => {
    const allDone = completed >= total && total > 0;

    return (
        <div className={`challenge-counter ${allDone ? "challenge-counter--complete" : ""}`}>
            <span className="challenge-counter__icon">{allDone ? "🏆" : "⚔️"}</span>
            <span className="challenge-counter__text">
                {label}: <strong>{completed}</strong>/{total}
            </span>
            {allDone && <span className="challenge-counter__badge">Complete!</span>}
        </div>
    );
};

export default ChallengeCounter;