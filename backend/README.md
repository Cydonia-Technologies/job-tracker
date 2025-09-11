# JobTracker Backend API

AI-powered job application tracking system with resume grading, structured resume parsing, job matching, and application management.

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
│   │   └── users.js             # User profile & resume management
│   ├── services/
│   │   └── aiService.js         # Google Gemini AI integration + resume parsing
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
- **Resume Parsing**: AI-powered structured data extraction with regex fallback
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
| `POST` | `/api/users/resume` | **Enhanced**: Upload & parse resume with AI |
| `GET` | `/api/users/resume/parsed` | **New**: Get parsed resume data |
| `POST` | `/api/users/resume/reparse` | **New**: Re-parse existing resume |
| `GET` | `/api/users/activity` | Get user activity log |

## 🧠 AI Resume Parsing Features

### **Enhanced Resume Upload (`POST /api/users/resume`)**

**Input**: PDF file upload
**Process**:
1. Extract text from PDF
2. AI-powered structured data extraction
3. Fallback regex parsing if AI fails
4. Store structured data in database

**Response**:
```json
{
  "message": "Resume uploaded and analyzed successfully",
  "resume_url": "https://supabase.storage.url/resume.pdf",
  "parsed_data": {
    "skills": {
      "technical": ["JavaScript", "React", "Python", "SQL"],
      "soft": ["Leadership", "Communication", "Problem Solving"],
      "tools": ["Git", "AWS", "Docker", "Figma"]
    },
    "experience": {
      "total_years": 3,
      "current_level": "Mid-level",
      "job_titles": ["Software Developer", "Frontend Engineer"],
      "companies": ["Tech Corp", "StartupXYZ"]
    },
    "education": {
      "highest_degree": "Bachelor's",
      "field_of_study": "Computer Science",
      "school": "Penn State University",
      "graduation_year": 2022
    },
    "contact": {
      "location": "State College, PA",
      "has_linkedin": true,
      "has_github": true,
      "has_portfolio": false
    },
    "summary": "Experienced software developer with 3 years of full-stack development experience..."
  },
  "analysis_metadata": {
    "processing_time_ms": 2500,
    "model_used": "gemini-1.5-flash",
    "cost_usd": 0.0009,
    "total_skills_found": 15,
    "experience_years": 3
  }
}
```

### **Get Parsed Resume Data (`GET /api/users/resume/parsed`)**

Returns previously parsed resume data without re-processing.

### **Re-parse Resume (`POST /api/users/resume/reparse`)**

Re-analyzes existing resume text with latest AI model/prompts.

## 🧪 Testing API Endpoints

### Test Resume Upload & Parsing
```bash
# Upload and parse resume (requires authentication)
curl -X POST http://localhost:3001/api/users/resume \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "resume=@path/to/resume.pdf"
```

### Test Getting Parsed Data
```bash
# Get parsed resume data
curl -X GET http://localhost:3001/api/users/resume/parsed \
  -H "Authorization: Bearer YOUR_TOKEN"
```

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
   - Run database migrations (see database schema section)
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
- `user_profiles` - **Enhanced**: User profile data with parsed resume fields
- `jobs` - Job postings saved by users
- `applications` - Job applications with status tracking
- `ai_analysis` - AI analysis results and usage tracking

### **Enhanced user_profiles Table Schema**
```sql
-- Add these columns for resume parsing
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS resume_text TEXT,
ADD COLUMN IF NOT EXISTS parsed_skills JSONB,
ADD COLUMN IF NOT EXISTS parsed_experience JSONB,
ADD COLUMN IF NOT EXISTS parsed_education JSONB,
ADD COLUMN IF NOT EXISTS parsed_contact JSONB,
ADD COLUMN IF NOT EXISTS resume_summary TEXT,
ADD COLUMN IF NOT EXISTS parsing_metadata JSONB;

-- Add indexes for efficient job matching queries
CREATE INDEX IF NOT EXISTS idx_user_profiles_skills
ON user_profiles USING GIN (parsed_skills);

CREATE INDEX IF NOT EXISTS idx_user_profiles_experience
ON user_profiles USING GIN (parsed_experience);
```

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

### **Parsed Data Structure Examples**

**Skills JSON Structure**:
```json
{
  "technical": ["JavaScript", "React", "Python", "SQL"],
  "soft": ["Leadership", "Communication", "Problem Solving"],
  "tools": ["Git", "AWS", "Docker", "Figma"]
}
```

**Experience JSON Structure**:
```json
{
  "total_years": 3,
  "current_level": "Mid-level",
  "job_titles": ["Software Developer", "Frontend Engineer"],
  "companies": ["Tech Corp", "StartupXYZ"]
}
```

**Education JSON Structure**:
```json
{
  "highest_degree": "Bachelor's",
  "field_of_study": "Computer Science",
  "school": "Penn State University",
  "graduation_year": 2022
}
```

**Contact JSON Structure**:
```json
{
  "location": "State College, PA",
  "has_linkedin": true,
  "has_github": true,
  "has_portfolio": false
}
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
   git commit -m "Deploy enhanced resume parsing to Heroku"
   git push heroku main
   ```

5. **Verify deployment**
   ```bash
   heroku logs --tail -a jobtracker-api
   heroku open -a jobtracker-api/health
   ```

### Production URLs
- **API**: `https://jobtracker-api-b08390fc29d1.herokuapp.com`
- **Health Check**: `https://jobtracker-api-b08390fc29d1.herokuapp.com/health`

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

### **Resume Parsing Development**

