import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./Top10.css";
import { trendingService } from "../../services/trendingService";

const Top10 = () => {
  const [trendingItems, setTrendingItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [timeWindow, setTimeWindow] = useState("week");
  const [isAnimating, setIsAnimating] = useState(false);
  const sliderRef = useRef(null);

  const navigate = useNavigate();

  const imageBaseUrl = "https://image.tmdb.org/t/p/w500";

  useEffect(() => {
    const fetchTrendingItems = async () => {
      try {
        setLoading(true);
        setCanScrollLeft(false);
        setCanScrollRight(true);

        const data = await trendingService.getTop10("all", timeWindow);
        setTrendingItems(data.results || []);
      } catch (err) {
        setError("Не удалось загрузить трендовые элементы");
        console.error(err);
      } finally {
        setTimeout(() => {
          setLoading(false);
          setIsAnimating(false);

          setTimeout(checkScrollButtons, 200);
        }, 300);
      }
    };

    fetchTrendingItems();
  }, [timeWindow]);

  const handleItemClick = (item) => {
    const mediaType = item.media_type;

    if (mediaType === "movie") {
      navigate(`/movie/${item.id}`);
    } else if (mediaType === "tv") {
      navigate(`/series/${item.id}`);
    }
  };

  const switchTimeWindow = (newTimeWindow) => {
    if (newTimeWindow !== timeWindow) {
      setIsAnimating(true);
      setTimeWindow(newTimeWindow);

      if (sliderRef.current) {
        sliderRef.current.scrollLeft = 0;
      }
    }
  };

  const checkScrollButtons = () => {
    if (sliderRef.current) {
      const slider = sliderRef.current;
      const maxScrollLeft = slider.scrollWidth - slider.clientWidth;

      setCanScrollLeft(slider.scrollLeft > 10);

      setCanScrollRight(slider.scrollLeft < maxScrollLeft - 10);
    }
  };

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
  }, [trendingItems]);

  const renderNumber = (number) => {
    const numberStr = number.toString();

    return (
      <div className="number-container">
        <svg
          className="number"
          viewBox="0 0 100 120"
          width="100%"
          height="100%"
        >
          <text
            x="50%"
            y="50%"
            dominantBaseline="middle"
            textAnchor="middle"
            className="number-text"
          >
            {numberStr}
          </text>
        </svg>
      </div>
    );
  };

  const LoadingSkeleton = () => {
    return (
      <div className="Top10-slider">
        {[...Array(10)].map((_, index) => (
          <div className="top10-item" key={`skeleton-${index}`}>
            <div className="number-wrapper skeleton-number">
              {renderNumber(index + 1)}
            </div>
            <div className="poster-wrapper skeleton-poster">
              <div className="poster skeleton-animation">
                <div className="poster-overlay"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  if (error) {
    return (
      <section className="Top10-section">
        <div className="Top10-container">
          <div className="Top10-header">
            <h2 className="Top10-title">
              <span className="Top10-title-text">В тренде</span>
            </h2>
            <div className="time-window-toggle">
              <button
                className={`time-window-btn ${
                  timeWindow === "day" ? "active" : ""
                }`}
                onClick={() => switchTimeWindow("day")}
              >
                Сегодня
              </button>
              <button
                className={`time-window-btn ${
                  timeWindow === "week" ? "active" : ""
                }`}
                onClick={() => switchTimeWindow("week")}
              >
                На этой неделе
              </button>
            </div>
          </div>
          <div className="Top10-error">{error}</div>
        </div>
      </section>
    );
  }

  return (
    <section className="Top10-section">
      <div className="Top10-container">
        <div className="Top10-header">
          <h2 className="Top10-title">
            <span className="Top10-title-text">В тренде</span>
          </h2>
          <div className="time-window-toggle">
            <button
              className={`time-window-btn ${
                timeWindow === "day" ? "active" : ""
              }`}
              onClick={() => switchTimeWindow("day")}
              disabled={loading || timeWindow === "day"}
            >
              <span className="btn-text">Сегодня</span>
            </button>
            <button
              className={`time-window-btn ${
                timeWindow === "week" ? "active" : ""
              }`}
              onClick={() => switchTimeWindow("week")}
              disabled={loading || timeWindow === "week"}
            >
              <span className="btn-text">На этой неделе</span>
            </button>
          </div>
        </div>

        <div className="Top10-slider-container">
          {canScrollLeft && !loading && (
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

          {loading || isAnimating ? (
            <LoadingSkeleton />
          ) : trendingItems.length === 0 ? (
            <div className="Top10-empty">Нет доступных трендовых элементов</div>
          ) : (
            <div
              className="Top10-slider fade-in"
              ref={sliderRef}
              onScroll={checkScrollButtons}
            >
              {trendingItems.slice(0, 10).map((item, index) => (
                <div className="top10-item" key={item.id}>
                  <div className="number-wrapper">
                    {renderNumber(index + 1)}
                  </div>
                  <div
                    className="poster-wrapper"
                    onClick={() => handleItemClick(item)}
                  >
                    <div
                      className="poster"
                      style={{
                        backgroundImage: `url(${imageBaseUrl}${item.poster_path})`,
                      }}
                    >
                      <div className="poster-overlay"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {canScrollRight && !loading && (
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

export default Top10;
