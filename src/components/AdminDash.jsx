import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import jwt_decode from 'jwt-decode';
import '../styles/adminDash.css';

const AdminDash = () => {
  const [users, setUsers] = useState([]);
  const navigate = useNavigate();

  // Choose base URL based on current hostname. Priority is localhost.
  const baseUrl = window.location.hostname === 'localhost'
    ? 'http://localhost:5000'
    : 'http://spackcloud.duckdns.org:5000';

  // Check if the logged in user is admin.
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      navigate('/');
      return;
    }
    try {
      const user = jwt_decode(token);
      if (user.status !== 'admin') {
        navigate('/');
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
                <select value={user.status} onChange={(e) => handleStatusChange(user.id, e.target.value)}>
                  <option value="normal">Normal</option>
                  <option value="admin">Admin</option>
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminDash;