import React, { useState, useRef } from 'react';
import '../styles/createArticleModal.css'; // Ensure CSS is loaded

const CreateArticleModal = ({ onClose, onSubmit }) => {
  const [article, setArticle] = useState({
    title: '',
    description: '',
    content: '',
    author: ''
  });

  const contentRef = useRef(null);

  const applyFormatting = (formatType) => {
    const textarea = contentRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = article.content.substring(start, end) || 'text';
    let formattedText = selectedText;

    switch (formatType) {
      case 'bold':
        formattedText = `**${selectedText}**`;
        break;
      case 'italic':
        formattedText = `*${selectedText}*`;
        break;
      case 'underline':
        formattedText = `__${selectedText}__`;
        break;
      case 'link': {
        const url = prompt('Enter URL:');
        if (url) {
          formattedText = `[${selectedText}](${url})`;
        }
        break;
      }
      default:
        break;
    }

    const newContent =
      article.content.slice(0, start) +
      formattedText +
      article.content.slice(end);
    setArticle({ ...article, content: newContent });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ ...article, timestamp: new Date().toISOString() });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        {/* Close Button */}
        <button type="button" className="close-button" onClick={onClose}>
          ×
        </button>

        <form onSubmit={handleSubmit} className="article-form">
          <input
            type="text"
            placeholder="Title"
            value={article.title}
            onChange={(e) => setArticle({ ...article, title: e.target.value })}
            required
            className="title-input"
          />

          <textarea
            placeholder="Short description"
            value={article.description}
            onChange={(e) =>
              setArticle({ ...article, description: e.target.value })
            }
            required
            className="description-textarea"
          />

          {/* Formatting Toolbar */}
          <div className="formatting-toolbar">
            <button type="button" className="bold-button" onClick={() => applyFormatting('bold')}>
              Bold
            </button>
            <button type="button" className="italics-button"onClick={() => applyFormatting('italic')}>
              Italic
            </button>
            <button type="button" className="underline-button"onClick={() => applyFormatting('underline')}>
              Underline
            </button>
            <button type="button" className="link-button"onClick={() => applyFormatting('link')}>
              Hyperlink
            </button>
          </div>

          <textarea
            placeholder="Article content"
            value={article.content}
            onChange={(e) =>
              setArticle({ ...article, content: e.target.value })
            }
            required
            className="content-textarea"
            ref={contentRef}
          />

          <input
            type="text"
            placeholder="Author"
            value={article.author}
            onChange={(e) => setArticle({ ...article, author: e.target.value })}
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