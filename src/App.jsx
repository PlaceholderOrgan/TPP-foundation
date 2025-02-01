import React from 'react';

function App() {
  return (
    <>
      <header>
        <h1>WELCOME</h1>
        <h2>RiverHealth Solutions</h2>
        <p>Well-being of river communities and clean water solutions</p>
      </header>
      <main>
        <img src="https://via.placeholder.com/600x300" alt="River" />
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