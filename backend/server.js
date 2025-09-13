const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();
const { initializeDatabase, seedInitialData } = require('./database/db');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:5175',
    process.env.FRONTEND_URL,
    process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null,
    process.env.CUSTOM_DOMAIN ? `https://${process.env.CUSTOM_DOMAIN}` : null
  ].filter(Boolean),
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Import routes
const articlesRoutes = require('./routes/articles');
const stocksRoutes = require('./routes/stocks');
const indicatorsRoutes = require('./routes/indicators');
const booksRoutes = require('./routes/books');
const authRoutes = require('./routes/auth');

// Use routes
app.use('/api/articles', articlesRoutes);
app.use('/api/stocks', stocksRoutes);
app.use('/api/indicators', indicatorsRoutes);
app.use('/api/books', booksRoutes);
app.use('/api/auth', authRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Research Portfolio API is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Initialize database and start server
async function startServer() {
  try {
    console.log('🚀 Initializing Research Portfolio API...');
    await initializeDatabase();
    await seedInitialData();
    
    app.listen(PORT, () => {
      console.log(`🚀 Research Portfolio API running on port ${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
      console.log(`🔐 Admin login: POST http://localhost:${PORT}/api/auth/login`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
