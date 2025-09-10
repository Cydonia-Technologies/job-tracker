# JobTracker Backend API

AI-powered job application tracking system with resume grading, job matching, and application management.

## 🚀 Quick Start

```bash
# Clone and setup
cd backend
npm install

# Setup environment variables
cp .env.example .env
# Edit .env with your credentials

# Start development server
npm run dev

# Test API health
curl http://localhost:3001/health
```

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/
│   │   └── database.js          # Supabase client configuration
│   ├── middleware/
│   │   ├── auth.js              # JWT authentication middleware
│   │   ├── errorHandler.js      # Global error handling
│   │   ├── rateLimiter.js       # API rate limiting
│   │   └── validation.js        # Request validation schemas
│   ├── routes/
│   │   ├── ai.js                # AI analysis endpoints
│   │   ├── applications.js      # Job application CRUD
│   │   ├── auth.js              # Authentication routes
│   │   ├── jobs.js              # Job posting CRUD
│   │   └── users.js             # User profile management
│   ├── services/
│   │   └── aiService.js         # Google Gemini AI integration
│   ├── prompts/
│   │   ├── resume-grading.txt   # AI prompt templates
│   │   ├── job-matching.txt
│   │   ├── resume-optimization.txt
│   │   └── company-research.txt
│   ├── utils/
│   └── server.js                # Express app entry point
├── package.json
├── Procfile                     # Heroku deployment config
└── README.md
```

## 🔧 Environment Variables

Create a `.env` file in the backend directory:

```env
# Server Configuration
NODE_ENV=development
PORT=3001

# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# AI Configuration
GEMINI_API_KEY=your-gemini-api-key

# CORS Configuration
FRONTEND_URL=http://localhost:3000
EXTENSION_ID=your-chrome-extension-id

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Security (optional - using Supabase Auth)
JWT_SECRET=your-jwt-secret
BCRYPT_ROUNDS=12
```

### Environment Variable Details

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `SUPABASE_URL` | ✅ | Your Supabase project URL | `https://abc123.supabase.co` |
| `SUPABASE_ANON_KEY` | ✅ | Supabase anonymous key | `eyJhbGciOiJIUzI1NiIs...` |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | Supabase service role key | `eyJhbGciOiJIUzI1NiIs...` |
| `GEMINI_API_KEY` | ✅ | Google Gemini API key | `AIzaSy...` |
| `FRONTEND_URL` | ✅ | Frontend application URL | `http://localhost:3000` |
| `EXTENSION_ID` | ❌ | Chrome extension ID | `abcdefghijk...` |

## 🏗️ Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: PostgreSQL (via Supabase)
- **Authentication**: Supabase Auth (JWT)
- **AI Service**: Google Gemini 1.5 Flash
- **File Processing**: PDF parsing with pdf-parse
- **Validation**: Joi schema validation
- **Rate Limiting**: rate-limiter-flexible

## 📡 API Endpoints

### Public Endpoints (No Authentication)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/health` | API health check |
| `POST` | `/api/ai/resume-grade` | Public resume grading (lead magnet) |

### Authentication Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/register` | User registration |
| `POST` | `/api/auth/login` | User login |
| `POST` | `/api/auth/refresh` | Refresh access token |
| `POST` | `/api/auth/logout` | User logout |
| `GET` | `/api/auth/me` | Get current user |

### Job Management (Authenticated)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/jobs` | Get user's jobs (with filtering) |
| `POST` | `/api/jobs` | Create new job |
| `GET` | `/api/jobs/:id` | Get specific job |
| `PUT` | `/api/jobs/:id` | Update job |
| `DELETE` | `/api/jobs/:id` | Delete job |
| `POST` | `/api/jobs/bulk` | Bulk create jobs (extension) |
| `GET` | `/api/jobs/stats/summary` | Get job statistics |

