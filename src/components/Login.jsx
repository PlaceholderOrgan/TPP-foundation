// LoginPopup component for logging in or registering a user.
import React, { useState } from 'react';
import "../styles/login.css";

const LoginPopup = ({ onClose, onLoginSuccess }) => {
  // State to toggle between login and register forms.
  const [isRegister, setIsRegister] = useState(false);
  // Input states.
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Style objects for overlay and modal.
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
    animation: 'fadeInMove 0.5s', // Animation defined in CSS.
  };

  // Handle login form submission.
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await response.json();
      if (response.ok) {
        alert('Login successful');
        if (onLoginSuccess) onLoginSuccess();
      } else {
        alert(data.error || 'Invalid credentials');
      }
    } catch (err) {
      console.error(err);
      alert('Login failed');
    }
  };

  // Handle register form submission.
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    // Check if passwords match.
    if (password !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password }),
      });
      const data = await response.json();
      if (response.ok) {
        alert('Registration successful');
        // Reset form fields.
        setUsername('');
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        setIsRegister(false);
      } else {
        alert(data.error || 'Registration failed');
      }
    } catch (err) {
      console.error(err);
      alert('Registration failed');
    }
  };

  return (
    // Clicking the overlay will close the popup.
    <div style={overlayStyle} className="login-overlay" onClick={onClose}>
      <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
        {!isRegister ? (
          <>
            <h2>Login</h2>
            <form onSubmit={handleLoginSubmit}>
              <div>
                {/* Input for username */}
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
                {/* Input for password */}
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
            {/* Toggle to registration mode */}
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
            {/* Toggle back to login mode */}
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