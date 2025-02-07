// Home component showing the main landing page.
import React from 'react';

function Home() {
  return (
    <div className="home-container">
      <main>
        {/* Main title and description */}
        <h2>RiverHealth Solutions</h2>
        <p>Well-being of river communities and clean water solutions</p>
        {/* Grid layout section with three cards */}
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
    </div>
  );
}

export default Home;