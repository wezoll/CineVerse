import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { tvService } from "../../services/TVService";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import "./PopularTV.css";

const PopularTV = () => {
  const [series, setSeries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const seriesPerPage = 24;
  const maxPages = 50; // Ограничиваем количество страниц до 50

  useEffect(() => {
    const fetchSeries = async () => {
      try {
        setLoading(true);
        // Запрашиваем две страницы, чтобы получить 24 сериала (по 20 на странице)
        const page1 = await tvService.getPopularSeries(currentPage);
        const page2 = await tvService.getPopularSeries(currentPage + 1);

        // Объединяем результаты и берем первые 24 сериала
        const combinedResults = [...page1.results, ...page2.results].slice(
          0,
          seriesPerPage
        );
        setSeries(combinedResults);

        // Ограничиваем количество страниц до maxPages
        setTotalPages(
          Math.min(Math.ceil(page1.total_results / seriesPerPage), maxPages)
        );
        setLoading(false);
      } catch (err) {
        setError("Произошла ошибка при загрузке сериалов");
        setLoading(false);
      }
    };

    fetchSeries();
  }, [currentPage]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      window.scrollTo(0, 0);
    }
  };

  if (loading)
    return (
      <div className="loading">
        <div className="loading-spinner"></div>Загрузка...
      </div>
    );
  if (error) return <div className="error">{error}</div>;

  return (
    <>
      <Header />
      <div className="popular-series">
        <h1>Популярные сериалы</h1>

        <div className="series-grid">
          {series.map((show) => (
            <Link
              to={`/series/${show.id}`}
              key={show.id}
              className="series-card"
            >
              <div className="series-poster-container">
                {show.poster_path ? (
                  <img
                    src={`https://image.tmdb.org/t/p/w500${show.poster_path}`}
                    alt={show.name}
                    className="series-poster"
                  />
                ) : (
                  <div className="no-poster">Нет изображения</div>
                )}
                <div className="series-overlay">
                  <div className="series-info">
                    <h3>{show.name}</h3>
                    <div className="series-date">
                      {show.first_air_date
                        ? new Date(show.first_air_date).getFullYear()
                        : "Н/Д"}
                    </div>
                    <div className="series-rating">
                      {show.vote_average.toFixed(1)}
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="pagination">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Назад
          </button>
          <span>
            Страница {currentPage} из {totalPages}
          </span>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Вперед
          </button>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default PopularTV;
