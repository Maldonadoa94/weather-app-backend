const db = require('../db');
const bcrypt = require('bcryptjs');

async function createUser(firstName, lastName, username, email, password) {
    const hashedPassword = await bcrypt.hash(password, 10);

    const query = `
        INSERT INTO users (first_name, last_name, username, email, password_hash)
        VALUES ($1, $2, $3, $4, $5) RETURNING id, username, email;
    `;

    const values = [firstName, lastName, username, email, hashedPassword];

    const result = await db.query(query, values);
    return result.rows[0]; // Return created user
}

module.exports = { createUser };