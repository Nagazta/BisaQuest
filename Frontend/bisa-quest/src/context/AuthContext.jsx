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
      }

      return result;
    } catch (err) {
      console.error("Login error:", err);
      return { success: false, error: err.message };
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      localStorage.removeItem("session");
      setUser(null);
      return { success: true };
    } catch {
      return { success: false };
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
