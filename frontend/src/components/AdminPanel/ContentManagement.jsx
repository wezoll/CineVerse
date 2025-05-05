import React, { useState, useEffect } from "react";
import { adminService } from "../../services/adminService";
import ConfirmModal from "./ConfirmModal";

const ContentManagement = () => {
  const [hiddenContent, setHiddenContent] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [formData, setFormData] = useState({
    item_type: "movie",
    item_id: "",
    reason: "",
  });
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    contentId: null,
    contentInfo: "",
  });

  const fetchHiddenContent = async () => {
    try {
      setIsLoading(true);
      setError("");
      const data = await adminService.getHiddenContent();
      setHiddenContent(data);
    } catch (err) {
      console.error("Ошибка при получении скрытого контента:", err);
      setError("Не удалось загрузить список скрытого контента");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHiddenContent();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    try {
      await adminService.hideContent(formData);
      setSuccessMessage("Контент успешно скрыт");
      setFormData({
        item_type: "movie",
        item_id: "",
        reason: "",
      });
      fetchHiddenContent();
    } catch (err) {
      console.error("Ошибка при скрытии контента:", err);
      setError(err.message || "Ошибка при скрытии контента");
    }
  };

  const handleUnhideClick = (content) => {
    setConfirmModal({
      isOpen: true,
      contentId: content.id,
      contentInfo: `${
        content.item_type === "movie" ? "Фильм" : "Сериал"
      } (ID: ${content.item_id})`,
    });
  };

  const handleUnhideConfirm = async () => {
    try {
      setError("");
      setSuccessMessage("");
      await adminService.unhideContent(confirmModal.contentId);
      setSuccessMessage("Скрытие контента отменено");
      setConfirmModal({ isOpen: false, contentId: null, contentInfo: "" });
      fetchHiddenContent();
    } catch (err) {
      setError(err.message || "Ошибка при отмене скрытия контента");
    }
  };

  return (
    <div className="admin-content-management">
      <h3 className="admin-section-title">Управление контентом</h3>

      {error && <div className="admin-error">{error}</div>}
      {successMessage && <div className="admin-success">{successMessage}</div>}

      <div className="admin-form-container">
        <form onSubmit={handleSubmit} className="admin-form">
          <div className="admin-form-group">
            <label htmlFor="item_type">Тип контента:</label>
            <select
              id="item_type"
              name="item_type"
              value={formData.item_type}
              onChange={handleInputChange}
              required
            >
              <option value="movie">Фильм</option>
              <option value="tv">Сериал</option>
            </select>
          </div>

          <div className="admin-form-group">
            <label htmlFor="item_id">ID контента:</label>
            <input
              type="text"
              id="item_id"
              name="item_id"
              value={formData.item_id}
              onChange={handleInputChange}
              required
              placeholder="Введите ID фильма или сериала"
            />
          </div>

          <div className="admin-form-group">
            <label htmlFor="reason">Причина скрытия:</label>
            <textarea
              id="reason"
              name="reason"
              value={formData.reason}
              onChange={handleInputChange}
              required
              placeholder="Укажите причину скрытия контента"
            ></textarea>
          </div>

          <button type="submit" className="admin-action-button primary">
            Скрыть контент
          </button>
        </form>
      </div>

      {isLoading ? (
        <div className="admin-loading">
          <div className="admin-loading-spinner"></div>
          <div className="admin-loading-text">
            Загрузка скрытого контента...
          </div>
        </div>
      ) : (
        <div className="admin-hidden-content">
          <h4>Скрытый контент</h4>
          {hiddenContent.length === 0 ? (
            <p>Нет скрытого контента</p>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Тип</th>
                  <th>Причина</th>
                  <th>Дата скрытия</th>
                  <th>Действия</th>
                </tr>
              </thead>
              <tbody>
                {hiddenContent.map((content) => (
                  <tr key={content.id}>
                    <td>{content.item_id}</td>
                    <td>
                      {content.item_type === "movie" ? "Фильм" : "Сериал"}
                    </td>
                    <td>{content.reason}</td>
                    <td>
                      {new Date(content.created_at).toLocaleString("ru-RU")}
                    </td>
                    <td className="actions">
                      <button
                        className="admin-action-button success"
                        onClick={() => handleUnhideClick(content)}
                      >
                        Отменить скрытие
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() =>
          setConfirmModal({ isOpen: false, contentId: null, contentInfo: "" })
        }
        onConfirm={handleUnhideConfirm}
        title="Подтверждение отмены скрытия"
        message={`Вы уверены, что хотите отменить скрытие для ${confirmModal.contentInfo}? Это действие нельзя отменить.`}
      />
    </div>
  );
};

export default ContentManagement;
