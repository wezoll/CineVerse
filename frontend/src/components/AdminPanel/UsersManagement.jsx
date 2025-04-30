import React, { useState, useEffect } from "react";
import { adminService } from "../../services/adminService";
import ConfirmModal from "./ConfirmModal";
import "./AdminPanel.css";

const UsersManagement = ({ userRole }) => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    userId: null,
    userName: "",
  });

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      setError("");
      const data = await adminService.getUsers();
      setUsers(data);
    } catch (err) {
      setError("Не удалось загрузить список пользователей");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (userId, newRole) => {
    try {
      setError("");
      setSuccess("");
      await adminService.updateUserRole(userId, newRole);
      setSuccess("Роль пользователя успешно обновлена");
      fetchUsers();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteClick = (user) => {
    setConfirmModal({
      isOpen: true,
      userId: user.id,
      userName: `${user.first_name} ${user.last_name}`,
    });
  };

  const handleDeleteConfirm = async () => {
    try {
      setError("");
      setSuccess("");
      await adminService.deleteUser(confirmModal.userId);
      setSuccess("Пользователь успешно удален");
      setConfirmModal({ isOpen: false, userId: null, userName: "" });
      fetchUsers();
    } catch (err) {
      setError(err.message);
    }
  };

  if (isLoading) {
    return (
      <div className="admin-loading">
        <div className="admin-loading-spinner"></div>
        <div className="admin-loading-text">Загрузка пользователей...</div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="admin-section-title">Управление пользователями</h2>

      {error && <div className="admin-error">{error}</div>}
      {success && <div className="admin-success">{success}</div>}

      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Имя</th>
              <th>Фамилия</th>
              <th>Email</th>
              <th>Роль</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{user.first_name}</td>
                <td>{user.last_name}</td>
                <td>{user.email}</td>
                <td>
                  {userRole === "super_admin" && (
                    <select
                      value={user.role}
                      onChange={(e) =>
                        handleRoleChange(user.id, e.target.value)
                      }
                      className="admin-select"
                    >
                      <option value="user">Пользователь</option>
                      <option value="admin">Администратор</option>
                      <option value="super_admin">Супер-администратор</option>
                    </select>
                  )}
                  {userRole !== "super_admin" && user.role}
                </td>
                <td className="actions">
                  <button
                    className="admin-action-button danger"
                    onClick={() => handleDeleteClick(user)}
                  >
                    Удалить
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() =>
          setConfirmModal({ isOpen: false, userId: null, userName: "" })
        }
        onConfirm={handleDeleteConfirm}
        title="Подтверждение удаления"
        message={`Вы уверены, что хотите удалить пользователя ${confirmModal.userName}? Это действие нельзя отменить.`}
      />
    </div>
  );
};

export default UsersManagement;
