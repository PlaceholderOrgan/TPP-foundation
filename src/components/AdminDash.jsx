import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import '../styles/adminDash.css';

const AdminDash = () => {
  const [users, setUsers] = useState([]);
  const [forumPosts, setForumPosts] = useState([]);
  const [articles, setArticles] = useState([]);
  const [view, setView] = useState('users'); // 'users', 'forum' or 'articles'
  const [searchTerm, setSearchTerm] = useState('');
  const [forumSearchTerm, setForumSearchTerm] = useState('');
  const [articleSearchTerm, setArticleSearchTerm] = useState('');
  const navigate = useNavigate();
  const [loggedUserId, setLoggedUserId] = useState(null);
  // NEW: state for statuses and new status input
  const [statuses, setStatuses] = useState(["normal", "writer", "admin"]);
  const [newStatus, setNewStatus] = useState('');

  const baseUrl = window.location.hostname === 'localhost'
    ? 'http://localhost:5000'
    : 'http://spackcloud.duckdns.org:5000';

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      navigate('/');
      return;
    }
    try {
      const user = jwtDecode(token);
      if (user.status !== 'admin') {
        navigate('/');
      } else {
        setLoggedUserId(user.userId);
      }
    } catch (err) {
      console.error('Invalid token.');
      navigate('/');
    }
  }, [navigate]);

  const fetchUsers = async () => {
    try {
      const res = await fetch(`${baseUrl}/api/users`, { credentials: 'include' });
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  };

  const fetchForumPosts = async () => {
    try {
      const res = await fetch(`${baseUrl}/api/posts`);
      const data = await res.json();
      data.sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));
      setForumPosts(data);
    } catch (err) {
      console.error('Error fetching forum posts:', err);
    }
  };

  // NEW: fetch articles for Article Management.
  const fetchArticles = async () => {
    try {
      const res = await fetch(`${baseUrl}/api/articles`);
      const data = await res.json();
      setArticles(data);
    } catch (err) {
      console.error('Error fetching articles:', err);
    }
  };

  useEffect(() => {
    if (view === 'users') {
      fetchUsers();
    } else if (view === 'forum') {
      fetchForumPosts();
    } else if (view === 'articles') {
      fetchArticles();
    }
  }, [view]);

  const handleStatusChange = async (id, newStatus) => {
    if (id === loggedUserId) return;
    try {
      const res = await fetch(`${baseUrl}/api/users/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (!res.ok) {
        console.error('Error updating status');
      } else {
        fetchUsers();
      }
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  const handleBan = async (id) => {
    if (id === loggedUserId) return;
    if (!window.confirm('Are you sure you want to ban this user?')) return;
    try {
      const res = await fetch(`${baseUrl}/api/users/${id}/ban`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      });
      if (!res.ok) {
        console.error('Error banning user');
      } else {
        fetchUsers();
      }
    } catch (err) {
      console.error('Error banning user:', err);
    }
  };

  const handleAddStatus = (e) => {
    e.preventDefault();
    const statusToAdd = newStatus.trim().toLowerCase();
    if (!statusToAdd) return;
    if (statuses.includes(statusToAdd)) {
      alert('Status already exists.');
      return;
    }
    setStatuses([...statuses, statusToAdd]);
    setNewStatus('');
  };

  const handlePinToggle = async (postId, currentStatus) => {
    try {
      const res = await fetch(`${baseUrl}/api/posts/${postId}/pin`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pinned: !currentStatus })
      });
      if (!res.ok) {
        console.error('Error toggling pin');
      } else {
        fetchForumPosts();
      }
    } catch (err) {
      console.error('Error toggling pin:', err);
    }
  };

  const handleLockToggle = async (postId, currentStatus) => {
    try {
      const res = await fetch(`${baseUrl}/api/posts/${postId}/lock`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ locked: !currentStatus })
      });
      if (!res.ok) {
        console.error('Error toggling lock');
      } else {
        fetchForumPosts();
      }
    } catch (err) {
      console.error('Error toggling lock:', err);
    }
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    try {
      const res = await fetch(`${baseUrl}/api/posts/${postId}`, {
        method: 'DELETE'
      });
      if (!res.ok) {
        console.error('Error deleting post');
      } else {
        fetchForumPosts();
      }
    } catch (err) {
      console.error('Error deleting post:', err);
    }
  };

  // NEW: delete an article
  const handleDeleteArticle = async (articleId) => {
    if (!window.confirm('Are you sure you want to delete this article?')) return;
    try {
      const res = await fetch(`${baseUrl}/api/articles/${articleId}`, {
        method: 'DELETE'
      });
      if (!res.ok) {
        console.error('Error deleting article');
      } else {
        fetchArticles();
      }
    } catch (err) {
      console.error('Error deleting article:', err);
    }
  };

  const filteredUsers = users.filter(user => 
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
    user.id.toString().includes(searchTerm)
  );

  const filteredForumPosts = forumPosts.filter(post => 
    post.title.toLowerCase().includes(forumSearchTerm.toLowerCase()) ||
    post.id.toString().includes(forumSearchTerm)
  );

  // NEW: filter articles based on search term by ID or Title.
  const filteredArticles = articles.filter(article =>
    article.title.toLowerCase().includes(articleSearchTerm.toLowerCase()) ||
    article.id.toString().includes(articleSearchTerm)
  );

  return (
    <div className="admin-dash">
      <h2>Admin Dashboard</h2>
      <div className="toggle-buttons" style={{ marginBottom: '1rem', textAlign: 'center' }}>
        <button onClick={() => setView('users')} disabled={view === 'users'} style={{ marginRight: '1rem' }}>
          User Management
        </button>
        <button onClick={() => setView('forum')} disabled={view === 'forum'} style={{ marginRight: '1rem' }}>
          Forum Management
        </button>
        <button onClick={() => setView('articles')} disabled={view === 'articles'}>
          Articles Management
        </button>
      </div>

      {view === 'users' && (
        <div>
          <h2>User Management</h2>
          <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
            <input
              type="text"
              placeholder="Search by username, email or ID"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ padding: '0.5rem', width: '80%', maxWidth: '400px' }}
            />
          </div>
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Username</th>
                <th>Email</th>
                <th>Status</th>
                <th>Change Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(user => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>{user.username}</td>
                  <td>{user.email}</td>
                  <td>{user.status}</td>
                  <td>
                    <select 
                      value={user.status} 
                      onChange={(e) => handleStatusChange(user.id, e.target.value)}
                      disabled={user.id === loggedUserId}
                    >
                      {statuses.map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <button 
                      onClick={() => handleBan(user.id)}
                      disabled={user.id === loggedUserId}
                    >
                      Ban
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ marginTop: '2rem', textAlign: 'center' }}>
            <h3>Create New Status</h3>
            <form onSubmit={handleAddStatus}>
              <input
                type="text"
                placeholder="Enter new status"
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                style={{ padding: '0.5rem', width: '200px', marginRight: '0.5rem' }}
              />
              <button type="submit">Add Status</button>
            </form>
            {statuses.length > 0 && (
              <div style={{ marginTop: '1rem' }}>
                <strong>Available statuses:</strong> {statuses.join(', ')}
              </div>
            )}
          </div>
        </div>
      )}

      {view === 'forum' && (
        <div>
          <h2>Forum Management</h2>
          <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
            <input
              type="text"
              placeholder="Search by post title or ID"
              value={forumSearchTerm}
              onChange={(e) => setForumSearchTerm(e.target.value)}
              style={{ padding: '0.5rem', width: '80%', maxWidth: '400px' }}
            />
          </div>
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Title</th>
                <th>Timestamp</th>
                <th>Pinned</th>
                <th>Locked</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredForumPosts.map(post => (
                <tr key={post.id}>
                  <td>{post.id}</td>
                  <td>{post.title}</td>
                  <td>{post.timestamp}</td>
                  <td>{post.pinned ? 'Yes' : 'No'}</td>
                  <td>{post.locked ? 'Yes' : 'No'}</td>
                  <td>
                    <button onClick={() => handlePinToggle(post.id, post.pinned)}>
                      {post.pinned ? 'Unpin' : 'Pin'}
                    </button>
                    <button onClick={() => handleLockToggle(post.id, post.locked)} style={{ marginLeft: '0.5rem' }}>
                      {post.locked ? 'Unlock' : 'Lock'}
                    </button>
                    <button onClick={() => handleDeletePost(post.id)} style={{ marginLeft: '0.5rem' }}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {view === 'articles' && (
        <div>
          <h2>Articles Management</h2>
          <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
            <input
              type="text"
              placeholder="Search by article title or ID"
              value={articleSearchTerm}
              onChange={(e) => setArticleSearchTerm(e.target.value)}
              style={{ padding: '0.5rem', width: '80%', maxWidth: '400px' }}
            />
          </div>
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Title</th>
                <th>Description</th>
                <th>Author</th>
                <th>Timestamp</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredArticles.map(article => (
                <tr key={article.id}>
                  <td>{article.id}</td>
                  <td>{article.title}</td>
                  <td>{article.description}</td>
                  <td>{article.author}</td>
                  <td>{article.timestamp}</td>
                  <td>
                    <button onClick={() => handleDeleteArticle(article.id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminDash;