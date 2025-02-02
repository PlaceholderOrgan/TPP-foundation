import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import '../styles/forumPost.css';

function ForumPost() {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    fetch(`http://localhost:5000/api/posts/${id}`)
      .then(res => res.json())
      .then(data => {
        setPost(data.post);
        setComments(data.comments);
      })
      .catch(err => console.error('Error:', err));
    
    const token = localStorage.getItem('authToken');
    setIsAuthenticated(!!token);
  }, [id]);

  const handleAddComment = (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    fetch(`http://localhost:5000/api/posts/${id}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: newComment,
        userId: 1, // Get from auth context in real app
        username: 'User' // Get from auth context in real app
      }),
    })
      .then(res => res.json())
      .then(() => {
        setNewComment('');
        // Refresh comments
        return fetch(`http://localhost:5000/api/posts/${id}`);
      })
      .then(res => res.json())
      .then(data => setComments(data.comments))
      .catch(err => console.error('Error:', err));
  };

  if (!post) return <div>Loading...</div>;

  return (
    <div className="forum-post">
      <Link to="/forum" className="back-button">← Back to Forum</Link>
      
      <div className="post-details">
        <h2>{post.title}</h2>
        <p>{post.description}</p>
        <span className="timestamp">{post.timestamp}</span>
      </div>

      <div className="comments-section">
        <h3>Comments</h3>
        {isAuthenticated && (
          <form onSubmit={handleAddComment} className="comment-form">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
            />
            <button type="submit">Submit</button>
          </form>
        )}

        <div className="comments-list">
          {comments.map(comment => (
            <div key={comment.id} className="comment">
              <p>{comment.content}</p>
              <div className="comment-meta">
                <span className="username">{comment.username}</span>
                <span className="timestamp">{comment.timestamp}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ForumPost;