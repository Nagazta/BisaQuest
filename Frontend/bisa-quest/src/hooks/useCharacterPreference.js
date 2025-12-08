import { useState, useEffect } from 'react';

/**
 * Custom hook to manage character preferences
 * @param {number} questId - The quest ID (default: 1)
 * @returns {object} - { character, characterImage, setCharacter, loading, error }
 */
export const useCharacterPreference = (questId = 1) => {
    const [character, setCharacter] = useState('male'); // 'male' or 'female'
    const [characterImage, setCharacterImage] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadCharacterPreference = async () => {
            try {
                setLoading(true);

                // Try to get from localStorage first (faster)
                const cachedCharacter = localStorage.getItem(`quest_${questId}_character`);
                if (cachedCharacter) {
                    setCharacter(cachedCharacter);
                    setLoading(false);
                    return;
                }

                // If not in localStorage, fetch from API
                const sessionData = JSON.parse(localStorage.getItem("session"));
                if (!sessionData?.user?.id) {
                    setCharacter('male');
                    setLoading(false);
                    return;
                }

                const studentResponse = await fetch(
                    `${import.meta.env.VITE_API_URL}/api/student/by-user/${sessionData.user.id}`
                );

                if (!studentResponse.ok) {
                    throw new Error("Failed to fetch student data");
                }

                const studentData = await studentResponse.json();
                const student_id = studentData.data.student_id;

                // Fetch character preference
                const response = await fetch(
                    `${import.meta.env.VITE_API_URL}/api/preferences?student_id=${student_id}&quest_id=${questId}`
                );

                if (!response.ok) {
                    throw new Error("Failed to fetch character preference");
                }

                const data = await response.json();
                const preferredCharacter = data.data?.character_gender || 'male';

                setCharacter(preferredCharacter);
                // Cache in localStorage
                localStorage.setItem(`quest_${questId}_character`, preferredCharacter);

            } catch (err) {
                setError(err.message);
                // Fallback to male
                setCharacter('male');
            } finally {
                setLoading(false);
            }
        };

        loadCharacterPreference();
    }, [questId]);

    // Function to update character preference
    const updateCharacter = async (newCharacter) => {
        try {
            const sessionData = JSON.parse(localStorage.getItem("session"));
            if (!sessionData?.user?.id) {
                throw new Error("Student not logged in");
            }

            const studentResponse = await fetch(
                `${import.meta.env.VITE_API_URL}/api/student/by-user/${sessionData.user.id}`
            );

            if (!studentResponse.ok) {
                throw new Error("Failed to fetch student data");
            }

            const studentData = await studentResponse.json();
            const student_id = studentData.data.student_id;

            // Update in database
            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/api/preferences/character`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        student_id,
                        quest_id: questId,
                        character_gender: newCharacter
                    })
                }
            );

            if (!response.ok) {
                throw new Error("Failed to update character preference");
            }

            // Update state and localStorage
            setCharacter(newCharacter);
            localStorage.setItem(`quest_${questId}_character`, newCharacter);

        } catch (err) {
            setError(err.message);
            // Still update locally even if API fails
            setCharacter(newCharacter);
            localStorage.setItem(`quest_${questId}_character`, newCharacter);
        }
    };

    return {
        character,
        setCharacter: updateCharacter,
        loading,
        error
    };
};

export default useCharacterPreference;