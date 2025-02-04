import React, { useState, useEffect } from 'react';
import '../styles/forum.css';
import { jwtDecode } from 'jwt-decode';


function Forum() {
  const [postTitle, setPostTitle] = useState('');
  const [postDescription, setPostDescription] = useState('');
  const [posts, setPosts] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Choose base URL based on current hostname. Priority is localhost.
  const baseUrl = window.location.hostname === 'localhost'
    ? 'http://localhost:5000/api'
    : 'http://spackcloud.duckdns.org:5000/api';

  useEffect(() => {
    fetch(`${baseUrl}/posts`)
      .then((res) => res.json())
      .then((data) => setPosts(data))
      .catch((err) => console.error('Error fetching posts:', err));

    // Check if the user is authenticated
    const token = localStorage.getItem('authToken');
    if (token) {
      fetch(`${baseUrl}/validate-token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.valid) {
            setIsAuthenticated(true);
          } else {
            localStorage.removeItem('authToken');
          }
        })
        .catch((err) => console.error('Error validating token:', err));
    }
  }, [baseUrl]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!postTitle.trim() || !postDescription.trim()) return;
    // Get username from the auth token
    const token = localStorage.getItem('authToken');
    let username = 'User';
    if (token) {
      try {
        const decoded = jwtDecode(token);
        username = decoded.username;
      } catch (err) {
        console.error('Invalid token', err);
      }
    }
    const newPost = {
      title: postTitle.trim(),
      description: postDescription.trim(),
      username, // use the decoded username
      timestamp: new Date().toLocaleString(),
    };
    fetch(`${baseUrl}/posts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newPost),
    })
      .then((res) => res.json())
      .then(() => {
        setPostTitle('');
        setPostDescription('');
        return fetch(`${baseUrl}/posts`);
      })
      .then((res) => res.json())
      .then((updatedPosts) => setPosts(updatedPosts))
      .catch((err) => console.error('Error adding post:', err));
  };

  return (
    <div className="forum-page">
      <h2>Forum</h2>
      {isAuthenticated ? (
        <form onSubmit={handleSubmit} className="post-form">
          <input
            type="text"
            placeholder="Post title..."
            value={postTitle}
            onChange={(e) => setPostTitle(e.target.value)}
            className="post-title-input"
          />
          <textarea
            placeholder="Post description..."
            value={postDescription}
            onChange={(e) => setPostDescription(e.target.value)}
            className="post-textarea"
          />
          <button type="submit" className="post-submit-btn">Post</button>
        </form>
      ) : (
        <p>Please sign in to post.</p>
      )}
      <div className="posts">
        {posts.length === 0 ? (
          <p>No posts yet. Be the first to post!</p>
        ) : (
          posts.map((post) => (
            <div
              key={post.id}
              className="post"
              onClick={() => window.location.href = `/forum/${post.id}`}
              style={{ cursor: 'pointer' }}
            >
              {post.pinned === 1 && <span className="pinned-badge">PINNED</span>}
              <h3 className="post-title">{post.title}</h3>
              <div className="post-info">
                <span className="post-author">Posted by {post.username}</span>
                <span className="post-timestamp">{post.timestamp}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Forum;