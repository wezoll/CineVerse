import React, { useState, useEffect } from "react";
import "./Profile.css";
import "./PasswordModal/PasswordModal.css";
import PasswordModal from "./PasswordModal/PasswordModal";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import Reviews from "../../components/Reviews/Reviews";
import AdminPanel from "../../components/AdminPanel/AdminPanel";
import { favoriteService } from "../../services/favoriteService";
import { movieService } from "../../services/movieService";
import { tvService } from "../../services/TVService";
import { adminService } from "../../services/adminService";
import { Link } from "react-router-dom";

const API_URL = "http://localhost:5000";

const Profile = () => {
  const [user, setUser] = useState({
    first_name: "",
    last_name: "",
    email: "",
    created_at: "",
    role: "user",
  });

  const [favorites, setFavorites] = useState([]);
  const [activeTab, setActiveTab] = useState("info");
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isFavoritesLoading, setIsFavoritesLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const [showPasswordModal, setShowPasswordModal] = useState(false);

  const [isAdminPanelAvailable, setIsAdminPanelAvailable] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`${API_URL}/profile/info`, {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          if (response.status === 401) {
            window.location.href = "/";
            return;
          }
          throw new Error("Ошибка при загрузке данных профиля");
        }

        const data = await response.json();
        setUser(data.user);
        setFormData({
          first_name: data.user.first_name,
          last_name: data.user.last_name,
          email: data.user.email,
        });

        if (data.user.role === "admin" || data.user.role === "super_admin") {
          setIsAdminPanelAvailable(true);
        }
      } catch (err) {
        console.error("Ошибка загрузки данных:", err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, []);

  useEffect(() => {
    const fetchFavorites = async () => {
      if (activeTab !== "favorites") return;

      try {
        setIsFavoritesLoading(true);
        const favorites = await favoriteService.getFavorites();

        const detailedFavorites = await Promise.all(
          favorites.map(async (favorite) => {
            try {
              let details = null;

              if (favorite.item_type === "movie") {
                details = await movieService.getMovieDetails(favorite.item_id);
              } else if (favorite.item_type === "tv") {
                details = await tvService.getTVDetails(favorite.item_id);
              }

              return {
                ...favorite,
                details,
              };
            } catch (error) {
              console.error(
                `Ошибка при загрузке деталей для ${favorite.item_type} ${favorite.item_id}:`,
                error
              );
              return {
                ...favorite,
                details: null,
              };
            }
          })
        );

        setFavorites(detailedFavorites);
      } catch (err) {
        console.error("Ошибка загрузки избранного:", err);
      } finally {
        setIsFavoritesLoading(false);
      }
    };

    fetchFavorites();
  }, [activeTab]);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setIsSaving(true);

    try {
      const response = await fetch(`${API_URL}/profile/update`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          first_name: formData.first_name,
          last_name: formData.last_name,
        }),
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Ошибка при обновлении профиля");
        return;
      }

      setMessage(data.message || "Профиль успешно обновлен");
      setUser(data.user);
      setTimeout(() => {
        setActiveTab("info");
        setMessage("");
      }, 1500);
    } catch (err) {
      setError("Ошибка соединения с сервером");
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordSuccess = () => {
    setShowPasswordModal(false);
    setMessage("Пароль успешно изменен");

    setTimeout(() => {
      setMessage("");
    }, 2000);
  };

  const handleClosePasswordModal = () => {
    setShowPasswordModal(false);
    document.body.style.overflow = "auto";
  };

  const handleLogout = async () => {
    try {
      const response = await fetch(`${API_URL}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });

      if (response.ok) {
        window.location.href = "/";
      }
    } catch (err) {
      console.error("Ошибка при выходе:", err);
    }
  };

  const removeFavorite = async (favoriteId) => {
    try {
      await favoriteService.removeFromFavorites(favoriteId);
      setFavorites(favorites.filter((fav) => fav.id !== favoriteId));
    } catch (error) {
      console.error("Ошибка при удалении из избранного:", error);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  if (isLoading) {
    return (
      <div className="profile-loading">
        <div className="loading-spinner"></div>
        <div className="loading-text">Загрузка профиля...</div>
      </div>
    );
  }

  return (
    <>
      <Header />
      <div className="profile-page">
        <div className="profile-container">
          <div className="profile-header">
            <div className="profile-info">
              <h1>
                {user.first_name} {user.last_name}
              </h1>
              <p>{user.email}</p>
              {user.role && user.role !== "user" && (
                <span className="user-role-badge">
                  {user.role === "super_admin"
                    ? "Супер-админ"
                    : "Администратор"}
                </span>
              )}
            </div>
            <div className="profile-actions">
              <button className="logout-button" onClick={handleLogout}>
                Выйти
              </button>
            </div>
          </div>

          <div className="profile-tabs">
            <button
              className={`tab-button ${activeTab === "info" ? "active" : ""}`}
              onClick={() => handleTabChange("info")}
            >
              Информация
            </button>
            <button
              className={`tab-button ${
                activeTab === "favorites" ? "active" : ""
              }`}
              onClick={() => handleTabChange("favorites")}
            >
              Избранное
            </button>
            <button
              className={`tab-button ${
                activeTab === "reviews" ? "active" : ""
              }`}
              onClick={() => handleTabChange("reviews")}
            >
              Отзывы
            </button>
            <button
              className={`tab-button ${
                activeTab === "settings" ? "active" : ""
              }`}
              onClick={() => handleTabChange("settings")}
            >
              Настройки
            </button>
            {isAdminPanelAvailable && (
              <button
                className={`tab-button admin-tab ${
                  activeTab === "admin" ? "active" : ""
                }`}
                onClick={() => handleTabChange("admin")}
              >
                Админ-панель
              </button>
            )}
          </div>

          <div className="profile-content">
            {activeTab === "info" && (
              <div className="profile-info">
                <h2>Личная информация</h2>
                <div className="info-row">
                  <span className="info-label">Имя:</span>
                  <span className="info-value">{user.first_name}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Фамилия:</span>
                  <span className="info-value">{user.last_name}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Email:</span>
                  <span className="info-value">{user.email}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Дата регистрации:</span>
                  <span className="info-value">{user.created_at}</span>
                </div>
                <button
                  className="edit-profile-button"
                  onClick={() => setActiveTab("settings")}
                >
                  Редактировать
                </button>
              </div>
            )}

            {activeTab === "favorites" && (
              <div className="profile-favorites">
                <h2>
                  Ваше избранное{" "}
                  {favorites.length > 0 && (
                    <span className="favorites-counter">
                      ({favorites.length})
                    </span>
                  )}
                </h2>
                {isFavoritesLoading ? (
                  <div className="favorites-loading">
                    <div className="favorites-loading-spinner"></div>
                    <div className="favorites-loading-text">
                      Загрузка избранного...
                    </div>
                  </div>
                ) : favorites.length === 0 ? (
                  <div className="empty-favorites">
                    <p>У вас пока нет избранных фильмов или сериалов.</p>
                    <p>
                      Добавляйте фильмы и сериалы в избранное, чтобы они
                      отображались здесь.
                    </p>
                  </div>
                ) : (
                  <div className="favorites-grid">
                    {favorites.map((favorite) => (
                      <div key={favorite.id} className="favorite-item">
                        {favorite.details ? (
                          <>
                            <div className="favorite-poster">
                              <Link
                                to={`/${
                                  favorite.item_type === "movie"
                                    ? "movie"
                                    : "series"
                                }/${favorite.item_id}`}
                              >
                                <img
                                  src={
                                    favorite.details.poster_path
                                      ? `https://image.tmdb.org/t/p/w200${favorite.details.poster_path}`
                                      : "/images/no-poster.jpg"
                                  }
                                  alt={
                                    favorite.details.title ||
                                    favorite.details.name
                                  }
                                />
                              </Link>
                              <button
                                className="remove-favorite"
                                onClick={() => removeFavorite(favorite.id)}
                                title="Удалить из избранного"
                              >
                                <svg
                                  className="favorite-icon"
                                  viewBox="0 0 24 24"
                                  fill="white"
                                  stroke="white"
                                  strokeWidth="1"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                                </svg>
                              </button>
                            </div>
                            <div className="favorite-info">
                              <h3>
                                <Link
                                  to={`/${
                                    favorite.item_type === "movie"
                                      ? "movie"
                                      : "series"
                                  }/${favorite.item_id}`}
                                >
                                  {favorite.item_type === "movie"
                                    ? favorite.details.title
                                    : favorite.details.name}
                                </Link>
                              </h3>
                              <div className="favorite-meta">
                                <span className="favorite-year">
                                  {favorite.item_type === "movie"
                                    ? favorite.details.release_date &&
                                      new Date(
                                        favorite.details.release_date
                                      ).getFullYear()
                                    : favorite.details.first_air_date &&
                                      new Date(
                                        favorite.details.first_air_date
                                      ).getFullYear()}
                                </span>
                                <span className="favorite-type">
                                  {favorite.item_type === "movie"
                                    ? "Фильм"
                                    : "Сериал"}
                                </span>
                              </div>
                            </div>
                          </>
                        ) : (
                          <div className="favorite-item-error">
                            <p>Не удалось загрузить информацию</p>
                            <button
                              className="remove-favorite-error"
                              onClick={() => removeFavorite(favorite.id)}
                            >
                              Удалить из избранного
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "reviews" && (
              <div className="profile-reviews">
                <h2>Ваши отзывы</h2>
                <Reviews inProfile={true} />
              </div>
            )}

            {activeTab === "settings" && (
              <div className="profile-settings">
                <h2>Настройки профиля</h2>
                {(message || error) && (
                  <div className="notification-container">
                    {error && <div className="error-message">{error}</div>}
                    {message && (
                      <div className="success-message">{message}</div>
                    )}
                  </div>
                )}
                <form onSubmit={handleSaveProfile}>
                  <div className="form-group">
                    <label htmlFor="first_name">Имя</label>
                    <input
                      type="text"
                      id="first_name"
                      name="first_name"
                      value={formData.first_name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="last_name">Фамилия</label>
                    <input
                      type="text"
                      id="last_name"
                      name="last_name"
                      value={formData.last_name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="email">Email</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      readOnly
                    />
                    <small>Email нельзя изменить</small>
                  </div>
                  <div className="form-buttons">
                    <button
                      type="submit"
                      className="save-button"
                      disabled={isSaving}
                    >
                      {isSaving ? (
                        <>
                          <span className="loading-spinner-1"></span>
                          Сохранение...
                        </>
                      ) : (
                        "Сохранить изменения"
                      )}
                    </button>
                    <button
                      type="button"
                      className="cancel-button"
                      onClick={() => setActiveTab("info")}
                    >
                      Отмена
                    </button>
                  </div>
                </form>

                <div className="password-section">
                  <h3>Изменение пароля</h3>
                  <button
                    className="change-password-button"
                    onClick={() => setShowPasswordModal(true)}
                  >
                    Изменить пароль
                  </button>
                </div>
              </div>
            )}

            {activeTab === "admin" && (
              <div className="profile-admin">
                <AdminPanel />
              </div>
            )}
          </div>
        </div>

        {showPasswordModal && (
          <div className="modal-overlay">
            <PasswordModal
              onClose={handleClosePasswordModal}
              onSuccess={handlePasswordSuccess}
            />
          </div>
        )}
      </div>
      <Footer />
    </>
  );
};

export default Profile;
