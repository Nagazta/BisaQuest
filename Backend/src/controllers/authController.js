import { supabase } from '../config/supabaseClient.js';

export const register = async (req, res) => {
    try {
        const { email, password, firstName, lastName, teacherID } = req.body;
        if (!email || !password || !firstName || !lastName) {
            return res.status(400).json({
                success: false,
                error: 'Please provide all required fields'
            });
        }

        const { data: authData, error: authError } = await supabase.auth.signUp({
            email,
            password,
        });

        if (authError) throw authError;

        const { data: userData, error: userError } = await supabase
            .from('users')
            .insert([
                {
                    user_id: authData.user.id,
                    username: email.split('@')[0],
                    email: email,
                    fullname: `${firstName} ${lastName}`.trim(),
                    role: 'teacher',
                },
            ])
            .select()
            .single();

        if (userError) throw userError;

        const teacherInsert = {
            user_id: authData.user.id,
        };

        if (teacherID) {
            teacherInsert.teacher_identifier = teacherID;
        }

        const { data: teacherData, error: teacherError } = await supabase
            .from('teacher')
            .insert([teacherInsert])
            .select()
            .single();

        if (teacherError) throw teacherError;

        res.status(201).json({
            success: true,
            message: 'Teacher registered successfully',
            data: {
                user: userData,
                teacher: teacherData
            }
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(400).json({
            success: false,
            error: error.message || 'Registration failed'
        });
    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                error: 'Please provide email and password'
            });
        }
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (authError) throw authError;

        const { data: userData, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('user_id', authData.user.id)
            .single();

        if (userError) throw userError;

        let roleData = null;
        if (userData.role === 'teacher') {
            const { data: teacherData, error: teacherError } = await supabase
                .from('teacher')
                .select('*')
                .eq('user_id', authData.user.id)
                .single();

            if (teacherError) throw teacherError;
            roleData = teacherData;
        } else if (userData.role === 'student') {
            const { data: studentData, error: studentError } = await supabase
                .from('student')
                .select('*')
                .eq('user_id', authData.user.id)
                .single();

            if (studentError) throw studentError;
            roleData = studentData;
        }

        res.json({
            success: true,
            message: 'Login successful',
            data: {
                user: userData,
                roleData: roleData,
                session: authData.session,
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(401).json({
            success: false,
            error: error.message || 'Login failed'
        });
    }
};

// Logout
export const logout = async (req, res) => {
    try {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;

        res.json({
            success: true,
            message: 'Logged out successfully'
        });

    } catch (error) {
        console.error('Logout error:', error);
        res.status(400).json({
            success: false,
            error: error.message || 'Logout failed'
        });
    }
};

// Get Current Session
export const getSession = async (req, res) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.json({
                success: true,
                session: null
            });
        }

        const token = authHeader.replace('Bearer ', '');
        const { data: { user }, error } = await supabase.auth.getUser(token);

        if (error) throw error;

        const { data: userData, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('user_id', user.id)
            .single();

        if (userError) throw userError;

        res.json({
            success: true,
            session: { user: userData }
        });

    } catch (error) {
        console.error('Get session error:', error);
        res.status(401).json({
            success: false,
            error: error.message
        });
    }
};

// Create Student (Teacher only)
export const createStudent = async (req, res) => {
    try {
        const { email, password, firstName, lastName, teacherID } = req.body;

        if (!email || !password || !firstName || !lastName || !teacherID) {
            return res.status(400).json({
                success: false,
                error: 'Please provide all required fields'
            });
        }

        const { data: authData, error: authError } = await supabase.auth.signUp({
            email,
            password,
        });

        if (authError) throw authError;

        const { data: userData, error: userError } = await supabase
            .from('users')
            .insert([
                {
                    user_id: authData.user.id,
                    username: email.split('@')[0],
                    email: email,
                    fullname: `${firstName} ${lastName}`.trim(),
                    role: 'student',
                },
            ])
            .select()
            .single();

        if (userError) throw userError;

        const { data: studentData, error: studentError } = await supabase
            .from('student')
            .insert([
                {
                    user_id: authData.user.id,
                    teacher_id: teacherID,
                },
            ])
            .select()
            .single();

        if (studentError) throw studentError;

        res.status(201).json({
            success: true,
            message: 'Student created successfully',
            data: {
                user: userData,
                student: studentData
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

export const loginStudent = async (req, res) => {
    try {
        const { studentId, classCode } = req.body;

        if (!studentId || !classCode) {
            return res.status(400).json({
                success: false,
                error: 'Please provide student ID and class code'
            });
        }

        const { data: studentData, error: studentError } = await supabase
            .from('student')
            .select('*, users(*)')
            .eq('student_id', studentId)
            .eq('class_code', classCode)
            .single();

        if (studentError || !studentData) {
            return res.status(401).json({
                success: false,
                error: 'Invalid student ID or class code'
            });
        }

        res.json({
            success: true,
            message: 'Student login successful',
            data: {
                user: studentData.users,
                roleData: studentData,
                session: { user_id: studentData.users.user_id },
            }
        });

    } catch (error) {
        console.error('Student login error:', error);
        res.status(401).json({
            success: false,
            error: error.message || 'Student login failed'
        });
    }
};