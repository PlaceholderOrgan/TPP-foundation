import React from 'react';

const ArticleModal = ({ article, onClose }) => {
  if (!article) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="close-button" onClick={onClose}>×</button>
        <h2>{article.title}</h2>
        <p className="description">{article.description}</p>
        <div className="content">{article.content}</div>
          <div className="article-footer">
            <span>{article.author}</span>
            <span>{new Date(article.timestamp).toLocaleDateString()}</span>
        </div>
      </div>
    </div>
  );
};

export default ArticleModal;