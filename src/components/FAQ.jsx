import React, { useState, useEffect } from 'react';
import "../styles/faq.css";

const FAQ = () => {
  const [faqs, setFaqs] = useState([]);
  const [newQuestion, setNewQuestion] = useState('');
  const [newAnswer, setNewAnswer] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);

  const baseUrl = window.location.hostname === 'localhost'
    ? 'http://localhost:5000/api'
    : 'http://spackcloud.duckdns.org:5000/api';

  useEffect(() => {
    fetchFAQs();
    checkAdminStatus();
  }, []);

  const fetchFAQs = async () => {
    try {
      const response = await fetch(`${baseUrl}/faq`);
      const data = await response.json();
      setFaqs(data);
    } catch (err) {
      console.error('Error fetching FAQs:', err);
    }
  };

  const checkAdminStatus = () => {
    const token = localStorage.getItem('authToken');
    if (token) {
      const decoded = JSON.parse(atob(token.split('.')[1]));
      setIsAdmin(decoded.status === 'admin');
    }
  };

  const handleAddFAQ = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${baseUrl}/faq`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': localStorage.getItem('authToken')
        },
        body: JSON.stringify({ question: newQuestion, answer: newAnswer })
      });
      if (response.ok) {
        fetchFAQs();
        setNewQuestion('');
        setNewAnswer('');
      } else {
        const data = await response.json();
        alert(`Failed to add FAQ: ${data.error}`);
      }
    } catch (err) {
      console.error('Error adding FAQ:', err);
      alert(`Failed to add FAQ: ${err.message}`);
    }
  };

  const handleDeleteFAQ = async (id) => {
    try {
      const response = await fetch(`${baseUrl}/faq/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': localStorage.getItem('authToken')
        }
      });
      if (response.ok) {
        fetchFAQs();
      } else {
        const data = await response.json();
        alert(`Failed to delete FAQ: ${data.error}`);
      }
    } catch (err) {
      console.error('Error deleting FAQ:', err);
      alert(`Failed to delete FAQ: ${err.message}`);
    }
  };

  return (
    <div className="faq-container">
      <h1>Frequently Asked Questions</h1>
      <ol>
        {faqs.map(faq => (
          <li key={faq.id}>
            <h3>{faq.question}</h3>
            <p>- {faq.answer}</p>
            {isAdmin && <button onClick={() => handleDeleteFAQ(faq.id)}>Delete</button>}
          </li>
        ))}
      </ol>
      {isAdmin && (
        <form onSubmit={handleAddFAQ}>
          <h2>Add New FAQ</h2>
          <input
            type="text"
            placeholder="Question"
            value={newQuestion}
            onChange={(e) => setNewQuestion(e.target.value)}
            required
          />
          <textarea
            placeholder="Answer"
            value={newAnswer}
            onChange={(e) => setNewAnswer(e.target.value)}
            required
          />
          <button type="submit">Add FAQ</button>
        </form>
      )}
    </div>
  );
};

export default FAQ;