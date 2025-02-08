// Home component showing the main landing page.
import React from 'react';
import "../styles/home.css";

function Home() {
  return (
    <div className="home-container">
      <main>
        {/* Main title and description */}
        <h1>The Power Plant Foundation</h1>
        <p>Making the energetic future better, together!</p>
        {/* Grid layout section with three cards */}
        <div className="section-grid">
          <div className="section-card">
            <h3>How does a nuclear power plant work?</h3>
            <p>This is a short, but informative video that provides insight to how nuclear power plants work.</p>
            <iframe
              width="560"
              height="315"
              src="https://www.youtube.com/embed/TW6s2Q4Zl9E"
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
          <div className="section-card">
            <h3> Coal 101: What's Wrong with Coal?</h3>
            <p>This is a short but inforative video about the concerns of coal as an energy source.</p>
            <iframe
              width="560"
              height="315"
              src="https://www.youtube.com/embed/9Wv2GKaukZU"
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
          <div className="section-card">
            <h3> Renewable Energy 101 | National Geographic</h3>
            <p>A short but informative video regarding renewable energy sources.</p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Home;