### Application Management (Authenticated)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/applications` | Get user's applications |
| `POST` | `/api/applications` | Create application |
| `GET` | `/api/applications/:id` | Get specific application |
| `PUT` | `/api/applications/:id` | Update application |
| `PATCH` | `/api/applications/:id/status` | Update application status only |
| `DELETE` | `/api/applications/:id` | Delete application |

### AI Analysis (Authenticated)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/ai/job-match` | Analyze job compatibility |
| `POST` | `/api/ai/resume-optimization` | Get resume improvement suggestions |
| `POST` | `/api/ai/company-research` | Generate company insights |
| `GET` | `/api/ai/analysis/:job_id` | Get all analysis for a job |
| `GET` | `/api/ai/usage-stats` | Get AI usage statistics |

### User Management (Authenticated)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/users/profile` | Get user profile |
| `PUT` | `/api/users/profile` | Update user profile |
| `POST` | `/api/users/resume` | Upload resume file |
| `GET` | `/api/users/activity` | Get user activity log |

## 🧪 Testing API Endpoints

### Test Resume Grader (Public)
```bash
curl -X POST http://localhost:3001/api/ai/resume-grade \
  -F "resume=@path/to/resume.pdf"
```

### Test Authentication
```bash
# Register user
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","firstName":"Test","lastName":"User"}'

# Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### Test Job Creation (Authenticated)
```bash
# Get token from login response, then:
curl -X POST http://localhost:3001/api/jobs \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Software Engineer","company":"Example Corp","url":"https://example.com/job"}'
```

## 🚀 Local Development

### Prerequisites
- Node.js 18+ and npm
- Supabase account and project
- Google Cloud account (for Gemini API)

### Setup Steps

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure Supabase**
   - Create project at [supabase.com](https://supabase.com)
   - Run database migrations (see database schema documentation)
   - Get your project URL and API keys

3. **Configure Google Gemini**
   - Enable Gemini API in Google Cloud Console
   - Get API key and set spending limits

4. **Setup environment**
   ```bash
   cp .env.example .env
   # Edit .env with your credentials
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

6. **Verify setup**
   ```bash
   # Check health endpoint
   curl http://localhost:3001/health

   # Should return: {"status":"OK","timestamp":"...","uptime":...}
   ```

## 🔄 Database Setup

The application uses Supabase (PostgreSQL) with Row Level Security. Key tables:

- `users` - User accounts (handled by Supabase Auth)
- `user_profiles` - User profile data and preferences
- `jobs` - Job postings saved by users
- `applications` - Job applications with status tracking
- `ai_analysis` - AI analysis results and usage tracking

### Required Database Views
```sql
-- Create view for jobs with application status
CREATE VIEW jobs_with_status AS
SELECT
  j.*,
  a.status as application_status,
  a.applied_date,
  a.id as application_id
FROM jobs j
LEFT JOIN applications a ON j.id = a.job_id;
```

## 📦 Production Deployment (Heroku)

### Prerequisites
- Heroku account and CLI installed
- Production Supabase project
- Production Gemini API key

### Deployment Steps

1. **Create Heroku app**
   ```bash
   heroku create jobtracker-api
   heroku git:remote -a jobtracker-api
   ```

2. **Set environment variables**
   ```bash
   heroku config:set NODE_ENV=production -a jobtracker-api
   heroku config:set SUPABASE_URL=your-prod-url -a jobtracker-api
   heroku config:set SUPABASE_ANON_KEY=your-prod-key -a jobtracker-api
   heroku config:set GEMINI_API_KEY=your-prod-key -a jobtracker-api
   heroku config:set FRONTEND_URL=https://your-frontend.vercel.app -a jobtracker-api
   ```

3. **Create Procfile** (if not exists)
   ```bash
   echo "web: node src/server.js" > Procfile
   ```

4. **Deploy**
   ```bash
   git add .
   git commit -m "Deploy to Heroku"
   git push heroku main
   ```

5. **Verify deployment**
   ```bash
   heroku logs --tail -a jobtracker-api
   heroku open -a jobtracker-api/health
   ```

