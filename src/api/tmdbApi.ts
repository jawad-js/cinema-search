import axios from "axios";

// Create a base API instance with common configuration
const api = axios.create({
  baseURL: "https://api.themoviedb.org/3",
  params: {
    api_key: "4f9d759b8f052e29f2f3c0329aa0711f", // Direct API key instead of using process.env
    language: "en-US",
  },
});

// Add request cache to manage API rate limits
const cache: Record<string, { data: any; timestamp: number }> = {};
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes in milliseconds

// Interceptor to implement caching
api.interceptors.request.use(async (config) => {
  const cacheKey = `${config.url}?${new URLSearchParams(
    config.params
  ).toString()}`;
  const cachedResponse = cache[cacheKey];

  if (
    cachedResponse &&
    Date.now() - cachedResponse.timestamp < CACHE_DURATION
  ) {
    // Return cached response
    return {
      ...config,
      adapter: () => {
        return Promise.resolve({
          data: cachedResponse.data,
          status: 200,
          statusText: "OK",
          headers: {},
          config,
          request: {},
        });
      },
    };
  }

  return config;
});

// Interceptor to save responses to cache
api.interceptors.response.use((response) => {
  const cacheKey = `${response.config.url}?${new URLSearchParams(
    response.config.params
  ).toString()}`;

  cache[cacheKey] = {
    data: response.data,
    timestamp: Date.now(),
  };

  return response;
});

// Define API methods
export const tmdbApi = {
  // Search movies by query
  searchMovies: (query: string, page = 1) => {
    return api.get("/search/movie", {
      params: {
        query,
        page,
        include_adult: false,
      },
    });
  },

  // Get movie details by ID
  getMovieDetails: (movieId: number) => {
    return api.get(`/movie/${movieId}`, {
      params: {
        append_to_response: "videos,credits,similar,recommendations",
      },
    });
  },

  // Get popular movies
  getPopularMovies: (page = 1) => {
    return api.get("/movie/popular", {
      params: {
        page,
      },
    });
  },

  // Get movie genres
  getGenres: () => {
    return api.get("/genre/movie/list");
  },

  // Get movie image URL
  getImageUrl: (path: string, size = "original") => {
    return `https://image.tmdb.org/t/p/${size}${path}`;
  },
};

export default tmdbApi;
