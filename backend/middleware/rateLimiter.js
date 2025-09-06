// =====================================================
// RATE LIMITING MIDDLEWARE (middleware/rateLimiter.js)
// =====================================================

const { RateLimiterMemory } = require('rate-limiter-flexible');

// Different rate limits for different endpoints
const rateLimiters = {
  // General API rate limiter
  general: new RateLimiterMemory({
    keyPrefix: 'general',
    points: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
    duration: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900, // 15 minutes
  }),

  // Stricter rate limiting for AI endpoints
  ai: new RateLimiterMemory({
    keyPrefix: 'ai',
    points: 20, // 20 AI requests per 15 minutes
    duration: 900,
  }),

  // Auth endpoints
  auth: new RateLimiterMemory({
    keyPrefix: 'auth',
    points: 5, // 5 login attempts per 15 minutes
    duration: 900,
  })
};

const rateLimiter = async (req, res, next) => {
  try {
    const key = req.ip || req.connection.remoteAddress;
    let limiter = rateLimiters.general;

    // Choose appropriate rate limiter based on route
    if (req.path.startsWith('/api/ai')) {
      limiter = rateLimiters.ai;
    } else if (req.path.startsWith('/api/auth')) {
      limiter = rateLimiters.auth;
    }

    await limiter.consume(key);
    next();
  } catch (rejRes) {
    const msBeforeNext = rejRes.msBeforeNext || 1000;
    
    res.set('Retry-After', Math.round(msBeforeNext / 1000));
    res.status(429).json({
      error: 'Too many requests',
      retryAfter: Math.round(msBeforeNext / 1000)
    });
  }
};

module.exports = { rateLimiter, rateLimiters };

