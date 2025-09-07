# Job Application Tracker

AI-powered job application tracking system with Chrome extension for automatic job extraction from major job sites.

## Overview

This project provides a comprehensive solution for tracking job applications with automated data extraction, AI-powered job matching, and professional application management. Built as a modern alternative to spreadsheet-based job tracking.

## Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  Chrome Ext     │    │   Web App       │    │   Backend API   │
│  (Job Extract)  │◄──►│   (React SPA)   │◄──►│   (Node.js)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 ▼
                    ┌─────────────────────────┐
                    │    Supabase             │
                    │  - PostgreSQL Database  │
                    │  - Authentication       │
                    │  - Real-time Engine     │
                    └─────────────────────────┘
```

## Current Features

### ✅ Working Features

- **Chrome Extension Job Extraction**
  - Automatic job data extraction from Indeed
  - Professional overlay UI for job saving
  - Intelligent text search algorithms
  - Handles Indeed's modern split-panel interface

- **Authentication System**
  - User registration and login through extension popup
  - JWT token-based authentication
  - Secure session management

- **Backend API**
  - Complete REST API with Express.js
  - Supabase PostgreSQL integration
  - User management and authentication
  - Job data storage with comprehensive schema

- **Database Design**
  - Normalized PostgreSQL schema
  - Row Level Security (RLS)
  - Optimized indexes for performance
  - Real-time subscription capabilities

### 🚧 In Development

- **Job Saving Validation** (schema mismatch debugging)
- **React Frontend Dashboard**
- **AI Integration** (Google Gemini for job matching)
- **LinkedIn Job Extraction**

## Tech Stack

- **Backend**: Node.js, Express.js, Supabase (PostgreSQL)
- **Extension**: Vanilla JavaScript, Chrome Extension Manifest v3
- **Frontend**: React (planned)
- **AI**: Google Gemini 1.5 Flash
- **Authentication**: Supabase Auth with JWT
- **Database**: PostgreSQL with Row Level Security

## Project Structure

```
job-application-tracker/
├── backend/                    # Node.js API server
│   ├── src/
│   │   ├── routes/            # API endpoints
│   │   ├── middleware/        # Auth, validation, rate limiting
│   │   ├── services/          # AI service integration
│   │   └── config/            # Database configuration
│   └── package.json
├── extension/                  # Chrome Extension
│   ├── manifest.json          # Extension configuration
│   ├── background/            # Service worker
│   ├── content/               # Content scripts and extractors
│   ├── popup/                 # Extension popup UI
│   └── utils/                 # Shared utilities
├── frontend/                   # React web app (planned)
└── docs/                      # Documentation
```

## Setup Instructions

### Prerequisites

- Node.js 18+
- Supabase account
- Google AI Studio account (for Gemini API)
- Chrome/Chromium browser

### Backend Setup

1. **Clone and setup backend**
   ```bash
   cd backend
   npm install
   ```

2. **Environment Configuration**
   ```bash
   cp .env.example .env
   ```

   Fill in your `.env` file:
   ```env
   PORT=3001
   SUPABASE_URL=your-supabase-url
   SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   GEMINI_API_KEY=your-gemini-api-key
   ```

3. **Database Setup**
   - Run the SQL scripts in `docs/database-schema.sql` in Supabase SQL Editor
   - Verify tables are created with proper RLS policies

4. **Start Development Server**
   ```bash
   npm run dev
   ```

   Verify health check: `http://localhost:3001/health`

### Chrome Extension Setup

1. **Load Extension in Development**
   - Open `chrome://extensions/` or `brave://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the `extension/` folder

2. **Test Extension**
   - Click extension icon to open popup
   - Register a new account or login
   - Visit an Indeed job page
   - Job extraction overlay should appear

### Testing the System

1. **Backend API Test**
   ```bash
   curl http://localhost:3001/health
   # Should return: {"status":"OK","timestamp":"...","uptime":...}
   ```

2. **Extension Test**
   - Go to any Indeed job page
   - Extension overlay should appear with job details
   - Click "Save Job" to test backend integration

3. **Authentication Test**
   - Use extension popup to register/login
   - Verify user appears in Supabase Auth dashboard

## Development Status

### Completed Milestones

- [x] Complete backend API architecture
- [x] Database schema with RLS policies
- [x] Chrome extension job extraction system
- [x] Professional overlay UI design
- [x] Authentication flow integration
- [x] Indeed job site support

### Current Issues

- Job saving validation errors (schema mismatch)
- Extension parsing Indeed bot check pages
- Missing React frontend dashboard

### Next Development Priorities

1. **Fix Validation Issues**: Debug schema mismatch between extension and backend
2. **Build React Frontend**: Job dashboard with Kanban interface
3. **Add LinkedIn Support**: Expand to second major job site
4. **AI Integration**: Job matching and resume optimization features

## API Documentation

### Authentication Endpoints

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - User logout

### Job Management Endpoints

- `GET /api/jobs` - List user's jobs with filtering/pagination
- `POST /api/jobs` - Create new job entry
- `PUT /api/jobs/:id` - Update job details
- `DELETE /api/jobs/:id` - Delete job entry

### Application Tracking

- `GET /api/applications` - List applications
- `POST /api/applications` - Create application record
- `PATCH /api/applications/:id/status` - Update application status

## Contributing

### Code Style

- Use consistent indentation (2 spaces)
- Follow ESLint configuration
- Add console logging for debugging
- Include error handling for all async operations

### Testing

Currently using manual testing. Automated testing framework planned for future implementation.

### Debugging

- Backend: Check console logs with `npm run dev`
- Extension: Use Chrome DevTools Console on job sites
- Database: Monitor via Supabase dashboard

## Competitive Analysis

This system provides features comparable to:

- **Huntr** ($40/month): Job tracking with basic AI
- **Teal** (Freemium): Resume optimization focus
- **Simplify** (Free): Basic job tracking

Our competitive advantages:
- Advanced AI integration with Google Gemini
- Professional Chrome extension with intelligent extraction
- Open source and self-hosted option
- Real-time synchronization across devices

## Future Roadmap

### Short Term (2-4 weeks)
- Fix current validation issues
- Complete React frontend
- Add LinkedIn job extraction
- Basic AI job matching

### Medium Term (1-3 months)
- Resume optimization features
- Interview preparation tools
- Mobile app (React Native)
- Advanced analytics dashboard

### Long Term (3+ months)
- Additional job sites (Glassdoor, company sites)
- Salary negotiation assistance
- Team collaboration features
- API for third-party integrations

## License

[License to be determined]

## Support

For issues and questions:
- Check console logs for error details
- Verify backend is running on port 3001
- Ensure Supabase credentials are correct
- Confirm extension permissions are granted

---

**Status**: Core functionality working, validation debugging in progress
**Last Updated**: September 2025
