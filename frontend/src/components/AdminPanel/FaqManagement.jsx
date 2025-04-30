import React, { useState, useEffect } from "react";
import { adminService } from "../../services/adminService";
import ConfirmModal from "./ConfirmModal";
import "./AdminPanel.css";

const FaqManagement = () => {
  const [faqs, setFaqs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Состояния для модального окна
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("create");
  const [selectedFaq, setSelectedFaq] = useState(null);
  const [formData, setFormData] = useState({
    question: "",
    answer: "",
    order: 0,
    is_active: true,
  });

  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    faqId: null,
    faqQuestion: "",
  });

  const fetchFaqs = async () => {
    try {
      setIsLoading(true);
      setError("");
      const data = await adminService.getAllFaqs();
      setFaqs(data);
    } catch (err) {
      console.error("Ошибка при получении списка FAQ:", err);
      setError("Не удалось загрузить список FAQ");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFaqs();
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const openCreateModal = () => {
    setModalMode("create");
    setSelectedFaq(null);
    setFormData({
      question: "",
      answer: "",
      order:
        faqs.length > 0 ? Math.max(...faqs.map((faq) => faq.order)) + 1 : 0,
      is_active: true,
    });
    setShowModal(true);
  };

  const openEditModal = (faq) => {
    setModalMode("edit");
    setSelectedFaq(faq);
    setFormData({
      question: faq.question,
      answer: faq.answer,
      order: faq.order,
      is_active: faq.is_active,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    try {
      if (modalMode === "create") {
        const result = await adminService.createFaq(formData);
        setFaqs([...faqs, result.faq]);
        setSuccessMessage("FAQ успешно создан");
      } else {
        const result = await adminService.updateFaq(selectedFaq.id, formData);
        setFaqs(
          faqs.map((faq) => (faq.id === selectedFaq.id ? result.faq : faq))
        );
        setSuccessMessage("FAQ успешно обновлен");
      }

      // Закрываем модальное окно через задержку
      setTimeout(() => {
        setShowModal(false);
        setSuccessMessage("");
      }, 1500);
    } catch (err) {
      console.error("Ошибка при сохранении FAQ:", err);
      setError(err.message || "Ошибка при сохранении FAQ");
    }
  };

  const handleDeleteClick = (faq) => {
    setConfirmModal({
      isOpen: true,
      faqId: faq.id,
      faqQuestion: faq.question,
    });
  };

  const handleDeleteConfirm = async () => {
    try {
      setError("");
      setSuccessMessage("");
      await adminService.deleteFaq(confirmModal.faqId);
      setSuccessMessage("FAQ успешно удален");
      setConfirmModal({ isOpen: false, faqId: null, faqQuestion: "" });
      fetchFaqs();
    } catch (err) {
      console.error("Ошибка при удалении FAQ:", err);
      setError(err.message || "Ошибка при удалении FAQ");
    }
  };

  return (
    <div className="admin-faqs">
      <div className="admin-section-header">
        <h3 className="admin-section-title">Управление FAQ</h3>
        <button
          className="admin-action-button primary"
          onClick={openCreateModal}
        >
          Добавить FAQ
        </button>
      </div>

      {error && <div className="admin-error">{error}</div>}
      {successMessage && <div className="admin-success">{successMessage}</div>}

      {isLoading ? (
        <div className="admin-loading">
          <div className="admin-loading-spinner"></div>
          <div className="admin-loading-text">Загрузка FAQ...</div>
        </div>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Вопрос</th>
              <th>Ответ</th>
              <th>Порядок</th>
              <th>Статус</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {faqs.map((faq) => (
              <tr key={faq.id}>
                <td>{faq.id}</td>
                <td>{faq.question}</td>
                <td>
                  {faq.answer.length > 50
                    ? `${faq.answer.substring(0, 50)}...`
                    : faq.answer}
                </td>
                <td>{faq.order}</td>
                <td>
                  <span
                    className={`faq-status ${
                      faq.is_active ? "active" : "inactive"
                    }`}
                  >
                    {faq.is_active ? "Активен" : "Неактивен"}
                  </span>
                </td>
                <td className="actions">
                  <button
                    className="admin-action-button primary"
                    onClick={() => openEditModal(faq)}
                  >
                    Редактировать
                  </button>
                  <button
                    className="admin-action-button danger"
                    onClick={() => handleDeleteClick(faq)}
                  >
                    Удалить
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {showModal && (
        <div className="admin-modal-overlay">
          <div className="admin-modal">
            <div className="admin-modal-header">
              <h4 className="admin-modal-title">
                {modalMode === "create"
                  ? "Добавление нового FAQ"
                  : "Редактирование FAQ"}
              </h4>
              <button
                className="admin-modal-close"
                onClick={() => setShowModal(false)}
              >
                &times;
              </button>
            </div>
            <div className="admin-modal-body">
              {error && <div className="admin-error">{error}</div>}
              {successMessage && (
                <div className="admin-success">{successMessage}</div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="admin-form-group">
                  <label htmlFor="question">Вопрос:</label>
                  <input
                    type="text"
                    id="question"
                    name="question"
                    value={formData.question}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="admin-form-group">
                  <label htmlFor="answer">Ответ:</label>
                  <textarea
                    id="answer"
                    name="answer"
                    value={formData.answer}
                    onChange={handleInputChange}
                    required
                  ></textarea>
                </div>

                <div className="admin-form-group">
                  <label htmlFor="order">Порядок отображения:</label>
                  <input
                    type="number"
                    id="order"
                    name="order"
                    value={formData.order}
                    onChange={handleInputChange}
                    min="0"
                  />
                </div>

                <div className="admin-form-group checkbox">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          is_active: e.target.checked,
                        })
                      }
                    />
                    <span className="checkbox-text">Активный</span>
                  </label>
                </div>

                <div className="admin-modal-footer">
                  <button
                    type="button"
                    className="admin-action-button"
                    onClick={() => setShowModal(false)}
                  >
                    Отмена
                  </button>
                  <button type="submit" className="admin-action-button primary">
                    {modalMode === "create" ? "Создать" : "Сохранить"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() =>
          setConfirmModal({ isOpen: false, faqId: null, faqQuestion: "" })
        }
        onConfirm={handleDeleteConfirm}
        title="Подтверждение удаления"
        message={`Вы уверены, что хотите удалить FAQ "${confirmModal.faqQuestion}"? Это действие нельзя отменить.`}
      />
    </div>
  );
};

export default FaqManagement;
