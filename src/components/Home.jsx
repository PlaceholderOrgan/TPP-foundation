// Home component showing the main landing page.
import React from 'react';
import "../styles/home.css";

function Home() {
  return (
    <div className="home-container">
      <main>
        {/* Main title and description */}
        <h2>The Plant Foundation</h2>
        <p>Making the energetic future better, together!</p>
        {/* Grid layout section with three cards */}
        <div className="section-grid">
          <div className="section-card">
            <h3>PlaceHolder1</h3>
            <p>Information about sanitation efforts.</p>
          </div>
          <div className="section-card">
            <h3>PlaceHolder2</h3>
            <p>Key problems facing river health.</p>
          </div>
          <div className="section-card">
            <h3>PlaceHolder3</h3>
            <p>Long-term solutions and practices.</p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Home;