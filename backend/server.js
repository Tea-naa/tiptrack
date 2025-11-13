// =======================
// IMPORTS
// =======================
require('dotenv').config(); // MUST be first - loads .env variables
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const shiftsRoutes = require('./routes/shifts');
const authRoutes = require('./routes/auth');

const app = express();
const PORT = process.env.PORT || 5000;  // use PORT from .env, or 5000 as default

// ====================
// MIDDLEWARE
// ====================

// ✅ CORS - allows frontend to make requests to backend
// This single line replaces all the manual header setting!
app.use(cors());
// What it does:
// - Sets 'Access-Control-Allow-Origin: *' (allows all origins)
// - Handles preflight OPTIONS requests automatically
// - Sets all the necessary CORS headers

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// ====================
// DATABASE CONNECTION 
// ====================
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log(`✅ Connected to MongoDB successfully`);
  })
  .catch((error) => {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  });

// ====================
// ROUTES
// ====================
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'TipTrack API is running',
    timestamp: new Date().toISOString()
  });
});

app.use('/api/shifts', shiftsRoutes);
app.use('/api/auth', authRoutes);

app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// ====================
// ERROR HANDLER
// ====================
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    message: 'Internal server error',
    error: err.message
  });
});

// ====================
// START SERVER
// ====================
app.listen(PORT, () => {
  console.log(`🚀 TipTrack API server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`💰 API base URL: http://localhost:${PORT}/api/shifts`);
});

// ====================
// GRACEFUL SHUTDOWN
// ====================
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down gracefully...');
  await mongoose.connection.close();
  console.log('✅ MongoDB connection closed');
  process.exit(0);
});