import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { movieService } from "../../services/movieService";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import Reviews from "../../components/Reviews/Reviews";
import FavoriteButton from "../../components/FavoriteButton/FavoriteButton";
import "./MovieDetails.css";

const MovieDetails = () => {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("about");
  const [trailerKey, setTrailerKey] = useState(null);
  const [movieImages, setMovieImages] = useState({ backdrops: [] });

  useEffect(() => {
    const fetchMovieDetails = async () => {
      try {
        setLoading(true);
        const data = await movieService.getMovieDetails(id);
        setMovie(data);

        // Поиск трейлера
        if (data.videos && data.videos.results) {
          const trailer = data.videos.results.find(
            (video) => video.type === "Trailer" && video.site === "YouTube"
          );
          if (trailer) {
            setTrailerKey(trailer.key);
          }
        }

        // Если images не пришли в расширенных данных, загружаем отдельно
        if (
          !data.images ||
          !data.images.backdrops ||
          data.images.backdrops.length === 0
        ) {
          try {
            const imagesData = await movieService.getMovieImages(id);
            setMovieImages(imagesData);
          } catch (imgErr) {
            console.error("Ошибка при загрузке изображений:", imgErr);
          }
        } else {
          setMovieImages(data.images);
        }

        setLoading(false);
      } catch (err) {
        setError("Произошла ошибка при загрузке информации о фильме");
        setLoading(false);
      }
    };

    fetchMovieDetails();
  }, [id]);

  if (loading)
    return (
      <div className="cineverse-loader">
        <div className="loading-spinner"></div>Загрузка...
      </div>
    );
  if (error) return <div className="cineverse-error">{error}</div>;
  if (!movie) return <div className="cineverse-not-found">Фильм не найден</div>;

  const directors =
    movie.credits?.crew.filter((person) => person.job === "Director") || [];
  const writers =
    movie.credits?.crew.filter(
      (person) =>
        person.job === "Screenplay" ||
        person.job === "Writer" ||
        person.job === "Story"
    ) || [];

  // Используем либо изображения из основных данных фильма, либо отдельно загруженные
  const backdrops = movieImages.backdrops || [];

  // Фильтруем актеров, оставляя только тех, у кого есть фото
  const castWithPhotos =
    movie.credits?.cast?.filter((actor) => actor.profile_path) || [];

  // Фильтруем похожие фильмы, оставляя только те, у которых есть постер
  const similarMoviesWithPosters =
    movie.similar?.results?.filter((similar) => similar.poster_path) || [];

  // Форматирование числа оценок
  const formatVoteCount = (count) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K оценок`;
    }
    return `${count} оценок`;
  };

  return (
    <>
      <Header />
      <div className="cineverse-movie-details">
        {/* Фоновое изображение с градиентом */}
        <div
          className="cineverse-movie-backdrop"
          style={{
            backgroundImage: movie.backdrop_path
              ? `url(https://image.tmdb.org/t/p/original${movie.backdrop_path})`
              : "none",
          }}
        >
          <div className="cineverse-backdrop-overlay"></div>
        </div>

        <div className="cineverse-container">
          <div className="cineverse-movie-header">
            <div className="cineverse-movie-poster-wrapper">
              {movie.poster_path ? (
                <img
                  src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                  alt={movie.title}
                  className="cineverse-movie-poster"
                />
              ) : (
                <div className="cineverse-no-poster">Нет изображения</div>
              )}
            </div>

            <div className="cineverse-movie-info">
              <h1 className="cineverse-movie-title">
                {movie.title}
                {movie.release_date && (
                  <span className="cineverse-movie-year">
                    {new Date(movie.release_date).getFullYear()}
                  </span>
                )}
              </h1>

              {movie.original_title && movie.original_title !== movie.title && (
                <div className="cineverse-original-title">
                  {movie.original_title}
                </div>
              )}

              {movie.tagline && (
                <div className="cineverse-movie-tagline">«{movie.tagline}»</div>
              )}

              <div className="cineverse-movie-meta">
                {movie.release_date && (
                  <div className="cineverse-movie-meta-item">
                    {new Date(movie.release_date).toLocaleDateString("ru-RU")}
                  </div>
                )}

                {movie.runtime && (
                  <div className="cineverse-movie-meta-item">
                    {Math.floor(movie.runtime / 60)}ч {movie.runtime % 60}м
                  </div>
                )}

                {movie.vote_average && (
                  <div className="cineverse-movie-rating">
                    <div className="cineverse-rating-badge">
                      {movie.vote_average.toFixed(1)}
                    </div>
                    {movie.vote_count > 0 && (
                      <div className="cineverse-vote-count">
                        {formatVoteCount(movie.vote_count)}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="cineverse-movie-genres">
                {movie.genres &&
                  movie.genres.map((genre) => (
                    <span key={genre.id} className="cineverse-genre-badge">
                      {genre.name}
                    </span>
                  ))}
              </div>

              {/* Кнопки действий */}
              <div className="cineverse-movie-actions">
                {trailerKey ? (
                  <button
                    className="cineverse-watch-trailer-btn"
                    onClick={() => setActiveTab("trailer")}
                  >
                    Смотреть трейлер
                  </button>
                ) : (
                  <div className="cineverse-trailer-placeholder"></div>
                )}
                <FavoriteButton
                  itemId={movie.id}
                  itemType="movie"
                  className="cineverse-favorite-btn"
                />
              </div>
            </div>
          </div>

          {/* Вкладки */}
          <div className="cineverse-movie-tabs">
            <div className="cineverse-tabs-header">
              <button
                className={`cineverse-tab ${
                  activeTab === "about" ? "active" : ""
                }`}
                onClick={() => setActiveTab("about")}
              >
                О фильме
              </button>

              {trailerKey && (
                <button
                  className={`cineverse-tab ${
                    activeTab === "trailer" ? "active" : ""
                  }`}
                  onClick={() => setActiveTab("trailer")}
                >
                  Трейлер
                </button>
              )}

              <button
                className={`cineverse-tab ${
                  activeTab === "frames" ? "active" : ""
                }`}
                onClick={() => setActiveTab("frames")}
              >
                Кадры
              </button>

              <button
                className={`cineverse-tab ${
                  activeTab === "cast" ? "active" : ""
                }`}
                onClick={() => setActiveTab("cast")}
              >
                Актёры
              </button>
            </div>

            <div className="cineverse-tabs-content">
              {/* О фильме */}
              {activeTab === "about" && (
                <div className="cineverse-movie-about">
                  <div className="cineverse-movie-description">
                    <p>{movie.overview || "Описание отсутствует"}</p>
                  </div>

                  <div className="cineverse-movie-details-grid">
                    {directors.length > 0 && (
                      <div className="cineverse-detail-item">
                        <span className="cineverse-detail-label">Режиссер</span>
                        <span className="cineverse-detail-value">
                          {directors
                            .map((director) => director.name)
                            .join(", ")}
                        </span>
                      </div>
                    )}

                    {writers.length > 0 && (
                      <div className="cineverse-detail-item">
                        <span className="cineverse-detail-label">Сценарий</span>
                        <span className="cineverse-detail-value">
                          {writers.map((writer) => writer.name).join(", ")}
                        </span>
                      </div>
                    )}

                    {movie.production_countries &&
                      movie.production_countries.length > 0 && (
                        <div className="cineverse-detail-item">
                          <span className="cineverse-detail-label">Страна</span>
                          <span className="cineverse-detail-value">
                            {movie.production_countries
                              .map((country) => country.name)
                              .join(", ")}
                          </span>
                        </div>
                      )}

                    {movie.budget > 0 && (
                      <div className="cineverse-detail-item">
                        <span className="cineverse-detail-label">Бюджет</span>
                        <span className="cineverse-detail-value">
                          ${movie.budget.toLocaleString()}
                        </span>
                      </div>
                    )}

                    {movie.revenue > 0 && (
                      <div className="cineverse-detail-item">
                        <span className="cineverse-detail-label">Сборы</span>
                        <span className="cineverse-detail-value">
                          ${movie.revenue.toLocaleString()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Трейлер */}
              {activeTab === "trailer" && trailerKey && (
                <div className="cineverse-movie-trailer">
                  <iframe
                    width="100%"
                    height="500"
                    src={`https://www.youtube.com/embed/${trailerKey}`}
                    title={`${movie.title} трейлер`}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
              )}

              {/* Кадры из фильма */}
              {activeTab === "frames" && (
                <div className="cineverse-movie-frames">
                  <div className="cineverse-frames-grid">
                    {backdrops.length > 0 ? (
                      backdrops.slice(0, 12).map((backdrop, index) => (
                        <div key={index} className="cineverse-frame-item">
                          <img
                            src={`https://image.tmdb.org/t/p/w780${backdrop.file_path}`}
                            alt={`Кадр ${index + 1} из фильма ${movie.title}`}
                          />
                        </div>
                      ))
                    ) : (
                      <div className="cineverse-no-frames">
                        Кадры из фильма отсутствуют
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Актеры (только с фото) */}
              {activeTab === "cast" && (
                <div className="cineverse-movie-cast">
                  {castWithPhotos.length > 0 ? (
                    <div className="cineverse-cast-grid">
                      {castWithPhotos.slice(0, 16).map((actor) => (
                        <div key={actor.id} className="cineverse-cast-card">
                          <img
                            src={`https://image.tmdb.org/t/p/w185${actor.profile_path}`}
                            alt={actor.name}
                            className="cineverse-cast-photo"
                          />
                          <div className="cineverse-cast-info">
                            <div className="cineverse-cast-name">
                              {actor.name}
                            </div>
                            <div className="cineverse-cast-character">
                              {actor.character}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="cineverse-no-cast">
                      Информация об актерах отсутствует
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Отзывы */}
          <Reviews movieId={id} />

          {/* Похожие фильмы (только с постерами) */}
          {similarMoviesWithPosters.length > 0 && (
            <div className="cineverse-section">
              <h2 className="cineverse-section-title">
                Похожие фильмы
                <div className="cineverse-title-line"></div>
              </h2>
              <div className="cineverse-similar-movies">
                {similarMoviesWithPosters.slice(0, 6).map((similar) => (
                  <Link
                    to={`/movie/${similar.id}`}
                    key={similar.id}
                    className="cineverse-movie-card"
                  >
                    <img
                      src={`https://image.tmdb.org/t/p/w342${similar.poster_path}`}
                      alt={similar.title}
                      className="cineverse-movie-card-poster"
                    />
                    <div className="cineverse-movie-card-rating">
                      {similar.vote_average.toFixed(1)}
                    </div>
                    <div className="cineverse-movie-card-info">
                      <div className="cineverse-movie-card-title">
                        {similar.title}
                      </div>
                      <div className="cineverse-movie-card-year">
                        {similar.release_date &&
                          new Date(similar.release_date).getFullYear()}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="cineverse-back-btn-container">
          <Link to="/popular-movies" className="cineverse-back-btn">
            Вернуться к списку фильмов
          </Link>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default MovieDetails;
