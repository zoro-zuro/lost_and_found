const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? true : ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}));
app.use(express.json());

// Serve static files (uploads) - only in development
if (process.env.NODE_ENV !== 'production') {
  app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
}

// Security & Logging
const helmet = require('helmet');
const morgan = require('morgan');
app.use(helmet());
app.use(morgan('dev'));

// Rate limiting (basic)
const rateLimit = require('express-rate-limit');
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 100 
});
app.use('/api/', limiter);

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/lost', require('./routes/lost'));
app.use('/api/found', require('./routes/found'));
app.use('/api/interests', require('./routes/interests'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/comments', require('./routes/comments'));
app.use('/api/debug', require('./routes/debug'));

// Health check
app.get('/', (req, res) => res.send('API running'));

// Startup Check for Mail Configuration
if (!process.env.MAIL_USER || !process.env.MAIL_APP_PASSWORD) {
  console.warn('\x1b[33m%s\x1b[0m', '⚠️ WARNING: Mail environment variables (MAIL_USER, MAIL_APP_PASSWORD) are missing.');
  console.warn('\x1b[33m%s\x1b[0m', 'Email notifications will be disabled. Check your .env file.');
}

// Error handler
app.use(errorHandler);

// For Vercel serverless
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

// Export for Vercel serverless
module.exports = app;
