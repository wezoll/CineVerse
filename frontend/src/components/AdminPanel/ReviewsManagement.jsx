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
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [selectedItemType, setSelectedItemType] = useState(null);
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
    const itemId = review.movie_id || review.series_id;
    const itemType = review.movie_id ? "movie" : "tv";
    setSelectedItemId(itemId);
    setSelectedItemType(itemType);
    console.log("Открыт отзыв:", review);

    try {
      if (!itemDetails[`${itemType}-${itemId}`]) {
        let details;
        if (itemType === "movie") {
          details = await movieService.getMovieDetails(itemId);
        } else if (itemType === "tv") {
          details = await tvService.getTVDetails(itemId);
        }
        setItemDetails((prev) => ({
          ...prev,
          [`${itemType}-${itemId}`]: details,
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
          <div className="admin-modal" style={{ minWidth: 600, maxWidth: 700 }}>
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
                <div
                  className="item-details"
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "20px",
                  }}
                >
                  {itemDetails[`${selectedItemType}-${selectedItemId}`]
                    ?.poster_path && (
                    <div className="item-poster" style={{ minWidth: 140 }}>
                      <img
                        src={`https://image.tmdb.org/t/p/w200${
                          itemDetails[`${selectedItemType}-${selectedItemId}`]
                            .poster_path
                        }`}
                        alt="Постер"
                        style={{
                          borderRadius: 8,
                          maxWidth: 140,
                          height: "auto",
                          boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                        }}
                      />
                    </div>
                  )}
                  <div style={{ flex: "1 1 0" }}>
                    <div style={{ marginBottom: 8 }}>
                      <strong>Информация о пользователе</strong>
                      <br />
                      Имя:{" "}
                      {selectedReview.user_name ||
                        `${selectedReview.user_first_name || ""} ${
                          selectedReview.user_last_name || ""
                        }`.trim()}
                      <br />
                      Email: {selectedReview.user_email || "Не указан"}
                    </div>
                    <div style={{ marginBottom: 8 }}>
                      <strong>Информация об отзыве</strong>
                      <br />
                      Рейтинг: {selectedReview.rating}/10
                      <br />
                      Отзыв:
                      <br />
                      <span style={{ whiteSpace: "pre-line" }}>
                        {selectedReview.content || "Отзыв отсутствует"}
                      </span>
                      <br />
                      Дата создания: {formatDate(selectedReview.created_at)}
                    </div>
                    <div>
                      <strong>Информация о контенте</strong>
                      <br />
                      Название:{" "}
                      {selectedItemType === "movie"
                        ? itemDetails[`${selectedItemType}-${selectedItemId}`]
                            .title
                        : itemDetails[`${selectedItemType}-${selectedItemId}`]
                            .name}
                      <br />
                      ID: {selectedItemId}
                      <br />
                      Тип: {selectedItemType === "movie" ? "Фильм" : "Сериал"}
                    </div>
                  </div>
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
