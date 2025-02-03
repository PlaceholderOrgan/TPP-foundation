import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import '../styles/adminDash.css';

const AdminDash = () => {
  const [users, setUsers] = useState([]);
  const [forumPosts, setForumPosts] = useState([]);
  const [view, setView] = useState('users'); // 'users' or 'forum'
  const navigate = useNavigate();
  const [loggedUserId, setLoggedUserId] = useState(null);

  // Choose base URL based on current hostname. Priority is localhost.
  const baseUrl = window.location.hostname === 'localhost'
    ? 'http://localhost:5000'
    : 'http://spackcloud.duckdns.org:5000';

  // Check if the logged in user is admin and store their id.
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

  // Fetch users for User Management.
  const fetchUsers = async () => {
    try {
      const res = await fetch(`${baseUrl}/api/users`, { credentials: 'include' });
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  };

  // Fetch forum posts for Forum Management.
  const fetchForumPosts = async () => {
    try {
      const res = await fetch(`${baseUrl}/api/posts`);
      const data = await res.json();
      // Assuming posts have "pinned" and "locked" properties.
      // Sort posts so that pinned posts appear first.
      data.sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));
      setForumPosts(data);
    } catch (err) {
      console.error('Error fetching forum posts:', err);
    }
  };

  // Fetch users or forum posts depending on the current view.
  useEffect(() => {
    if (view === 'users') {
      fetchUsers();
    } else if (view === 'forum') {
      fetchForumPosts();
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

  // Forum management actions

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

  return (
    <div className="admin-dash">
      <h2>Admin Dashboard</h2>
      <div className="toggle-buttons" style={{ marginBottom: '1rem', textAlign: 'center' }}>
        <button onClick={() => setView('users')} disabled={view === 'users'} style={{ marginRight: '1rem' }}>
          User Management
        </button>
        <button onClick={() => setView('forum')} disabled={view === 'forum'}>
          Forum Management
        </button>
      </div>

      {view === 'users' && (
        <div>
          <h2>User Management</h2>
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
              {users.map(user => (
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
                      <option value="normal">Normal</option>
                      <option value="admin">Admin</option>
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
        </div>
      )}

      {view === 'forum' && (
        <div>
          <h2>Forum Management</h2>
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
              {forumPosts.map(post => (
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
    </div>
  );
};

export default AdminDash;