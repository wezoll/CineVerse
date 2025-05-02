const API_URL = "/api/tv";

export const tvService = {
  getPopularSeries: async (page = 1) => {
    try {
      const response = await fetch(`${API_URL}/popular-series?page=${page}`);
      if (!response.ok) {
        throw new Error("Не удалось получить популярные сериалы");
      }
      return await response.json();
    } catch (error) {
      console.error("Ошибка при получении популярных сериалов:", error);
      throw error;
    }
  },

  getTVDetails: async (tvId) => {
    try {
      // Добавляем параметр для запроса расширенных данных
      const response = await fetch(`${API_URL}/${tvId}?extended=true`);
      if (!response.ok) {
        throw new Error("Не удалось получить детали сериала");
      }
      return await response.json();
    } catch (error) {
      console.error("Ошибка при получении деталей сериала:", error);
      throw error;
    }
  },

  // Метод для получения трейлеров
  getTVTrailers: async (tvId) => {
    try {
      const response = await fetch(`${API_URL}/${tvId}/videos`);
      if (!response.ok) {
        throw new Error("Не удалось получить трейлеры");
      }
      return await response.json();
    } catch (error) {
      console.error("Ошибка при получении трейлеров:", error);
      throw error;
    }
  },

  // Метод для получения изображений сериала
  getTVImages: async (tvId) => {
    try {
      const response = await fetch(`${API_URL}/${tvId}/images`);
      if (!response.ok) {
        throw new Error("Не удалось получить изображения");
      }
      return await response.json();
    } catch (error) {
      console.error("Ошибка при получении изображений:", error);
      throw error;
    }
  },

  // Метод для получения внешних ссылок сериала
  getTVExternalIds: async (tvId) => {
    try {
      const response = await fetch(`${API_URL}/${tvId}/external_ids`);
      if (!response.ok) {
        throw new Error("Не удалось получить внешние ссылки");
      }
      return await response.json();
    } catch (error) {
      console.error("Ошибка при получении внешних ссылок:", error);
      throw error;
    }
  },
};
