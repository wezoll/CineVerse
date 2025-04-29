import React, { useState, useEffect } from "react";
import { reviewService } from "../../services/reviewService";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import "./Reviews.css";

const DeleteConfirmModal = ({ isOpen, onClose, onConfirm, reviewId }) => {
  useEffect(() => {
    if (isOpen) {
      const originalStyle = window.getComputedStyle(document.body).overflow;
      document.body.style.overflow = "hidden";

      const preventScroll = (e) => {
        e.preventDefault();
        e.stopPropagation();
      };

      window.addEventListener("wheel", preventScroll, { passive: false });
      window.addEventListener("touchmove", preventScroll, { passive: false });

      return () => {
        document.body.style.overflow = originalStyle;
        window.removeEventListener("wheel", preventScroll);
        window.removeEventListener("touchmove", preventScroll);
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="reviews-delete-modal-overlay">
      <div className="reviews-delete-modal-container">
        <div className="reviews-delete-modal-content">
          <h3>Удаление отзыва</h3>
          <p>Вы действительно хотите удалить этот отзыв?</p>
          <div className="reviews-delete-modal-buttons">
            <button
              className="reviews-delete-modal-btn reviews-delete-modal-btn-cancel"
              onClick={onClose}
            >
              Отмена
            </button>
            <button
              className="reviews-delete-modal-btn reviews-delete-modal-btn-delete"
              onClick={() => onConfirm(reviewId)}
            >
              Удалить
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const API_URL = "http://localhost:5000";

const Reviews = ({ movieId, seriesId, inProfile = false }) => {
  const [reviews, setReviews] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [averageRating, setAverageRating] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reviewForm, setReviewForm] = useState({
    rating: 8,
    content: "",
  });
  const [editingReviewId, setEditingReviewId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [contentNames, setContentNames] = useState({});

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [reviewToDelete, setReviewToDelete] = useState(null);

  const { isAuthenticated, currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (deleteModalOpen) {
      document.body.classList.add("modal-open");
    } else {
      document.body.classList.remove("modal-open");
    }

    return () => {
      document.body.classList.remove("modal-open");
    };
  }, [deleteModalOpen]);

  const determineContentTypeFromUrl = () => {
    const path = window.location.pathname;
    if (path.includes("/movie/")) return "movie";
    if (path.includes("/tv/") || path.includes("/series/")) return "tv";
    return movieId ? "movie" : seriesId ? "tv" : null;
  };

  const contentType = determineContentTypeFromUrl();
  const contentId = movieId || seriesId;

  useEffect(() => {
    const fetchContentNames = async () => {
      if (!inProfile || !reviews.length) return;

      const namesMap = {};

      for (const review of reviews) {
        if (review.movie_id && !namesMap[review.movie_id]) {
          try {
            const response = await fetch(
              `${API_URL}/api/movies/${review.movie_id}`
            );
            const data = await response.json();
            namesMap[review.movie_id] = {
              title:
                data.movie?.title || data.title || `Фильм #${review.movie_id}`,
              type: "movie",
            };
          } catch (err) {
            console.error("Ошибка при получении информации о фильме:", err);
            namesMap[review.movie_id] = {
              title: `Фильм #${review.movie_id}`,
              type: "movie",
            };
          }
        } else if (review.series_id && !namesMap[review.series_id]) {
          try {
            const response = await fetch(
              `${API_URL}/api/tv/${review.series_id}`
            );
            const data = await response.json();
            namesMap[review.series_id] = {
              title:
                data.similar?.name ||
                data.name ||
                `Сериал #${review.series_id}`,
              type: "tv",
            };
          } catch (err) {
            console.error("Ошибка при получении информации о сериале:", err);
            namesMap[review.series_id] = {
              title: `Сериал #${review.series_id}`,
              type: "tv",
            };
          }
        }
      }

      setContentNames(namesMap);
    };

    fetchContentNames();
  }, [inProfile, reviews]);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true);

        if (inProfile) {
          const data = await reviewService.getUserReviews();
          setReviews(data.reviews || []);
          setTotalCount(data.total_count || 0);
        } else if (contentId) {
          let data;
          if (contentType === "movie") {
            data = await reviewService.getMovieReviews(contentId);
          } else {
            data = await reviewService.getTVReviews(contentId);
          }
          setReviews(data.reviews || []);
          setTotalCount(data.total_count || 0);
        }
      } catch (err) {
        setError("Ошибка при загрузке отзывов");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [contentId, contentType, inProfile]);

  useEffect(() => {
    if (reviews.length > 0) {
      const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
      setAverageRating(sum / reviews.length);
    } else {
      setAverageRating(0);
    }
  }, [reviews]);

  const hasUserReview = () => {
    if (!isAuthenticated || !currentUser) return false;
    return reviews.some(
      (review) => review.user_id === currentUser.id && review.source === "local"
    );
  };

  const getUserReview = () => {
    if (!isAuthenticated || !currentUser) return null;
    return reviews.find(
      (review) => review.user_id === currentUser.id && review.source === "local"
    );
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setReviewForm({
      ...reviewForm,
      [name]: name === "rating" ? parseFloat(value) : value,
    });
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (editingReviewId) {
        await reviewService.updateReview(editingReviewId, reviewForm);
        setSuccessMessage("Отзыв успешно обновлен");
      } else {
        if (contentType === "movie") {
          await reviewService.createReview(contentId, reviewForm);
        } else {
          await reviewService.createTVReview(contentId, reviewForm);
        }
        setSuccessMessage("Отзыв успешно добавлен");
      }

      if (inProfile) {
        const data = await reviewService.getUserReviews();
        setReviews(data.reviews || []);
      } else {
        let data;
        if (contentType === "movie") {
          data = await reviewService.getMovieReviews(contentId);
        } else {
          data = await reviewService.getTVReviews(contentId);
        }
        setReviews(data.reviews || []);
      }

      setReviewForm({ rating: 8, content: "" });
      setEditingReviewId(null);

      setTimeout(() => {
        setSuccessMessage("");
      }, 3000);
    } catch (err) {
      setError("Ошибка при сохранении отзыва");
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditReview = (review) => {
    if (inProfile) {
      const contentType = review.movie_id ? "movie" : "tv";
      const contentId = review.movie_id || review.series_id;
      navigate(
        `/${contentType}/${contentId}?edit=review&reviewId=${review.id}`
      );
      return;
    }

    setReviewForm({
      rating: review.rating,
      content: review.content,
    });
    setEditingReviewId(review.id);

    document
      .getElementById("review-form")
      ?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const editParam = searchParams.get("edit");
    const reviewIdParam = searchParams.get("reviewId");

    if (editParam === "review" && reviewIdParam && !inProfile) {
      const reviewToEdit = reviews.find(
        (review) => review.id === parseInt(reviewIdParam)
      );

      if (reviewToEdit) {
        setReviewForm({
          rating: reviewToEdit.rating,
          content: reviewToEdit.content,
        });
        setEditingReviewId(reviewToEdit.id);

        setTimeout(() => {
          document
            .getElementById("review-form")
            ?.scrollIntoView({ behavior: "smooth" });
        }, 100);
      }
    }
  }, [reviews, inProfile]);

  const handleDeleteReview = async (reviewId) => {
    try {
      await reviewService.deleteReview(reviewId);
      setSuccessMessage("Отзыв успешно удален");

      if (inProfile) {
        const data = await reviewService.getUserReviews();
        setReviews(data.reviews || []);
      } else {
        let data;
        if (contentType === "movie") {
          data = await reviewService.getMovieReviews(contentId);
        } else {
          data = await reviewService.getTVReviews(contentId);
        }
        setReviews(data.reviews || []);
      }

      setDeleteModalOpen(false);
      setReviewToDelete(null);

      setTimeout(() => {
        setSuccessMessage("");
      }, 3000);
    } catch (err) {
      setError("Ошибка при удалении отзыва");
      console.error(err);
      setDeleteModalOpen(false);
    }
  };

  const handleCancelEdit = () => {
    setReviewForm({ rating: 8, content: "" });
    setEditingReviewId(null);
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating / 2);
    const halfStar = rating % 2 >= 1;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <span key={`full-${i}`} className="star full-star">
          ★
        </span>
      );
    }

    if (halfStar) {
      stars.push(
        <span key="half" className="star half-star">
          ★
        </span>
      );
    }

    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <span key={`empty-${i}`} className="star empty-star">
          ☆
        </span>
      );
    }

    return (
      <div className="review-stars">
        {stars}
        <span className="review-rating-number">{rating.toFixed(1)}</span>
      </div>
    );
  };

  const getAvatarUrl = (avatarPath) => {
    if (!avatarPath) return "/assets/default-avatar.png";

    if (avatarPath.startsWith("/https")) {
      return avatarPath.substring(1);
    } else {
      return `https://image.tmdb.org/t/p/w45${avatarPath}`;
    }
  };

  const getContentTypeText = () =>
    contentType === "movie" ? "фильм" : "сериал";

  const getContentTypeTextGenitive = () =>
    contentType === "movie" ? "фильме" : "сериале";

  const navigateToContent = (contentType, contentId) => {
    navigate(`/${contentType === "tv" ? "series" : contentType}/${contentId}`);
  };

  const confirmDeleteReview = (review) => {
    setReviewToDelete(review.id);
    setDeleteModalOpen(true);
  };

  const handleCloseModal = () => {
    setDeleteModalOpen(false);
    setReviewToDelete(null);
  };

  const ReviewCard = ({ review }) => {
    const isUserReview =
      isAuthenticated && currentUser && review.user_id === currentUser.id;

    const reviewContentId = review.movie_id || review.series_id;
    const reviewContentType = review.movie_id ? "movie" : "tv";

    const contentInfo = inProfile && contentNames[reviewContentId];

    return (
      <div className="review-card">
        <div className="review-header">
          <div className="review-author">
            <div className="review-author-info">
              <div className="review-author-name">{review.user_name}</div>
              <div className="review-date">{review.created_at}</div>
            </div>
          </div>
          <div className="review-source-badge">
            {review.source === "tmdb" ? "TMDB" : "CineVerse"}
          </div>
        </div>

        {inProfile && contentInfo && (
          <h3
            className="content-title-link"
            onClick={() => navigateToContent(contentInfo.type, reviewContentId)}
          >
            {contentInfo.type === "movie" ? "🎬 " : "📺 "}
            {contentInfo.title}
          </h3>
        )}

        <div className="review-content">
          {renderStars(review.rating)}
          <p className="review-text">{review.content}</p>
        </div>

        {isUserReview && review.source === "local" && (
          <div className="review-actions">
            <button
              className="review-edit-btn"
              onClick={() => handleEditReview(review)}
            >
              Редактировать
            </button>
            <button
              className="review-delete-btn"
              onClick={() => confirmDeleteReview(review)}
            >
              Удалить
            </button>
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return <div className="reviews-loading">Загрузка отзывов...</div>;
  }

  return (
    <div className="cineverse-reviews-section">
      <DeleteConfirmModal
        isOpen={deleteModalOpen}
        onClose={handleCloseModal}
        onConfirm={handleDeleteReview}
        reviewId={reviewToDelete}
      />

      <h2 className="cineverse-section-title">
        {inProfile ? "Мои отзывы" : "Отзывы"}
        {totalCount > 0 && (
          <>
            <span className="reviews-count">({totalCount})</span>
            {!inProfile && averageRating > 0 && (
              <div className="reviews-average-rating">
                <span className="average-rating-stars">
                  {renderStars(averageRating)}
                </span>
              </div>
            )}
          </>
        )}
      </h2>

      {error && <div className="reviews-error">{error}</div>}
      {successMessage && (
        <div className="reviews-success">{successMessage}</div>
      )}

      {isAuthenticated && !inProfile && contentId && (
        <div id="review-form" className="review-form-container">
          <h3>
            {editingReviewId
              ? "Редактировать отзыв"
              : hasUserReview()
              ? "Вы уже оставили отзыв"
              : `Написать отзыв на ${getContentTypeText()}`}
          </h3>

          {!hasUserReview() || editingReviewId ? (
            <form onSubmit={handleSubmitReview} className="review-form">
              <div className="form-group">
                <label htmlFor="rating">Оценка:</label>
                <div className="rating-slider-container">
                  <input
                    type="range"
                    id="rating"
                    name="rating"
                    min="0"
                    max="10"
                    step="0.5"
                    value={reviewForm.rating}
                    onChange={handleInputChange}
                  />
                  <div className="rating-value">
                    {reviewForm.rating.toFixed(1)}
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="content">
                  Ваше мнение о {getContentTypeTextGenitive()}:
                </label>
                <textarea
                  id="content"
                  name="content"
                  rows="4"
                  value={reviewForm.content}
                  onChange={handleInputChange}
                  placeholder={`Поделитесь своими впечатлениями о ${getContentTypeTextGenitive()}...`}
                ></textarea>
              </div>

              <div className="form-buttons">
                <button
                  type="submit"
                  className="submit-review-btn"
                  disabled={submitting}
                >
                  {submitting
                    ? "Сохранение..."
                    : editingReviewId
                    ? "Сохранить изменения"
                    : "Опубликовать отзыв"}
                </button>

                {editingReviewId && (
                  <button
                    type="button"
                    className="cancel-edit-btn"
                    onClick={handleCancelEdit}
                  >
                    Отмена
                  </button>
                )}
              </div>
            </form>
          ) : (
            <p className="already-reviewed-message">
              Вы уже оставили отзыв на этот {getContentTypeText()}. Вы можете
              отредактировать или удалить его ниже.
            </p>
          )}
        </div>
      )}

      <div className="reviews-list">
        {reviews.length > 0 ? (
          reviews.map((review) => (
            <ReviewCard key={`${review.source}-${review.id}`} review={review} />
          ))
        ) : (
          <div className="no-reviews">
            {inProfile ? (
              <p>
                У вас пока нет отзывов. Оставьте отзыв на странице фильма или
                сериала!
              </p>
            ) : (
              <p>Отзывов пока нет. Будьте первым, кто оставит отзыв!</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Reviews;
