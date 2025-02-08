import React, { useState, useEffect } from 'react';
import ArticleModal from './ArticleModal';
import CreateArticleModal from './CreateArticleModal';
import '../styles/articles.css';

const Articles = () => {
  const [articles, setArticles] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [canWrite, setCanWrite] = useState(false);

  const baseUrl = window.location.hostname === 'localhost'
    ? 'http://localhost:5000'
    : 'https://tppfoundation.netlify.app:5000';

  // Check if user is writer or admin
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      fetch(`${baseUrl}/api/validate-token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token })
      })
      .then(res => res.json())
      .then(data => {
        if (data.decoded && (data.decoded.status === 'admin' || data.decoded.status === 'writer')) {
          setCanWrite(true);
        }
      })
      .catch(console.error);
    }
  }, [baseUrl]);

  // Fetch articles
  useEffect(() => {
    fetch(`${baseUrl}/api/articles`)
      .then(res => res.json())
      .then(data => setArticles(data))
      .catch(console.error);
  }, [baseUrl]);

  const handleCreateSubmit = async (articleData) => {
    try {
      const response = await fetch(`${baseUrl}/api/articles`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(articleData)
      });
      if (response.ok) {
        setShowCreateModal(false);
        const updatedArticles = await fetch(`${baseUrl}/api/articles`).then(res => res.json());
        setArticles(updatedArticles);
      }
    } catch (error) {
      console.error('Failed to create article:', error);
    }
  };

  return (
    <div className="articles-container">
      <div className="articles-header">
      <h1>Articles</h1>
      
      {canWrite && (
        <button className="write-button" onClick={() => setShowCreateModal(true)}>
          Write✎
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
      </div>
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
              <span>{new Date(article.timestamp).toLocaleDateString()}</span>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};

export default Articles;