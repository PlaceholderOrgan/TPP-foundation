import React, { useState, useEffect } from 'react';
import '../styles/forum.css';

function Forum() {
  const [postTitle, setPostTitle] = useState('');
  const [postDescription, setPostDescription] = useState('');
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    fetch('http://localhost:5000/api/posts')
      .then((res) => res.json())
      .then((data) => setPosts(data))
      .catch((err) => console.error('Error fetching posts:', err));
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!postTitle.trim() || !postDescription.trim()) return;
    const newPost = {
      title: postTitle.trim(),
      description: postDescription.trim(),
      timestamp: new Date().toLocaleString(),
    };
    fetch('http://localhost:5000/api/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newPost),
    })
      .then((res) => res.json())
      .then(() => {
        setPostTitle('');
        setPostDescription('');
        return fetch('http://localhost:5000/api/posts');
      })
      .then((res) => res.json())
      .then((updatedPosts) => setPosts(updatedPosts))
      .catch((err) => console.error('Error adding post:', err));
  };

  return (
    <div className="forum-page">
      <h2>Forum</h2>
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
      <div className="posts">
        {posts.length === 0 ? (
          <p>No posts yet. Be the first to post!</p>
        ) : (
          posts.map((post) => (
            <div key={post.id} className="post">
              <h3 className="post-title">{post.title}</h3>
              <p className="post-content">{post.description}</p>
              <span className="post-timestamp">{post.timestamp}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Forum;