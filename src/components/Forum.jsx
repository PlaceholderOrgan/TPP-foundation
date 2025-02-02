// Forum component for displaying and submitting posts.
import React, { useState } from 'react';
import '../styles/forum.css';

function Forum() {
  // State for holding posts and the content of a new post.
  const [posts, setPosts] = useState([]);
  const [postContent, setPostContent] = useState('');

  // Handle the form submit to add a new post.
  const handleSubmit = (e) => {
    e.preventDefault();
    // Ignore empty posts.
    if (postContent.trim() === '') return;
    const newPost = {
      id: Date.now(), // Unique identifier based on timestamp.
      content: postContent.trim(), // Cleaned post text.
      timestamp: new Date().toLocaleString(), // Human-readable timestamp.
    };
    // Add the new post to the beginning of the list.
    setPosts([newPost, ...posts]);
    // Clear the textarea.
    setPostContent('');
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