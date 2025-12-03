const API_URL = 'http://localhost:5000/api/teacher';

export const teacherService = {
    async getDashboardData() {
        try {
            const session = JSON.parse(localStorage.getItem('session'));
            const response = await fetch(`${API_URL}/dashboard`, {
                headers: {
                    'Authorization': `Bearer ${session.access_token}`,
                },
            });
            return await response.json();
        } catch (error) {
            console.error('Get dashboard error:', error);
            return { success: false, error: error.message };
        }
    },

    async createStudent(studentData) {
        try {
            const session = JSON.parse(localStorage.getItem('session'));

            const response = await fetch(`${API_URL}/create-student`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.access_token}`,
                },
                body: JSON.stringify({
                    fullname: studentData.fullname,
                    studentId: studentData.studentId
                }),
            });

            return await response.json();
        } catch (error) {
            console.error('Create student error:', error);
            return { success: false, error: error.message };
        }
    }
};