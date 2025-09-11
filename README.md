# JobTracker - AI-Powered Job Application Management

**Status: 🚀 LIVE IN PRODUCTION**

AI-powered job application tracking system that automates resume grading, job matching, and application management. Built to compete with OfferPilotAI with superior technical execution and student-friendly pricing.

## 🌟 Live Application

- **Frontend**: https://job-tracker-weld-three.vercel.app
- **Backend API**: https://jobtracker-api-b08390fc29d1.herokuapp.com
- **Health Check**: https://jobtracker-api-b08390fc29d1.herokuapp.com/health

## ✅ Current Status (Week 1-2 Sprint)

### **COMPLETED ✅**
- [x] **Backend Infrastructure**: Complete Node.js/Express API with Supabase
- [x] **Frontend Application**: React dashboard with real-time job tracking
- [x] **Chrome Extension**: Working Indeed job extraction with overlay UI
- [x] **Database Schema**: PostgreSQL with Row Level Security, user profiles, job tracking
- [x] **AI Integration**: Google Gemini API connected with resume grading feature
- [x] **AI Resume Parsing**: Extract structured data (skills, experience, education) from PDFs
- [x] **Production Deployment**: Backend deployed to Heroku, Frontend deployed to Vercel
- [x] **Testing Framework**: Comprehensive test scripts for local and production environments

### **IN PROGRESS 🚧**
- [ ] **AI Job Matching**: Score job compatibility based on parsed resume data
- [ ] **Resume Grader Frontend**: Public landing page with file upload and AI analysis
- [ ] **Extension Production Integration**: Point Chrome extension to production API
- [ ] **Job Dashboard**: View job matches with freemium limits (3 detailed + unlimited blurred)

### **NEXT SPRINT 📋**
- [ ] **Resume Optimization**: AI-powered job-specific resume improvement suggestions
- [ ] **Company Research**: AI-generated interview prep and company insights
- [ ] **User Acquisition Landing Page**: Marketing site with resume grader as lead magnet
- [ ] **Guerrilla Marketing Prep**: Materials for Penn State career fair promotion

## 🏗️ Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  Chrome Ext     │    │   React App     │    │   Node.js API   │
│  (Job Extract)  │◄──►│   (Vercel)      │◄──►│   (Heroku)      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 ▼
                    ┌─────────────────────────┐
                    │    Supabase             │
                    │  - PostgreSQL Database  │
                    │  - Real-time Engine     │
                    │  - Authentication       │
                    │  - File Storage         │
                    └─────────────────────────┘
                                 │
                                 ▼
                    ┌─────────────────────────┐
                    │   Google Gemini AI      │
                    │  - Resume Analysis      │
                    │  - Structured Parsing   │
                    │  - Job Matching         │
                    └─────────────────────────┘
```

## 💻 Tech Stack

### **Backend (Heroku)**
- **Runtime**: Node.js 18+ with Express.js
- **Database**: PostgreSQL via Supabase with Row Level Security
- **Authentication**: Supabase Auth (JWT tokens)
- **AI Service**: Google Gemini 1.5 Flash ($0.000075/1K tokens)
- **File Processing**: PDF parsing with pdf-parse
- **Resume Parsing**: AI-powered structured data extraction with regex fallback
- **Rate Limiting**: 100 requests per 15 minutes per IP

### **Frontend (Vercel)**
- **Framework**: React 18 with functional components
- **Styling**: Tailwind CSS with responsive design
- **State Management**: React hooks + Supabase real-time
- **Build Tool**: Create React App with Vercel optimization
- **Performance**: Static site generation with CDN

### **Chrome Extension**
- **Manifest**: V3 with content scripts and service workers
- **Target Sites**: Indeed.com, LinkedIn.com, Nittany Careers
- **Features**: Job extraction, one-click save, background sync
- **Communication**: Message passing between content and background scripts

### **AI Features**
- **Resume Grading**: Letter grades (A+, A, B+, etc.) with detailed feedback
- **Resume Parsing**: Extract skills, experience, education, contact info
- **Fallback System**: Regex-based parsing if AI fails
- **Cost Optimization**: ~$0.001 per resume analysis

## 🚀 Quick Start

### **Development Setup**
```bash
# Clone the repository
git clone <your-repo-url>
cd job-tracker

# Backend setup
cd backend
npm install
cp .env.example .env  # Configure your environment variables
npm run dev

# Frontend setup (new terminal)
cd frontend
npm install
npm start

# Test everything
./scripts/test-all.sh local
```

### **Production Testing**
```bash
# Test live deployment
./scripts/test-all.sh production

# Test resume parsing specifically
./scripts/test-resume-parsing.sh

