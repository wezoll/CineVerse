const API_URL = "http://localhost:5000/api/favorites";
const PROFILE_API_URL = "http://localhost:5000/profile";

/**
 * Сервис для работы с избранными фильмами/сериалами
 */
export const favoriteService = {
  /**
   * Получить список избранного
   * @returns {Promise<Array>} - Список избранных элементов
   */
  async getFavorites() {
    try {
      // Используем URL из профиля, так как там уже есть проверка авторизации
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
   * @param {string} itemType - Тип элемента ('movie', 'tv', 'person')
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
   * Удалить элемент из избранного
   * @param {number} favoriteId - ID записи в избранном
   * @returns {Promise<Object>} - Результат операции
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
   * Проверить, находится ли элемент в избранном
   * @param {number} itemId - ID элемента
   * @param {string} itemType - Тип элемента ('movie', 'tv', 'person')
   * @returns {Promise<{is_favorite: boolean, favorite_id: number|null}>} - Результат проверки
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
