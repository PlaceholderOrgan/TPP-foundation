import React, { useState } from 'react';
import "../styles/login.css";

const LoginPopup = ({ onClose, onLoginSuccess }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const overlayStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  };

  const modalStyle = {
    backgroundColor: '#fff',
    padding: '20px',
    borderRadius: '8px',
    width: '300px',
    textAlign: 'center',
    animation: 'fadeInMove 0.5s',
  };

  const baseUrl = 'http://spackcloud.duckdns.org:3000/api';

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${baseUrl}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await response.json();
      if (response.ok) {
        alert('Login successful');
        localStorage.setItem('authToken', data.token);
        if (onLoginSuccess) onLoginSuccess();
        window.location.reload();
      } else {
        alert(data.error || 'Invalid credentials');
      }
    } catch (err) {
      console.error(err);
      alert('Login failed');
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
      const data = await response.json();
      
      // Debug logging
      console.log('Registration Response:', {
        status: response.status,
        statusText: response.statusText,
        data: data
      });

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

        // Debug logging
        console.log('Login Response:', {
          status: loginResponse.status,
          statusText: loginResponse.statusText,
          data: loginData
        });

        if (loginResponse.ok) {
          localStorage.setItem('authToken', loginData.token);
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
    <div style={overlayStyle} className="login-overlay" onClick={onClose}>
      <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
        {!isRegister ? (
          <>
            <h2>Login</h2>
            <form onSubmit={handleLoginSubmit}>
              <div>
                <input
                  type="text"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  style={{ width: '100%', margin: '10px 0', padding: '8px' }}
                  required
                />
              </div>
              <div>
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ width: '100%', margin: '10px 0', padding: '8px' }}
                  required
                />
              </div>
              <button type="submit" style={{ padding: '8px 16px', marginRight: '10px' }}>
                Submit
              </button>
              <button type="button" onClick={onClose} style={{ padding: '8px 16px' }}>
                Cancel
              </button>
            </form>
            <p style={{ marginTop: '15px' }}>
              Don't have an account?{' '}
              <a href="#" onClick={() => setIsRegister(true)}>
                Register
              </a>
            </p>
          </>
        ) : (
          <>
            <h2>Register</h2>
            <form onSubmit={handleRegisterSubmit}>
              <div>
                <input
                  type="text"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  style={{ width: '100%', margin: '10px 0', padding: '8px' }}
                  required
                />
              </div>
              <div>
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ width: '100%', margin: '10px 0', padding: '8px' }}
                  required
                />
              </div>
              <div>
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ width: '100%', margin: '10px 0', padding: '8px' }}
                  required
                />
              </div>
              <div>
                <input
                  type="password"
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  style={{ width: '100%', margin: '10px 0', padding: '8px' }}
                  required
                />
              </div>
              <button type="submit" style={{ padding: '8px 16px', marginRight: '10px' }}>
                Register
              </button>
              <button type="button" onClick={onClose} style={{ padding: '8px 16px' }}>
                Cancel
              </button>
            </form>
            <p style={{ marginTop: '15px' }}>
              Already have an account?{' '}
              <a href="#" onClick={() => setIsRegister(false)}>
                Back to Login
              </a>
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default LoginPopup;