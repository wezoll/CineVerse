import React, { useState, useEffect } from "react";
import "./NewReleases.css";
import { releasesService } from "../../services/releasesService";
import { useNavigate } from "react-router-dom";

const NewReleases = () => {
  const [releases, setReleases] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  const imageBaseUrl = "https://image.tmdb.org/t/p/w500";

  useEffect(() => {
    const fetchReleases = async () => {
      try {
        setLoading(true);
        const data = await releasesService.getUpcomingMarchApril2025(1, 20);
        setReleases(data.results || []);
        setCurrentSlide(0);
        setCurrentPage(0);
        setError(null);
      } catch (err) {
        setError("Не удалось загрузить новинки");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchReleases();
  }, []);

  const featuredItem = releases[currentSlide] || null;

  const releasesPerPage = 5;
  const totalPages = Math.ceil((releases.length - 1) / releasesPerPage);

  const getPageItems = () => {
    if (!releases.length) return [];
    const otherItems = releases.filter((_, index) => index !== currentSlide);
    const startIndex = currentPage * releasesPerPage;
    return otherItems.slice(startIndex, startIndex + releasesPerPage);
  };

  const otherItems = getPageItems();

  const nextSlide = () => {
    if (releases.length > 0) {
      const nextIndex = (currentSlide + 1) % releases.length;
      setCurrentSlide(nextIndex);
    }
  };

  const prevSlide = () => {
    if (releases.length > 0) {
      const prevIndex =
        currentSlide > 0 ? currentSlide - 1 : releases.length - 1;
      setCurrentSlide(prevIndex);
    }
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  const changePage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage((prev) => prev + 1);
    } else {
      setCurrentPage(0);
    }
  };

  const handleItemClick = (item) => {
    if (item.media_type === "tv") {
      navigate(`/series/${item.id}`);
    } else {
      navigate(`/movie/${item.id}`);
    }
  };

  const formatReleaseDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.getFullYear().toString();
  };

  if (loading) {
    return (
      <section className="new-releases-section">
        <div className="new-releases-container">
          <h2 className="new-releases-title">
            <span className="new-releases-title-text">Новинки</span>
          </h2>
          <div className="new-releases-loading-skeleton">
            <div className="new-releases-loading-featured"></div>
            <div className="new-releases-loading-small">
              {[...Array(5)].map((_, index) => (
                <div key={index} className="new-releases-loading-card"></div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="new-releases-section">
        <div className="new-releases-container">
          <h2 className="new-releases-title">
            <span className="new-releases-title-text">Новинки</span>
          </h2>
          <div className="new-releases-error">{error}</div>
        </div>
      </section>
    );
  }

  if (releases.length === 0) {
    return (
      <section className="new-releases-section">
        <div className="new-releases-container">
          <h2 className="new-releases-title">
            <span className="new-releases-title-text">Новинки</span>
          </h2>
          <div className="new-releases-empty">Нет доступных новинок</div>
        </div>
      </section>
    );
  }

  return (
    <section className="new-releases-section">
      <div className="new-releases-container">
        <div className="new-releases-header">
          <h2 className="new-releases-title">
            <span className="new-releases-title-text">Новинки</span>
          </h2>
        </div>

        <div className="new-releases-layout">
          {featuredItem && (
            <div className="featured-movie-card">
              <div
                className="featured-movie-poster"
                style={{
                  backgroundImage: `url(${
                    featuredItem.poster_path
                      ? imageBaseUrl + featuredItem.poster_path
                      : "/images/no-poster.jpg"
                  })`,
                }}
                onClick={() => handleItemClick(featuredItem)}
              >
                <div className="movie-overlay"></div>
                <div className="movie-info">
                  <h3 className="movie-title">
                    {featuredItem.title || featuredItem.name}
                  </h3>
                  <p className="movie-year">
                    {formatReleaseDate(
                      featuredItem.release_date || featuredItem.first_air_date
                    )}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="small-movies-container">
            <div className="small-movies-flex">
              {otherItems.map((item) => (
                <div
                  className="small-movie-card"
                  key={`${item.media_type || "movie"}-${item.id}`}
                >
                  <div
                    className="small-movie-poster"
                    onClick={() =>
                      goToSlide(
                        releases.findIndex(
                          (r) =>
                            r.id === item.id &&
                            (r.media_type || "movie") ===
                              (item.media_type || "movie")
                        )
                      )
                    }
                    style={{
                      backgroundImage: `url(${
                        item.poster_path
                          ? imageBaseUrl + item.poster_path
                          : "/images/no-poster.jpg"
                      })`,
                    }}
                  >
                    <div className="movie-overlay"></div>
                  </div>
                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <button
                className="movies-page-nav-btn"
                onClick={changePage}
                disabled={totalPages <= 1}
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  style={{
                    transform:
                      currentPage === totalPages - 1
                        ? "rotate(180deg)"
                        : "rotate(0deg)",
                  }}
                >
                  <path
                    d="M9 18L15 12L9 6"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            )}
          </div>
        </div>

        <div className="new-releases-navigation">
          <button className="slider-prev-btn" onClick={prevSlide}>
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M15 18L9 12L15 6"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          <div className="slider-dots">
            {releases.slice(0, Math.min(releases.length, 6)).map((_, index) => (
              <button
                key={index}
                className={`slider-dot ${
                  currentSlide === index ? "active" : ""
                }`}
                onClick={() => goToSlide(index)}
              />
            ))}
          </div>

          <button className="slider-next-btn" onClick={nextSlide}>
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M9 18L15 12L9 6"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
};

export default NewReleases;
