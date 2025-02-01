import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Forum from './Forum';
import Home from './Home'; // your home component

function App() {
  return (
    <Router>
      <>
        <header>
          <h3>WELCOME</h3>
          <nav className="nav-buttons">
            <button
              onClick={() => window.location.href = '/'}
              style={{ backgroundImage: `url(${require('../assets/test_button.webp')})` }}
              className="nav-img-btn"
            />
            <button
              style={{ backgroundImage: `url(${require('../assets/test_button.webp')})` }}
              className="nav-img-btn"
            />
            <button
              onClick={() => window.location.href = '/forum'}
              style={{ backgroundImage: `url(${require('../assets/test_button.webp')})` }}
              className="nav-img-btn"
            />
            <button
              style={{ backgroundImage: `url(${require('../assets/test_button.webp')})` }}
              className="nav-img-btn"
            />
          </nav>
        </header>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/forum" element={<Forum />} />
        </Routes>
      </>
    </Router>
  );
}

export default App;