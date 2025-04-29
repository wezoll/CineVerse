import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Header from "../Header/Header";
import Footer from "../Footer/Footer";
import "./SearchResults.css"; // Используем тот же CSS файл

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("query") || "";
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const itemsPerPage = 18;

  useEffect(() => {
    const fetchSearchResults = async () => {
      if (!query) {
        setResults([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await fetch(
          `/api/search/combined?query=${encodeURIComponent(
            query
          )}&page=${currentPage}`
        );

        if (!response.ok) {
          throw new Error("Не удалось выполнить поиск");
        }

        const data = await response.json();
        setResults(data.results.slice(0, itemsPerPage));
        setTotalPages(data.total_pages > 500 ? 500 : data.total_pages);
        setLoading(false);
      } catch (err) {
        setError("Произошла ошибка при поиске");
        setLoading(false);
      }
    };

    fetchSearchResults();
  }, [query, currentPage]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      window.scrollTo(0, 0);
    }
  };

  if (loading)
    return (
      <>
        <Header />
        <div className="loading">
          <div className="loading-spinner"></div>Загрузка...
        </div>
        <Footer />
      </>
    );

  if (error)
    return (
      <>
        <Header />
        <div className="error">{error}</div>
        <Footer />
      </>
    );

  if (!query)
    return (
      <>
        <Header />
        <div className="no-query">Введите поисковый запрос</div>
        <Footer />
      </>
    );

  if (results.length === 0)
    return (
      <>
        <Header />
        <div className="no-results">По запросу "{query}" ничего не найдено</div>
        <Footer />
      </>
    );

  return (
    <>
      <Header />
      <div className="search-results">
        <h1>Результаты поиска: {query}</h1>

        <div className="movies-grid">
          {results.map((item) => (
            <Link
              to={`/${item.media_type}/${item.id}`}
              key={`${item.media_type}-${item.id}`}
              className="movie-card"
            >
              <div className="movie-poster-container">
                {item.poster_path ? (
                  <img
                    src={`https://image.tmdb.org/t/p/w500${item.poster_path}`}
                    alt={item.title}
                    className="movie-poster"
                  />
                ) : (
                  <div className="no-poster">Нет изображения</div>
                )}
                <div className="movie-overlay">
                  <div className="movie-info">
                    <h3>{item.title}</h3>
                    <div className="movie-type">
                      {item.media_type === "movie" ? "Фильм" : "Сериал"}
                    </div>
                    <div className="movie-date">
                      {item.release_date &&
                        new Date(item.release_date).getFullYear()}
                    </div>
                    <div className="movie-rating">
                      {item.vote_average?.toFixed(1)}
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {totalPages > 1 && (
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
        )}
      </div>
      <Footer />
    </>
  );
};

export default SearchResults;
