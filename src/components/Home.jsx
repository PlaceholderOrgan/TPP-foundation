// Home component showing the main landing page.
import React from 'react';

function Home() {
  return (
    <>
      <main>
        {/* Main title and description */}
        <h2>RiverHealth Solutions</h2>
        <p>Well-being of river communities and clean water solutions</p>
        {/* Display a placeholder image */}
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
      {/* Footer */}
      <footer>
        <p>© 2023 RiverHealth Solutions</p>
      </footer>
    </>
  );
}

export default Home;