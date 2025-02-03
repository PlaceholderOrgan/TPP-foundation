import React, { useState, useEffect } from 'react';
import '../styles/articles.css';

const Articles = () => {
  const [articles, setArticles] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [newArticle, setNewArticle] = useState({
    title: '',
    description: '',
    author: ''
  });

  // Check if user is admin
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      fetch('http://localhost:5000/api/validate-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token })
      })
      .then(res => res.json())
      .then(data => setIsAdmin(data.admin))
      .catch(console.error);
    }
  }, []);

  // Fetch articles
  useEffect(() => {
    fetch('http://localhost:5000/api/articles')
      .then(res => res.json())
      .then(data => setArticles(data))
      .catch(console.error);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/articles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newArticle,
          date_published: new Date().toISOString()
        })
      });
      if (response.ok) {
        setShowCreateForm(false);
        // Refresh articles list
        const updatedArticles = await fetch('http://localhost:5000/api/articles').then(res => res.json());
        setArticles(updatedArticles);
      }
    } catch (error) {
      console.error('Failed to create article:', error);
    }
  };

  return (
    <div className="articles-container">
      <h1>Articles</h1>
      
      {isAdmin && (
        <button 
          className="write-button"
          onClick={() => setShowCreateForm(true)}
        >
          Write
        </button>
      )}

      {showCreateForm && (
        <form onSubmit={handleSubmit} className="article-form">
          <input
            type="text"
            placeholder="Title"
            value={newArticle.title}
            onChange={e => setNewArticle({...newArticle, title: e.target.value})}
            required
          />
          <textarea
            placeholder="Description"
            value={newArticle.description}
            onChange={e => setNewArticle({...newArticle, description: e.target.value})}
            required
          />
          <input
            type="text"
            placeholder="Author"
            value={newArticle.author}
            onChange={e => setNewArticle({...newArticle, author: e.target.value})}
            required
          />
          <button type="submit">Publish</button>
          <button type="button" onClick={() => setShowCreateForm(false)}>Cancel</button>
        </form>
      )}

      <div className="articles-list">
        {articles.map(article => (
          <article key={article.id} className="article-card">
            <h2>{article.title}</h2>
            <p>{article.description}</p>
            <div className="article-meta">
              <span>By {article.author}</span>
              <span>{new Date(article.date_published).toLocaleDateString()}</span>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};

export default Articles;