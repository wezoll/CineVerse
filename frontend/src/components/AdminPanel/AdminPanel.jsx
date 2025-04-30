import React, { useState, useEffect } from "react";
import { adminService } from "../../services/adminService";
import "./AdminPanel.css";
import UsersManagement from "./UsersManagement";
import FaqManagement from "./FaqManagement";
import ReviewsManagement from "./ReviewsManagement";
import ContentManagement from "./ContentManagement";
import Statistics from "./Statistics";

const AdminPanel = () => {
  const [activeSection, setActiveSection] = useState("users");
  const [role, setRole] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const checkAdminAccess = async () => {
      try {
        setIsLoading(true);
        setError("");
        console.log("Запрашиваем проверку роли в админке...");
        const { role } = await adminService.checkRole();
        console.log("Полученная роль в админке:", role);
        setRole(role);
      } catch (err) {
        console.error("Ошибка при проверке роли:", err);
        setError(
          err.message === "Failed to fetch"
            ? "Не удалось подключиться к серверу. Пожалуйста, проверьте подключение к интернету и попробуйте снова."
            : "У вас нет доступа к админ-панели"
        );
      } finally {
        setIsLoading(false);
      }
    };

    checkAdminAccess();
  }, []);

  if (isLoading) {
    return (
      <div className="admin-loading">
        <div className="admin-loading-spinner"></div>
        <div className="admin-loading-text">Загрузка админ-панели...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-error">
        <h3>Ошибка доступа</h3>
        <p>{error}</p>
        <button
          className="admin-action-button primary"
          onClick={() => window.location.reload()}
        >
          Попробовать снова
        </button>
      </div>
    );
  }

  if (!role || (role !== "admin" && role !== "super_admin")) {
    return (
      <div className="admin-access-denied">
        <h2>Доступ запрещен</h2>
        <p>У вас нет прав для доступа к админ-панели.</p>
      </div>
    );
  }

  return (
    <div className="admin-panel">
      <h2 className="admin-panel-title">Панель администратора</h2>

      <div className="admin-panel-container">
        <div className="admin-sidebar">
          <button
            className={`admin-nav-button ${
              activeSection === "statistics" ? "active" : ""
            }`}
            onClick={() => setActiveSection("statistics")}
          >
            Статистика
          </button>
          <button
            className={`admin-nav-button ${
              activeSection === "users" ? "active" : ""
            }`}
            onClick={() => setActiveSection("users")}
          >
            Пользователи
          </button>
          <button
            className={`admin-nav-button ${
              activeSection === "faq" ? "active" : ""
            }`}
            onClick={() => setActiveSection("faq")}
          >
            FAQ
          </button>
          <button
            className={`admin-nav-button ${
              activeSection === "reviews" ? "active" : ""
            }`}
            onClick={() => setActiveSection("reviews")}
          >
            Отзывы
          </button>
          <button
            className={`admin-nav-button ${
              activeSection === "content" ? "active" : ""
            }`}
            onClick={() => setActiveSection("content")}
          >
            Управление контентом
          </button>
        </div>

        <div className="admin-content">
          {activeSection === "statistics" && <Statistics />}
          {activeSection === "users" && <UsersManagement userRole={role} />}
          {activeSection === "faq" && <FaqManagement />}
          {activeSection === "reviews" && <ReviewsManagement />}
          {activeSection === "content" && <ContentManagement />}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
