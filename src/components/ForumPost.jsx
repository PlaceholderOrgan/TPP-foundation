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
  const [loading, setLoading] = useState(true); // Add a loading state
  const [error, setError] = useState(null);

  const baseUrl = window.location.hostname === 'localhost'
    ? 'http://localhost:5000/api'
    : 'http://spackcloud.duckdns.org:5000/api';

  useEffect(() => {
    const fetchPostAndComments = async () => {
      setLoading(true); // Start loading
      try {
        const res = await fetch(`${baseUrl}/posts/${id}`); // Correct route
        if (!res.ok) {
          if (res.status === 404) {
            setError('Post not found.');
          } else {
            throw new Error(`HTTP error! status: ${res.status}`);
          }
          return;
        }
        const data = await res.json();
        setPost(data.post);
        setComments(data.comments);
      } catch (err) {
        console.error('Error fetching post and comments:', err);
        setError('Failed to load post.');
        // Optionally set an error state to display an error message to the user
      } finally {
        setLoading(false); // End loading
      }
    };

    fetchPostAndComments();

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
    
    fetch(`${baseUrl}/posts/${id}/comments`, { // Correct route
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
      .then(data => {
        // Optimistically update the comments array
        const newCommentObj = {
          id: data.commentId,
          content: newComment,
          userId: storedUserId,
          username: storedUsername,
          timestamp: timestamp,
          postId: id,
          pinned: 0
        };
        setComments(prevComments => [...prevComments, newCommentObj]);
        setNewComment('');
      })
      .catch(err => console.error('Error:', err));
  };

  const handleDeleteComment = (commentId) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return;
    fetch(`${baseUrl}/posts/${id}/comments/${commentId}`, { // Correct route
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

  const handlePinComment = (commentId, currentPinned) => {
    const newPin = !currentPinned;
    fetch(`${baseUrl}/posts/${id}/comments/${commentId}/pin`, { // Correct route
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': localStorage.getItem('authToken')
      },
      body: JSON.stringify({ pin: newPin })
    })
      .then(res => res.json())
      .then(() => {
        setComments(comments.map(comment =>
          comment.id === commentId ? { ...comment, pinned: newPin } : comment
        ));
      })
      .catch(err => console.error('Error updating pin status:', err));
  };

  if (loading) return <div>Loading...</div>; // Show loading indicator
  if (error) return <div>Error: {error}</div>;
  if (!post) return <div>Error loading post.</div>; // Show error message if post is null

  // Sort comments so that pinned ones appear first.
  const sortedComments = [...comments].sort((a, b) => {
    return (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0);
  });

  return (
    <div className="forum-post">
      <Link to="/forum" className="back-button">← Back to Forum</Link>
      
      <div className="post-details">
        <h2>{post.title}</h2>
        <p>{post.content}</p>
        <span className="post-author">Posted by {post.username} </span>
        <span className="timestamp">{post.timestamp}</span>
      </div>

      <div className="comments-section">
        <h3>Comments</h3>
        <div className="comments-section-meta">
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
              <button type="submit" className="submit-button">Submit</button>
            </form>
          ) : (
            <p>Please sign in to comment.</p>
          )
        )}

        <div className="comments-list">
          {sortedComments.map(comment => (
            <div key={comment.id} className="comment">
              <p style={{ whiteSpace: 'pre-wrap' }}>{comment.content}</p>
              <div className="comment-meta">
                Posted by {comment.username} on {comment.timestamp}
                {comment.pinned && (
                  <span className="pinned-label" style={{ marginLeft: '10px', color: 'green', fontWeight: 'bold' }}>
                    [Pinned]
                  </span>
                )}
              </div>
              {isAdmin && (
                <>
                  <button className="delete-comment-button" onClick={() => handleDeleteComment(comment.id)}>
                    Delete
                  </button>
                  <button className="pin-button" onClick={() => handlePinComment(comment.id, comment.pinned)}>
                    {comment.pinned ? 'Unpin' : 'Pin'}
                  </button>
                </>
              )}
            </div>
          ))}
        </div>
        </div>
      </div>
    </div>
  );
}

export default ForumPost;