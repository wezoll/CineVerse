const API_URL = "http://localhost:5000/api/favorites";
const PROFILE_API_URL = "http://localhost:5000/profile";

export const favoriteService = {
  /**
   * Получить список избранного
   * @returns {Promise<Array>} - Список избранных элементов
   */
  async getFavorites() {
    try {
      const response = await fetch(`${PROFILE_API_URL}/favorites`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Ошибка: ${response.status}`);
      }

      const data = await response.json();
      return data.favorites;
    } catch (error) {
      console.error("Ошибка при получении избранного:", error);
      throw error;
    }
  },

  /**
   * Добавить элемент в избранное
   * @param {number} itemId - ID элемента
   * @param {string} itemType - Тип элемента
   * @returns {Promise<Object>} - Результат операции
   */
  async addToFavorites(itemId, itemType) {
    try {
      const response = await fetch(API_URL, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          item_id: itemId,
          item_type: itemType,
        }),
      });

      if (!response.ok) {
        throw new Error(`Ошибка: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Ошибка при добавлении в избранное:", error);
      throw error;
    }
  },

  /**
   * @param {number} favoriteId
   * @returns {Promise<Object>}
   */
  async removeFromFavorites(favoriteId) {
    try {
      const response = await fetch(`${API_URL}/${favoriteId}`, {
        method: "DELETE",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Ошибка: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Ошибка при удалении из избранного:", error);
      throw error;
    }
  },

  /**
   * @param {number} itemId
   * @param {string} itemType
   * @returns {Promise<{is_favorite: boolean, favorite_id: number|null}>}
   */
  async checkFavorite(itemId, itemType) {
    try {
      const response = await fetch(`${API_URL}/check`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          item_id: itemId,
          item_type: itemType,
        }),
      });

      if (!response.ok) {
        throw new Error(`Ошибка: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Ошибка при проверке избранного:", error);
      throw error;
    }
  },
};
