const API_URL = "/api/trending";

export const trendingService = {
  async getTop10(timeWindow = "week") {
    try {
      const response = await fetch(
        `/api/trending/top10?time_window=${timeWindow}`
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error("Ошибка при получении трендовых элементов:", error);
      throw error;
    }
  },
  getTop10: async (mediaType = "all", timeWindow = "week") => {
    try {
      const response = await fetch(
        `${API_URL}/top10?media_type=${mediaType}&time_window=${timeWindow}`
      );
      if (!response.ok) {
        throw new Error("Не удалось получить трендовые элементы");
      }
      return await response.json();
    } catch (error) {
      console.error("Ошибка при получении трендовых элементов:", error);
      throw error;
    }
  },

  getTrendingMovies: async (timeWindow = "week") => {
    try {
      const response = await fetch(
        `${API_URL}/trending-movies?time_window=${timeWindow}`
      );
      if (!response.ok) {
        throw new Error("Не удалось получить трендовые фильмы");
      }
      return await response.json();
    } catch (error) {
      console.error("Ошибка при получении трендовых фильмов:", error);
      throw error;
    }
  },

  getTrendingTV: async (timeWindow = "week") => {
    try {
      const response = await fetch(
        `${API_URL}/trending-tv?time_window=${timeWindow}`
      );
      if (!response.ok) {
        throw new Error("Не удалось получить трендовые сериалы");
      }
      return await response.json();
    } catch (error) {
      console.error("Ошибка при получении трендовых сериалов:", error);
      throw error;
    }
  },
};
