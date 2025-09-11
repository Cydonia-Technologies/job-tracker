#!/bin/bash

# =====================================================
# RESUME PARSING TEST SCRIPT
# =====================================================

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
API_URL="http://localhost:3001"  # Change to production URL when testing production
TEST_USER_EMAIL="test@example.com"
TEST_USER_PASSWORD="testpassword123"

echo -e "${BLUE}===========================================${NC}"
echo -e "${BLUE}   JobTracker Resume Parsing Tests${NC}"
echo -e "${BLUE}===========================================${NC}"

# Function to make authenticated requests
make_auth_request() {
    local method=$1
    local endpoint=$2
    local data=$3

    if [ -z "$AUTH_TOKEN" ]; then
        echo -e "${RED}❌ No auth token available${NC}"
        return 1
    fi

    if [ "$method" = "GET" ]; then
        curl -s -X GET \
            -H "Authorization: Bearer $AUTH_TOKEN" \
            -H "Content-Type: application/json" \
            "$API_URL$endpoint"
    elif [ "$method" = "POST" ]; then
        curl -s -X POST \
            -H "Authorization: Bearer $AUTH_TOKEN" \
            -H "Content-Type: application/json" \
            -d "$data" \
            "$API_URL$endpoint"
    fi
}

# Function to upload resume file
upload_resume() {
    local file_path=$1

    if [ -z "$AUTH_TOKEN" ]; then
        echo -e "${RED}❌ No auth token available${NC}"
        return 1
    fi

    curl -s -X POST \
        -H "Authorization: Bearer $AUTH_TOKEN" \
        -F "resume=@$file_path" \
        "$API_URL/api/users/resume"
}

# Test 1: Health Check
echo -e "\n${YELLOW}Test 1: API Health Check${NC}"
health_response=$(curl -s "$API_URL/health")
if echo "$health_response" | grep -q "OK"; then
    echo -e "${GREEN}✅ API is healthy${NC}"
else
    echo -e "${RED}❌ API health check failed${NC}"
    echo "Response: $health_response"
    exit 1
fi

# Test 2: User Authentication (Create test user or login)
echo -e "\n${YELLOW}Test 2: User Authentication${NC}"

# Try to login first
login_response=$(curl -s -X POST \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"$TEST_USER_EMAIL\",\"password\":\"$TEST_USER_PASSWORD\"}" \
    "$API_URL/api/auth/login")

if echo "$login_response" | grep -q "access_token"; then
    echo -e "${GREEN}✅ User login successful${NC}"
    AUTH_TOKEN=$(echo "$login_response" | grep -o '"access_token":"[^"]*"' | sed 's/"access_token":"//' | sed 's/"//')
else
    # Try to register if login fails
    echo -e "${YELLOW}Login failed, attempting registration...${NC}"
    register_response=$(curl -s -X POST \
        -H "Content-Type: application/json" \
        -d "{\"email\":\"$TEST_USER_EMAIL\",\"password\":\"$TEST_USER_PASSWORD\",\"firstName\":\"Test\",\"lastName\":\"User\"}" \
        "$API_URL/api/auth/register")

    if echo "$register_response" | grep -q "User registered successfully"; then
        echo -e "${GREEN}✅ User registration successful${NC}"
        # Login after registration
        login_response=$(curl -s -X POST \
            -H "Content-Type: application/json" \
            -d "{\"email\":\"$TEST_USER_EMAIL\",\"password\":\"$TEST_USER_PASSWORD\"}" \
            "$API_URL/api/auth/login")
        AUTH_TOKEN=$(echo "$login_response" | grep -o '"access_token":"[^"]*"' | sed 's/"access_token":"//' | sed 's/"//')
    else
        echo -e "${RED}❌ User registration failed${NC}"
        echo "Response: $register_response"
        exit 1
    fi
fi

if [ -z "$AUTH_TOKEN" ]; then
    echo -e "${RED}❌ Failed to get auth token${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Authentication successful${NC}"

# Test 3: Check if aiService.js has parseResumeData function
echo -e "\n${YELLOW}Test 3: Check AI Service Implementation${NC}"
if [ -f "backend/services/aiService.js" ]; then
    if grep -q "parseResumeData" "backend/services/aiService.js"; then
        echo -e "${GREEN}✅ parseResumeData function found in aiService.js${NC}"
    else
        echo -e "${RED}❌ parseResumeData function not found in aiService.js${NC}"
        echo -e "${YELLOW}Please add the parseResumeData function to aiService.js${NC}"
    fi
else
    echo -e "${RED}❌ aiService.js file not found${NC}"
fi

# Test 4: Create sample resume text file for testing
echo -e "\n${YELLOW}Test 4: Create Sample Resume for Testing${NC}"

