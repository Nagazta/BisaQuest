import { supabase, supabaseAdmin } from '../config/supabaseClient.js';

export const getDashboardData = async (req, res) => {
    try {
        const teacherUserId = req.user.id;

        console.log('Getting dashboard for teacher user_id:', teacherUserId);
        const { data: teacherData, error: teacherError } = await supabase
            .from('teacher')
            .select('teacher_id')
            .eq('user_id', teacherUserId)
            .single();

        if (teacherError || !teacherData) {
            console.error('Teacher lookup error:', teacherError);
            throw new Error('Teacher not found');
        }

        console.log('Found teacher_id:', teacherData.teacher_id);

        const { data: students, error: studentsError } = await supabase
            .from('student')
            .select(`
                *,
                users!student_user_id_fkey (
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
            fullname: s.users?.fullname || 'Unknown',
            email: s.users?.email || '',
            username: s.users?.username || '',
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
        const { fullname, studentId, classCode } = req.body;

        // Validate inputs
        if (!fullname || !studentId || !classCode) {
            return res.status(400).json({
                success: false,
                error: 'Full name, Student ID, and Class Code are required'
            });
        }

        // Create valid email format - remove all special characters
        const email = `${studentId}@bisaquest.app`;
        const password = studentId;


        console.log('Creating student:', { fullname, studentId, classCode, email });

        // Get teacher_id from Teacher table
        const { data: teacherData, error: teacherError } = await supabase
            .from('teacher')
            .select('teacher_id')
            .eq('user_id', teacherUserId)
            .single();

        if (teacherError || !teacherData) {
            console.error('Teacher lookup error:', teacherError);
            throw new Error('Teacher not found');
        }

        console.log('Teacher found:', teacherData.teacher_id);

        // Check if student ID already exists in users table
        const { data: existingUser } = await supabase
            .from('users')
            .select('user_id')
            .eq('username', studentId)
            .maybeSingle();

        // Check for old deleted accounts
        const { data: existingStudent } = await supabase
            .from('student')
            .select('student_id')
            .eq('class_code', classCode)
            .maybeSingle();

        if (existingUser || existingStudent) {
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
            .from('users')
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

        const { data: studentData, error: studentError } = await supabase
            .from('student')
            .insert([{
                user_id: authData.user.id,
                teacher_id: teacherData.teacher_id,
                class_code: classCode,
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
                    classCode
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