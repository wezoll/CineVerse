import React, { useState } from "react";
import "./AuthModal.css";

const API_URL = "http://localhost:5000";

const AuthModal = ({ onAuthSuccess, onClose }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [loginForm, setLoginForm] = useState({
    email: "",
    password: "",
    remember: false,
  });

  const [signupForm, setSignupForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    termsAccepted: false,
  });

  const [forgotPasswordForm, setForgotPasswordForm] = useState({
    email: "",
  });

  const [resetPasswordForm, setResetPasswordForm] = useState({
    email: "",
    code: "",
    new_password: "",
  });

  const handleLoginChange = (e) => {
    const value =
      e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setLoginForm({
      ...loginForm,
      [e.target.name]: value,
    });
  };

  const handleSignupChange = (e) => {
    const value =
      e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setSignupForm({
      ...signupForm,
      [e.target.name]: value,
    });
  };

  const handleForgotPasswordChange = (e) => {
    setForgotPasswordForm({
      ...forgotPasswordForm,
      [e.target.name]: e.target.value,
    });
  };

  const handleResetPasswordChange = (e) => {
    setResetPasswordForm({
      ...resetPasswordForm,
      [e.target.name]: e.target.value,
    });
  };

  const resetMessages = () => {
    setMessage("");
    setError("");
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    resetMessages();

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(loginForm),
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Ошибка при входе");
        return;
      }

      setMessage(data.message || "Вход выполнен успешно");

      // Оповещаем родительский компонент об успешной авторизации
      if (onAuthSuccess) onAuthSuccess(data.user);

      // Задержка перед перенаправлением
      setTimeout(() => {
        window.location.href = "/profile";
      });
    } catch (err) {
      setError("Ошибка соединения с сервером");
      console.error("Ошибка:", err);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    resetMessages();

    if (!signupForm.termsAccepted) {
      setError("Необходимо согласиться с условиями использования");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          first_name: signupForm.first_name,
          last_name: signupForm.last_name,
          email: signupForm.email,
          password: signupForm.password,
        }),
        credentials: "include", // Важно для работы с сессиями
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Ошибка при регистрации");
        return;
      }

      setMessage(data.message || "Регистрация успешна");

      // Оповещаем родительский компонент об успешной регистрации
      if (onAuthSuccess) onAuthSuccess(data.user);

      // Задержка перед перенаправлением
      setTimeout(() => {
        window.location.href = "/profile";
      }, 1500);
    } catch (err) {
      setError("Ошибка соединения с сервером");
      console.error("Ошибка:", err);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    resetMessages();

    try {
      const response = await fetch(`${API_URL}/auth/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(forgotPasswordForm),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Ошибка при запросе сброса пароля");
        return;
      }

      setMessage(data.message || "Проверьте вашу почту для сброса пароля");
      setShowPasswordReset(true);
      setShowForgotPassword(false);

      // Предзаполняем email для формы сброса пароля
      setResetPasswordForm({
        ...resetPasswordForm,
        email: forgotPasswordForm.email,
      });
    } catch (err) {
      setError("Ошибка соединения с сервером");
      console.error("Ошибка:", err);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    resetMessages();

    try {
      const response = await fetch(`${API_URL}/auth/reset-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(resetPasswordForm),
        credentials: "include", // Важно для работы с сессиями
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Ошибка при сбросе пароля");
        return;
      }

      setMessage(data.message || "Пароль успешно обновлён");

      // Переключаемся на форму входа после успешного сброса пароля
      setTimeout(() => {
        switchToLogin();
      }, 1500);
    } catch (err) {
      setError("Ошибка соединения с сервером");
      console.error("Ошибка:", err);
    }
  };

  const switchToLogin = (e) => {
    if (e) e.preventDefault();
    setShowSignup(false);
    setShowForgotPassword(false);
    setShowPasswordReset(false);
    resetMessages();
  };

  const switchToSignup = (e) => {
    if (e) e.preventDefault();
    setShowSignup(true);
    setShowForgotPassword(false);
    setShowPasswordReset(false);
    resetMessages();
  };

  const switchToForgotPassword = (e) => {
    if (e) e.preventDefault();
    setShowForgotPassword(true);
    setShowPasswordReset(false);
    resetMessages();
  };

  return (
    <div className="auth-page modal-auth-page">
      <div className="auth-container">
        <button className="modal-close" onClick={onClose}>
          ×
        </button>
        {!showSignup && !showForgotPassword && !showPasswordReset && (
          <div className="auth-form login-form">
            <h2 className="form-title">Вход в аккаунт</h2>

            <form onSubmit={handleLogin}>
              <div className="input-group">
                <label>Электронная почта</label>
                <input
                  type="email"
                  name="email"
                  value={loginForm.email}
                  onChange={handleLoginChange}
                  required
                />
              </div>

              <div className="input-group">
                <label>Пароль</label>
                <div className="password-field">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={loginForm.password}
                    onChange={handleLoginChange}
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

              <button type="submit" className="submit-button">
                Войти
              </button>
            </form>

            <div className="auth-links">
              <a
                href="#"
                className="forgot-password"
                onClick={switchToForgotPassword}
              >
                Забыли пароль?
              </a>
              <div className="signup-prompt">
                У вас нет аккаунта?{" "}
                <a href="#" onClick={switchToSignup}>
                  Создать аккаунт
                </a>
              </div>
            </div>

            {(message || error) && (
              <div className="notification-container">
                {error && <div className="error-message">{error}</div>}
                {message && <div className="success-message">{message}</div>}
              </div>
            )}
          </div>
        )}

        {showSignup && (
          <div className="auth-form signup-form">
            <h2 className="form-title">Создать аккаунт</h2>

            <form onSubmit={handleSignup}>
              <div className="input-group">
                <label>Имя</label>
                <input
                  type="text"
                  name="first_name"
                  value={signupForm.first_name}
                  onChange={handleSignupChange}
                  required
                />
              </div>

              <div className="input-group">
                <label>Фамилия</label>
                <input
                  type="text"
                  name="last_name"
                  value={signupForm.last_name}
                  onChange={handleSignupChange}
                  required
                />
              </div>

              <div className="input-group">
                <label>Электронная почта</label>
                <input
                  type="email"
                  name="email"
                  value={signupForm.email}
                  onChange={handleSignupChange}
                  required
                />
              </div>

              <div className="input-group">
                <label>Пароль</label>
                <input
                  type="password"
                  name="password"
                  value={signupForm.password}
                  onChange={handleSignupChange}
                  required
                  minLength="8"
                />
                <small>Пароль должен содержать минимум 8 символов</small>
              </div>

              <div className="terms-row">
                <input
                  type="checkbox"
                  id="terms"
                  name="termsAccepted"
                  checked={signupForm.termsAccepted}
                  onChange={handleSignupChange}
                  required
                />
                <label htmlFor="terms">
                  Создавая аккаунт, я соглашаюсь с{" "}
                  <a href="#">Условиями использования</a> и{" "}
                  <a href="#">Политикой конфиденциальности</a>
                </label>
              </div>

              <button type="submit" className="submit-button">
                Создать аккаунт
              </button>
            </form>

            <div className="login-prompt">
              Уже есть аккаунт?{" "}
              <a href="#" onClick={switchToLogin}>
                Войти
              </a>
            </div>

            {(message || error) && (
              <div className="notification-container">
                {error && <div className="error-message">{error}</div>}
                {message && <div className="success-message">{message}</div>}
              </div>
            )}
          </div>
        )}

        {showForgotPassword && (
          <div className="auth-form forgot-password-form">
            <h2 className="form-title">Восстановление пароля</h2>

            <form onSubmit={handleForgotPassword}>
              <div className="input-group">
                <label>Электронная почта</label>
                <input
                  type="email"
                  name="email"
                  value={forgotPasswordForm.email}
                  onChange={handleForgotPasswordChange}
                  required
                />
              </div>

              <button type="submit" className="submit-button">
                Отправить код
              </button>
            </form>

            <div className="login-prompt">
              <a href="#" onClick={switchToLogin}>
                Вернуться к входу
              </a>
            </div>

            {/* Уведомления внизу формы */}
            {(message || error) && (
              <div className="notification-container">
                {error && <div className="error-message">{error}</div>}
                {message && <div className="success-message">{message}</div>}
              </div>
            )}
          </div>
        )}

        {showPasswordReset && (
          <div className="auth-form reset-password-form">
            <h2 className="form-title">Сброс пароля</h2>

            <form onSubmit={handleResetPassword}>
              <div className="input-group">
                <label>Электронная почта</label>
                <input
                  type="email"
                  name="email"
                  value={resetPasswordForm.email}
                  onChange={handleResetPasswordChange}
                  required
                  readOnly
                />
              </div>

              <div className="input-group">
                <label>Код подтверждения</label>
                <input
                  type="text"
                  name="code"
                  value={resetPasswordForm.code}
                  onChange={handleResetPasswordChange}
                  required
                  placeholder="Введите код из письма"
                />
              </div>

              <div className="input-group">
                <label>Новый пароль</label>
                <input
                  type="password"
                  name="new_password"
                  value={resetPasswordForm.new_password}
                  onChange={handleResetPasswordChange}
                  required
                  minLength="8"
                />
                <small>Пароль должен содержать минимум 8 символов</small>
              </div>

              <button type="submit" className="submit-button">
                Сбросить пароль
              </button>
            </form>

            <div className="login-prompt">
              <a href="#" onClick={switchToLogin}>
                Вернуться к входу
              </a>
            </div>

            {(message || error) && (
              <div className="notification-container">
                {error && <div className="error-message">{error}</div>}
                {message && <div className="success-message">{message}</div>}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthModal;
