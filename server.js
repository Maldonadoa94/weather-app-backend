const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const weatherRoutes = require('./server/routes/weatherRoutes');
const authRoutes = require('./server/routes/authRoutes');


dotenv.config();

const app = express();
const PORT = process.env.PORT || 10000;


const corsOptions = {
  origin: "https://weather-app-frontend-lx9k.onrender.com", // Allow frontend origin
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true, // Allow cookies, authorization headers, etc.
};

app.use(cors(corsOptions));

app.use(bodyParser.json());
app.use('/api', weatherRoutes); 
app.use('/api/auth', authRoutes);


app.get('/', (req, res) => {
  res.send('Weather app backend is running');
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});