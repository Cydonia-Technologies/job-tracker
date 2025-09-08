# Job Tracker - Testing Workflow Guide

## Prerequisites
- Backend server running on `http://localhost:3001`
- Frontend running on `http://localhost:3000`
- Supabase project configured with correct environment variables

## 🧪 Testing Checklist

### 1. Application Startup
- [ ] App loads without console errors
- [ ] Redirects to login page if not authenticated
- [ ] Shows loading spinner during initial auth check

### 2. Authentication Flow Testing

#### Registration Testing
1. **Navigate to Registration**
   - Go to `http://localhost:3000/register`
   - Check page loads with registration form

2. **Test Registration Validation**
   - [ ] Submit empty form → Shows validation errors
   - [ ] Enter invalid email → Shows email validation error
   - [ ] Enter password < 6 characters → Shows password length error
   - [ ] Enter non-matching passwords → Shows "passwords don't match" error

3. **Test Successful Registration**
   - [ ] Enter valid email and matching passwords (6+ chars)
   - [ ] Submit form → Should redirect to dashboard
   - [ ] Check if user appears in Supabase Auth dashboard

#### Login Testing
1. **Navigate to Login**
   - Go to `http://localhost:3000/login`
   - Check page loads with login form

2. **Test Login Validation**
   - [ ] Submit empty form → Shows validation errors
   - [ ] Enter invalid credentials → Shows login error

3. **Test Successful Login**
   - [ ] Enter valid credentials → Redirects to dashboard
   - [ ] User info displays correctly in header

### 3. Dashboard Testing
1. **Dashboard Content**
   - [ ] Dashboard loads with user email in header
   - [ ] Stats cards display (all showing 0 initially)
   - [ ] Quick actions section displays
   - [ ] Recent activity shows empty state

2. **Navigation**
   - [ ] "View Jobs" button → Redirects to `/jobs`
   - [ ] "Sign Out" button → Logs out and redirects to login

### 4. Jobs Page Testing
1. **Jobs Page Content**
   - [ ] Jobs page loads with header
   - [ ] Filter buttons display with counts
   - [ ] Search box is functional
   - [ ] Empty state displays when no jobs

2. **Navigation**
   - [ ] "Dashboard" button → Returns to dashboard
   - [ ] "Sign Out" button → Logs out and redirects to login

### 5. Authentication Persistence Testing
1. **Browser Refresh**
   - [ ] Login → Refresh page → Should stay logged in
   - [ ] Logout → Refresh page → Should stay logged out

2. **Direct URL Access**
   - [ ] While logged out, visit `/dashboard` → Redirects to login
   - [ ] While logged out, visit `/jobs` → Redirects to login
   - [ ] While logged in, visit `/login` → Should allow access (or optionally redirect to dashboard)

## 🐛 Common Issues & Troubleshooting

### Issue: "Element type is invalid" Error
- **Cause**: Missing component exports or incorrect imports
- **Fix**: Check all component files exist and have proper `export default`

### Issue: Sign Out Button Not Working
- **Cause**: Method name mismatch in AuthContext
- **Fix**: Ensure AuthContext provides `signOut` method (fixed in updated version)

### Issue: API Calls Failing
- **Cause**: Backend not running or incorrect API endpoints
- **Fix**:
  1. Check backend is running on port 3001
  2. Check `src/services/api.js` has correct base URL
  3. Check browser network tab for actual error responses

### Issue: Supabase Connection Issues
- **Cause**: Incorrect environment variables
- **Fix**:
  1. Check `.env` file has correct Supabase URL and keys
  2. Verify Supabase project is active
  3. Check browser console for Supabase-specific errors

### Issue: Routing Not Working
- **Cause**: React Router configuration issues
- **Fix**:
  1. Ensure all components are properly exported
  2. Check browser console for routing errors
  3. Verify protected routes are working correctly

## 🔧 Development Testing Commands

```bash
# Start frontend (in project root)
npm start

# Start backend (in backend directory)
cd backend
npm run dev

# Check for linting issues
npm run lint

# Run tests (when available)
npm test
```

## 📝 Test Data

### Valid Test Credentials
- **Email**: `test@example.com`
- **Password**: `password123`

### Test Job Data (for manual addition later)
```json
{
  "title": "Software Engineer",
  "company": "Test Company",
  "location": "Remote",
  "url": "https://example.com/job",
  "status": "saved"
}
```

## 🚀 Success Criteria

The application passes testing when:
- [ ] All authentication flows work without errors
- [ ] Navigation between pages works correctly
- [ ] User stays logged in after browser refresh
- [ ] Protected routes redirect properly when not authenticated
- [ ] No console errors during normal usage
- [ ] UI displays correctly on different screen sizes

## 📋 Testing Notes Template

Use this template to document your testing session:

```
Date: ___________
Tester: _________
Environment: Development/Staging/Production

✅ Passed Tests:
-

❌ Failed Tests:
-

🐛 Bugs Found:
-

📝 Additional Notes:
-
```
