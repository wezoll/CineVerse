import React, { createContext, useState, useContext, useEffect } from "react";

const AuthContext = createContext(null);

const API_URL = "http://localhost:5000";

const fetchApi = async (endpoint, options = {}) => {
  const defaultOptions = {
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  };

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...defaultOptions,
    ...options,
  });

  const data = await response.json();

  if (!response.ok) {
    const error = new Error(data.error || "Что-то пошло не так");
    error.response = response;
    error.data = data;
    throw error;
  }

  return data;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      setLoading(true);
      const data = await fetchApi("/auth/check-session");

      if (data.authenticated) {
        setCurrentUser(data.user);
      } else {
        setCurrentUser(null);
      }

      setError(null);
    } catch (err) {
      console.error("Ошибка проверки аутентификации:", err);
      setCurrentUser(null);
      setError("Ошибка при проверке сессии");
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setLoading(true);
      const data = await fetchApi("/auth/register", {
        method: "POST",
        body: JSON.stringify(userData),
      });
      setCurrentUser(data.user);
      setError(null);
      return data;
    } catch (err) {
      setError(err.data?.error || "Ошибка при регистрации");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      setLoading(true);
      const data = await fetchApi("/auth/login", {
        method: "POST",
        body: JSON.stringify(credentials),
      });
      setCurrentUser(data.user);
      setError(null);
      return data;
    } catch (err) {
      setError(err.data?.error || "Ошибка при входе");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      await fetchApi("/auth/logout", {
        method: "POST",
      });
      setCurrentUser(null);
      setError(null);
    } catch (err) {
      console.error("Ошибка при выходе:", err);
      setError("Ошибка при выходе из системы");
    } finally {
      setLoading(false);
    }
  };

  const forgotPassword = async (email) => {
    try {
      setLoading(true);
      const data = await fetchApi("/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email }),
      });
      setError(null);
      return data;
    } catch (err) {
      setError(err.data?.error || "Ошибка при запросе сброса пароля");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (resetData) => {
    try {
      setLoading(true);
      const data = await fetchApi("/auth/reset-password", {
        method: "POST",
        body: JSON.stringify(resetData),
      });
      setCurrentUser(data.user);
      setError(null);
      return data;
    } catch (err) {
      setError(err.data?.error || "Ошибка при сбросе пароля");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const isAuthenticated = !!currentUser;

  const getFullName = () => {
    if (!currentUser) return "";
    return `${currentUser.first_name} ${currentUser.last_name}`;
  };

  const value = {
    currentUser,
    loading,
    error,
    isAuthenticated,
    register,
    login,
    logout,
    forgotPassword,
    resetPassword,
    checkAuthStatus,
    getFullName,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
