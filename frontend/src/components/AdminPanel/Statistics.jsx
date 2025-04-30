import React, { useState, useEffect } from "react";
import { adminService } from "../../services/adminService";
import "./AdminPanel.css";

const Statistics = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalMovies: 0,
    totalTvShows: 0,
    totalReviews: 0,
    totalFaqs: 0,
    hiddenContent: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true);
        setError("");
        const data = await adminService.getStatistics();
        setStats(data);
      } catch (err) {
        console.error("Ошибка при получении статистики:", err);
        setError("Не удалось загрузить статистику");
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (isLoading) {
    return (
      <div className="admin-loading">
        <div className="admin-loading-spinner"></div>
        <div className="admin-loading-text">Загрузка статистики...</div>
      </div>
    );
  }

  if (error) {
    return <div className="admin-error">{error}</div>;
  }

  return (
    <div className="statistics-container">
      <h2 className="admin-section-title">Статистика</h2>

      <div className="statistics-grid">
        <div className="statistics-card">
          <h3>Пользователи</h3>
          <div className="statistics-value">{stats.totalUsers}</div>
        </div>

        <div className="statistics-card">
          <h3>Фильмы</h3>
          <div className="statistics-value">{stats.totalMovies}</div>
        </div>

        <div className="statistics-card">
          <h3>Сериалы</h3>
          <div className="statistics-value">{stats.totalTvShows}</div>
        </div>

        <div className="statistics-card">
          <h3>Отзывы</h3>
          <div className="statistics-value">{stats.totalReviews}</div>
        </div>

        <div className="statistics-card">
          <h3>FAQ</h3>
          <div className="statistics-value">{stats.totalFaqs}</div>
        </div>

        <div className="statistics-card">
          <h3>Скрытый контент</h3>
          <div className="statistics-value">{stats.hiddenContent}</div>
        </div>
      </div>
    </div>
  );
};

export default Statistics;
