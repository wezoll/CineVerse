import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import './ProtectedRoute.css';

const API_URL = 'http://localhost:5000';

const ProtectedRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch(`${API_URL}/profile/info`, {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          }
        });
        
        if (response.ok) {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      } catch (err) {
        console.error("Ошибка проверки авторизации:", err);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuth();
  }, []);

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <div className="loading-text">Проверка авторизации...</div>
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/" />;
};

export default ProtectedRoute;