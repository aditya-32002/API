const express = require('express');
const axios = require('axios');
const rateLimit = require('express-rate-limit');
const apicache = require('apicache');
const morgan = require('morgan');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();

const app = express();
const cache = apicache.middleware;
const port = process.env.PORT || 3000;

// Rate limiting (5 requests per minute per IP, configurable via env)
const limiter = rateLimit({
  windowMs: (process.env.RATE_LIMIT_WINDOW || 1) * 60 * 1000, // 1 minute window
  max: process.env.RATE_LIMIT_MAX || 5, // 5 requests per minute
  message: 'Too many requests, please try again later.',
  statusCode: 429,
  keyGenerator: (req) => req.ip,
  handler: (req, res, next, options) => {
    logRequest(req, res, 'Rate limit exceeded');
    res.status(options.statusCode).send(options.message);
  }
});

// Apply rate limiter to all requests
app.use(limiter);

// Logging middleware with morgan (logs timestamp, IP, etc.)
app.use(morgan(':date[iso] :remote-addr :method :url :status :res[content-length] - :response-time ms'));

// Cache duration (5 minutes default)
const cacheDuration = `${process.env.CACHE_DURATION || 5} minutes`;

// Simple API Key Authentication middleware
const authenticate = (req, res, next) => {
  const apiKey = process.env.API_KEY;
  const providedKey = req.headers['authorization'];

  if (!apiKey || providedKey === `Bearer ${apiKey}`) {
    return next();
  }
  res.status(401).send('Unauthorized');
};

// Proxy endpoint (for example, proxies to GitHub API)
app.get('/proxy', authenticate, cache(cacheDuration), async (req, res) => {
  const apiUrl = 'https://api.github.com'; // Replace with the public API of your choice

  try {
    const response = await axios.get(apiUrl);
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching data from external API:', error.message);
    res.status(500).send('Error fetching data from external API');
  }
});

// Error handler for unexpected server errors
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).send('Internal Server Error');
});

// Start the server
app.listen(port, () => {
  console.log(`API Proxy Server running on http://localhost:${port}`);
});
