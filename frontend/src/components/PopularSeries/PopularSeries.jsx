import React, { useState, useEffect, useRef } from "react";
import "./PopularSeries.css";
import { Link, useNavigate } from "react-router-dom";
import { tvService } from "../../services/TVService";

const PopularSeries = () => {
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const sliderRef = useRef(null);
  const [series, setSeries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSeries = async () => {
      try {
        setLoading(true);
        const data = await tvService.getPopularSeries(1);
        setSeries(data.results || []);
        setLoading(false);
      } catch (err) {
        setError("Произошла ошибка при загрузке сериалов");
        setLoading(false);
      }
    };

    fetchSeries();
  }, []);

  const checkScrollButtons = () => {
    if (sliderRef.current) {
      const slider = sliderRef.current;
      const maxScrollLeft = slider.scrollWidth - slider.clientWidth;

      setCanScrollLeft(slider.scrollLeft > 10);
      setCanScrollRight(slider.scrollLeft < maxScrollLeft - 10);
    }
  };

  useEffect(() => {
    const slider = sliderRef.current;

    const handleScrollAndResize = () => {
      checkScrollButtons();
      setTimeout(checkScrollButtons, 100);
    };

    if (slider) {
      slider.addEventListener("scroll", handleScrollAndResize);
      window.addEventListener("resize", handleScrollAndResize);

      handleScrollAndResize();

      return () => {
        slider.removeEventListener("scroll", handleScrollAndResize);
        window.removeEventListener("resize", handleScrollAndResize);
      };
    }
  }, [series]);

  const scrollRight = () => {
    if (sliderRef.current) {
      const slider = sliderRef.current;
      const scrollAmount = slider.clientWidth;
      slider.scrollBy({ left: scrollAmount, behavior: "smooth" });

      setTimeout(checkScrollButtons, 300);
      setTimeout(checkScrollButtons, 600);
    }
  };

  const scrollLeft = () => {
    if (sliderRef.current) {
      const slider = sliderRef.current;
      const scrollAmount = slider.clientWidth;
      slider.scrollBy({ left: -scrollAmount, behavior: "smooth" });

      setTimeout(checkScrollButtons, 300);
      setTimeout(checkScrollButtons, 600);
    }
  };

  const openSeriesInfo = (series) => {
    navigate(`/series/${series.id}`);
  };

  if (loading) {
    return (
      <section className="popular-section">
        <div className="popular-container">
          <h2 className="popular-title">
            <span className="popular-title-text">Популярные сериалы</span>
          </h2>
          <div className="popular-loading-skeleton">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="popular-loading-card"></div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="popular-section">
        <div className="popular-container">
          <h2 className="popular-title">
            <span className="popular-title-text">Популярные сериалы</span>
          </h2>
          <div className="popular-error">{error}</div>
        </div>
      </section>
    );
  }

  if (series.length === 0) {
    return (
      <section className="popular-section">
        <div className="popular-container">
          <h2 className="popular-title">
            <span className="popular-title-text">Популярные сериалы</span>
          </h2>
          <div className="popular-empty">Нет доступных сериалов</div>
        </div>
      </section>
    );
  }

  return (
    <section className="popular-section">
      <div className="popular-container">
        <div className="popular-header">
          <h2 className="popular-title">
            <span className="popular-title-text">Популярные сериалы</span>
            <span className="popular-title-icon"></span>
          </h2>
          <Link to="/popular-series" className="all-popular-link">
            Все популярные
            <span className="all-popular-underline"></span>
          </Link>
        </div>

        <div className="popular-slider-container">
          {canScrollLeft && (
            <button className="prev-btn" onClick={scrollLeft}>
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
          )}

          <div className="popular-slider" ref={sliderRef}>
            {series.map((show) => (
              <div className="popular-movie-card" key={show.id}>
                <div
                  className="popular-movie-poster"
                  style={{
                    backgroundImage: show.poster_path
                      ? `url(https://image.tmdb.org/t/p/w500${show.poster_path})`
                      : "none",
                  }}
                  onClick={() => openSeriesInfo(show)}
                >
                  <div className="popular-movie-overlay"></div>
                  <div className="popular-movie-info">
                    <h3 className="popular-movie-title">{show.name}</h3>
                    <p className="popular-movie-year">
                      {show.first_air_date
                        ? new Date(show.first_air_date).getFullYear()
                        : ""}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {canScrollRight && (
            <button className="next-btn" onClick={scrollRight}>
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
          )}
        </div>
      </div>
    </section>
  );
};

export default PopularSeries;
