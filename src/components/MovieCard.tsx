import React from "react";
import { Link } from "react-router-dom";
import { Movie } from "../types/movie";
import { tmdbApi } from "../api/tmdbApi";
import { useUser } from "../context/UserContext";
import "../styles/MovieCard.css";

interface MovieCardProps {
  movie: Movie;
  showRating?: boolean;
}

const MovieCard: React.FC<MovieCardProps> = ({ movie, showRating = true }) => {
  const {
    isInWatchlist,
    addToWatchlist,
    removeFromWatchlist,
    getUserRating,
    rateMovie,
  } = useUser();

  const inWatchlist = isInWatchlist(movie.id);
  const userRating = getUserRating(movie.id);

  const handleWatchlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (inWatchlist) {
      removeFromWatchlist(movie.id);
    } else {
      addToWatchlist(movie.id);
    }
  };

  const handleRating = (e: React.MouseEvent, rating: number) => {
    e.preventDefault();
    e.stopPropagation();
    rateMovie(movie.id, rating);
  };

  return (
    <div className="movie-card">
      <Link to={`/movie/${movie.id}`} className="movie-card-link">
        <div className="movie-poster">
          {movie.poster_path ? (
            <img
              src={tmdbApi.getImageUrl(movie.poster_path, "w500")}
              alt={`${movie.title} poster`}
              className="poster-image"
            />
          ) : (
            <div className="no-poster">No Image Available</div>
          )}

          <div className="movie-info-overlay">
            <h3 className="movie-title">{movie.title}</h3>
            <p className="movie-release-date">
              {movie.release_date
                ? new Date(movie.release_date).getFullYear()
                : "Unknown"}
            </p>
            <div className="movie-rating">
              <span className="tmdb-rating">
                ★ {movie.vote_average.toFixed(1)}
              </span>
            </div>
          </div>
        </div>
      </Link>

      <div className="movie-actions">
        <button
          className={`watchlist-btn ${inWatchlist ? "in-watchlist" : ""}`}
          onClick={handleWatchlistToggle}
          aria-label={
            inWatchlist ? "Remove from watchlist" : "Add to watchlist"
          }
        >
          {inWatchlist ? "✓ In Watchlist" : "+ Watchlist"}
        </button>

        {showRating && (
          <div className="rating-control">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                className={`star-btn ${
                  userRating && userRating >= star ? "active" : ""
                }`}
                onClick={(e) => handleRating(e, star)}
                aria-label={`Rate ${star} stars`}
              >
                ★
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MovieCard;
