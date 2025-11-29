import { supabase } from '../config/supabaseClient.js';

// Register Teacher
export const register = async (req, res) => {
    try {
        const { email, password, firstName, lastName, teacherID } = req.body;

        // Validation
        if (!email || !password || !firstName || !lastName) {
            return res.status(400).json({
                success: false,
                error: 'Please provide all required fields'
            });
        }

        // 1. Create auth user in Supabase
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email,
            password,
        });

        if (authError) throw authError;

        // 2. Create user record in Users table
        const { data: userData, error: userError } = await supabase
            .from('Users')
            .insert([
                {
                    user_id: authData.user.id,  // ✅ Changed from user_ID to user_id
                    username: email.split('@')[0],
                    email: email,
                    fullname: `${firstName} ${lastName}`.trim(),
                    role: 'teacher',
                },
            ])
            .select()
            .single();

        if (userError) throw userError;

        // 3. Create teacher record in Teacher table
        const teacherInsert = {
            user_id: authData.user.id,  // ✅ Changed from user_ID to user_id
        };

        // Add optional teacher identifier if provided
        if (teacherID) {
            teacherInsert.teacher_identifier = teacherID;
        }

        const { data: teacherData, error: teacherError } = await supabase
            .from('Teacher')
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

// Login (Teacher or Student)
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validation
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                error: 'Please provide email and password'
            });
        }

        // 1. Sign in with Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (authError) throw authError;

        // 2. Get user details from Users table
        const { data: userData, error: userError } = await supabase
            .from('Users')
            .select('*')
            .eq('user_id', authData.user.id)  // ✅ Changed from user_ID to user_id
            .single();

        if (userError) throw userError;

        // 3. Get role-specific data
        let roleData = null;
        if (userData.role === 'teacher') {
            const { data: teacherData, error: teacherError } = await supabase
                .from('Teacher')
                .select('*')
                .eq('user_id', authData.user.id)  // ✅ Changed from user_ID to user_id
                .single();

            if (teacherError) throw teacherError;
            roleData = teacherData;
        } else if (userData.role === 'student') {
            const { data: studentData, error: studentError } = await supabase
                .from('Student')
                .select('*')
                .eq('user_id', authData.user.id)  // ✅ Changed from user_ID to user_id
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

        // Get full user data
        const { data: userData, error: userError } = await supabase
            .from('Users')
            .select('*')
            .eq('user_id', user.id)  // ✅ Changed from user_ID to user_id
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

        // Validation
        if (!email || !password || !firstName || !lastName || !teacherID) {
            return res.status(400).json({
                success: false,
                error: 'Please provide all required fields'
            });
        }

        // 1. Create auth user
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email,
            password,
        });

        if (authError) throw authError;

        // 2. Create user record
        const { data: userData, error: userError } = await supabase
            .from('Users')
            .insert([
                {
                    user_id: authData.user.id,  // ✅ Changed from user_ID to user_id
                    username: email.split('@')[0],
                    email: email,
                    fullname: `${firstName} ${lastName}`.trim(),
                    role: 'student',
                },
            ])
            .select()
            .single();

        if (userError) throw userError;

        // 3. Create student record
        const { data: studentData, error: studentError } = await supabase
            .from('Student')
            .insert([
                {
                    user_id: authData.user.id,  // ✅ Changed from user_ID to user_id
                    teacher_id: teacherID,  // ✅ Changed from teacher_ID to teacher_id
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