const API_URL = "http://localhost:5000";

export const reviewService = {
  // Получение отзывов для фильма
  getMovieReviews: async (movieId) => {
    try {
      const response = await fetch(`${API_URL}/api/reviews/movie/${movieId}`, {
        credentials: "include",
      });
      return await response.json();
    } catch (error) {
      console.error("Ошибка при получении отзывов:", error);
      throw error;
    }
  },

  // Создание отзыва
  createReview: async (movieId, reviewData) => {
    try {
      const response = await fetch(`${API_URL}/api/reviews/movie/${movieId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(reviewData),
      });
      return await response.json();
    } catch (error) {
      console.error("Ошибка при создании отзыва:", error);
      throw error;
    }
  },

  // Обновление отзыва
  updateReview: async (reviewId, reviewData) => {
    try {
      const response = await fetch(`${API_URL}/api/reviews/${reviewId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(reviewData),
      });
      return await response.json();
    } catch (error) {
      console.error("Ошибка при обновлении отзыва:", error);
      throw error;
    }
  },

  // Удаление отзыва
  deleteReview: async (reviewId) => {
    try {
      const response = await fetch(`${API_URL}/api/reviews/${reviewId}`, {
        method: "DELETE",
        credentials: "include",
      });
      return await response.json();
    } catch (error) {
      console.error("Ошибка при удалении отзыва:", error);
      throw error;
    }
  },

  // Получение отзывов пользователя
  getUserReviews: async () => {
    try {
      const response = await fetch(`${API_URL}/api/reviews/user`, {
        credentials: "include",
      });
      return await response.json();
    } catch (error) {
      console.error("Ошибка при получении отзывов пользователя:", error);
      throw error;
    }
  },

  getTVReviews: async (seriesId) => {
    try {
      const response = await fetch(`${API_URL}/api/reviews/tv/${seriesId}`, {
        credentials: "include",
      });
      return await response.json();
    } catch (error) {
      console.error("Ошибка при получении отзывов к сериалу:", error);
      throw error;
    }
  },

  // Создание отзыва к сериалу
  createTVReview: async (seriesId, reviewData) => {
    try {
      const response = await fetch(`${API_URL}/api/reviews/tv/${seriesId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(reviewData),
      });
      return await response.json();
    } catch (error) {
      console.error("Ошибка при создании отзыва к сериалу:", error);
      throw error;
    }
  },
};
