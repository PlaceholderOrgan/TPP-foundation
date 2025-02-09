import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Forum from './Forum';
import Home from './Home';
import LoginPopup from './Login';
import Articles from './Articles';
import ForumPost from './ForumPost';
import AdminDash from './AdminDash';
import FAQ from './FAQ';

function App() {
  const [showLogin, setShowLogin] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(
    localStorage.getItem('isLoggedIn') === 'true'
  );
  const [isAdmin, setIsAdmin] = useState(
    localStorage.getItem('isAdmin') === 'true'
  );

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
          <div className="header-logo">
            <img
              src={require("../assets/logo_highdef_ekpathon.webp")}
              alt="Logo"
              style={{ 
                height: "60px",
                position: "absolute",
                top: "10px",
                left: "20px" }}
            />
          </div>
          <nav className="nav-buttons">
            <button
              onClick={() => window.location.href = '/'}
              className="nav-btn btn-home"
            >
              Home
            </button>
            <button
              onClick={() => window.location.href = '/info'}
              className="nav-btn btn-articles"
            >
              Articles
            </button>
            <button
              onClick={() => window.location.href = '/forum'}
              className="nav-btn btn-forum"
            >
              Forum
            </button>
            <button
              onClick={() => window.location.href = '/faq'}
              className="nav-btn btn-faq"
            >
              FAQ
            </button>
            {isLoggedIn ? (
              <button
                onClick={handleLogout}
                className="nav-btn btn-logout"
              >
                Logout
              </button>
            ) : (
              <button
                onClick={() => setShowLogin(true)}
                className="nav-btn btn-login"
              >
                Login
              </button>
            )}
          </nav>
        </header>

        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/forum" element={<Forum />} />
            <Route path="/forum/:id" element={<ForumPost />} />
            <Route path="/info" element={<Articles />} />
            <Route path="/admin" element={<AdminDash />} />
            <Route path="/faq" element={<FAQ />} />
          </Routes>
        </main>

        {/* Footer added below main */}
        <footer>
          <span>©2025 The Plant Foundation</span>
        </footer>

{isAdmin && (
  <button
    className="admin-floating"
    onClick={() => window.location.href = '/admin'}
  >
    🖳
  </button>
)}

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