# Or test individual components
curl https://jobtracker-api-b08390fc29d1.herokuapp.com/health
curl https://job-tracker-weld-three.vercel.app
```

## 📁 Project Structure

```
job-tracker/
├── backend/                 # Node.js API server
│   ├── src/
│   │   ├── routes/         # API endpoints
│   │   │   ├── auth.js     # Authentication routes
│   │   │   ├── users.js    # User profile & enhanced resume upload
│   │   │   ├── jobs.js     # Job management
│   │   │   ├── applications.js # Application tracking
│   │   │   └── ai.js       # AI analysis endpoints
│   │   ├── services/       # AI and business logic
│   │   │   └── aiService.js # Gemini integration + resume parsing
│   │   ├── middleware/     # Auth, validation, rate limiting
│   │   ├── config/         # Database and external service config
│   │   └── prompts/        # AI prompt templates
│   ├── Procfile           # Heroku deployment config
│   └── README.md          # Backend-specific documentation
├── frontend/               # React application
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Route components
│   │   ├── services/      # API communication
│   │   └── context/       # React context providers
│   ├── vercel.json        # Vercel deployment config
│   └── README.md          # Frontend-specific documentation
├── extension/             # Chrome extension
│   ├── background/        # Service worker scripts
│   ├── content/          # Content scripts for job sites
│   ├── popup/            # Extension popup UI
│   └── manifest.json     # Extension configuration
├── scripts/              # Testing and automation scripts
│   ├── test-local.sh     # Local development testing
│   ├── test-production.sh # Production deployment testing
│   ├── test-resume-parsing.sh # Resume parsing tests
│   └── test-all.sh       # Master test runner
├── docs/                 # Technical documentation
│   ├── DEPLOYMENT.md     # Deployment guides
│   ├── DESIGN.md         # Architecture and design decisions
│   └── TESTING.md        # Testing strategies
└── README.md             # This file
```

## 🔧 Environment Variables

### **Backend (Heroku)**
```env
NODE_ENV=production
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
GEMINI_API_KEY=your-gemini-api-key
FRONTEND_URL=https://job-tracker-weld-three.vercel.app
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### **Frontend (Vercel)**
```env
REACT_APP_API_URL=https://jobtracker-api-b08390fc29d1.herokuapp.com
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-anon-key
REACT_APP_ENVIRONMENT=production
```

## 🧪 Testing

### **Automated Testing**
```bash
# Test everything
./scripts/test-all.sh

# Test specific environment
./scripts/test-all.sh local        # Local development
./scripts/test-all.sh production   # Production deployment

# Test resume parsing specifically
./scripts/test-resume-parsing.sh
```

### **Manual Testing Checklist**
- [ ] Backend health endpoint responds
- [ ] Resume upload accepts PDF files
- [ ] AI resume parsing extracts structured data (skills, experience, education)
- [ ] Resume grader returns letter grades with feedback
- [ ] User registration and authentication works
- [ ] Job creation and management functional
- [ ] Chrome extension extracts job data
- [ ] Real-time sync between extension and dashboard

## 🎯 Business Goals

### **Target Market**
- **Primary**: College students and new graduates
- **Secondary**: Career changers and job seekers under 30
- **Pricing**: $5-10/month (vs OfferPilotAI's $40/month)

### **Core Value Proposition**
- **Automated Workflow**: Reduce 1-2 hours daily to 10-15 minutes
- **AI-Powered Insights**: Resume grading, parsing, job matching, company research
- **Browser Integration**: Seamless job extraction from major job boards
- **Student-Focused**: Affordable pricing with university-specific features

### **Differentiation from OfferPilotAI**
- ✅ **80% cost savings** with superior technical execution
- ✅ **AI resume parsing** with structured data extraction
- ✅ **Free resume grader** as lead magnet for user acquisition
- ✅ **Better Chrome extension** with more job site support
- ✅ **Transparent AI** algorithms and pricing
- ✅ **Open development** with public roadmap

## 📊 Current Metrics

### **Technical Performance**
- **Backend Response Time**: < 500ms average
- **Frontend Load Time**: < 2s on 3G
- **AI Analysis Time**: < 10s for resume grading/parsing
- **Resume Parsing Accuracy**: 80%+ for skills and experience extraction
- **Uptime**: 99.9% target (Heroku + Vercel)

### **AI Usage & Costs**
- **Model**: Google Gemini 1.5 Flash
- **Input Cost**: $0.000075 per 1K tokens
- **Output Cost**: $0.0003 per 1K tokens
- **Average Resume Analysis**: ~$0.01 per request
- **Average Resume Parsing**: ~$0.001 per request

## 🚧 Known Issues & Limitations

1. **Resume Grader Frontend**: Not yet implemented (in progress)
2. **Chrome Extension**: Points to local API (needs production update)
3. **Job Sites**: Limited to Indeed and Nittany Careers for MVP
4. **Resume Parsing**: Works best with standard resume formats
5. **Mobile App**: Not planned for initial release
6. **Bulk Import**: No ATS integration yet

## 🤝 Contributing

### **Development Workflow**
1. **Create feature branch**: `git checkout -b feature/new-feature`
2. **Test locally**: `./scripts/test-local.sh`
3. **Deploy to staging**: Review deployment
4. **Test production**: `./scripts/test-production.sh`
5. **Submit PR**: With test results and documentation

### **Code Standards**
- **Backend**: ES6+ with async/await, JSDoc comments
- **Frontend**: Functional React components with hooks
- **Database**: Row Level Security, proper indexing
- **AI**: Modular prompts, cost tracking, error handling, fallback systems

## 📞 Support & Documentation

- **Technical Issues**: Check individual component READMEs
- **API Documentation**: `/backend/README.md`
- **Deployment Guide**: `/docs/DEPLOYMENT.md`
- **Architecture Details**: `/docs/DESIGN.md`

## 📈 Roadmap

### **Phase 1: PoC Completion (Week 2-3)**
- Complete AI job matching with parsed resume data
- Resume grader frontend implementation
- Chrome extension production integration
- Job dashboard with freemium model

### **Phase 2: Feature Expansion (Month 2)**
- Resume optimization for specific jobs
- Company research and interview prep
- Application status tracking
- Email notifications

### **Phase 3: Scale & Growth (Month 3+)**
- Additional job site integrations
- Mobile application
- ATS system integrations
- Enterprise features

---

**Last Updated**: January 2025
**Version**: 1.1.0 (Resume Parsing Added)
**Deployment**: Heroku + Vercel
**Status**: ✅ Live with AI Resume Parsing Ready for Job Matching
