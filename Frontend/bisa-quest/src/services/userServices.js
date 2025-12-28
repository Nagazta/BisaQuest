// services/autoUserService.js
// Frontend service for auto-user (no authentication)

const API_URL = `${import.meta.env.VITE_API_URL}/api/auto-user`;

export const autoUserService = {
    /**
     * Create a new auto user (no login required)
     * @param {string} nickname - Optional player nickname
     * @returns {Promise} User data with user_id and student_id
     */
    async createUser(nickname = 'Guest Player') {
        try {
            const response = await fetch(`${API_URL}/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ nickname }),
            });

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Create user error:', error);
            return { success: false, error: error.message };
        }
    },

    /**
     * Get user information
     * @param {string} userId - UUID of the user
     */
    async getUser(userId) {
        try {
            const response = await fetch(`${API_URL}/${userId}`);
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Get user error:', error);
            return { success: false, error: error.message };
        }
    },

    /**
     * Update user nickname
     * @param {string} userId - UUID of the user
     * @param {string} nickname - New nickname
     */
    async updateNickname(userId, nickname) {
        try {
            const response = await fetch(`${API_URL}/${userId}/nickname`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ nickname }),
            });

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Update nickname error:', error);
            return { success: false, error: error.message };
        }
    },

    /**
     * Get user progress
     * @param {string} userId - UUID of the user
     */
    async getProgress(userId) {
        try {
            const response = await fetch(`${API_URL}/${userId}/progress`);
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Get progress error:', error);
            return { success: false, error: error.message };
        }
    },

    /**
     * Update progress
     * @param {string} userId - UUID of the user
     * @param {object} updates - Progress updates
     */
    async updateProgress(userId, updates) {
        try {
            const response = await fetch(`${API_URL}/${userId}/progress`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updates),
            });

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Update progress error:', error);
            return { success: false, error: error.message };
        }
    },

    /**
     * Get user statistics
     * @param {string} userId - UUID of the user
     */
    async getStats(userId) {
        try {
            const response = await fetch(`${API_URL}/${userId}/stats`);
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Get stats error:', error);
            return { success: false, error: error.message };
        }
    },

    /**
     * Reset all progress
     * @param {string} userId - UUID of the user
     */
    async resetProgress(userId) {
        try {
            const response = await fetch(`${API_URL}/${userId}/reset`, {
                method: 'DELETE',
            });

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Reset progress error:', error);
            return { success: false, error: error.message };
        }
    },
};