
// =====================================================
// SETUP INSTRUCTIONS
// =====================================================
/*
1. Create project directory:
   mkdir job-tracker-backend
   cd job-tracker-backend

2. Initialize npm:
   npm init -y

3. Install dependencies:
   npm install express cors helmet morgan dotenv @supabase/supabase-js joi bcryptjs jsonwebtoken rate-limiter-flexible multer pdf-parse
   npm install --save-dev nodemon jest

4. Create folder structure:
   mkdir config middleware routes services utils
   touch .env .env.example server.js

5. Copy the code above into respective files

6. Set up environment variables in .env:
   - Copy from .env.example
   - Add your Supabase credentials
   - Add your AI API keys

7. Start development server:
   npm run dev

8. Test health endpoint:
   curl http://localhost:3001/health

Next steps:
- Complete the jobs routes
- Add AI service integration
- Set up Chrome extension communication
*/
