import React from 'react';
var welcomeIcon = require('../assets/test_button.webp');
var newsIcon = require('../assets/test_button.webp');
var forumIcon = require('../assets/test_button.webp');
var loginIcon = require('../assets/test_button.webp');

function App() {
  return (
    <>
      <main>
        <h2>RiverHealth Solutions</h2>
        <p>Well-being of river communities and clean water solutions</p>
        <img src={require('../assets/placeholder.webp')} alt="River" />
        <div className="section-grid">
          <div className="section-card">
            <h3>SANITATION</h3>
            <p>Information about sanitation efforts.</p>
          </div>
          <div className="section-card">
            <h3>PROBLEMS</h3>
            <p>Key problems facing river health.</p>
          </div>
          <div className="section-card">
            <h3>SUSTAINABLE</h3>
            <p>Long-term solutions and practices.</p>
          </div>
        </div>
      </main>
      <footer>
        <p>© 2023 RiverHealth Solutions</p>
      </footer>
    </>
  );
}

export default App;