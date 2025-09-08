# Job Application Tracker

A full-stack web application that helps job seekers track their applications, optimize resumes with AI, and manage their job search process efficiently.

## 🚀 Features

- **User Authentication**: Secure login/registration with Supabase Auth
- **Job Tracking**: Save and organize job applications by status
- **Chrome Extension**: Save jobs directly from job sites while browsing
- **AI Resume Optimization**: Get personalized resume suggestions using Google Gemini
- **Application Analytics**: Track success rates and application metrics
- **Real-time Sync**: Data syncs across web app and extension

## 🛠️ Tech Stack

### Frontend
- **React 18** - Component-based UI framework
- **React Router** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **Context API** - State management for authentication

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web application framework
- **Supabase** - Database, authentication, and real-time subscriptions
- **Google Gemini** - AI-powered resume and job analysis

### Chrome Extension
- **Manifest V3** - Modern extension platform
- **Content Scripts** - Job data extraction from websites
- **Background Service Worker** - API communication

## 📦 Project Structure

```
job-tracker/
├── backend/                 # Node.js/Express API
│   ├── config/             # Database and service configurations
│   ├── middleware/         # Auth, validation, rate limiting
│   ├── routes/            # API endpoints
│   ├── services/          # Business logic (AI, email, etc.)
│   └── server.js          # Main server file
├── src/                   # React frontend
│   ├── components/        # Reusable UI components
│   ├── context/          # React Context providers
│   ├── pages/            # Page components
│   └── services/         # API client services
└── extension/            # Chrome extension (coming soon)
    ├── content/          # Content scripts
    ├── background/       # Service worker
    └── popup/           # Extension popup UI
```

## 🏃‍♂️ Quick Start

### Prerequisites
- Node.js 18+ and npm
- Supabase account
- Google Gemini API key

### 1. Environment Setup

Create `.env` files in both root and backend directories:

**Root `.env`:**
```env
REACT_APP_SUPABASE_URL=your_supabase_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**Backend `.env`:**
```env
PORT=3001
NODE_ENV=development
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
GEMINI_API_KEY=your_gemini_api_key
FRONTEND_URL=http://localhost:3000
```

### 2. Database Setup

Run the SQL scripts in Supabase to create tables:
```sql
-- See backend/database/schema.sql for complete schema
```

### 3. Install Dependencies

**Frontend:**
```bash
npm install
```

**Backend:**
```bash
cd backend
npm install
```

### 4. Start Development Servers

**Frontend (Terminal 1):**
```bash
npm start
# Runs on http://localhost:3000
```

**Backend (Terminal 2):**
```bash
cd backend
npm run dev
# Runs on http://localhost:3001
```

### 5. Test the Application

Visit `http://localhost:3000` and:
1. Register a new account
2. Navigate through the dashboard
3. Test authentication flows

## 🧪 Testing

See [Testing Workflow Guide](docs/TESTING.md) for comprehensive testing instructions.

**Quick Test:**
```bash
# Frontend
npm test

# Backend
cd backend
npm test

# Manual testing
curl http://localhost:3001/health
```

## 📚 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Job Management
- `GET /api/jobs` - Get user's jobs
- `POST /api/jobs` - Create new job
- `PUT /api/jobs/:id` - Update job
- `DELETE /api/jobs/:id` - Delete job

### AI Features
- `POST /api/ai/job-match` - Analyze job compatibility
- `POST /api/ai/resume-optimization` - Get resume suggestions
- `POST /api/ai/company-research` - Generate company insights

## 🏗️ Development Roadmap

### Phase 1: Core MVP ✅
- [x] User authentication
- [x] Basic job tracking
- [x] Frontend dashboard
- [x] Backend API structure

### Phase 2: Enhanced Features (In Progress)
- [ ] Chrome extension development
- [ ] AI integration (Gemini)
- [ ] Advanced job filtering
- [ ] Application status tracking

### Phase 3: Advanced Features
- [ ] Resume upload and parsing
- [ ] Email integration
- [ ] Analytics dashboard
- [ ] Team collaboration features

## 🚀 Deployment

### Frontend (Vercel/Netlify)
```bash
npm run build
# Deploy build/ directory
```

### Backend (Railway/Heroku)
```bash
cd backend
# Deploy with your preferred platform
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- 📧 Email: support@jobtracker.com
- 💬 Discord: [Join our community](https://discord.gg/jobtracker)
- 📚 Docs: [Documentation](https://docs.jobtracker.com)

## 🙏 Acknowledgments

- Supabase for the backend infrastructure
- Google Gemini for AI capabilities
- React and Node.js communities
- All contributors and testers
