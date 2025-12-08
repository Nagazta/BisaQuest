import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getRandomGameSet } from '../data/moduleOneGames';

export const useGameSession = (npcId, gameData, challengeType) => {
    const navigate = useNavigate();
    const [encountersRemaining, setEncountersRemaining] = useState(3);
    const [latestAttempt, setLatestAttempt] = useState(null);
    const [showReplayConfirm, setShowReplayConfirm] = useState(false);
    const [gameStarted, setGameStarted] = useState(false);
    const [gameContent, setGameContent] = useState([]);
    const [startTime, setStartTime] = useState(null);
    const hasCheckedAttempt = useRef(false);

    const startGame = useCallback(() => {
        if (!gameData) return;

        const selectedSet = getRandomGameSet(npcId);

        if (selectedSet) {
            const content = selectedSet.words || selectedSet.items || selectedSet.sentences;
            if (content) {
                setGameContent(content);
                setStartTime(Date.now());
                setGameStarted(true);
                setShowReplayConfirm(false);
            }
        }
    }, [npcId, gameData]);

    useEffect(() => {
        if (!gameData || hasCheckedAttempt.current) return;

        hasCheckedAttempt.current = true;

        const checkPreviousAttempt = async () => {
            try {
                const token = localStorage.getItem('token');

                const response = await fetch(`${import.meta.env.VITE_API_URL}/api/npc/start`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        npcId,
                        challengeType
                    })
                });

                const result = await response.json();

                if (result.success) {
                    setEncountersRemaining(result.data.encountersRemaining);
                    setLatestAttempt(result.data.latestAttempt);

                    if (result.data.latestAttempt) {
                        setShowReplayConfirm(true);
                    } else {
                        startGame();
                    }
                }
            } catch (error) {
                console.error('Error checking previous attempt:', error);
                startGame();
            }
        };

        checkPreviousAttempt();
    }, [gameData, npcId, challengeType, startGame]);

    const handleCancelReplay = useCallback(() => {
        navigate('/student/village');
    }, [navigate]);

    return {
        encountersRemaining,
        latestAttempt,
        showReplayConfirm,
        gameStarted,
        gameContent,
        startTime,
        startGame,
        handleCancelReplay
    };
}; ``