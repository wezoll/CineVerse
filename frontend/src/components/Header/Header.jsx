import React, { useEffect, useState } from "react";
import "./Header.css";
import logo from "../../assets/Header/logo.svg";
import searchIcon from "../../assets/Header/search-icon.svg";
import avatar from "../../assets/Header/avatar.png";
import AuthModal from "./AuthModal/AuthModal";
import Search from "./Search/Search";

const API_URL = "http://localhost:5000";

const Header = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch(`${API_URL}/profile/info`, {
          method: "GET",
          credentials: "include",
          headers: {
            'Content-Type': 'application/json',
          }
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

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  const toggleSearch = () => {
    setIsSearchOpen(!isSearchOpen);
    if (!isSearchOpen) {
      document.body.classList.add("modal-open");
    } else {
      document.body.classList.remove("modal-open");
    }
  };

  useEffect(() => {
    if (isModalOpen || isSearchOpen) {
      document.body.classList.add("modal-open");
    } else {
      document.body.classList.remove("modal-open");
    }
  }, [isModalOpen, isSearchOpen]);

  const closeModal = (e) => {
    if (e.target.classList.contains("modal-overlay")) {
      setIsModalOpen(false);
    }
  };

  const scrollToSection = (sectionId) => {
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
                onClick={() => window.location.href = "/"}
                style={{ cursor: "pointer" }}
              />
            </div>
          </div>
          <div className="nav-right">
            <ul className="nav-els">
              <li className="nav-el" onClick={() => scrollToSection("home")}>
                Главная
              </li>
              <li
                className="nav-el"
                onClick={() => scrollToSection("TrendingMovies")}
              >
                Актуальные фильмы
              </li>
              <li
                className="nav-el"
                onClick={() => scrollToSection("PopularSeries")}
              >
                Популярные сериалы
              </li>
              <li className="nav-el" onClick={() => scrollToSection("FAQ")}>
                FAQ
              </li>
            </ul>
            <div className="nav-icons">
              <img
                src={searchIcon}
                alt=""
                className="search-icon"
                onClick={toggleSearch}
                style={{ cursor: "pointer" }}
              />
              {isLoading ? (
                <div className="loading-avatar"></div>
              ) : (
                <img
                  src={isAuthenticated ? avatar : avatar} // В будущем можно использовать аватар пользователя
                  alt=""
                  className="user-avatar"
                  onClick={
                    isAuthenticated
                      ? () => (window.location.href = "/profile")
                      : toggleModal
                  }
                  style={{ cursor: "pointer" }}
                />
              )}
              {isAuthenticated && <div className="auth-indicator"></div>}
            </div>
          </div>
        </nav>
      </header>

      {isModalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={toggleModal}>
              ×
            </button>
            <AuthModal onAuthSuccess={handleAuthSuccess} onClose={toggleModal} />
          </div>
        </div>
      )}

      <Search isOpen={isSearchOpen} onClose={toggleSearch} />
    </>
  );
};

export default Header;