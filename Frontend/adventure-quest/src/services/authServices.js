const API_URL = 'http://localhost:5000/api/auth';

export const authService = {
    async registerTeacher(email, password, firstName, lastName, teacherID = '') {
        try {
            const response = await fetch(`${API_URL}/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email,
                    password,
                    firstName,
                    lastName,
                    teacherID
                }),
            });

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Registration error:', error);
            return { success: false, error: error.message };
        }
    },

    async login(email, password) {
        try {
            const response = await fetch(`${API_URL}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            return data;
        } catch (error) {
            console.error('Login error:', error);
            return { success: false, error: error.message };
        }
    },

    async logout() {
        try {
            const response = await fetch(`${API_URL}/logout`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const data = await response.json();
            localStorage.removeItem('session');
            localStorage.removeItem('user');
            return data;
        } catch (error) {
            console.error('Logout error:', error);
            return { success: false, error: error.message };
        }
    },

    async getSession() {
        try {
            const session = localStorage.getItem('session');
            const user = localStorage.getItem('user');

            if (!session || !user) {
                return { success: true, session: null };
            }

            const sessionData = JSON.parse(session);
            const userData = JSON.parse(user);

            const response = await fetch(`${API_URL}/session`, {
                headers: {
                    'Authorization': `Bearer ${sessionData.access_token}`,
                },
            });

            const data = await response.json();

            if (data.success && data.session) {
                return { success: true, session: data.session, user: userData };
            }

            return { success: true, session: null };
        } catch (error) {
            console.error('Get session error:', error);
            return { success: false, error: error.message };
        }
    },
};