1. **Test AI parsing function**:
   ```javascript
   // Test in Node.js REPL
   const { parseResumeData } = require('./src/services/aiService');
   const result = await parseResumeData(resumeText);
   console.log(result.parsed_data);
   ```

2. **Test fallback regex parsing**:
   ```javascript
   // Disable AI to test regex fallback
   process.env.GEMINI_API_KEY = 'invalid';
   const result = await parseResumeData(resumeText);
   // Should still return structured data
   ```

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
# Test with simple request
curl -X POST "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=$GEMINI_API_KEY" \
  -H 'Content-Type: application/json' \
  -d '{"contents":[{"parts":[{"text":"Hello"}]}]}'
```

#### "Resume parsing fails"
```bash
# Check if parseResumeData function is exported
node -e "
const { parseResumeData } = require('./src/services/aiService');
console.log('Function available:', typeof parseResumeData);
"

# Test with sample text
node -e "
const { parseResumeData } = require('./src/services/aiService');
parseResumeData('John Smith Software Developer JavaScript React').then(console.log);
"
```

#### "Database schema errors"
```sql
-- Check if new columns exist
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'user_profiles'
AND column_name IN ('parsed_skills', 'parsed_experience', 'parsed_education');
```

### Debug Commands

```bash
# View logs in production
heroku logs --tail -a jobtracker-api

# Check environment variables
heroku config -a jobtracker-api

# Run commands in production
heroku run node -a jobtracker-api

# Local debugging with resume parsing
DEBUG=* npm run dev

# Test resume parsing endpoint specifically
curl -X POST http://localhost:3001/api/users/resume \
  -H "Authorization: Bearer $TOKEN" \
  -F "resume=@test-resume.pdf" \
  -v
```

## 📊 Monitoring & Analytics

### Key Metrics to Track
- API response times
- **Resume parsing success rate** (AI vs fallback)
- **Skills extraction accuracy** (manual verification)
- AI token usage and costs
- User registration conversion from resume grader
- Most popular job sites being scraped
- Error rates by endpoint

### Logging
```javascript
// Enhanced logging for resume parsing
console.log(JSON.stringify({
  level: 'info',
  message: 'Resume parsed',
  userId: req.userId,
  fileSize: req.file.size,
  processingTime: metadata.processing_time_ms,
  aiCost: metadata.cost_usd,
  skillsFound: parsed_data.skills?.technical?.length || 0,
  experienceYears: parsed_data.experience?.total_years || 0,
  parseMethod: metadata.model_used, // 'gemini-1.5-flash' or 'fallback_regex'
  success: !metadata.error
}));
```

## 🔐 Security Considerations

- **Authentication**: Using Supabase Auth (JWT tokens)
- **Authorization**: Row Level Security (RLS) in database
- **Rate Limiting**: 100 requests per 15 minutes per IP
- **File Upload**: PDF only, 5MB limit, virus scanning via Supabase
- **CORS**: Restricted to known origins
- **Data Privacy**: Resume text encrypted at rest
- **Environment Variables**: Never commit to git

## 📈 Performance Optimization

### AI Cost Management
- **Resume Parsing**: ~$0.001 per analysis (very affordable)
- Cache similar resume analyses (hash-based)
- Use Gemini Flash (cheaper) for parsing
- Implement circuit breaker for API failures
- Monitor token usage per user
- Fallback to regex parsing if AI quota exceeded

### Database Optimization
- **JSONB indexes** for fast skill searches
- GIN indexes on parsed_skills and parsed_experience
- Connection pooling via Supabase
- Paginated responses for large datasets

### Resume Parsing Optimization
- **Batch processing**: Parse multiple resumes in queue
- **Caching**: Store parsing results by content hash
- **Fallback performance**: Regex parsing <100ms
- **AI performance**: Target <5s for parsing

## 🎯 Future Enhancements

- [ ] **Enhanced resume parsing**: Support for more file formats (DOCX, TXT)
- [ ] **Skill ontology**: Map similar skills (React.js = ReactJS)
- [ ] **Experience verification**: Cross-reference with LinkedIn/GitHub
- [ ] **Resume scoring**: Grade based on industry standards
- [ ] **Custom parsing**: User-defined skill categories
- [ ] **Batch upload**: Process multiple resumes
- [ ] **Resume templates**: Generate optimized resumes from parsed data

## 📞 Support

For technical issues or questions:
1. Check this README and troubleshooting section
2. Review application logs: `heroku logs --tail`
3. Test with curl commands provided above
4. Check Supabase and Google Cloud Console dashboards
5. **Resume parsing issues**: Check parsing metadata in response

## 🧪 Testing Resume Parsing

### **Comprehensive Test Script**
```bash
# Run the resume parsing test suite
./scripts/test-resume-parsing.sh

# Manual testing with different resume formats
curl -X POST http://localhost:3001/api/users/resume \
  -H "Authorization: Bearer $TOKEN" \
  -F "resume=@technical-resume.pdf"

curl -X POST http://localhost:3001/api/users/resume \
  -H "Authorization: Bearer $TOKEN" \
  -F "resume=@marketing-resume.pdf"

curl -X POST http://localhost:3001/api/users/resume \
  -H "Authorization: Bearer $TOKEN" \
  -F "resume=@student-resume.pdf"
```

---

**Last Updated**: January 2025
**Node Version**: 18.x
**Database**: PostgreSQL via Supabase with Resume Parsing Schema
**Deployment**: Heroku Basic Dyno ($7/month)
**New Features**: ✅ AI-Powered Resume Parsing with Structured Data Extraction