### Production URLs
- **API**: `https://jobtracker-api.herokuapp.com`
- **Health Check**: `https://jobtracker-api.herokuapp.com/health`

## 🛠️ Development Workflow

### Adding New Features

1. **Create feature branch**
   ```bash
   git checkout -b feature/new-endpoint
   ```

2. **Add route** in appropriate file under `src/routes/`

3. **Add validation** schema in `src/middleware/validation.js`

4. **Test locally**
   ```bash
   npm run dev
   curl http://localhost:3001/your-new-endpoint
   ```

5. **Deploy**
   ```bash
   git push heroku main
   ```

### Adding New AI Features

1. **Create prompt template** in `src/prompts/`
2. **Add service function** in `src/services/aiService.js`
3. **Add route** in `src/routes/ai.js`
4. **Test with sample data**

## 🐛 Troubleshooting

### Common Issues

#### "Cannot connect to Supabase"
```bash
# Check environment variables
echo $SUPABASE_URL
echo $SUPABASE_ANON_KEY

# Test connection
node -e "
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
console.log('Connected:', !!supabase);
"
```

#### "Gemini API errors"
```bash
# Check API key
echo $GEMINI_API_KEY

# Verify quota and billing in Google Cloud Console
```

#### "CORS errors"
```javascript
// Update CORS configuration in src/server.js
app.use(cors({
  origin: [
    process.env.FRONTEND_URL,
    'http://localhost:3000',
    `chrome-extension://${process.env.EXTENSION_ID}`
  ],
  credentials: true
}));
```

#### "Rate limiting too aggressive"
```javascript
// Adjust in src/middleware/rateLimiter.js
const rateLimiters = {
  general: new RateLimiterMemory({
    points: 200, // Increase from 100
    duration: 900
  })
};
```

### Debug Commands

```bash
# View logs in production
heroku logs --tail -a jobtracker-api

# Check environment variables
heroku config -a jobtracker-api

# Run commands in production
heroku run node -a jobtracker-api

# Local debugging
DEBUG=* npm run dev
```

## 📊 Monitoring & Analytics

### Key Metrics to Track
- API response times
- AI token usage and costs
- User registration conversion from resume grader
- Most popular job sites being scraped
- Error rates by endpoint

### Logging
```javascript
// Structured logging example
console.log(JSON.stringify({
  level: 'info',
  message: 'Resume analyzed',
  userId: req.userId,
  fileSize: req.file.size,
  processingTime: Date.now() - startTime,
  aiCost: analysis.cost_usd
}));
```

## 🔐 Security Considerations

- **Authentication**: Using Supabase Auth (JWT tokens)
- **Authorization**: Row Level Security (RLS) in database
- **Rate Limiting**: 100 requests per 15 minutes per IP
- **File Upload**: PDF only, 5MB limit
- **CORS**: Restricted to known origins
- **Environment Variables**: Never commit to git

## 📈 Performance Optimization

### AI Cost Management
- Cache similar resume analyses
- Use Gemini Flash (cheaper) for most features
- Implement circuit breaker for API failures
- Monitor token usage per user

### Database Optimization
- Indexes on frequently queried columns
- Connection pooling via Supabase
- Paginated responses for large datasets

## 🎯 Future Enhancements

- [ ] Redis caching for AI responses
- [ ] Webhook endpoints for real-time updates
- [ ] Bulk import from job boards
- [ ] Email notifications for application updates
- [ ] Integration with ATS systems
- [ ] Advanced analytics dashboard

## 📞 Support

For technical issues or questions:
1. Check this README and troubleshooting section
2. Review application logs: `heroku logs --tail`
3. Test with curl commands provided above
4. Check Supabase and Google Cloud Console dashboards

---

**Last Updated**: January 2025
**Node Version**: 18.x
**Database**: PostgreSQL via Supabase
**Deployment**: Heroku Basic Dyno ($7/month)
