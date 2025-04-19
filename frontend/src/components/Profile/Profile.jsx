import React, { useState, useEffect } from "react";
import "./Profile.css";
import "./PasswordModal/PasswordModal.css";
import PasswordModal from "./PasswordModal/PasswordModal";
import avatar from "../../assets/Header/avatar.png";
import Header from "../Header/Header"; 

const API_URL = "http://localhost:5000";

const Profile = () => {
  const [user, setUser] = useState({
    first_name: "",
    last_name: "",
    email: "",
    created_at: "",
  });

  const [favorites, setFavorites] = useState([]);
  const [activeTab, setActiveTab] = useState("info");
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [showPasswordModal, setShowPasswordModal] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch(`${API_URL}/profile/info`, {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          if (response.status === 401) {
            console.log("Пользователь не авторизован, перенаправление...");
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
      try {
        const response = await fetch(`${API_URL}/profile/favorites`, {
          method: "GET",
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error("Ошибка при загрузке избранного");
        }

        const data = await response.json();
        setFavorites(data.favorites || []);
      } catch (err) {
        console.error("Ошибка загрузки избранного:", err);
      }
    };

    if (activeTab === "favorites") {
      fetchFavorites();
    }
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
    }
  };

  const handlePasswordSuccess = () => {
    setShowPasswordModal(false);
    setMessage("Пароль успешно изменен");
    
    setTimeout(() => {
      setMessage("");
    }, 2000);
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

  if (isLoading) {
    return <div className="profile-loading">Загрузка профиля...</div>;
  }

  return (
    <>
      <Header />
      <div className="profile-page">
        <div className="profile-container">
          <div className="profile-header">
            <div className="profile-avatar">
              <img src={avatar} alt="Аватар пользователя" />
            </div>
            <div className="profile-name">
              <h1>
                {user.first_name} {user.last_name}
              </h1>
              <p>{user.email}</p>
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
              onClick={() => setActiveTab("info")}
            >
              Информация
            </button>
            <button
              className={`tab-button ${
                activeTab === "favorites" ? "active" : ""
              }`}
              onClick={() => setActiveTab("favorites")}
            >
              Избранное
            </button>
            <button
              className={`tab-button ${activeTab === "settings" ? "active" : ""}`}
              onClick={() => setActiveTab("settings")}
            >
              Настройки
            </button>
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
                <h2>Избранное</h2>
                {favorites.length === 0 ? (
                  <div className="no-favorites">
                    <p>Вы еще не добавили фильмы или сериалы в избранное.</p>
                    <button className="browse-button">
                      Посмотреть популярные фильмы
                    </button>
                  </div>
                ) : (
                  <div className="favorites-grid">
                    {favorites.map((item) => (
                      <div className="favorite-item" key={item.id}>
                        <div className="favorite-poster">
                          <img src={item.poster_path} alt={item.title} />
                          <div className="favorite-type">
                            {item.type === "movie" ? "Фильм" : "Сериал"}
                          </div>
                        </div>
                        <div className="favorite-info">
                          <h3>{item.title}</h3>
                          <p>
                            {item.release_date &&
                              new Date(item.release_date).getFullYear()}
                          </p>
                          <div className="favorite-actions">
                            <button className="favorite-detail-btn">
                              Подробнее
                            </button>
                            <button className="remove-favorite">
                              <i className="heart-icon">❤</i>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "settings" && (
              <div className="profile-settings">
                <h2>Настройки профиля</h2>
                {(message || error) && (
                  <div className="notification-container">
                    {error && <div className="error-message">{error}</div>}
                    {message && <div className="success-message">{message}</div>}
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
                    <button type="submit" className="save-button">
                      Сохранить изменения
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
          </div>
        </div>

        {showPasswordModal && (
          <div className="modal-overlay">
            <PasswordModal
              onClose={() => setShowPasswordModal(false)}
              onSuccess={handlePasswordSuccess}
            />
          </div>
        )}
      </div>
    </>
  );
};

export default Profile;