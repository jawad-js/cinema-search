import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { tmdbApi } from "../api/tmdbApi";
import { Movie } from "../types/movie";
import MovieCard from "../components/MovieCard";
import "../styles/HomePage.css";

const HomePage: React.FC = () => {
  const [popularMovies, setPopularMovies] = useState<Movie[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Movie[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch popular movies on component mount
  useEffect(() => {
    const fetchPopularMovies = async () => {
      try {
        setIsLoading(true);
        const response = await tmdbApi.getPopularMovies();
        setPopularMovies(response.data.results);
        setError(null);
      } catch (err) {
        setError("Failed to fetch popular movies. Please try again later.");
        console.error("Error fetching popular movies:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPopularMovies();
  }, []);

  // Handle search
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!searchQuery.trim()) {
      setIsSearching(false);
      return;
    }

    try {
      setIsLoading(true);
      setIsSearching(true);
      const response = await tmdbApi.searchMovies(searchQuery);
      setSearchResults(response.data.results);
      setError(null);
    } catch (err) {
      setError("Failed to search movies. Please try again later.");
      console.error("Error searching movies:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Display movies based on search state
  const displayedMovies = isSearching ? searchResults : popularMovies;

  return (
    <div className="home-page">
      <div className="hero-section">
        <h1>CinemaSearch</h1>
        <p>Discover your next favorite movie</p>

        <form className="search-form" onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Search for movies..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          <button type="submit" className="search-button">
            Search
          </button>
        </form>
      </div>

      <div className="content-section">
        <h2>{isSearching ? "Search Results" : "Popular Movies"}</h2>

        {isLoading ? (
          <div className="loading">Loading movies...</div>
        ) : error ? (
          <div className="error">{error}</div>
        ) : displayedMovies.length === 0 ? (
          <div className="no-results">
            {isSearching
              ? "No movies found. Try a different search."
              : "No popular movies available."}
          </div>
        ) : (
          <div className="movies-grid">
            {displayedMovies.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;
