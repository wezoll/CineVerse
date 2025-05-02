import { useState, useEffect } from "react";
import { favoriteService } from "../../services/favoriteService";
import Notification from "../Notification/Notification";
import "./FavoriteButton.css";

const FavoriteButton = ({ itemId, itemType, onToggle, className = "" }) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteId, setFavoriteId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");

  useEffect(() => {
    const checkIfFavorite = async () => {
      try {
        const data = await favoriteService.checkFavorite(itemId, itemType);
        setIsFavorite(data.is_favorite);
        setFavoriteId(data.favorite_id);
      } catch (error) {
        if (
          error.message &&
          (error.message.includes("401") || error.message.includes("403"))
        ) {
          setIsAuthenticated(false);
        }
        console.error("Ошибка при проверке избранного:", error);
      }
    };

    if (itemId && itemType) {
      checkIfFavorite();
    }
  }, [itemId, itemType]);

  const handleToggleFavorite = async () => {
    if (!isAuthenticated) {
      setNotificationMessage(
        "Пожалуйста, войдите в систему, чтобы добавить в избранное"
      );
      setShowNotification(true);
      return;
    }

    try {
      const wasInFavorites = isFavorite;
      setIsFavorite(!isFavorite);

      if (wasInFavorites) {
        await favoriteService.removeFromFavorites(favoriteId);
        setFavoriteId(null);
        setNotificationMessage("Удалено из избранного");
        setShowNotification(true);
      } else {
        const response = await favoriteService.addToFavorites(itemId, itemType);
        setFavoriteId(response.favorite.id);
        setNotificationMessage("Добавлено в избранное");
        setShowNotification(true);
      }

      if (onToggle) {
        onToggle(!wasInFavorites);
      }
    } catch (error) {
      setIsFavorite(isFavorite);

      if (
        error.message &&
        (error.message.includes("401") || error.message.includes("403"))
      ) {
        setIsAuthenticated(false);
        setNotificationMessage(
          "Пожалуйста, войдите в систему, чтобы добавить в избранное"
        );
        setShowNotification(true);
      }
      console.error("Ошибка при изменении избранного:", error);
    }
  };

  return (
    <>
      <button
        className={`favorite-button ${isFavorite ? "active" : ""} ${className}`}
        onClick={handleToggleFavorite}
        disabled={isLoading}
        title={
          isAuthenticated
            ? isFavorite
              ? "Удалить из избранного"
              : "Добавить в избранное"
            : "Авторизуйтесь, чтобы добавить в избранное"
        }
      >
        <svg
          className="favorite-icon"
          viewBox="0 0 24 24"
          fill={isFavorite ? "white" : "none"}
          stroke="white"
          strokeWidth="2"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </svg>
        <span className="favorite-text">
          {isFavorite ? "В избранном" : "В избранное"}
        </span>
      </button>
      {showNotification && (
        <Notification
          message={notificationMessage}
          type={isAuthenticated ? "success" : "info"}
          onClose={() => setShowNotification(false)}
        />
      )}
    </>
  );
};

export default FavoriteButton;
