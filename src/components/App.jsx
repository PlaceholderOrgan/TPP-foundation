// Main component that sets up routing and navigation for the application.
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Forum from './Forum';
import Home from './Home';
import LoginPopup from './Login';

// Import navigation button images.
var welcomeButton = require('../assets/test_button.webp');
var forumButton = require('../assets/test_button.webp');
var newsButton = require('../assets/test_button.webp');
var loginButon = require('../assets/test_button.webp');

function App() {
  // State to control display of the login popup.
  const [showLogin, setShowLogin] = useState(false);
  // State to track if the user is logged in.
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Log the user out.
  const handleLogout = () => {
    setIsLoggedIn(false);
    alert("Logged out");
  };

  return (
    <Router>
      <>
        {/* Header with navigation buttons */}
        <header>
          <h3>WELCOME</h3>
          <nav className="nav-buttons">
            {/* Navigate to Home */}
            <button
              onClick={() => window.location.href = '/'}
              style={{ backgroundImage: `url(${welcomeButton})` }}
              className="nav-img-btn"
            />
            {/* Dummy button for news (no action specified) */}
            <button
              style={{ backgroundImage: `url(${newsButton})` }}
              className="nav-img-btn"
            />
            {/* Navigate to Forum */}
            <button
              onClick={() => window.location.href = '/forum'}
              style={{ backgroundImage: `url(${forumButton})` }}
              className="nav-img-btn"
            />
            {/* Toggle login or logout button based on logged in state */}
            {isLoggedIn ? (
              <button
                onClick={handleLogout}
                style={{ backgroundColor: "#f00", color: "#fff" }}
                className="nav-img-btn"
              >
                Log Out
              </button>
            ) : (
              <button
                onClick={() => setShowLogin(true)}
                style={{ backgroundImage: `url(${loginButon})` }}
                className="nav-img-btn"
              />
            )}
          </nav>
        </header>

        {/* Define main application routes */}
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/forum" element={<Forum />} />
          </Routes>
        </main>

        {/* Display the LoginPopup when needed */}
        {showLogin && (
          <LoginPopup
            onClose={() => setShowLogin(false)}
            onLoginSuccess={() => {
              setIsLoggedIn(true);
              setShowLogin(false);
            }}
          />
        )}
      </>
    </Router>
  );
}

export default App;