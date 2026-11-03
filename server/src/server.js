const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const seedDemoData = require('./seed');

// Load environment variables
dotenv.config();

const app = express();

// Body parser middleware
app.use(express.json());
app.use(cors());

// Route files
const authRoutes = require('./routes/authRoutes');
const trainingRoutes = require('./routes/trainingRoutes');
const registrationRoutes = require('./routes/registrationRoutes');

// Health Check Route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Training Program Management Portal API is running',
    timestamp: new Date().toISOString()
  });
});

// Mount router modules
app.use('/api/auth', authRoutes);
app.use('/api/trainings', trainingRoutes);
app.use('/api/registrations', registrationRoutes);

// Centralized error handler middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Connect to MongoDB Atlas, seed demo data, and start server
const startServer = async () => {
  await connectDB();
  await seedDemoData();
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

if (process.env.NODE_ENV !== 'test') {
  startServer();
}

module.exports = app;
