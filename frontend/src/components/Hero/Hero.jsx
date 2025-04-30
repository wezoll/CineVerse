import React, { useState, useEffect, useRef } from "react";
import "./Hero.css";
import { useFrame } from "@react-three/fiber";
import { Canvas, useLoader } from "@react-three/fiber";
import "./Knight3d.css";
import { OrbitControls } from "@react-three/drei";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { useNavigate } from "react-router-dom";
import deadpool from "../../assets/Hero/deadpool.png";
import moviesData from "../../../db.json";
import { favoriteService } from "../../services/favoriteService";
import Notification from "../Notification/Notification";

const Knight = () => {
  const gltf = useLoader(GLTFLoader, "/deadpool/scene.gltf");
  const knightRef = useRef();

  useFrame(() => {
    if (knightRef.current) {
      knightRef.current.rotation.y += 0.006;
    }
  });

  return (
    <primitive
      ref={knightRef}
      object={gltf.scene}
      scale={120}
      position={[0, -1, 0]}
    />
  );
};

const Hero = () => {
  const navigate = useNavigate();
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteId, setFavoriteId] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");
  const MOVIE_ID = 533535;
  const ITEM_TYPE = "movie";

  const heroMovie = moviesData.movies
    ? moviesData.movies.find((movie) => movie.category === "Hero")
    : null;

  // Проверка статуса избранного при загрузке компонента
  useEffect(() => {
    const checkIfFavorite = async () => {
      try {
        const data = await favoriteService.checkFavorite(MOVIE_ID, ITEM_TYPE);
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

    checkIfFavorite();
  }, []);

  const navigateToMoviePage = () => {
    navigate(`/movie/${MOVIE_ID}`);
  };

  const toggleFavorite = async () => {
    if (!isAuthenticated) {
      setNotificationMessage(
        "Пожалуйста, войдите в систему, чтобы добавить в избранное"
      );
      setShowNotification(true);
      return;
    }

    try {
      // Оптимистичное обновление UI
      const wasInFavorites = isFavorite;
      setIsFavorite(!isFavorite);

      if (wasInFavorites) {
        // Удаляем из избранного
        await favoriteService.removeFromFavorites(favoriteId);
        setFavoriteId(null);
        setNotificationMessage("Удалено из избранного");
        setShowNotification(true);
      } else {
        // Добавляем в избранное
        const response = await favoriteService.addToFavorites(
          MOVIE_ID,
          ITEM_TYPE
        );
        setFavoriteId(response.favorite.id);
        setNotificationMessage("Добавлено в избранное");
        setShowNotification(true);
      }
    } catch (error) {
      // В случае ошибки возвращаем предыдущее состояние
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
    <section className="hero-section-main">
      <div className="hero-block-main">
        <div className="movie-card-main">
          <img
            src={deadpool}
            alt="Deadpool & Wolverine"
            className="movie-image-main"
          />
          <div className="movie-info-main">
            <div className="movie-content-main">
              <h2 className="movie-title-main">
                Дэдпул <br /> и Росомаха
              </h2>
              <p className="release-date-main">Дата премьеры: 25 июля 2024г</p>
              <p className="movie-description-main">
                Уэйд Уилсон попадает в организацию «Управление временными
                изменениями», что вынуждает его вернуться к своему альтер-эго
                Дэдпулу и изменить историю с помощью Росомахи.
              </p>
              <div className="action-buttons-main">
                <button
                  className="details-button-main"
                  onClick={navigateToMoviePage}
                >
                  Подробнее
                </button>
                <button
                  className="favorite-button-main"
                  onClick={toggleFavorite}
                  title={
                    isAuthenticated
                      ? isFavorite
                        ? "Удалить из избранного"
                        : "Добавить в избранное"
                      : "Авторизуйтесь, чтобы добавить в избранное"
                  }
                >
                  <img
                    src={
                      isFavorite
                        ? "/images/btn-favorite-fill.png"
                        : "/images/btn-favorite.png"
                    }
                    alt="Favorite"
                    width="30"
                    height="30"
                  />
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="hero-model-main">
          <Canvas camera={{ position: [0, 10, 50], fov: 3.5 }}>
            <ambientLight intensity={2.5} />
            <directionalLight position={[5, 5, 5]} intensity={1} />
            <Knight />
            <OrbitControls
              enableZoom={false}
              enableRotate={true}
              minPolarAngle={Math.PI / 2}
              maxPolarAngle={Math.PI / 2}
            />
          </Canvas>
        </div>
      </div>
      {showNotification && (
        <Notification
          message={notificationMessage}
          type={isAuthenticated ? "success" : "info"}
          onClose={() => setShowNotification(false)}
        />
      )}
    </section>
  );
};

export default Hero;
