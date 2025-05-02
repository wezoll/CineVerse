import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { movieService } from "../../services/movieService";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import "./PopularMovies.css";

const PopularMovies = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const moviesPerPage = 24;
  const maxPages = 50;

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        setLoading(true);
        const page1 = await movieService.getPopularMovies(currentPage);
        const page2 = await movieService.getPopularMovies(currentPage + 1);

        const combinedResults = [...page1.results, ...page2.results].slice(
          0,
          moviesPerPage
        );
        setMovies(combinedResults);

        setTotalPages(
          Math.min(Math.ceil(page1.total_results / moviesPerPage), maxPages)
        );
        setLoading(false);
      } catch (err) {
        setError("Произошла ошибка при загрузке фильмов");
        setLoading(false);
      }
    };

    fetchMovies();
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
      <div className="popular-movies">
        <h1>Популярные фильмы</h1>

        <div className="movies-grid">
          {movies.map((movie) => (
            <Link
              to={`/movie/${movie.id}`}
              key={movie.id}
              className="movie-card"
            >
              <div className="movie-poster-container">
                {movie.poster_path ? (
                  <img
                    src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                    alt={movie.title}
                    className="movie-poster"
                  />
                ) : (
                  <div className="no-poster">Нет изображения</div>
                )}
                <div className="movie-overlay">
                  <div className="movie-info">
                    <h3>{movie.title}</h3>
                    <div className="movie-date">
                      {new Date(movie.release_date).getFullYear()}
                    </div>
                    <div className="movie-rating">
                      {movie.vote_average.toFixed(1)}
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

export default PopularMovies;
