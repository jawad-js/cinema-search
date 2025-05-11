import React, { useState, useEffect } from "react";
import { tmdbApi } from "../api/tmdbApi";
import { Movie } from "../types/movie";
import { useUser } from "../context/UserContext";
import MovieCard from "../components/MovieCard";
import "../styles/WatchlistPage.css";

const WatchlistPage: React.FC = () => {
  const { watchlist } = useUser();
  const [watchlistMovies, setWatchlistMovies] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWatchlistMovies = async () => {
      if (watchlist.length === 0) {
        setWatchlistMovies([]);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const moviePromises = watchlist.map((item) =>
          tmdbApi
            .getMovieDetails(item.movieId)
            .then((response) => response.data)
            .catch((err) => {
              console.error(`Error fetching movie ${item.movieId}:`, err);
              return null;
            })
        );

        const results = await Promise.all(moviePromises);
        const validMovies = results.filter(
          (movie) => movie !== null
        ) as Movie[];

        // Sort by date added to watchlist (newest first)
        const sortedMovies = validMovies.sort((a, b) => {
          const aItem = watchlist.find((item) => item.movieId === a.id);
          const bItem = watchlist.find((item) => item.movieId === b.id);
          if (!aItem || !bItem) return 0;
          return (
            new Date(bItem.addedAt).getTime() -
            new Date(aItem.addedAt).getTime()
          );
        });

        setWatchlistMovies(sortedMovies);
        setError(null);
      } catch (err) {
        setError("Failed to fetch watchlist movies. Please try again later.");
        console.error("Error fetching watchlist movies:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWatchlistMovies();
  }, [watchlist]);

  return (
    <div className="watchlist-page">
      <div className="watchlist-header">
        <h1>Your Watchlist</h1>
        <p>{watchlistMovies.length} movies saved</p>
      </div>

      <div className="watchlist-content">
        {isLoading ? (
          <div className="loading">Loading your watchlist...</div>
        ) : error ? (
          <div className="error">{error}</div>
        ) : watchlistMovies.length === 0 ? (
          <div className="empty-watchlist">
            <h2>Your watchlist is empty</h2>
            <p>Movies you add to your watchlist will appear here.</p>
          </div>
        ) : (
          <div className="watchlist-grid">
            {watchlistMovies.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WatchlistPage;
