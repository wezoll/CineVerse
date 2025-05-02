import React, { useState, useEffect } from "react";
import { adminService } from "../../services/adminService";
import { movieService } from "../../services/movieService";
import { tvService } from "../../services/TVService";
import ConfirmModal from "./ConfirmModal";
import "./AdminPanel.css";

const ReviewsManagement = () => {
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [itemDetails, setItemDetails] = useState({});
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    reviewId: null,
    reviewText: "",
  });

  const fetchReviews = async () => {
    try {
      setIsLoading(true);
      setError("");
      const data = await adminService.getAllReviews();
      setReviews(data);
    } catch (err) {
      console.error("Ошибка при получении списка отзывов:", err);
      setError("Не удалось загрузить список отзывов");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleDelete = async (reviewId) => {
    if (!window.confirm("Вы уверены, что хотите удалить этот отзыв?")) {
      return;
    }

    setError("");
    setSuccessMessage("");

    try {
      await adminService.deleteReview(reviewId);
      setReviews(reviews.filter((review) => review.id !== reviewId));
      setSuccessMessage("Отзыв успешно удален");

      setTimeout(() => {
        setSuccessMessage("");
      }, 2000);
    } catch (err) {
      console.error("Ошибка при удалении отзыва:", err);
      setError(err.message || "Ошибка при удалении отзыва");
    }
  };

  const handleViewDetails = async (review) => {
    setSelectedReview(review);

    try {
      if (!itemDetails[`${review.item_type}-${review.item_id}`]) {
        let details;
        if (review.item_type === "movie") {
          details = await movieService.getMovieDetails(review.item_id);
        } else if (review.item_type === "tv") {
          details = await tvService.getTVDetails(review.item_id);
        }

        setItemDetails((prev) => ({
          ...prev,
          [`${review.item_type}-${review.item_id}`]: details,
        }));
      }

      setShowDetailsModal(true);
    } catch (err) {
      console.error("Ошибка при получении информации о контенте:", err);
    }
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return "Дата не указана";
      }
      return date.toLocaleString("ru-RU", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (err) {
      console.error("Ошибка при форматировании даты:", err);
      return "Дата не указана";
    }
  };

  const handleDeleteClick = (review) => {
    setConfirmModal({
      isOpen: true,
      reviewId: review.id,
      reviewText:
        review.content.substring(0, 50) +
        (review.content.length > 50 ? "..." : ""),
    });
  };

  const handleDeleteConfirm = async () => {
    try {
      setError("");
      setSuccessMessage("");
      await adminService.deleteReview(confirmModal.reviewId);
      setSuccessMessage("Отзыв успешно удален");
      setConfirmModal({ isOpen: false, reviewId: null, reviewText: "" });
      fetchReviews();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="admin-reviews">
      <h3 className="admin-section-title">Управление отзывами</h3>

      {error && <div className="admin-error">{error}</div>}
      {successMessage && <div className="admin-success">{successMessage}</div>}

      {isLoading ? (
        <div className="admin-loading">
          <div className="admin-loading-spinner"></div>
          <div className="admin-loading-text">Загрузка отзывов...</div>
        </div>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Пользователь</th>
              <th>Email</th>
              <th>Тип</th>
              <th>Рейтинг</th>
              <th>Содержание</th>
              <th>Дата создания</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {reviews.map((review) => (
              <tr key={review.id}>
                <td>{review.id}</td>
                <td>
                  {review.user_name ||
                    `${review.user_first_name} ${review.user_last_name}`}
                </td>
                <td>{review.user_email}</td>
                <td>{review.item_type === "movie" ? "Фильм" : "Сериал"}</td>
                <td>{review.rating}/10</td>
                <td>
                  {review.content.length > 50
                    ? `${review.content.substring(0, 50)}...`
                    : review.content}
                </td>
                <td>{formatDate(review.created_at)}</td>
                <td className="actions">
                  <button
                    className="admin-action-button primary"
                    onClick={() => handleViewDetails(review)}
                  >
                    Детали
                  </button>
                  <button
                    className="admin-action-button danger"
                    onClick={() => handleDeleteClick(review)}
                  >
                    Удалить
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {showDetailsModal && selectedReview && (
        <div className="admin-modal-overlay">
          <div className="admin-modal">
            <div className="admin-modal-header">
              <h4 className="admin-modal-title">Детали отзыва</h4>
              <button
                className="admin-modal-close"
                onClick={() => setShowDetailsModal(false)}
              >
                &times;
              </button>
            </div>
            <div className="admin-modal-body">
              <div className="review-detail-content">
                <div className="review-user-info">
                  <h4>Информация о пользователе</h4>
                  <p>
                    <strong>Имя:</strong>{" "}
                    {selectedReview.user_name || "Пользователь"}
                  </p>
                  <p>
                    <strong>Email:</strong>{" "}
                    {selectedReview.user_email || "Не указан"}
                  </p>
                </div>

                <div className="review-content-info">
                  <h4>Информация об отзыве</h4>
                  <p>
                    <strong>Рейтинг:</strong> {selectedReview.rating}/10
                  </p>
                  <p>
                    <strong>Отзыв:</strong>
                  </p>
                  <div className="review-full-content">
                    {selectedReview.content || "Отзыв отсутствует"}
                  </div>
                  <p>
                    <strong>Дата создания:</strong>{" "}
                    {formatDate(selectedReview.created_at)}
                  </p>
                </div>

                <div className="review-item-info">
                  <h4>Информация о контенте</h4>
                  {itemDetails[
                    `${selectedReview.item_type}-${selectedReview.item_id}`
                  ] ? (
                    <div className="item-details">
                      <p>
                        <strong>Название:</strong>{" "}
                        {selectedReview.item_type === "movie"
                          ? itemDetails[
                              `${selectedReview.item_type}-${selectedReview.item_id}`
                            ].title
                          : itemDetails[
                              `${selectedReview.item_type}-${selectedReview.item_id}`
                            ].name}
                      </p>
                      {itemDetails[
                        `${selectedReview.item_type}-${selectedReview.item_id}`
                      ].poster_path && (
                        <div className="item-poster">
                          <img
                            src={`https://image.tmdb.org/t/p/w200${
                              itemDetails[
                                `${selectedReview.item_type}-${selectedReview.item_id}`
                              ].poster_path
                            }`}
                            alt="Постер"
                          />
                        </div>
                      )}
                    </div>
                  ) : (
                    <p>Загрузка информации о контенте...</p>
                  )}
                </div>
              </div>
            </div>
            <div className="admin-modal-footer">
              <button
                className="admin-action-button"
                onClick={() => setShowDetailsModal(false)}
              >
                Закрыть
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() =>
          setConfirmModal({ isOpen: false, reviewId: null, reviewText: "" })
        }
        onConfirm={handleDeleteConfirm}
        title="Подтверждение удаления"
        message={`Вы уверены, что хотите удалить отзыв "${confirmModal.reviewText}"? Это действие нельзя отменить.`}
      />
    </div>
  );
};

export default ReviewsManagement;
