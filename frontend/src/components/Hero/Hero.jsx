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

  const heroMovie = moviesData.movies
    ? moviesData.movies.find((movie) => movie.category === "Hero")
    : null;

  // Проверка статуса избранного при загрузке компонента
  useEffect(() => {
    if (heroMovie) {
      // Проверяем, есть ли этот фильм в localStorage в избранном
      const favorites = JSON.parse(localStorage.getItem("favorites")) || [];
      const isFav = favorites.some((favMovie) => favMovie.id === heroMovie.id);
      setIsFavorite(isFav);
    }
  }, [heroMovie]);

  const navigateToMoviePage = () => {
    if (heroMovie) {
      // Переходим на страницу фильма, используя его ID
      navigate(`/movie/533535`);
    }
  };

  const toggleFavorite = () => {
    if (heroMovie) {
      const favorites = JSON.parse(localStorage.getItem("favorites")) || [];

      if (isFavorite) {
        // Удаляем из избранного
        const updatedFavorites = favorites.filter(
          (movie) => movie.id !== heroMovie.id
        );
        localStorage.setItem("favorites", JSON.stringify(updatedFavorites));
      } else {
        // Добавляем в избранное
        const updatedFavorites = [...favorites, heroMovie];
        localStorage.setItem("favorites", JSON.stringify(updatedFavorites));
      }

      setIsFavorite(!isFavorite);
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
    </section>
  );
};

export default Hero;
