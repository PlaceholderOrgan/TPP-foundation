import React, { useState } from 'react';
import '../styles/forum.css';

function Forum() {
  const [posts, setPosts] = useState([]);
  const [postContent, setPostContent] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (postContent.trim() === '') return;
    const newPost = {
      id: Date.now(),
      content: postContent.trim(),
      timestamp: new Date().toLocaleString(),
    };
    setPosts([newPost, ...posts]);
    setPostContent('');
  };

  return (
    <div className="forum-page">
      <h2>Forum</h2>
      <form onSubmit={handleSubmit} className="post-form">
        <textarea
          placeholder="Write your post..."
          value={postContent}
          onChange={(e) => setPostContent(e.target.value)}
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