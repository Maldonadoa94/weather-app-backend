const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config();  // load the environment variables from .env

//Initialize database
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
      rejectUnauthorized: false
  },
  keepAlive: true,  // Keeps the connection alive
  connectionTimeoutMillis: 5000,  // Timeout after 5 seconds if unable to connect
});

// Test connection
pool.connect()
  .then(() => console.log('Connected to PostgreSQL'))
  .catch((err) => console.error('Connection error', err.stack));

module.exports = pool;