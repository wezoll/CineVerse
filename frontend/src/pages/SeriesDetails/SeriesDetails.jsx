import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { tvService } from "../../services/TVService";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import Reviews from "../../components/Reviews/Reviews";
import FavoriteButton from "../../components/FavoriteButton/FavoriteButton";
import ExternalLinks from "../../components/ExternalLinks/ExternalLinks";
import "./SeriesDetails.css";

const SeriesDetails = () => {
  const { id } = useParams();
  const [series, setSeries] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("about");
  const [trailerKey, setTrailerKey] = useState(null);
  const [seriesImages, setSeriesImages] = useState({ backdrops: [] });
  const [externalIds, setExternalIds] = useState(null);

  useEffect(() => {
    const fetchSeriesDetails = async () => {
      try {
        setLoading(true);
        // Получаем детали сериала
        const data = await tvService.getTVDetails(id);
        setSeries(data);

        // Получаем трейлеры
        const trailersData = await tvService.getTVTrailers(id);
        const trailer = trailersData.results.find(
          (video) => video.site === "YouTube" && video.type === "Trailer"
        );
        if (trailer) {
          setTrailerKey(trailer.key);
        }

        // Получаем кадры
        const imagesData = await tvService.getTVImages(id);
        setSeriesImages(imagesData);

        // Загружаем внешние ссылки
        try {
          const externalIdsData = await tvService.getTVExternalIds(id);
          setExternalIds(externalIdsData);
        } catch (externalIdsErr) {
          console.error("Ошибка при загрузке внешних ссылок:", externalIdsErr);
        }

        setLoading(false);
      } catch (err) {
        setError("Произошла ошибка при загрузке данных сериала");
        setLoading(false);
      }
    };

    fetchSeriesDetails();
    window.scrollTo(0, 0);
  }, [id]);

  if (loading)
    return (
      <div className="cineverse-loader">
        <div className="loading-spinner"></div>Загрузка...
      </div>
    );
  if (error) return <div className="cineverse-error">{error}</div>;
  if (!series)
    return <div className="cineverse-not-found">Сериал не найден</div>;

  const directors = series.created_by || [];

  // Фильтруем актеров, оставляя только тех, у кого есть фото
  const castWithPhotos =
    series.credits?.cast?.filter((actor) => actor.profile_path) || [];

  // Фильтруем похожие сериалы, оставляя только те, у которых есть постер
  const similarSeriesWithPosters =
    series.similar?.results?.filter((similar) => similar.poster_path) || [];

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
            backgroundImage: series.backdrop_path
              ? `url(https://image.tmdb.org/t/p/original${series.backdrop_path})`
              : "none",
          }}
        >
          <div className="cineverse-backdrop-overlay"></div>
        </div>

        <div className="cineverse-container">
          <div className="cineverse-movie-header">
            <div className="cineverse-movie-poster-wrapper">
              {series.poster_path ? (
                <img
                  src={`https://image.tmdb.org/t/p/w500${series.poster_path}`}
                  alt={series.name}
                  className="cineverse-movie-poster"
                />
              ) : (
                <div className="cineverse-no-poster">Нет изображения</div>
              )}
            </div>

            <div className="cineverse-movie-info">
              <h1 className="cineverse-movie-title">
                {series.name}
                {series.first_air_date && (
                  <span className="cineverse-movie-year">
                    {new Date(series.first_air_date).getFullYear()}
                  </span>
                )}
              </h1>

              {series.original_name && series.original_name !== series.name && (
                <div className="cineverse-original-title">
                  {series.original_name}
                </div>
              )}

              {series.tagline && (
                <div className="cineverse-movie-tagline">
                  «{series.tagline}»
                </div>
              )}

              <div className="cineverse-movie-meta">
                {series.first_air_date && (
                  <div className="cineverse-movie-meta-item">
                    {new Date(series.first_air_date).toLocaleDateString(
                      "ru-RU"
                    )}
                  </div>
                )}

                {series.episode_run_time &&
                  series.episode_run_time.length > 0 && (
                    <div className="cineverse-movie-meta-item">
                      {series.episode_run_time[0]} мин.
                    </div>
                  )}

                {series.vote_average && (
                  <div className="cineverse-movie-rating">
                    <div className="cineverse-rating-badge">
                      {series.vote_average.toFixed(1)}
                    </div>
                    {series.vote_count > 0 && (
                      <div className="cineverse-vote-count">
                        {formatVoteCount(series.vote_count)}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="cineverse-movie-genres">
                {series.genres &&
                  series.genres.map((genre) => (
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
                  itemId={series.id}
                  itemType="tv"
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
                О сериале
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
              {/* О сериале */}
              {activeTab === "about" && (
                <div className="cineverse-movie-about">
                  <div className="cineverse-movie-description">
                    <p>{series.overview || "Описание отсутствует"}</p>
                  </div>

                  <div className="cineverse-movie-details-grid">
                    {directors.length > 0 && (
                      <div className="cineverse-detail-item">
                        <span className="cineverse-detail-label">
                          Создатели
                        </span>
                        <span className="cineverse-detail-value">
                          {directors.map((creator) => creator.name).join(", ")}
                        </span>
                      </div>
                    )}

                    <div className="cineverse-detail-item">
                      <span className="cineverse-detail-label">Статус</span>
                      <span className="cineverse-detail-value">
                        {series.status === "Returning Series"
                          ? "Продолжается"
                          : series.status === "Ended"
                          ? "Завершен"
                          : series.status}
                      </span>
                    </div>

                    <div className="cineverse-detail-item">
                      <span className="cineverse-detail-label">
                        Первый эфир
                      </span>
                      <span className="cineverse-detail-value">
                        {series.first_air_date
                          ? new Date(series.first_air_date).toLocaleDateString(
                              "ru-RU"
                            )
                          : "Неизвестно"}
                      </span>
                    </div>

                    <div className="cineverse-detail-item">
                      <span className="cineverse-detail-label">
                        Последний эфир
                      </span>
                      <span className="cineverse-detail-value">
                        {series.last_air_date
                          ? new Date(series.last_air_date).toLocaleDateString(
                              "ru-RU"
                            )
                          : "Неизвестно"}
                      </span>
                    </div>

                    <div className="cineverse-detail-item">
                      <span className="cineverse-detail-label">
                        Количество сезонов
                      </span>
                      <span className="cineverse-detail-value">
                        {series.number_of_seasons}
                      </span>
                    </div>

                    <div className="cineverse-detail-item">
                      <span className="cineverse-detail-label">
                        Количество эпизодов
                      </span>
                      <span className="cineverse-detail-value">
                        {series.number_of_episodes}
                      </span>
                    </div>

                    {series.networks && series.networks.length > 0 && (
                      <div className="cineverse-detail-item">
                        <span className="cineverse-detail-label">Канал</span>
                        <span className="cineverse-detail-value">
                          {series.networks
                            .map((network) => network.name)
                            .join(", ")}
                        </span>
                      </div>
                    )}

                    {series.origin_country &&
                      series.origin_country.length > 0 && (
                        <div className="cineverse-detail-item">
                          <span className="cineverse-detail-label">
                            Страна производства
                          </span>
                          <span className="cineverse-detail-value">
                            {series.origin_country.join(", ")}
                          </span>
                        </div>
                      )}
                  </div>

                  {/* Добавляем компонент внешних ссылок */}
                  <ExternalLinks externalIds={externalIds} type="tv" />
                </div>
              )}

              {/* Трейлер */}
              {activeTab === "trailer" && trailerKey && (
                <div className="cineverse-movie-trailer">
                  <iframe
                    width="100%"
                    height="500"
                    src={`https://www.youtube.com/embed/${trailerKey}`}
                    title={`${series.title} трейлер`}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
              )}

              {/* Кадры из сериала */}
              {activeTab === "frames" && (
                <div className="cineverse-frames-grid">
                  {seriesImages.backdrops &&
                  seriesImages.backdrops.length > 0 ? (
                    seriesImages.backdrops
                      .slice(0, 12)
                      .map((backdrop, index) => (
                        <div key={index} className="cineverse-frame-item">
                          <img
                            src={`https://image.tmdb.org/t/p/w780${backdrop.file_path}`}
                            alt={`Кадр ${index + 1} из сериала ${series.name}`}
                          />
                        </div>
                      ))
                  ) : (
                    <div className="cineverse-no-frames">
                      Кадры из сериала отсутствуют
                    </div>
                  )}
                </div>
              )}

              {/* Актеры (только с фото) */}
              {activeTab === "cast" && (
                <div className="cineverse-cast-grid">
                  {castWithPhotos.length > 0 ? (
                    castWithPhotos.slice(0, 16).map((actor) => (
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
                    ))
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

          {/* Похожие сериалы (только с постерами) */}
          {similarSeriesWithPosters.length > 0 && (
            <div className="cineverse-section">
              <h2 className="cineverse-section-title">
                Похожие сериалы
                <div className="cineverse-title-line"></div>
              </h2>
              <div className="cineverse-similar-movies">
                {similarSeriesWithPosters.slice(0, 6).map((similar) => (
                  <Link
                    to={`/series/${similar.id}`}
                    key={similar.id}
                    className="cineverse-movie-card"
                  >
                    <img
                      src={`https://image.tmdb.org/t/p/w342${similar.poster_path}`}
                      alt={similar.name}
                      className="cineverse-movie-card-poster"
                    />
                    <div className="cineverse-movie-card-rating">
                      {similar.vote_average.toFixed(1)}
                    </div>
                    <div className="cineverse-movie-card-info">
                      <div className="cineverse-movie-card-title">
                        {similar.name}
                      </div>
                      <div className="cineverse-movie-card-year">
                        {similar.first_air_date &&
                          new Date(similar.first_air_date).getFullYear()}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="cineverse-back-btn-container">
          <Link to="/popular-series" className="cineverse-back-btn">
            Вернуться к списку сериалов
          </Link>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default SeriesDetails;
