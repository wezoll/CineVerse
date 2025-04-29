import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import Header from "./components/Header/Header";
import Hero from "./components/Hero/Hero";
import Kinoservice from "./components/Kinoservice/Kinoservice";
import NewReleases from "./components/NewReleases/NewReleases";
import PopularFilms from "./components/PopularFilms/PopularFilms";
import Top10 from "./components/Top10/Top10";
import MovieCategory from "./components/MovieCategory/MovieCategory";
import PopularSeries from "./components/PopularSeries/PopularSeries";
import FeedbackForm from "./components/FeedbackForm/FeedbackForm";
import ScrollToTopButton from "./components/ScrollToTopButton/ScrollToTopButton";
import Footer from "./components/Footer/Footer";
import Profile from "./pages/Profile/Profile";
import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute";
import FAQPage from "./pages/FAQ/FAQ";
import MovieDetails from "./components/MovieDetails/MovieDetails";
import PopularMovies from "./components/PopularMovies/PopularMovies";
import SearchResults from "./components/SearchResults/SearchResults";
import PopularTV from "./components/PopularTV/PopularTV";
import SeriesDetails from "./components/SeriesDetails/SeriesDetails";
import { AuthProvider } from "./contexts/AuthContext";

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route path="/faq" element={<FAQPage />} />
          <Route path="/" element={<HomePage />} />
          <Route path="/movie/:id" element={<MovieDetails />} />
          <Route path="/popular-movies" element={<PopularMovies />} />
          <Route path="/combined-search" element={<SearchResults />} />
          <Route path="/popular-series" element={<PopularTV />} />
          <Route path="/series/:id" element={<SeriesDetails />} />
        </Routes>
      </AuthProvider>
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
      <div id="NewReleases">
        <NewReleases />
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
      <div id="Feedback">
        <FeedbackForm />
      </div>
      <Footer />
      <ScrollToTopButton />
    </>
  );
}

export default App;
