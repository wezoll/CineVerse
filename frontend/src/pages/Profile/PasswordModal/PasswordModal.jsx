import React, { useState, useEffect } from "react";
import "./PasswordModal.css";

const API_URL = "http://localhost:5000";

const PasswordModal = ({ onClose, onSuccess }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalError, setModalError] = useState("");

  const [passwordData, setPasswordData] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });

  useEffect(() => {
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  const handlePasswordChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value,
    });
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setModalError("");
    setModalMessage("");

    if (passwordData.new_password !== passwordData.confirm_password) {
      setModalError("Новый пароль и подтверждение пароля не совпадают");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/profile/change-password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          current_password: passwordData.current_password,
          new_password: passwordData.new_password,
          confirm_password: passwordData.confirm_password,
        }),
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        setModalError(data.error || "Ошибка при смене пароля");
        return;
      }

      setModalMessage(data.message || "Пароль успешно изменен");

      if (onSuccess) {
        setTimeout(() => {
          onSuccess();
        }, 1500);
      }
    } catch (err) {
      setModalError("Ошибка соединения с сервером");
      console.error("Ошибка:", err);
    }
  };

  return (
    <div className="auth-page modal-auth-page">
      <div className="auth-container">
        <div className="auth-form">
          <div className="modal-header">
            <h2 className="form-title">Изменение пароля</h2>
            <button className="close-button" onClick={onClose}>
              &times;
            </button>
          </div>

          <form onSubmit={handlePasswordSubmit}>
            <div className="input-group">
              <label htmlFor="current_password">Текущий пароль</label>
              <div className="password-field">
                <input
                  type={showPassword ? "text" : "password"}
                  id="current_password"
                  name="current_password"
                  value={passwordData.current_password}
                  onChange={handlePasswordChange}
                  required
                />
                <button
                  type="button"
                  className="eye-button"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? "Скрыть" : "Показать"}
                </button>
              </div>
            </div>
            <div className="input-group">
              <label htmlFor="new_password">Новый пароль</label>
              <div className="password-field">
                <input
                  type={showNewPassword ? "text" : "password"}
                  id="new_password"
                  name="new_password"
                  value={passwordData.new_password}
                  onChange={handlePasswordChange}
                  required
                  minLength="8"
                />
                <button
                  type="button"
                  className="eye-button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? "Скрыть" : "Показать"}
                </button>
              </div>
              <small>Пароль должен содержать минимум 8 символов</small>
            </div>
            <div className="input-group">
              <label htmlFor="confirm_password">Подтвердите пароль</label>
              <div className="password-field">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirm_password"
                  name="confirm_password"
                  value={passwordData.confirm_password}
                  onChange={handlePasswordChange}
                  required
                  minLength="8"
                />
                <button
                  type="button"
                  className="eye-button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? "Скрыть" : "Показать"}
                </button>
              </div>
            </div>
            <div className="form-buttons">
              <button type="submit" className="submit-button-1">
                Сохранить пароль
              </button>
              <button
                type="button"
                className="cancel-button-1"
                onClick={onClose}
              >
                Отмена
              </button>
            </div>
          </form>

          {(modalMessage || modalError) && (
            <div className="notification-container">
              {modalError && <div className="error-message">{modalError}</div>}
              {modalMessage && (
                <div className="success-message">{modalMessage}</div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PasswordModal;
