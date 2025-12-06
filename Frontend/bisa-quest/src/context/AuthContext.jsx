import React, { createContext, useContext, useEffect, useState } from "react";
import { authService } from "../services/authServices";

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSession();
  }, []);

  const loadSession = async () => {
    try {
      const storedUser = localStorage.getItem("user");

      if (storedUser) {
        const userData = JSON.parse(storedUser);
        setUser({
          id: userData.user_id,
          fullname: userData.fullname,
          email: userData.email,
          role: userData.role,
        });
        setLoading(false);
        return;
      }

      // Fallback to teacher session check
      const result = await authService.getSession();

      if (result.success && result.user) {
        setUser({
          id: result.user.user_id,
          fullname: result.user.fullname,
          email: result.user.email,
          role: result.user.role,
        });
      } else {
        setUser(null);
      }
    } catch (err) {
      console.error("Session load error:", err);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const result = await authService.login(email, password);

      if (result.success && result.data?.user) {
        const u = result.data.user;

        setUser({
          id: u.user_id,
          fullname: u.fullname,
          email: u.email,
          role: u.role,
        });

        localStorage.setItem("session", JSON.stringify(result.data.session));
        
        // ADD THIS - Store token for teacher login
        if (result.data.session?.access_token) {
          localStorage.setItem("token", result.data.session.access_token);
        }
      }

      return result;
    } catch (err) {
      console.error("Login error:", err);
      return { success: false, error: err.message };
    }
  };

  const loginStudent = async (studentId, classCode) => {
    try {
      const result = await authService.loginStudent(studentId, classCode);

      if (result.success && result.data?.user) {
        const u = result.data.user;

        setUser({
          id: u.user_id,
          fullname: u.fullname,
          email: u.email,
          role: u.role,
        });
        
        // ADD THIS - Store token for student login
        if (result.data.session?.access_token) {
          localStorage.setItem("token", result.data.session.access_token);
        }
      }

      return result;
    } catch (err) {
      console.error("Student login error:", err);
      return { success: false, error: err.message };
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      localStorage.removeItem("session");
      localStorage.removeItem("user");
      localStorage.removeItem("token"); // ADD THIS LINE
      localStorage.removeItem("studentId"); // Also clear studentId
      setUser(null);
      return { success: true };
    } catch {
      return { success: false };
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, login, loginStudent, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};