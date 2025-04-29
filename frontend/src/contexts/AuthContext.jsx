// contexts/AuthContext.js
import React, { createContext, useState, useContext, useEffect } from "react";

// Создаем контекст аутентификации
const AuthContext = createContext(null);

// Базовый URL API (измените на ваш)
const API_URL = "http://localhost:5000";

// Вспомогательная функция для выполнения запросов
const fetchApi = async (endpoint, options = {}) => {
  const defaultOptions = {
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include", // Важно для сохранения сессионных cookie
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

  // Проверка авторизации при загрузке
  useEffect(() => {
    checkAuthStatus();
  }, []);

  // Проверка текущей сессии
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

  // Регистрация пользователя
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

  // Вход пользователя
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

  // Выход пользователя
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

  // Запрос на сброс пароля
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

  // Сброс пароля
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

  // Проверка, авторизован ли пользователь
  const isAuthenticated = !!currentUser;

  // Получение полного имени пользователя
  const getFullName = () => {
    if (!currentUser) return "";
    return `${currentUser.first_name} ${currentUser.last_name}`;
  };

  // Значение, которое будет доступно через контекст
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

// Хук для использования контекста аутентификации
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
