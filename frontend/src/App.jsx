import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import Header from "./components/Header/Header";
import Hero from "./components/Hero/Hero";
import Kinoservice from "./components/Kinoservice/Kinoservice";
import TrendingMovies from "./components/TrendingMovies/TrendingMovies";
import PopularFilms from "./components/PopularFilms/PopularFilms";
import Top10 from "./components/Top10/Top10";
import MovieCategory from "./components/MovieCategory/MovieCategory";
import PopularSeries from "./components/PopularSeries/PopularSeries";
import FAQ from "./components/FAQ/FAQ";
import FeedbackForm from "./components/FeedbackForm/FeedbackForm";
import ScrollToTopButton from "./components/ScrollToTopButton/ScrollToTopButton";
import Footer from "./components/Footer/Footer";
import Profile from "./components/Profile/Profile";
import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/profile" element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        } />
        <Route path="/" element={<HomePage />} />
      </Routes>
    </Router>
  );
}

function HomePage() {
  return (
    <>
      <Header />
      <div id="home">
        <Hero />
      </div>
      <div id="top10">
        <Top10 />
      </div>
      <Kinoservice />
      <div id="TrendingMovies">
        <TrendingMovies />
      </div>
      <div id="PopularFilms">
        <PopularFilms />
      </div>
      <div id="MovieCategory">
        <MovieCategory />
      </div>
      <div id="PopularSeries">
        <PopularSeries />
      </div>
      <div id="FAQ">
        <FAQ />
      </div>
      <div id="Feedback">
        <FeedbackForm />
      </div>
      <Footer />
      <ScrollToTopButton />
    </>
  );
}

export default App;