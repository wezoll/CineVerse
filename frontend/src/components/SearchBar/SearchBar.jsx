import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./SearchBar.css";
import searchIcon from "../../assets/Header/search-icon.svg";

const SearchBar = () => {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/combined-search?query=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <form className="search-bar" onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Поиск фильмов и сериалов..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        aria-label="Поиск фильмов и сериалов"
      />
      <button type="submit" aria-label="Искать">
        <img src={searchIcon} alt="Search" />
      </button>
    </form>
  );
};

export default SearchBar;
