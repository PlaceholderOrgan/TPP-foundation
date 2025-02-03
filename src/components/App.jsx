import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Forum from './Forum';
import Home from './Home';
import LoginPopup from './Login';
import News from './News';
import ForumPost from './ForumPost';
import AdminDash from './AdminDash';

var welcomeButton = require('../assets/logo_malakia.webp');
var newsButton = require('../assets/test_button.webp');
var forumButton = require('../assets/test_button.webp');
var loginButon = require('../assets/test_button.webp');

function App() {
  const [showLogin, setShowLogin] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(
    localStorage.getItem('isLoggedIn') === 'true'
  );
  const [isAdmin, setIsAdmin] = useState(
    localStorage.getItem('isAdmin') === 'true'
  );

  // Choose base URL based on current hostname. Priority is localhost.
  const baseUrl = window.location.hostname === 'localhost'
    ? 'http://localhost:5000'
    : 'http://spackcloud.duckdns.org:5000';

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
    if (token && loggedIn) {
      fetch(`${baseUrl}/api/validate-token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      })
        .then(response => response.json())
        .then(data => {
          setIsLoggedIn(data.valid);
          if(data.admin){
            setIsAdmin(true);
            localStorage.setItem('isAdmin', 'true');
          } else {
            setIsAdmin(false);
            localStorage.removeItem('isAdmin');
          }
          if (!data.valid) {
            localStorage.removeItem('authToken');
            localStorage.removeItem('isLoggedIn');
          }
        })
        .catch(err => {
          console.error('Token validation failed:', err);
          localStorage.removeItem('authToken');
          localStorage.removeItem('isLoggedIn');
          localStorage.removeItem('isAdmin');
          setIsLoggedIn(false);
          setIsAdmin(false);
        });
    }
  }, [baseUrl]);

  const handleLogout = () => {
    setIsLoggedIn(false);
    setIsAdmin(false);
    localStorage.removeItem('authToken');
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('isAdmin');
    alert("Logged out");
    window.location.reload();
  };

  return (
    <Router>
      <>
        <header>
          <h3>WELCOME</h3>
          <nav className="nav-buttons">
            <button
              onClick={() => window.location.href = '/'}
              style={{ backgroundImage: `url(${welcomeButton})` }}
              className="nav-img-btn"
            />
            <button
              onClick={() => window.location.href = '/news'}
              style={{ backgroundImage: `url(${newsButton})` }}
              className="nav-img-btn"
            />
            <button
              onClick={() => window.location.href = '/forum'}
              style={{ backgroundImage: `url(${forumButton})` }}
              className="nav-img-btn"
            />
            {isAdmin && (
              <button
                onClick={() => window.location.href = '/admin'}
                style={{ backgroundColor: "#007BFF", color: "#fff" }}
                className="nav-img-btn"
              >
                Admin Dash
              </button>
            )}
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

        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/forum" element={<Forum />} />
            <Route path="/forum/:id" element={<ForumPost />} />
            <Route path="/news" element={<News />} />
            <Route path="/admin" element={<AdminDash />} />
          </Routes>
        </main>

        {showLogin && (
          <LoginPopup
            onClose={() => setShowLogin(false)}
            onLoginSuccess={() => {
              setIsLoggedIn(true);
              const admin = localStorage.getItem('isAdmin') === 'true';
              setIsAdmin(admin);
              setShowLogin(false);
            }}
          />
        )}
      </>
    </Router>
  );
}

export default App;