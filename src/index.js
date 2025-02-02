// Entry point for the React application.
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './components/App';
// Import global styles.
import './styles/styles.css';

// Create a React root and render the App component.
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);