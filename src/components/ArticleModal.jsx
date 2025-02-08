import React from 'react';
import ReactMarkdown from 'react-markdown';
import '../styles/articleModal.css';

const ArticleModal = ({ article, onClose }) => {
  if (!article) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content-read">
        <button className="close-button-read" onClick={onClose}>×</button>
        <h2>{article.title}</h2>
        <p className="description">{article.description}</p>
        <div className="content">
          <ReactMarkdown>{article.content}</ReactMarkdown>
        </div>
        <div className="article-footer">
          <span>By {article.author}</span>
          <span>{new Date(article.timestamp).toLocaleDateString()}</span>
        </div>
      </div>
    </div>
  );
};

export default ArticleModal;