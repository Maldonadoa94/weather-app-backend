const pool = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const { createUser } = require('../models/userModel');

// Create a new User from User Model after signing up
async function signup(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { firstName, lastName, username, email, password } = req.body;

    try {
        // Check if username or email already exists
        const existingUser = await pool.query(
            'SELECT * FROM users WHERE username = $1 OR email = $2',
            [username, email]
        );

        if (existingUser.rows.length > 0) {
            return res.status(400).json({ error: 'Username or email already exists. Please try another.' });
        }

        // Ensure password meets length requirement
        if (password.length < 6) {
            return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
        }


        //create new user
        const newUser = await createUser(firstName, lastName, username, email, password);
        res.status(201).json({ message: 'User created successfully', user: newUser });
    } catch (error) {
        console.error('Error in signup:', error);
        res.status(500).json({ error: 'An unexpected error occurred. Please try again later.' });
    }
}

const login = async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { username, password } = req.body;

    try {
        // Check if user exists
        const userQuery = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
        if (userQuery.rows.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const user = userQuery.rows[0];

        if (!user) {
            return res.status(400).json({ error: 'Invalid username or password' });
        }

        // Ensure password exists before comparing
        if (!user.password_hash) {
            return res.status(500).json({ error: 'User password is missing in the database' });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Generate JWT token
        const token = jwt.sign(
            { userId: user.id, username: user.username },
            process.env.JWT_SECRET, 
            { expiresIn: '1h' } 
        );

        res.json({ token, username: user.username });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ error: 'Server error' });
    }
};

module.exports = { signup, login };