import React, { useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import "../styles/login.css";

const LoginPopup = ({ onClose, onLoginSuccess }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Choose base URL based on current hostname. Priority is localhost.
  const baseUrl = window.location.hostname === 'localhost'
    ? 'http://localhost:5000/api/users'
    : 'http://spackcloud.duckdns.org:5000/api/users';

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${baseUrl}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ username, password }),
      });
      const data = await response.json();

      if (response.ok) {
        // Decode the token to extract user details and save them to localStorage
        const decoded = jwtDecode(data.token);
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('userId', decoded.userId);
        localStorage.setItem('username', decoded.username);
        localStorage.setItem('isLoggedIn', 'true');
        onLoginSuccess && onLoginSuccess(data.token);
        window.location.reload();
      } else {
        alert(`Login failed: ${data.error || 'Unknown error'}`);
      }
    } catch (err) {
      console.error('Login error:', err);
      alert(`Login failed: ${err.message}`);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    try {
      const response = await fetch(`${baseUrl}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ username, email, password }),
      });

      const rawResponse = await response.text();
      console.log('Raw server response:', rawResponse);

      let data;
      try {
        data = JSON.parse(rawResponse);
      } catch (e) {
        console.error('Server returned non-JSON response:', rawResponse);
        alert('Server error: Invalid response format');
        return;
      }

      if (response.ok) {
        alert('Registration successful');
        const loginResponse = await fetch(`${baseUrl}/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({ username, password }),
        });
        const loginData = await loginResponse.json();

        console.log('Login Response:', {
          status: loginResponse.status,
          statusText: loginResponse.statusText,
          data: loginData
        });

        if (loginResponse.ok) {
          localStorage.setItem('authToken', loginData.token);
          localStorage.setItem('isLoggedIn', 'true');
          if (onLoginSuccess) onLoginSuccess();
          window.location.reload();
        } else {
          alert(`Login failed: ${loginData.error || 'Unknown error'}`);
        }
      } else {
        alert(`Registration failed: ${data.error || 'Unknown error'}`);
      }
    } catch (err) {
      console.error('Registration error:', err);
      alert(`Registration failed: ${err.message}`);
    }
  };

  return (
    <div className="login-overlay" onClick={onClose}>
      <div className="login-modal" onClick={(e) => e.stopPropagation()}>
        {!isRegister ? (
          <div className="login-form">
            <h2>Login</h2>
            <form onSubmit={handleLoginSubmit}>
              <div className="login-user">
                <input
                  type="text"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  minLength="3"
                  maxLength="24"
                />
              </div>
              <div className="login-pass">
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <button type="submit" className="login-submit">
                Submit
              </button>
              <button type="button" className="login-cancel" onClick={onClose}>
                Cancel
              </button>
            </form>
            <p>
              Don't have an account? &nbsp;
              <a href="#" onClick={() => setIsRegister(true)}>
                Register
              </a>
            </p>
          </div>
        ) : (
          <div className="register-form">
            <h2>Register</h2>
            <form onSubmit={handleRegisterSubmit}>
              <div>
                <input
                  type="text"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  minLength="3"
                  maxLength="24"
                />
              </div>
              <div>
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div>
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <div>
                <input
                  type="password"
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
              <button type="submit">
                Register
              </button>
              <button type="button" onClick={onClose}>
                Cancel
              </button>
            </form>
            <p>
              Already have an account? &nbsp;
              <a href="#" onClick={() => setIsRegister(false)}>
                Back to Login
              </a>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginPopup;