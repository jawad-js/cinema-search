import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { UserRating, WatchlistItem } from "../types/movie";

interface UserContextType {
  watchlist: WatchlistItem[];
  ratings: UserRating[];
  addToWatchlist: (movieId: number) => void;
  removeFromWatchlist: (movieId: number) => void;
  isInWatchlist: (movieId: number) => boolean;
  rateMovie: (movieId: number, rating: number) => void;
  getUserRating: (movieId: number) => number | null;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  // Initialize state from localStorage or empty arrays
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>(() => {
    const saved = localStorage.getItem("watchlist");
    return saved ? JSON.parse(saved) : [];
  });

  const [ratings, setRatings] = useState<UserRating[]>(() => {
    const saved = localStorage.getItem("ratings");
    return saved ? JSON.parse(saved) : [];
  });

  // Save to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem("watchlist", JSON.stringify(watchlist));
  }, [watchlist]);

  useEffect(() => {
    localStorage.setItem("ratings", JSON.stringify(ratings));
  }, [ratings]);

  // Watchlist functions
  const addToWatchlist = (movieId: number) => {
    if (!isInWatchlist(movieId)) {
      setWatchlist([
        ...watchlist,
        { movieId, addedAt: new Date().toISOString() },
      ]);
    }
  };

  const removeFromWatchlist = (movieId: number) => {
    setWatchlist(watchlist.filter((item) => item.movieId !== movieId));
  };

  const isInWatchlist = (movieId: number) => {
    return watchlist.some((item) => item.movieId === movieId);
  };

  // Rating functions
  const rateMovie = (movieId: number, rating: number) => {
    const existingRatingIndex = ratings.findIndex((r) => r.movieId === movieId);

    if (existingRatingIndex >= 0) {
      // Update existing rating
      const updatedRatings = [...ratings];
      updatedRatings[existingRatingIndex] = {
        ...updatedRatings[existingRatingIndex],
        rating,
        ratedAt: new Date().toISOString(),
      };
      setRatings(updatedRatings);
    } else {
      // Add new rating
      setRatings([
        ...ratings,
        {
          movieId,
          rating,
          ratedAt: new Date().toISOString(),
        },
      ]);
    }
  };

  const getUserRating = (movieId: number): number | null => {
    const userRating = ratings.find((r) => r.movieId === movieId);
    return userRating ? userRating.rating : null;
  };

  const value = {
    watchlist,
    ratings,
    addToWatchlist,
    removeFromWatchlist,
    isInWatchlist,
    rateMovie,
    getUserRating,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

// Custom hook to use the user context
export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};
