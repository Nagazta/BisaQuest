// context/AuthContext.jsx
// Soft logout - navigates to login but keeps localStorage

import { createContext, useContext, useState, useEffect } from 'react';
import { autoUserService } from '../services/userServices';
import LoadingScreen from '../components/LoadingScreen';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkExistingUser();
    }, []);

    const checkExistingUser = async () => {
        console.log('🔍 Checking for existing user...');
        
        try {
            const userId = localStorage.getItem('bisaquest_user_id');
            const studentId = localStorage.getItem('bisaquest_student_id');

            console.log('📦 localStorage values:', { userId, studentId });

            if (userId && studentId) {
                console.log('✅ Found user in localStorage, fetching from Supabase...');
                
                const result = await autoUserService.getUser(userId);
                
                if (result.success) {
                    const userData = {
                        id: result.data.user.user_id,
                        student_id: result.data.student.student_id,
                        username: result.data.user.username,
                        nickname: result.data.user.fullname,
                        role: 'student',
                        isAutoUser: true
                    };
                    
                    setUser(userData);
                    console.log('✅ User loaded:', userData.nickname);
                } else {
                    console.log('⚠️ User not found in database, clearing localStorage');
                    localStorage.removeItem('bisaquest_user_id');
                    localStorage.removeItem('bisaquest_student_id');
                    setUser(null);
                }
            } else {
                console.log('ℹ️ No existing user found in localStorage');
                setUser(null);
            }
        } catch (error) {
            console.error('❌ Check user error:', error);
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    const createNewUser = async (nickname = 'Guest Player') => {
        console.log('=== CREATE NEW USER START ===');
        console.log('📝 Nickname:', nickname);
        
        try {
            console.log('📡 Calling API...');
            const result = await autoUserService.createUser(nickname);
            console.log('📦 API Response:', result);
            
            if (result.success) {
                const { user_id, student_id, username } = result.data;
                
                console.log('✅ User created in database!');
                console.log('   user_id:', user_id);
                console.log('   student_id:', student_id);
                
                console.log('💾 Saving to localStorage...');
                
                try {
                    localStorage.setItem('bisaquest_user_id', user_id);
                    console.log('   ✓ Saved bisaquest_user_id');
                    
                    localStorage.setItem('bisaquest_student_id', student_id);
                    console.log('   ✓ Saved bisaquest_student_id');
                    
                    const verify_user = localStorage.getItem('bisaquest_user_id');
                    const verify_student = localStorage.getItem('bisaquest_student_id');
                    
                    console.log('🔍 Verification:');
                    console.log('   user_id saved:', verify_user === user_id ? '✅' : '❌', verify_user);
                    console.log('   student_id saved:', verify_student === student_id ? '✅' : '❌', verify_student);
                    
                    if (verify_user !== user_id || verify_student !== student_id) {
                        console.error('❌ LOCALSTORAGE SAVE FAILED!');
                        return { 
                            success: false, 
                            error: 'Failed to save to localStorage' 
                        };
                    }
                    
                } catch (storageError) {
                    console.error('❌ localStorage.setItem failed:', storageError);
                    return { 
                        success: false, 
                        error: 'Cannot save data' 
                    };
                }
                
                const userData = {
                    id: user_id,
                    student_id: student_id,
                    username: username,
                    nickname: nickname,
                    role: 'student',
                    isAutoUser: true
                };
                
                console.log('🔧 Setting user state:', userData);
                setUser(userData);
                
                console.log('✅ CREATE NEW USER COMPLETE');
                console.log('=== END ===');
                
                return { success: true, data: { user_id, student_id } };
            } else {
                console.error('❌ API returned error:', result.error);
                return { success: false, error: result.error };
            }
        } catch (error) {
            console.error('❌ Create user exception:', error);
            return { success: false, error: error.message };
        }
    };

    const updateNickname = async (newNickname) => {
        if (!user?.id) return { success: false, error: 'No user logged in' };

        const result = await autoUserService.updateNickname(user.id, newNickname);
        
        if (result.success) {
            setUser(prev => ({ ...prev, nickname: newNickname }));
        }
        
        return result;
    };

    const getProgress = async () => {
        if (!user?.id) return { success: false, error: 'No user logged in' };
        return await autoUserService.getProgress(user.id);
    };

    const updateProgress = async (updates) => {
        if (!user?.id) return { success: false, error: 'No user logged in' };
        return await autoUserService.updateProgress(user.id, updates);
    };

    const getStats = async () => {
        if (!user?.id) return { success: false, error: 'No user logged in' };
        return await autoUserService.getStats(user.id);
    };

    const resetProgress = async () => {
        if (!user?.id) return { success: false, error: 'No user logged in' };
        
        const confirmReset = window.confirm(
            'Are you sure you want to reset all your progress? This cannot be undone!'
        );
        
        if (confirmReset) {
            const result = await autoUserService.resetProgress(user.id);
            if (result.success) {
                setUser(prev => ({ ...prev, overall_progress: 0 }));
            }
            return result;
        }
        
        return { success: false, message: 'Reset cancelled' };
    };

    // SOFT LOGOUT - Only clears user state, keeps localStorage
    const logout = async () => {
        console.log('👋 Soft logout - keeping localStorage for later');
        // Don't clear localStorage - just set user to null
        setUser(null);
        console.log('✅ User state cleared (localStorage preserved)');
    };

    // HARD LOGOUT - Clears everything (for "New Game" button)
    const hardLogout = async () => {
        console.log('🗑️ Hard logout - clearing everything');
        localStorage.removeItem('bisaquest_user_id');
        localStorage.removeItem('bisaquest_student_id');
        setUser(null);
        console.log('✅ Everything cleared');
    };

    const value = {
        user,
        loading,
        createNewUser,
        updateNickname,
        getProgress,
        updateProgress,
        getStats,
        resetProgress,
        logout,        // Soft logout (keeps localStorage)
        hardLogout,    // Hard logout (clears everything)
    };

    if (loading) {
        return <LoadingScreen message="Preparing your adventure..." />;
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};