import React, { useState } from 'react';

const CreateArticleModal = ({ onClose, onSubmit }) => {
  const [article, setArticle] = useState({
    title: '',
    description: '',
    content: '',
    author: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ ...article, date_published: new Date().toISOString() });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <form onSubmit={handleSubmit}>
          <button type="button" className="close-button" onClick={onClose}>×</button>
          <input
            type="text"
            placeholder="Title"
            value={article.title}
            onChange={e => setArticle({...article, title: e.target.value})}
            required
          />
          <textarea
            placeholder="Short description"
            value={article.description}
            onChange={e => setArticle({...article, description: e.target.value})}
            required
          />
          <textarea
            placeholder="Article content"
            value={article.content}
            onChange={e => setArticle({...article, content: e.target.value})}
            required
            className="content-area"
          />
          <input
            type="text"
            placeholder="Author"
            value={article.author}
            onChange={e => setArticle({...article, author: e.target.value})}
            required
          />
          <button type="submit">Publish</button>
        </form>
      </div>
    </div>
  );
};

export default CreateArticleModal;