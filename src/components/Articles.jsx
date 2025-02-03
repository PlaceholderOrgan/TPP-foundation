import React, { useState, useEffect } from 'react';
import ArticleModal from './ArticleModal';
import CreateArticleModal from './CreateArticleModal';
import '../styles/articles.css';

const Articles = () => {
  const [articles, setArticles] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

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

  const handleCreateSubmit = async (articleData) => {
    try {
      const response = await fetch('http://localhost:5000/api/articles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(articleData)
      });
      if (response.ok) {
        setShowCreateModal(false);
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
        <button className="write-button" onClick={() => setShowCreateModal(true)}>
          Write
        </button>
      )}

      {showCreateModal && (
        <CreateArticleModal
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateSubmit}
        />
      )}

      {selectedArticle && (
        <ArticleModal
          article={selectedArticle}
          onClose={() => setSelectedArticle(null)}
        />
      )}

      <div className="articles-list">
        {articles.map(article => (
          <article 
            key={article.id} 
            className="article-card"
            onClick={() => setSelectedArticle(article)}
          >
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