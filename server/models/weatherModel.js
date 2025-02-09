const { query } = require('express');
const pool = require('../db');

// Save search history
const saveSearchHistory = async (city, userId) => {
    const query = `INSERT INTO weather_search_history (city_name, searched_at, user_id) VALUES ($1, NOW(), $2)`;
    try {
      console.log(`Inserting into database: ${city}`);  //Debugging searches being saved 3 times
      await pool.query(query, [city, userId]);
      return true;
    } catch (err) {
      console.error('Error saving search history:', err);
      return false;
    }
  };
  
  // Get search history
  const getSearchHistory = async (userId) => {
    try {
      const result = await pool.query(
        `SELECT city_name, searched_at FROM weather_search_history WHERE user_id = $1 ORDER BY searched_at DESC LIMIT 10`,
        [userId]
      );
      return result.rows;
    } catch (err) {
      console.error('Error retrieving search history:', err);
      return [];
    }
  };

  // Add a city to favorites
  const addFavorite = async (city, userId) => {
    try {
        const query = `
            INSERT INTO weather_favorites (city_name, user_id) 
            VALUES ($1, $2) 
            ON CONFLICT (city_name, user_id) DO NOTHING 
            RETURNING *;
        `;
        const { rows } = await pool.query(query, [city, userId]);

        if (!rows.length) {
          console.log(`City ${city} is already in favorites for user ${userId}`);
        }

        return rows[0] || null; // Return the inserted row if added, null if already exists
    } catch (error) {
        console.error('Error adding favorite:', error);
        throw error;
    }
};

// Remove a city from favorites
const removeFavorite = async (city, userId) => {
    try {
        const query = `DELETE FROM weather_favorites WHERE city_name = $1 AND user_id = $2 RETURNING *;`;
        const { rows } = await pool.query(query, [city, userId]);
        return rows[0] || null;
    } catch (error) {
        console.error('Error removing favorite:', error);
        throw error;
    }
};

// Fetch all favorite cities
const getFavorites = async (userId) => {
    try {
        const query = `SELECT city_name, added_at FROM weather_favorites WHERE user_id = $1 ORDER BY added_at DESC;`;
        const { rows } = await pool.query(query, [userId]);
        return rows;
    } catch (error) {
        console.error('Error fetching favorites:', error);
        throw error;
    }
};
  
  module.exports = { saveSearchHistory, getSearchHistory, addFavorite, removeFavorite, getFavorites };
  