import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { tmdbApi } from "../api/tmdbApi";
import { MovieDetails, Movie } from "../types/movie";
import { useUser } from "../context/UserContext";
import MovieCard from "../components/MovieCard";
import "../styles/MovieDetailsPage.css";

const MovieDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [movie, setMovie] = useState<MovieDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const {
    isInWatchlist,
    addToWatchlist,
    removeFromWatchlist,
    getUserRating,
    rateMovie,
  } = useUser();

  useEffect(() => {
    const fetchMovieDetails = async () => {
      if (!id) return;

      try {
        setIsLoading(true);
        const response = await tmdbApi.getMovieDetails(parseInt(id));
        setMovie(response.data);
        setError(null);
      } catch (err) {
        setError("Failed to fetch movie details. Please try again later.");
        console.error("Error fetching movie details:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMovieDetails();
    // Reset state when id changes
    return () => {
      setMovie(null);
      setIsLoading(true);
      setError(null);
    };
  }, [id]);

  if (isLoading) {
    return <div className="loading-container">Loading movie details...</div>;
  }

  if (error || !movie) {
    return (
      <div className="error-container">
        <p>{error || "Movie not found"}</p>
        <Link to="/" className="back-button">
          Back to Home
        </Link>
      </div>
    );
  }

  const inWatchlist = isInWatchlist(movie.id);
  const userRating = getUserRating(movie.id);

  const handleWatchlistToggle = () => {
    if (inWatchlist) {
      removeFromWatchlist(movie.id);
    } else {
      addToWatchlist(movie.id);
    }
  };

  const handleRating = (rating: number) => {
    rateMovie(movie.id, rating);
  };

  // Format runtime to hours and minutes
  const formatRuntime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  return (
    <div className="movie-details-page">
      {/* Backdrop */}
      <div
        className="movie-backdrop"
        style={{
          backgroundImage: movie.backdrop_path
            ? `url(${tmdbApi.getImageUrl(movie.backdrop_path, "original")})`
            : "none",
        }}
      >
        <div className="backdrop-overlay"></div>
      </div>

      <div className="movie-details-content">
        {/* Movie Header */}
        <div className="movie-header">
          <div className="movie-poster-container">
            {movie.poster_path ? (
              <img
                src={tmdbApi.getImageUrl(movie.poster_path, "w500")}
                alt={`${movie.title} poster`}
                className="movie-poster-large"
              />
            ) : (
              <div className="no-poster-large">No Image Available</div>
            )}
          </div>

          <div className="movie-info">
            <h1 className="movie-title">
              {movie.title}
              <span className="movie-year">
                {movie.release_date
                  ? `(${new Date(movie.release_date).getFullYear()})`
                  : ""}
              </span>
            </h1>

            {movie.tagline && (
              <p className="movie-tagline">"{movie.tagline}"</p>
            )}

            <div className="movie-meta">
              <span className="movie-release">{movie.release_date}</span>
              {movie.genres.map((genre, index) => (
                <span key={genre.id} className="movie-genre">
                  {index > 0 && ", "}
                  {genre.name}
                </span>
              ))}
              {movie.runtime > 0 && (
                <span className="movie-runtime">
                  {formatRuntime(movie.runtime)}
                </span>
              )}
            </div>

            <div className="movie-ratings">
              <div className="tmdb-rating">
                <span className="rating-label">TMDB Rating:</span>
                <span className="rating-value">
                  ★ {movie.vote_average.toFixed(1)}
                </span>
                <span className="vote-count">({movie.vote_count} votes)</span>
              </div>

              <div className="user-rating">
                <span className="rating-label">Your Rating:</span>
                <div className="rating-stars">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      className={`star-btn ${
                        userRating && userRating >= star ? "active" : ""
                      }`}
                      onClick={() => handleRating(star)}
                      aria-label={`Rate ${star} stars`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              className={`watchlist-btn-large ${
                inWatchlist ? "in-watchlist" : ""
              }`}
              onClick={handleWatchlistToggle}
            >
              {inWatchlist ? "✓ In Watchlist" : "+ Add to Watchlist"}
            </button>

            <div className="movie-overview">
              <h3>Overview</h3>
              <p>{movie.overview || "No overview available."}</p>
            </div>
          </div>
        </div>

        {/* Cast Section */}
        {movie.credits &&
          movie.credits.cast &&
          movie.credits.cast.length > 0 && (
            <div className="movie-section">
              <h2>Cast</h2>
              <div className="cast-list">
                {movie.credits.cast.slice(0, 10).map((person) => (
                  <div key={person.id} className="cast-item">
                    {person.profile_path ? (
                      <img
                        src={tmdbApi.getImageUrl(person.profile_path, "w185")}
                        alt={person.name}
                        className="cast-image"
                      />
                    ) : (
                      <div className="no-cast-image">No Image</div>
                    )}
                    <div className="cast-info">
                      <p className="cast-name">{person.name}</p>
                      <p className="cast-character">{person.character}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        {/* Videos Section */}
        {movie.videos &&
          movie.videos.results &&
          movie.videos.results.length > 0 && (
            <div className="movie-section">
              <h2>Videos</h2>
              <div className="videos-list">
                {movie.videos.results.slice(0, 3).map((video) => (
                  <div key={video.id} className="video-item">
                    <h3>{video.name}</h3>
                    <div className="video-container">
                      <iframe
                        title={video.name}
                        src={`https://www.youtube.com/embed/${video.key}`}
                        allowFullScreen
                        frameBorder="0"
                      ></iframe>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        {/* Similar Movies Section */}
        {movie.similar &&
          movie.similar.results &&
          movie.similar.results.length > 0 && (
            <div className="movie-section">
              <h2>Similar Movies</h2>
              <div className="similar-movies">
                {movie.similar.results.slice(0, 6).map((similarMovie) => (
                  <MovieCard
                    key={similarMovie.id}
                    movie={similarMovie}
                    showRating={false}
                  />
                ))}
              </div>
            </div>
          )}
      </div>
    </div>
  );
};

export default MovieDetailsPage;
