const API_URL = "/api/releases";

export const releasesService = {
  // Получение новинок (фильмы и сериалы марта-апреля 2025)
  getUpcomingMarchApril2025: async (page = 1, limit = 20) => {
    try {
      const response = await fetch(
        `${API_URL}/new-movies?page=${page}&limit=${limit}`
      );
      if (!response.ok) {
        throw new Error("Не удалось получить новинки");
      }
      return await response.json();
    } catch (error) {
      console.error("Ошибка при получении новинок:", error);
      throw error;
    }
  },

  // Получение детальной информации о фильме
  getMovieDetails: async (movieId) => {
    try {
      const response = await fetch(`${API_URL}/movie/${movieId}`);
      if (!response.ok) {
        throw new Error("Не удалось получить информацию о фильме");
      }
      return await response.json();
    } catch (error) {
      console.error("Ошибка при получении информации о фильме:", error);
      throw error;
    }
  },

  // Получение детальной информации о сериале
  getTVDetails: async (tvId) => {
    try {
      const response = await fetch(`${API_URL}/tv/${tvId}`);
      if (!response.ok) {
        throw new Error("Не удалось получить информацию о сериале");
      }
      return await response.json();
    } catch (error) {
      console.error("Ошибка при получении информации о сериале:", error);
      throw error;
    }
  },
};
