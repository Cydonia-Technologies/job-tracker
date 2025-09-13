// =====================================================
// BACKEND API SETUP - Complete Node.js/Express Server
// =====================================================

// =====================================================
// PROJECT STRUCTURE SETUP
// =====================================================
/*
job-tracker-backend/
├── package.json
├── .env
├── .env.example
├── server.js
├── config/
│   ├── database.js
│   └── auth.js
├── middleware/
│   ├── auth.js
│   ├── validation.js
│   └── errorHandler.js
├── routes/
│   ├── auth.js
│   ├── jobs.js
│   ├── applications.js
│   ├── users.js
│   └── ai.js
├── services/
│   ├── aiService.js
│   ├── jobExtractor.js
│   └── emailService.js
└── utils/
    ├── logger.js
    └── helpers.js
*/

// =====================================================
// 2. ENVIRONMENT VARIABLES (.env.example)
// =====================================================
/*
# Server Configuration
PORT=3001
NODE_ENV=development

# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# AI Configuration
GEMINI_API_KEY=your-gemini-api-key
OPENAI_API_KEY=your-openai-api-key

# CORS Configuration
FRONTEND_URL=http://localhost:3000
EXTENSION_ID=your-chrome-extension-id

# Security
JWT_SECRET=your-super-secret-jwt-key
BCRYPT_ROUNDS=12

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
*/

// =====================================================
// 3. MAIN SERVER FILE (server.js)
// =====================================================

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const { errorHandler } = require('./middleware/errorHandler');
const { rateLimiter } = require('./middleware/rateLimiter');

// Import routes
const globalRoutes = require('./routes/global');
const authRoutes = require('./routes/auth');
const jobRoutes = require('./routes/jobs');
const applicationRoutes = require('./routes/applications');
const userRoutes = require('./routes/users');
const aiRoutes = require('./routes/ai');

const app = express();
const PORT = process.env.PORT || 3001;
// =====================================================
// MIDDLEWARE SETUP
// =====================================================

// Use global routes
app.use('/api/global', globalRoutes);

// Security middleware
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// CORS configuration for extension and web app
app.use(cors({
  origin: [
    process.env.FRONTEND_URL,
    'https://job-tracker-weld-three.vercel.app',
    'https://job-tracker-a328d75pp-efekaralars-projects.vercel.app', // Add this
    'http://localhost:3000',
    `chrome-extension://${process.env.EXTENSION_ID}`
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Logging
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('combined'));
}

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
app.use('/api/', rateLimiter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// =====================================================
// API ROUTES
// =====================================================

app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/users', userRoutes);
app.use('/api/ai', aiRoutes);

// Catch 404 errors
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Global error handler
app.use(errorHandler);

// Start server
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/health`);
  });
}

module.exports = app;

