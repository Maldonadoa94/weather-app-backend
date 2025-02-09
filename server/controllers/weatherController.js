const pool = require('../db');
const axios = require('axios');
const weatherModel = require('../models/weatherModel');

const API_KEY = process.env.REACT_APP_OPENWEATHER_API_KEY;
const BASE_URL = 'https://api.openweathermap.org/data/2.5/';

//Call api to fetch weather and forecast information
const fetchWeatherData = async (req, res) => {
  const { city } = req.params;

  console.log(`Received request to fetch weather for: ${city}`); //debugging step

  if (!city) {
    return res.status(400).json({ error: 'City is required'});
  }
  
  try {
    const weatherResponse = await axios.get(`${BASE_URL}weather`, {
      params: { q: city, units: 'metric', appid: API_KEY },
    });

    const forecastResponse = await axios.get(`${BASE_URL}forecast`, {
      params: { q: city, units: 'metric', appid: API_KEY },
    });


    const userId = req.user?.userId;  //Extract user ID from jwt
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const saved = await weatherModel.saveSearchHistory(city, userId);  //store search history into a variable for debugging
    if (saved) {
      console.log(`Search saved for city: ${city}`);
    } else {
      console.log(`Failed to save search for city: ${city}`);
    }

    res.json({
      current: weatherResponse.data,        // Weather data
      forecast: forecastResponse.data.list, // Hourly forecast
    });
  } catch (err) {
    console.error('Error fetching weather data', err);
    res.status(500).json({ error: 'Failed to fetch weather data' });
  }
};


//fetch search history
const fetchSearchHistory = async (req, res) => {
  try {
    const userId = req.user?.userId; // Extract user ID from jwt
    if (!userId) return res.status(401).json({ error: "Unauthorized" });
    
    const history = await weatherModel.getSearchHistory(userId);
    res.json(history);
  } catch (err) {
    res.status(500).json({ err: 'Failed to fetch search history' });
  }
};

// adding a favorite
const addFavorite = async (req, res) => {
  const { city } = req.body;
  if (!city) return res.status(400).json({ error: 'City name is required' });

  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });
    
    const favorite = await weatherModel.addFavorite(city, userId);
    if (favorite) {
        return res.status(201).json({ message: `Added ${city} to favorites` });
    } else {
        return res.status(200).json({ message: `${city} is already in favorites` });
    }
  } catch (error) {
      return res.status(500).json({ error: 'Error adding favorite' });
  }
};

// removing a favorite
const removeFavorite = async (req, res) => {
  const { city } = req.params;
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });  
      
    const removed = await weatherModel.removeFavorite(city, userId);
    if (removed) {
        return res.json({ message: `Removed ${city} from favorites` });
    } else {
        return res.status(404).json({ error: `City not found in favorites` });
    }
  } catch (error) {
      return res.status(500).json({ error: 'Error removing favorite' });
  }
};

// fetch all favorites
const getFavorites = async (req, res) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });  
    
    const favorites = await weatherModel.getFavorites(userId);
    return res.json(favorites);
  } catch (error) {
      return res.status(500).json({ error: 'Error fetching favorites' });
  }
};


module.exports = { fetchWeatherData, fetchSearchHistory, addFavorite, removeFavorite, getFavorites };
