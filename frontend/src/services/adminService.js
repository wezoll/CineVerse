import { API_URL } from "../config";

const ADMIN_API_URL = `${API_URL}/api/admin`;

export const adminService = {
  checkRole: async () => {
    try {
      const response = await fetch(`${ADMIN_API_URL}/check-role`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Ошибка при проверке роли");
      }

      return await response.json();
    } catch (error) {
      console.error("Ошибка в adminService.checkRole:", error);
      throw error;
    }
  },

  getUsers: async () => {
    try {
      const response = await fetch(`${ADMIN_API_URL}/users`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Ошибка при получении списка пользователей");
      }

      return await response.json();
    } catch (error) {
      console.error("Ошибка в adminService.getUsers:", error);
      throw error;
    }
  },

  updateUserRole: async (userId, newRole) => {
    try {
      const response = await fetch(`${ADMIN_API_URL}/users/${userId}/role`, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ role: newRole }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(
          error.error || "Ошибка при обновлении роли пользователя"
        );
      }

      return await response.json();
    } catch (error) {
      console.error("Ошибка в adminService.updateUserRole:", error);
      throw error;
    }
  },

  getAllFaqs: async () => {
    try {
      const response = await fetch(`${ADMIN_API_URL}/faqs`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Ошибка при получении FAQ");
      }

      return await response.json();
    } catch (error) {
      console.error("Ошибка в adminService.getAllFaqs:", error);
      throw error;
    }
  },

  createFaq: async (faqData) => {
    try {
      const response = await fetch(`${ADMIN_API_URL}/faqs`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(faqData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Ошибка при создании FAQ");
      }

      return await response.json();
    } catch (error) {
      console.error("Ошибка в adminService.createFaq:", error);
      throw error;
    }
  },

  updateFaq: async (faqId, faqData) => {
    try {
      const response = await fetch(`${ADMIN_API_URL}/faqs/${faqId}`, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(faqData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Ошибка при обновлении FAQ");
      }

      return await response.json();
    } catch (error) {
      console.error("Ошибка в adminService.updateFaq:", error);
      throw error;
    }
  },

  deleteFaq: async (faqId) => {
    try {
      const response = await fetch(`${ADMIN_API_URL}/faqs/${faqId}`, {
        method: "DELETE",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Ошибка при удалении FAQ");
      }

      return await response.json();
    } catch (error) {
      console.error("Ошибка в adminService.deleteFaq:", error);
      throw error;
    }
  },

  getAllReviews: async () => {
    try {
      const response = await fetch(`${ADMIN_API_URL}/reviews`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Ошибка при получении отзывов");
      }

      return await response.json();
    } catch (error) {
      console.error("Ошибка в adminService.getAllReviews:", error);
      throw error;
    }
  },

  deleteReview: async (reviewId) => {
    try {
      const response = await fetch(`${ADMIN_API_URL}/reviews/${reviewId}`, {
        method: "DELETE",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Ошибка при удалении отзыва");
      }

      return await response.json();
    } catch (error) {
      console.error("Ошибка в adminService.deleteReview:", error);
      throw error;
    }
  },

  getHiddenContent: async () => {
    try {
      const response = await fetch(`${ADMIN_API_URL}/hidden-content`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(
          error.error || "Ошибка при получении скрытого контента"
        );
      }

      return await response.json();
    } catch (error) {
      console.error("Ошибка в adminService.getHiddenContent:", error);
      throw error;
    }
  },

  hideContent: async (contentData) => {
    try {
      const response = await fetch(`${ADMIN_API_URL}/hidden-content`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(contentData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Ошибка при скрытии контента");
      }

      return await response.json();
    } catch (error) {
      console.error("Ошибка в adminService.hideContent:", error);
      throw error;
    }
  },

  unhideContent: async (contentId) => {
    try {
      const response = await fetch(
        `${ADMIN_API_URL}/hidden-content/${contentId}`,
        {
          method: "DELETE",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Ошибка при отмене скрытия контента");
      }

      return await response.json();
    } catch (error) {
      console.error("Ошибка в adminService.unhideContent:", error);
      throw error;
    }
  },

  getStatistics: async () => {
    try {
      const response = await fetch(`${ADMIN_API_URL}/statistics`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Ошибка при получении статистики");
      }

      return await response.json();
    } catch (error) {
      console.error("Ошибка в adminService.getStatistics:", error);
      throw error;
    }
  },

  deleteUser: async (userId) => {
    try {
      const response = await fetch(`${ADMIN_API_URL}/users/${userId}`, {
        method: "DELETE",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Ошибка при удалении пользователя");
      }

      return await response.json();
    } catch (error) {
      console.error("Ошибка в adminService.deleteUser:", error);
      throw error;
    }
  },
};