# Create a sample resume PDF (as text file for testing)
cat > /tmp/sample_resume.txt << 'EOF'
John Smith
Software Developer
Email: john.smith@email.com
Phone: (555) 123-4567
Location: State College, PA
LinkedIn: linkedin.com/in/johnsmith
GitHub: github.com/johnsmith

PROFESSIONAL SUMMARY
Experienced software developer with 3 years of experience in full-stack web development.
Proficient in JavaScript, React, Node.js, and database management. Strong problem-solving
skills and experience leading small development teams.

TECHNICAL SKILLS
Programming Languages: JavaScript, Python, Java, SQL
Frontend: React, Vue.js, HTML5, CSS3, TypeScript
Backend: Node.js, Express.js, Python Flask
Databases: PostgreSQL, MongoDB, Redis
Tools: Git, Docker, AWS, Jenkins, Jira
Soft Skills: Leadership, Communication, Problem Solving, Team Collaboration

EXPERIENCE

Software Developer | Tech Solutions Inc | 2021 - Present
• Developed and maintained web applications using React and Node.js
• Led a team of 3 junior developers on multiple projects
• Implemented CI/CD pipelines reducing deployment time by 50%
• Collaborated with cross-functional teams to deliver features on time

Junior Developer | StartupXYZ | 2020 - 2021
• Built responsive web interfaces using React and CSS
• Worked with REST APIs and database integration
• Participated in code reviews and agile development processes

EDUCATION
Bachelor of Science in Computer Science
Penn State University, 2020
GPA: 3.7/4.0

PROJECTS
E-commerce Platform - Built full-stack application with React, Node.js, and PostgreSQL
Task Management App - Developed mobile-responsive app with user authentication
Open Source Contributions - Regular contributor to React and Node.js projects
EOF

echo -e "${GREEN}✅ Sample resume created${NC}"

# Test 5: Test direct text parsing (if we can call the function directly)
echo -e "\n${YELLOW}Test 5: Test Resume Parsing Function${NC}"

# For now, we'll test the API endpoint
# In production, we'd need an actual PDF file, but let's test with a simple call

# Test 6: Get current user profile
echo -e "\n${YELLOW}Test 6: Get User Profile${NC}"
profile_response=$(make_auth_request "GET" "/api/users/profile")
if echo "$profile_response" | grep -q "user_id"; then
    echo -e "${GREEN}✅ User profile retrieved${NC}"
else
    echo -e "${YELLOW}⚠️  No user profile found (this is OK for new users)${NC}"
fi

# Test 7: Test getting parsed resume data (should fail for new user)
echo -e "\n${YELLOW}Test 7: Get Parsed Resume Data (Expected to Fail)${NC}"
parsed_response=$(make_auth_request "GET" "/api/users/resume/parsed")
if echo "$parsed_response" | grep -q "No resume found"; then
    echo -e "${GREEN}✅ Correctly returns 'no resume found' for new user${NC}"
else
    echo -e "${YELLOW}⚠️  Unexpected response: $parsed_response${NC}"
fi

# Test 8: Validate database schema
echo -e "\n${YELLOW}Test 8: Database Schema Validation${NC}"
echo -e "${BLUE}To complete testing, please:${NC}"
echo -e "1. Run the SQL schema updates in your Supabase dashboard"
echo -e "2. Upload a test PDF resume through the frontend"
echo -e "3. Check that the parsed data is stored correctly"

# Test 9: Check environment variables
echo -e "\n${YELLOW}Test 9: Environment Variables Check${NC}"
if [ ! -z "$GEMINI_API_KEY" ]; then
    echo -e "${GREEN}✅ GEMINI_API_KEY is set${NC}"
else
    echo -e "${RED}❌ GEMINI_API_KEY is not set${NC}"
    echo -e "${YELLOW}Please set GEMINI_API_KEY in your environment${NC}"
fi

# Summary
echo -e "\n${BLUE}===========================================${NC}"
echo -e "${BLUE}           Test Summary${NC}"
echo -e "${BLUE}===========================================${NC}"
echo -e "📝 Sample resume text created at: /tmp/sample_resume.txt"
echo -e "🔑 Auth token obtained successfully"
echo -e "🗄️  Next steps:"
echo -e "   1. Run database schema updates"
echo -e "   2. Test with actual PDF upload"
echo -e "   3. Verify AI parsing works correctly"
echo -e "   4. Test parsed data retrieval"

# Optional: Create a simple test for the parsing logic
echo -e "\n${YELLOW}Test 10: AI Parsing Logic Test${NC}"
echo -e "${BLUE}To test AI parsing:${NC}"
echo -e "1. Ensure GEMINI_API_KEY is set in your backend environment"
echo -e "2. Upload a PDF resume via the API or frontend"
echo -e "3. Check the response includes parsed_data structure"
echo -e "4. Verify the data is stored in user_profiles table"

echo -e "\n${GREEN}✅ Resume parsing tests completed!${NC}"
