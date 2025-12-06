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

            // ADD THIS - Store token for teacher login too
            if (data.success && data.data?.session?.access_token) {
                localStorage.setItem('token', data.data.session.access_token);
            }

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
            localStorage.removeItem('token'); // ADD THIS LINE
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

    async loginStudent(studentId, classCode) {
        try {
            const response = await fetch(`${API_URL}/login-student`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ studentId, classCode }),
            });

            const data = await response.json();

            if (data.success) {
                localStorage.setItem('user', JSON.stringify(data.data.user));
                localStorage.setItem('session', JSON.stringify(data.data.session));
                
                // ADD THIS LINE - Store the access token separately
                if (data.data.session?.access_token) {
                    localStorage.setItem('token', data.data.session.access_token);
                }
            }
            return data;
        } catch (error) {
            console.error('Student login error:', error);
            return { success: false, error: error.message };
        }
    },
};