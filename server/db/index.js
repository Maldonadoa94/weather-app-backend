const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config();  // load the environment variables from .env

//Initialize database
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: true, // Required for Supabase connection
});

// Test connection
pool.connect()
  .then(() => console.log('Connected to PostgreSQL'))
  .catch((err) => console.error('Connection error', err.stack));

module.exports = pool;