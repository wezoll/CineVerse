import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import "./Header.css";
import logo from "../../assets/Header/logo.svg";
import searchIcon from "../../assets/Header/search-icon.svg";
import avatar from "../../assets/Header/avatar.png";
import AuthModal from "./AuthModal/AuthModal";
import SearchBar from "../SearchBar/SearchBar";

const API_URL = "http://localhost:5000";

const Header = () => {
  const location = useLocation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch(`${API_URL}/profile/info`, {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          const data = await response.json();
          setIsAuthenticated(true);
          setUserData(data.user);
        } else {
          setIsAuthenticated(false);
          setUserData(null);
        }
      } catch (err) {
        console.error("Ошибка проверки аутентификации:", err);
        setIsAuthenticated(false);
        setUserData(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();

    const handleScroll = () => {
      const header = document.querySelector("header");
      if (header) {
        if (window.scrollY > 50) {
          header.classList.add("shrink");
        } else {
          header.classList.remove("shrink");
        }
      }
    };

    window.addEventListener("scroll", handleScroll);

    // Закрытие меню пользователя при клике вне его
    const handleClickOutside = (event) => {
      if (
        showUserMenu &&
        !event.target.closest(".user-menu") &&
        !event.target.closest(".auth-button")
      ) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showUserMenu]);

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
    setShowUserMenu(false);
  };

  const toggleSearch = () => {
    setIsSearchOpen(!isSearchOpen);
    if (!isSearchOpen) {
      document.body.classList.add("modal-open");
    } else {
      document.body.classList.remove("modal-open");
    }
  };

  const toggleUserMenu = () => {
    setShowUserMenu(!showUserMenu);
  };

  useEffect(() => {
    if (isModalOpen || isSearchOpen) {
      document.body.classList.add("modal-open");
    } else {
      document.body.classList.remove("modal-open");
    }
  }, [isModalOpen, isSearchOpen]);

  const scrollToSection = (sectionId) => {
    // If not on homepage, navigate to homepage first
    if (location.pathname !== "/") {
      window.location.href = `/#${sectionId}`;
      return;
    }

    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleAuthSuccess = (userData) => {
    setIsAuthenticated(true);
    setUserData(userData);
    setIsModalOpen(false);
  };

  const handleLogout = async () => {
    try {
      const response = await fetch(`${API_URL}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });

      if (response.ok) {
        setIsAuthenticated(false);
        setUserData(null);
        setShowUserMenu(false);
        window.location.href = "/";
      }
    } catch (err) {
      console.error("Ошибка при выходе:", err);
    }
  };

  return (
    <>
      <header className="nav-header">
        <nav className="navigation">
          <div className="nav-left">
            <div className="logo">
              <img
                src={logo}
                alt=""
                className="nav-logo"
                onClick={() => (window.location.href = "/")}
                style={{ cursor: "pointer" }}
              />
            </div>
          </div>
          <div className="nav-right">
            <ul className="nav-els">
              <li className="nav-el" onClick={() => scrollToSection("home")}>
                Главная
              </li>
              <li className="nav-el">
                <Link
                  to="/popular-movies"
                  style={{ color: "inherit", textDecoration: "none" }}
                >
                  Популярные фильмы
                </Link>
              </li>
              <li className="nav-el">
                <Link
                  to="/popular-series"
                  style={{ color: "inherit", textDecoration: "none" }}
                >
                  Популярные сериалы
                </Link>
              </li>
              <li className="nav-el">
                <Link
                  to="/faq"
                  style={{ color: "inherit", textDecoration: "none" }}
                >
                  FAQ
                </Link>
              </li>
            </ul>
            <div className="nav-icons">
              <SearchBar />
              {isLoading ? (
                <div className="loading-avatar"></div>
              ) : isAuthenticated ? (
                <>
                  <button className="auth-button" onClick={toggleUserMenu}>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="user-icon"
                    >
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                      <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                  </button>
                  {showUserMenu && (
                    <div className="user-menu">
                      <div className="user-menu-header">{userData?.email}</div>
                      <ul className="user-menu-items">
                        <li
                          className="user-menu-item"
                          onClick={() => (window.location.href = "/profile")}
                        >
                          Настройки аккаунта
                        </li>
                        <li
                          className="user-menu-item logout"
                          onClick={handleLogout}
                        >
                          Выйти
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="logout-icon"
                          >
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                            <polyline points="16 17 21 12 16 7"></polyline>
                            <line x1="21" y1="12" x2="9" y2="12"></line>
                          </svg>
                        </li>
                      </ul>
                    </div>
                  )}
                </>
              ) : (
                <button className="auth-button" onClick={toggleModal}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="user-icon"
                  >
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                </button>
              )}
            </div>
          </div>
        </nav>
      </header>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={toggleModal}>
              ×
            </button>
            <AuthModal
              onAuthSuccess={handleAuthSuccess}
              onClose={toggleModal}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default Header;
