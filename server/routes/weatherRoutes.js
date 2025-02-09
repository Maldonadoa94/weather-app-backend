const express = require('express');
const router = express.Router();
const weatherController = require('../controllers/weatherController');
const authenticateToken = require('../middlewares/authMiddleware');

//city search route
router.get('/weather/:city', authenticateToken, weatherController.fetchWeatherData);

//history route
router.get('/history', authenticateToken, weatherController.fetchSearchHistory);

//favorite routes
router.get('/favorites', authenticateToken, weatherController.getFavorites);
router.post('/favorites', authenticateToken, weatherController.addFavorite);
router.delete('/favorites/:city', authenticateToken, weatherController.removeFavorite);


module.exports = router;