const express = require('express');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const morgan = require('morgan');

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(helmet()); // Security headers
app.use(cors());
app.use(express.json());
app.use(morgan('combined')); // Logging

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Service URLs from environment variables
const PRODUCT_SERVICE_URL = process.env.PRODUCT_SERVICE_URL || 'http://localhost:4001';
const ORDER_SERVICE_URL = process.env.ORDER_SERVICE_URL || 'http://localhost:4002';
const USER_SERVICE_URL = process.env.USER_SERVICE_URL || 'http://localhost:4003';

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) {
    return res.sendStatus(401);
  }

  // Verify token with User Service
  fetch(`${USER_SERVICE_URL}/api/auth/verify`, {
    headers: { 'Authorization': `Bearer ${token}` }
  })
    .then(response => {
      if (response.ok) {
        next();
      } else {
        res.sendStatus(403);
      }
    })
    .catch(error => {
      console.error('Auth Error:', error);
      res.sendStatus(500);
    });
};

// Proxy middleware options
const options = {
  changeOrigin: true,
  pathRewrite: {
    '^/api/products': '/api',
    '^/api/orders': '/api',
    '^/api/users': '/api'
  }
};

// Proxy routes
app.use('/api/products', createProxyMiddleware({
  ...options,
  target: PRODUCT_SERVICE_URL
}));

app.use('/api/orders', authenticateToken, createProxyMiddleware({
  ...options,
  target: ORDER_SERVICE_URL
}));

app.use('/api/users', createProxyMiddleware({
  ...options,
  target: USER_SERVICE_URL
}));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`API Gateway running on port ${PORT}`);
}); 