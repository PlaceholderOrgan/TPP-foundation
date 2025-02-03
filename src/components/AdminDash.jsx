import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import '../styles/adminDash.css';

const AdminDash = () => {
  const [users, setUsers] = useState([]);
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

  const fetchUsers = async () => {
    try {
      const res = await fetch(`${baseUrl}/api/users`, { credentials: 'include' });
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleStatusChange = async (id, newStatus) => {
    // Prevent user from changing their own role.
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
    // Prevent user from banning themselves.
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

  return (
    <div className="admin-dash">
      <h2>Admin Dashboard - User Management</h2>
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
  );
};

export default AdminDash;