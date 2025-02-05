// Language: jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import '../styles/forumPost.css';

function ForumPost() {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  const baseUrl = window.location.hostname === 'localhost'
    ? 'http://localhost:5000/api'
    : 'http://spackcloud.duckdns.org:5000/api';

  useEffect(() => {
    fetch(`${baseUrl}/posts/${id}`)
      .then(res => res.json())
      .then(data => {
        setPost(data.post);
        setComments(data.comments);
      })
      .catch(err => console.error('Error:', err));
    
    const token = localStorage.getItem('authToken');
    setIsAuthenticated(!!token);
    if (token) {
      try {
        const decoded = jwtDecode(token);
        if (decoded.status === 'admin') {
          setIsAdmin(true);
        }
      } catch (err) {
        console.error('Token decoding failed:', err);
      }
    }
  }, [id, baseUrl]);

  const handleAddComment = (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
  
    const storedUsername = localStorage.getItem('username');
    const storedUserId = localStorage.getItem('userId');
    if (!storedUserId || !storedUsername) {
      alert("You must be logged in to comment.");
      return;
    }
    const timestamp = new Date().toLocaleString();
  
    fetch(`${baseUrl}/posts/${id}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: newComment,
        userId: storedUserId,
        username: storedUsername,
        timestamp: timestamp
      }),
    })
      .then(res => res.json())
      .then(() => {
        setNewComment('');
        return fetch(`${baseUrl}/posts/${id}`);
      })
      .then(res => res.json())
      .then(data => setComments(data.comments))
      .catch(err => console.error('Error:', err));
  };

  const handleDeleteComment = (commentId) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return;
    fetch(`${baseUrl}/posts/${id}/comments/${commentId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': localStorage.getItem('authToken')
      }
    })
      .then(res => {
        if (res.ok) {
          setComments(comments.filter(comment => comment.id !== commentId));
        } else {
          console.error('Error deleting comment');
        }
      })
      .catch(err => console.error('Error deleting comment:', err));
  };

  if (!post) return <div>Loading...</div>;

  return (
    <div className="forum-post">
      <Link to="/forum" className="back-button">← Back to Forum</Link>
      
      <div className="post-details">
        <h2>{post.title}</h2>
        <p>{post.content}</p>
        <span className="post-author">Posted by {post.username}</span>
        <span className="timestamp">{post.timestamp}</span>
      </div>

      <div className="comments-section">
        <h3>Comments</h3>
        {post.locked ? (
          <p>This thread has been locked and no more comments can be made</p>
        ) : (
          isAuthenticated ? (
            <form onSubmit={handleAddComment} className="comment-form">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
              />
              <button type="submit">Submit</button>
            </form>
          ) : (
            <p>Please sign in to comment.</p>
          )
        )}

        <div className="comments-list">
          {comments.map(comment => (
            <div key={comment.id} className="comment">
              <p>{comment.content}</p>
              <div className="comment-meta">
                Posted by {comment.username} on {comment.timestamp}
              </div>
              {isAdmin && (
                <button onClick={() => handleDeleteComment(comment.id)}>
                  Delete
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ForumPost;