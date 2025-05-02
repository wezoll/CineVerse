const API_URL = "/api/movies";

export const movieService = {
  getPopularMovies: async (page = 1) => {
    try {
      const response = await fetch(`${API_URL}/popular-movies?page=${page}`);
      if (!response.ok) {
        throw new Error("Не удалось получить популярные фильмы");
      }
      return await response.json();
    } catch (error) {
      console.error("Ошибка при получении популярных фильмов:", error);
      throw error;
    }
  },

  getMovieDetails: async (movieId) => {
    try {
      const response = await fetch(`${API_URL}/${movieId}?extended=true`);
      if (!response.ok) {
        throw new Error("Не удалось получить детали фильма");
      }
      return await response.json();
    } catch (error) {
      console.error("Ошибка при получении деталей фильма:", error);
      throw error;
    }
  },

  getMovieTrailers: async (movieId) => {
    try {
      const response = await fetch(`${API_URL}/${movieId}/videos`);
      if (!response.ok) {
        throw new Error("Не удалось получить трейлеры");
      }
      return await response.json();
    } catch (error) {
      console.error("Ошибка при получении трейлеров:", error);
      throw error;
    }
  },

  getMovieImages: async (movieId) => {
    try {
      const response = await fetch(`${API_URL}/${movieId}/images`);
      if (!response.ok) {
        throw new Error("Не удалось получить изображения");
      }
      return await response.json();
    } catch (error) {
      console.error("Ошибка при получении изображений:", error);
      throw error;
    }
  },

  discoverMovies: async (genreId, page = 1) => {
    try {
      const response = await fetch(
        `${API_URL}/discover?genre=${genreId}&page=${page}`
      );
      if (!response.ok) {
        throw new Error("Не удалось получить фильмы по жанру");
      }
      return await response.json();
    } catch (error) {
      console.error("Ошибка при получении фильмов по жанру:", error);
      throw error;
    }
  },

  getMovieExternalIds: async (movieId) => {
    try {
      const response = await fetch(`${API_URL}/${movieId}/external_ids`);
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
