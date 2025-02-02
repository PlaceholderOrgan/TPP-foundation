// Import necessary dependencies.
const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();

// Initialize the Express app.
const app = express();
const PORT = process.env.PORT || 5000;

// Apply middleware.
app.use(cors()); // Enable CORS for cross-origin requests.
app.use(express.json()); // Enable parsing of JSON bodies.

// Start the server.
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});

// Initialize SQLite database connection.
const db = new sqlite3.Database('./database/users.db', (err) => {
  if (err) {
    console.error("Error opening users.db:", err.message);
  } else {
    console.log("Connected to the SQLite database.");
    // Create the 'users' table if it does not exist.
    db.run(
      `CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE,
        email TEXT,
        password TEXT
      )`,
      (err) => {
        if (err) console.error("Error creating table:", err.message);
      }
    );
  }
});

// API endpoint for user registration.
app.post('/api/register', (req, res) => {
  const { username, email, password } = req.body;
  db.run(
    'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
    [username, email, password],
    function (err) {
      if (err) {
        console.error("Error inserting user:", err.message);
        // If error occurs (e.g., duplicate username), respond with an error.
        return res.status(500).json({ error: "Registration failed. The username might already be taken." });
      }
      // Respond with success message and the new user id.
      res.status(201).json({ message: "Registration successful", userId: this.lastID });
    }
  );
});

// API endpoint for user login.
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  db.get('SELECT * FROM users WHERE username = ?', [username], (err, user) => {
    if (err) {
      console.error("Error during login:", err.message);
      return res.status(500).json({ error: "Login failed" });
    }
    if (!user) {
      return res.status(400).json({ error: "User not found" });
    }
    // Check if the password matches.
    if (user.password === password) {
      return res.status(200).json({ message: "Login successful", userId: user.id });
    } else {
      return res.status(400).json({ error: "Incorrect password" });
    }
  });
});