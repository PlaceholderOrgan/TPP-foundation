// Forum component for displaying and submitting posts.
import React, { useState, useEffect } from 'react';
import '../styles/forum.css';

function Forum() {
  // State for holding posts and the content of a new post.
  const [posts, setPosts] = useState([]);
  const [postContent, setPostContent] = useState('');

  useEffect(() => {
    fetch('http://localhost:5000/api/posts')
      .then((res) => res.json())
      .then((data) => setPosts(data))
      .catch((err) => console.error('Error fetching posts:', err));
  }, []);
  

  // Handle the form submit to add a new post.
  const handleSubmit = (e) => {
    e.preventDefault();
    if (postContent.trim() === '') return;
    const newPost = {
      content: postContent.trim(),
      timestamp: new Date().toLocaleString(),
    };
    fetch('http://localhost:5000/api/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newPost),
    })
      .then((res) => res.json())
      .then(() => {
        setPostContent('');
        // Re-fetch to update the list
        return fetch('http://localhost:5000/api/posts');
      })
      .then((res) => res.json())
      .then((updatedPosts) => setPosts(updatedPosts))
      .catch((err) => console.error('Error adding post:', err));
  };

  return (
    <div className="forum-page">
      <h2>Forum</h2>
      {/* Form for submitting a new post */}
      <form onSubmit={handleSubmit} className="post-form">
        <textarea
          placeholder="Write your post..."
          value={postContent}
          onChange={(e) => setPostContent(e.target.value)}
          className="post-textarea"
        />
        <button type="submit" className="post-submit-btn">Post</button>
      </form>
      {/* Display posts or a placeholder message if no posts exist */}
      <div className="posts">
        {posts.length === 0 ? (
          <p>No posts yet. Be the first to post!</p>
        ) : (
          posts.map((post) => (
            <div key={post.id} className="post">
              <p className="post-content">{post.content}</p>
              <span className="post-timestamp">{post.timestamp}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Forum;