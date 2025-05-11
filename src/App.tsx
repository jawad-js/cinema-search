import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { UserProvider } from "./context/UserContext";
import HomePage from "./pages/HomePage";
import "./App.css";
import MovieDetailsPage from "./pages/MovieDetailsPage";
import WatchlistPage from "./pages/WatchlistPage";

function App() {
  return (
    <UserProvider>
      <Router>
        <div className="App">
          <nav className="app-nav">
            <div className="nav-container">
              <Link to="/" className="nav-logo">
                CinemaSearch
              </Link>
              <div className="nav-links">
                <Link to="/" className="nav-link">
                  Home
                </Link>
                <Link to="/watchlist" className="nav-link">
                  Watchlist
                </Link>
              </div>
            </div>
          </nav>

          <main className="app-main">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/movie/:id" element={<MovieDetailsPage />} />
              <Route path="/watchlist" element={<WatchlistPage />} />
            </Routes>
          </main>

          <footer className="app-footer">
            <div className="footer-container">
              <p>
                © {new Date().getFullYear()} CinemaSearch - Film Discovery
                Platform
              </p>
              <p>
                This is a learning-based project created for educational
                purposes only.
              </p>
              <p>
                Powered by{" "}
                <a
                  href="https://www.themoviedb.org/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  TMDB API
                </a>
              </p>
            </div>
          </footer>
        </div>
      </Router>
    </UserProvider>
  );
}

export default App;
