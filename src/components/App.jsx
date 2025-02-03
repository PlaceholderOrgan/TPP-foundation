// Main component that sets up routing and navigation for the application.
import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Forum from './Forum';
import Home from './Home';
import LoginPopup from './Login';
import News from './News';
import ForumPost from './ForumPost'

// Import navigation button images.
var welcomeButton = require('../assets/logo_malakia.webp');
var newsButton = require('../assets/test_button.webp');
var forumButton = require('../assets/test_button.webp');
var loginButon = require('../assets/test_button.webp');

function App() {
  const [showLogin, setShowLogin] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(
    localStorage.getItem('isLoggedIn') === 'true'
  );

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
    if (token && loggedIn) {
      fetch(`${process.env.REACT_APP_API_URL || 'http://spackcloud.duckdns.org:5000'}/api/validate-token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      })
        .then(response => response.json())
        .then(data => {
          setIsLoggedIn(data.valid);
          if (!data.valid) {
            localStorage.removeItem('authToken');
            localStorage.removeItem('isLoggedIn');
          }
        })
        .catch(err => {
          console.error('Token validation failed:', err);
          localStorage.removeItem('authToken');
          localStorage.removeItem('isLoggedIn');
          setIsLoggedIn(false);
        });
    }
  }, []);

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem('authToken');
    localStorage.removeItem('isLoggedIn');
    alert("Logged out");
    window.location.reload();
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
              onClick={() => window.location.href = '/news'}
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
            <Route path="/forum/:id" element={<ForumPost />} />
            <Route path="/news" element={<News />} />
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