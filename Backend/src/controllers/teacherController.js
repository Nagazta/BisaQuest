import { supabase, supabaseAdmin } from '../config/supabaseClient.js';

export const getDashboardData = async (req, res) => {
    try {
        const teacherUserId = req.user.id;

        const { data: teacherData, error: teacherError } = await supabase
            .from('teacher')
            .select('teacher_id')
            .eq('user_id', teacherUserId)
            .single();

        if (teacherError || !teacherData) {
            throw new Error('Teacher not found');
        }

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
            .eq('teacher_id', teacherData.teacher_id);

        if (studentsError) {
            throw studentsError;
        }

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

        // Get teacher_id from Teacher table
        const { data: teacherData, error: teacherError } = await supabase
            .from('teacher')
            .select('teacher_id')
            .eq('user_id', teacherUserId)
            .single();

        if (teacherError || !teacherData) {
            throw new Error('Teacher not found');
        }

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
            throw authError;
        }

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
            throw userError;
        }

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
            throw studentError;
        }

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
        res.status(400).json({
            success: false,
            error: error.message || 'Failed to create student'
        });
    }
};