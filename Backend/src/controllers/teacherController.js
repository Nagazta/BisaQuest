import { supabase, supabaseAdmin } from '../config/supabaseClient.js';

export const getDashboardData = async (req, res) => {
    try {
        const teacherUserId = req.user.id; // This is the user_id from JWT

        console.log('Getting dashboard for teacher user_id:', teacherUserId);

        // FIRST: Get teacher_id from Teacher table using user_id
        const { data: teacherData, error: teacherError } = await supabase
            .from('Teacher')
            .select('teacher_id')
            .eq('user_id', teacherUserId)
            .single();

        if (teacherError || !teacherData) {
            console.error('Teacher lookup error:', teacherError);
            throw new Error('Teacher not found');
        }

        console.log('Found teacher_id:', teacherData.teacher_id);

        // NOW: Get students using the correct teacher_id
        const { data: students, error: studentsError } = await supabase
            .from('Student')
            .select(`
                *,
                Users!Student_user_id_fkey (
                    fullname,
                    email,
                    username
                )
            `)
            .eq('teacher_id', teacherData.teacher_id); // Use teacher_id, not user_id

        if (studentsError) {
            console.error('Students query error:', studentsError);
            throw studentsError;
        }

        console.log('Found students:', students?.length || 0);

        const formattedStudents = students.map(s => ({
            ...s,
            fullname: s.Users?.fullname || 'Unknown',
            email: s.Users?.email || '',
            username: s.Users?.username || '',
            overall_progress: s.overall_progress || 0
        }));

        const totalStudents = formattedStudents.length;
        const averageProgress = totalStudents > 0
            ? Math.round(formattedStudents.reduce((sum, s) => sum + (s.overall_progress || 0), 0) / totalStudents)
            : 0;

        const topPerformers = formattedStudents
            .sort((a, b) => (b.overall_progress || 0) - (a.overall_progress || 0))
            .slice(0, 5);

        res.json({
            success: true,
            data: {
                students: formattedStudents,
                statistics: {
                    totalStudents,
                    activeNow: 0,
                    averageProgress,
                    needAttention: 0
                },
                topPerformers
            }
        });
    } catch (error) {
        console.error('Dashboard error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

export const createStudent = async (req, res) => {
    try {
        const teacherUserId = req.user.id;
        const { fullname, studentId } = req.body;

        // Validate inputs
        if (!fullname || !studentId) {
            return res.status(400).json({
                success: false,
                error: 'Full name and Student ID are required'
            });
        }

        // Create valid email format - remove all special characters
        const email = `${studentId}@bisaquest.app`;
        const password = studentId;


        console.log('Creating student:', { fullname, studentId, email });

        // Get teacher_id from Teacher table
        const { data: teacherData, error: teacherError } = await supabase
            .from('Teacher')
            .select('teacher_id')
            .eq('user_id', teacherUserId)
            .single();

        if (teacherError || !teacherData) {
            console.error('Teacher lookup error:', teacherError);
            throw new Error('Teacher not found');
        }

        console.log('Teacher found:', teacherData.teacher_id);

        // Check if student ID already exists
        const { data: existingUser } = await supabase
            .from('Users')
            .select('username')
            .eq('username', studentId)
            .single();

        if (existingUser) {
            return res.status(400).json({
                success: false,
                error: 'Student ID already exists'
            });
        }

        console.log('Creating auth user with admin client...');

        // USE ADMIN CLIENT - bypasses email confirmation
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: {
                fullname: fullname,
                student_id: studentId,
                role: 'student'
            }
        });

        if (authError) {
            console.error('Auth creation error:', authError);
            throw authError;
        }

        console.log('Auth user created:', authData.user.id);

        // Insert into Users table
        const { data: userData, error: userError } = await supabase
            .from('Users')
            .insert([{
                user_id: authData.user.id,
                username: studentId,
                email,
                fullname: fullname,
                role: 'student',
            }])
            .select()
            .single();

        if (userError) {
            console.error('Users table insert error:', userError);
            throw userError;
        }

        console.log('User record created:', userData.user_id);

        // Insert into Student table
        const { data: studentData, error: studentError } = await supabase
            .from('Student')
            .insert([{
                user_id: authData.user.id,
                teacher_id: teacherData.teacher_id,
            }])
            .select()
            .single();

        if (studentError) {
            console.error('Student table insert error:', studentError);
            throw studentError;
        }

        console.log('Student record created:', studentData.student_id);

        res.status(201).json({
            success: true,
            data: {
                user: userData,
                student: studentData,
                credentials: {
                    studentId,
                    password: studentId
                }
            }
        });
    } catch (error) {
        console.error('Create student error:', error);
        res.status(400).json({
            success: false,
            error: error.message || 'Failed to create student'
        });
    }
};