import React, { useState } from 'react';
import '../styles/createArticleModal.css'; // Make sure to import your CSS here

const CreateArticleModal = ({ onClose, onSubmit }) => {
  const [article, setArticle] = useState({
    title: '',
    description: '',
    content: '',
    author: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ ...article, timestamp: new Date().toISOString() });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        {/* Close Button */}
        <button
          type="button"
          className="close-button"
          onClick={onClose}
        >
          ×
        </button>

        <form onSubmit={handleSubmit} className="article-form">
          <input
            type="text"
            placeholder="Title"
            value={article.title}
            onChange={e => setArticle({ ...article, title: e.target.value })}
            required
            className="title-input"
          />

          <textarea
            placeholder="Short description"
            value={article.description}
            onChange={e => setArticle({ ...article, description: e.target.value })}
            required
            className="description-textarea"
          />

          <textarea
            placeholder="Article content"
            value={article.content}
            onChange={e => setArticle({ ...article, content: e.target.value })}
            required
            className="content-textarea"
          />

          <input
            type="text"
            placeholder="Author"
            value={article.author}
            onChange={e => setArticle({ ...article, author: e.target.value })}
            required
            className="author-input"
          />

          <button type="submit" className="publish-button">
            Publish
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateArticleModal;
