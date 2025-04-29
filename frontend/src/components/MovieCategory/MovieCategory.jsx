import React, { useState, useEffect, useRef } from "react";
import "./MovieCategory.css";
import { movieService } from "../../services/movieService";

const MovieCategory = () => {
  const [selectedCategory, setSelectedCategory] = useState("action");
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [favorites, setFavorites] = useState({});
  const sliderRef = useRef(null);

  // Карта соответствия для идентификаторов жанров TMDB
  const genreIds = {
    action: 28, // Боевик
    comedy: 35, // Комедия
    drama: 18, // Драма
    fantasy: 14, // Фэнтези
    horror: 27, // Ужасы
    mystery: 9648, // Детектив
    romance: 10749, // Мелодрама
  };

  const categoryMap = {
    action: "Боевик",
    comedy: "Комедия",
    drama: "Драма",
    fantasy: "Фэнтези",
    horror: "Ужасы",
    mystery: "Детектив",
    romance: "Мелодрама",
  };

  useEffect(() => {
    const savedFavorites = localStorage.getItem("movieFavorites");
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("movieFavorites", JSON.stringify(favorites));
  }, [favorites]);

  // Функция для загрузки фильмов по жанру
  useEffect(() => {
    const fetchMoviesByGenre = async () => {
      try {
        setLoading(true);
        const genreId = genreIds[selectedCategory];

        // Добавим конечную точку API для получения фильмов по жанру
        const response = await fetch(
          `/api/movies/discover?genre=${genreId}&page=1`
        );
        if (!response.ok) {
          throw new Error("Не удалось получить фильмы");
        }

        const data = await response.json();
        setMovies(data.results);
        setLoading(false);
      } catch (err) {
        console.error("Ошибка при загрузке фильмов:", err);
        setError("Произошла ошибка при загрузке фильмов");
        setLoading(false);
      }
    };

    fetchMoviesByGenre();
  }, [selectedCategory]);

  const toggleFavorite = (movieId) => {
    setFavorites((prevFavorites) => {
      const newFavorites = { ...prevFavorites };
      if (newFavorites[movieId]) {
        delete newFavorites[movieId];
      } else {
        newFavorites[movieId] = true;
      }
      return newFavorites;
    });
  };

  const isFavorite = (movieId) => {
    return !!favorites[movieId];
  };

  const getCategoryDescription = () => {
    switch (selectedCategory) {
      case "action":
        return "Жанр кино, в котором главный герой сталкивается с серией событий, обычно связанных с насилием и физическими подвигами. Жанр имеет тенденцию изображать находчивого героя, борющегося против невероятных трудностей, включающих опасные для жизни ситуации, злодея или погоню, обычно заканчивающуюся победой героя.";
      case "comedy":
        return "Жанр кино, направленный на то, чтобы вызвать смех с помощью юмора. Эти фильмы преувеличивают ситуации, язык, действия, отношения и персонажей.";
      case "drama":
        return "Жанр повествования, характеризующийся серьезными тонами и содержанием, и с сюжетами, посвященными серьезным жизненным вопросам, часто с эмоционально интенсивными ситуациями.";
      case "fantasy":
        return "Жанр кино, который использует магию и другие сверхъестественные формы как основной элемент сюжета, тематики или обстановки. Такие фильмы обычно происходят в воображаемых мирах, где магия и магические существа являются обычным явлением.";
      case "horror":
        return "Жанр кино, предназначенный для вызывания страха, паники, отвращения и ужаса. Сюжет часто вращается вокруг злого антагониста, такого как монстр, и его взаимодействия с жертвой.";
      case "mystery":
        return "Жанр кино, который вращается вокруг решения загадки, обычно связанной с преступлением. Часто фокусируется на усилиях детектива или любителя, который должен раскрыть скрытые мотивы или истинную личность злоумышленника.";
      case "romance":
        return "Жанр кино, который помещает романтическую любовь в центр сюжета. Эти фильмы делают проблемы привлекательности и любви центральными элементами сюжета.";
      default:
        return "";
    }
  };

  const scrollRight = () => {
    if (sliderRef.current) {
      const slider = sliderRef.current;
      const scrollAmount = slider.clientWidth;

      slider.scrollBy({
        left: scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const scrollLeft = () => {
    if (sliderRef.current) {
      const slider = sliderRef.current;
      const scrollAmount = slider.clientWidth;

      slider.scrollBy({
        left: -scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const checkScrollButtons = () => {
    if (sliderRef.current) {
      const slider = sliderRef.current;
      const maxScrollLeft = slider.scrollWidth - slider.clientWidth;

      setCanScrollLeft(slider.scrollLeft > 0);
      setCanScrollRight(slider.scrollLeft < maxScrollLeft - 1);
    }
  };

  useEffect(() => {
    const slider = sliderRef.current;
    if (slider) {
      slider.addEventListener("scroll", checkScrollButtons);

      setTimeout(checkScrollButtons, 100);

      return () => {
        slider.removeEventListener("scroll", checkScrollButtons);
      };
    }
  }, [movies]);

  useEffect(() => {
    const handleResize = () => {
      checkScrollButtons();
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const changeCategory = (category) => {
    setSelectedCategory(category);
    if (sliderRef.current) {
      sliderRef.current.scrollLeft = 0;
      setTimeout(checkScrollButtons, 100);
    }
  };

  return (
    <section className="category-section">
      <div className="category-container">
        <h2 className="category-title">Поиск фильмов по категории</h2>

        <div className="category-sidebar">
          {Object.entries(categoryMap).map(([key, value]) => (
            <button
              key={key}
              className={`category-button ${
                selectedCategory === key ? "active" : ""
              }`}
              onClick={() => changeCategory(key)}
            >
              {value}
            </button>
          ))}
        </div>

        <div className="category-content">
          <h3 className="category-content-title">
            {categoryMap[selectedCategory]}
          </h3>

          <p className="category-description">{getCategoryDescription()}</p>

          <div className="category-slider-container">
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

            <div className="category-slider" ref={sliderRef}>
              {loading ? (
                <div className="category-loading-skeleton">
                  {[...Array(6)].map((_, index) => (
                    <div key={index} className="category-loading-card"></div>
                  ))}
                </div>
              ) : error ? (
                <div className="error">{error}</div>
              ) : movies.length > 0 ? (
                movies.map((movie) => (
                  <div className="category-movie-card" key={movie.id}>
                    <div
                      className="category-movie-poster"
                      style={{
                        backgroundImage: movie.poster_path
                          ? `url(https://image.tmdb.org/t/p/w500${movie.poster_path})`
                          : "url(/images/no-poster.jpg)",
                      }}
                    >
                      <div className="category-movie-overlay"></div>
                      <div className="category-movie-info">
                        <h3 className="category-movie-title">{movie.title}</h3>
                        <p className="category-movie-year">
                          {movie.release_date
                            ? new Date(movie.release_date).getFullYear()
                            : ""}
                        </p>
                        <div className="featured-movie-buttons">
                          <button
                            className="more-info-btn"
                            onClick={() => {
                              window.location.href = `/movie/${movie.id}`;
                            }}
                          >
                            Подробнее
                          </button>
                          <button
                            className="favorite-btn"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              toggleFavorite(movie.id);
                            }}
                          >
                            <img
                              src={
                                isFavorite(movie.id)
                                  ? "/images/heart-fill.png"
                                  : "/images/heart.png"
                              }
                              alt="Heart Icon"
                              width="20"
                              height="20"
                            />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-movies">Нет фильмов в этой категории</div>
              )}
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
      </div>
    </section>
  );
};

export default MovieCategory;
