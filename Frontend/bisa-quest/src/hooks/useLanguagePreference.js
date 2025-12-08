import { useState, useEffect } from 'react';

/**
 * Custom hook to manage language preferences for quests
 * @param {number} questId - The quest ID (1=Vocabulary, 2=Synonyms, 3=Compound, 4=Narrative)
 * @returns {object} - { language, setLanguage, loading, error }
 */
export const useLanguagePreference = (questId) => {
    const [language, setLanguage] = useState('en');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadLanguagePreference = async () => {
            try {
                setLoading(true);

                // Try to get from localStorage first (faster)
                const cachedLanguage = localStorage.getItem(`quest_${questId}_language`);
                if (cachedLanguage) {
                    setLanguage(cachedLanguage);
                    setLoading(false);
                    return;
                }

                // If not in localStorage, fetch from API
                const sessionData = JSON.parse(localStorage.getItem("session"));
                if (!sessionData?.user?.id) {
                    setLanguage('en');
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

                // Fetch language preference
                const response = await fetch(
                    `${import.meta.env.VITE_API_URL}/api/language-preferences?student_id=${student_id}&quest_id=${questId}`
                );

                if (!response.ok) {
                    throw new Error("Failed to fetch language preference");
                }

                const data = await response.json();
                const preferredLanguage = data.data?.language_code || 'en';

                setLanguage(preferredLanguage);
                // Cache in localStorage
                localStorage.setItem(`quest_${questId}_language`, preferredLanguage);

            } catch (err) {
                setError(err.message);
                // Fallback to English
                setLanguage('en');
            } finally {
                setLoading(false);
            }
        };

        loadLanguagePreference();
    }, [questId]);

    // Function to update language preference
    const updateLanguage = async (newLanguage) => {
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
                `${import.meta.env.VITE_API_URL}/api/language-preferences`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        student_id,
                        quest_id: questId,
                        language_code: newLanguage
                    })
                }
            );

            if (!response.ok) {
                throw new Error("Failed to update language preference");
            }

            // Update state and localStorage
            setLanguage(newLanguage);
            localStorage.setItem(`quest_${questId}_language`, newLanguage);

        } catch (err) {
            setError(err.message);
            // Still update locally even if API fails
            setLanguage(newLanguage);
            localStorage.setItem(`quest_${questId}_language`, newLanguage);
        }
    };

    return { language, setLanguage: updateLanguage, loading, error };
};

export default useLanguagePreference;