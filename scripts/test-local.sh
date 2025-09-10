#!/bin/bash
# =====================================================
# LOCAL DEVELOPMENT API TESTING SCRIPT
# Run from root directory: ./scripts/test-local.sh
# =====================================================

# Get script directory and project root
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
PROJECT_ROOT="$( cd "$SCRIPT_DIR/.." &> /dev/null && pwd )"

BASE_URL="http://localhost:3001"
API_URL="$BASE_URL/api"
FRONTEND_URL="http://localhost:3000"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test variables
RANDOM_VAL=$((10+$RANDOM%100))
TEST_EMAIL_REGISTER="karalar.alpefe+test$RANDOM_VAL@gmail.com"
TEST_EMAIL_LOGIN="karalar.alpefe+test@gmail.com"
TEST_PASSWORD="password123"
ACCESS_TOKEN=""

echo -e "${BLUE}======================================${NC}"
echo -e "${BLUE}  JOB TRACKER LOCAL TESTING SCRIPT${NC}"
echo -e "${BLUE}======================================${NC}"
echo -e "${YELLOW}Running from: $PROJECT_ROOT${NC}"
echo -e "${YELLOW}Backend URL: $BASE_URL${NC}"
echo -e "${YELLOW}Frontend URL: $FRONTEND_URL${NC}"
echo ""

# Check if backend is running
check_backend() {
    echo -e "${BLUE}🔍 Checking backend availability...${NC}"
    if curl -s "$BASE_URL/health" > /dev/null; then
        echo -e "${GREEN}✅ Backend is running${NC}"
        return 0
    else
        echo -e "${RED}❌ Backend is not running${NC}"
        echo -e "${YELLOW}💡 To start backend: cd backend && npm run dev${NC}"
        return 1
    fi
}

# Check if frontend is running
check_frontend() {
    echo -e "${BLUE}🔍 Checking frontend availability...${NC}"
    if curl -s "$FRONTEND_URL" > /dev/null; then
        echo -e "${GREEN}✅ Frontend is running${NC}"
        return 0
    else
        echo -e "${YELLOW}⚠️  Frontend is not running${NC}"
        echo -e "${YELLOW}💡 To start frontend: cd frontend && npm start${NC}"
        return 1
    fi
}

# Function to make HTTP requests and pretty print
make_request() {
    local method=$1
    local endpoint=$2
    local data=$3
    local headers=$4

    echo -e "${YELLOW}Testing: $method $endpoint${NC}"

    if [ -n "$data" ]; then
        if [ -n "$headers" ]; then
            response=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X "$method" \
                -H "Content-Type: application/json" \
                -H "$headers" \
                -d "$data" "$API_URL$endpoint")
        else
            response=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X "$method" \
                -H "Content-Type: application/json" \
                -d "$data" "$API_URL$endpoint")
        fi
    else
        if [ -n "$headers" ]; then
            response=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X "$method" \
                -H "Content-Type: application/json" \
                -H "$headers" "$API_URL$endpoint")
        else
            response=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X "$method" \
                -H "Content-Type: application/json" "$API_URL$endpoint")
        fi
    fi

    # Extract response body and status
    body=$(echo "$response" | sed -n '1,/HTTP_STATUS:/p' | sed '$d')
    status=$(echo "$response" | grep "HTTP_STATUS:" | cut -d: -f2)

    if [ "$status" -lt 300 ]; then
        echo -e "${GREEN}✓ Success ($status)${NC}"
        echo "$body" | jq . 2>/dev/null || echo "$body"
    else
        echo -e "${RED}✗ Failed ($status)${NC}"
        echo "$body" | jq . 2>/dev/null || echo "$body"
    fi
    echo ""

    # Extract token from auth responses
    if [[ "$endpoint" == "/auth/register" || "$endpoint" == "/auth/login" ]]; then
        ACCESS_TOKEN=$(echo "$body" | jq -r '.session.access_token // empty' 2>/dev/null)
        if [ -n "$ACCESS_TOKEN" ] && [ "$ACCESS_TOKEN" != "null" ]; then
            echo -e "${GREEN}✓ Token extracted: ${ACCESS_TOKEN:0:20}...${NC}"
            echo ""
        fi
    fi

    return $status
}

# Test file upload for resume grader
test_resume_grader() {
    echo -e "${BLUE}Testing Resume Grader (Public Endpoint)${NC}"

    # Create a simple test PDF using pandoc if available
    local test_pdf="/tmp/test_resume_local.pdf"

    if command -v pandoc >/dev/null 2>&1; then
        cat > /tmp/test_resume.md << 'EOF'
# John Doe - Software Engineer

**Email:** john.doe@email.com | **Phone:** (555) 123-4567

## Experience
**Software Engineer** - Tech Company (2022-Present)
- Developed React applications with Node.js backends
- Implemented REST APIs using Express.js
- Worked with PostgreSQL databases

## Skills
- JavaScript, React, Node.js, Python, SQL
- Git, Docker, AWS

## Education
**BS Computer Science** - University (2018-2022)
EOF
        pandoc /tmp/test_resume.md -o "$test_pdf" 2>/dev/null

        if [ -f "$test_pdf" ]; then
            echo -e "${YELLOW}Testing: POST /api/ai/resume-grade${NC}"
            response=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X POST \
                -F "resume=@$test_pdf" \
                "$API_URL/ai/resume-grade" 2>/dev/null)

            body=$(echo "$response" | sed -n '1,/HTTP_STATUS:/p' | sed '$d')
            status=$(echo "$response" | grep "HTTP_STATUS:" | cut -d: -f2)

            if [ "$status" = "200" ]; then
                echo -e "${GREEN}✓ Resume grader working ($status)${NC}"
                echo "$body" | jq . 2>/dev/null || echo "$body"

                # Extract score if available
                score=$(echo "$body" | jq -r '.overall_score // empty' 2>/dev/null)
                if [ -n "$score" ]; then
                    echo -e "${GREEN}✓ AI Analysis Score: $score/100${NC}"
                fi
            else
                echo -e "${RED}✗ Resume grader failed ($status)${NC}"
                echo "$body"
            fi

            # Cleanup
            rm -f "$test_pdf" /tmp/test_resume.md
        else
            echo -e "${YELLOW}⚠️  Could not create test PDF${NC}"
        fi
    else
        echo -e "${YELLOW}⚠️  pandoc not available, skipping resume grader test${NC}"
        echo -e "${YELLOW}💡 Install pandoc to test resume grader: sudo apt-get install pandoc${NC}"
    fi
    echo ""
}

# Pre-flight checks
echo -e "${BLUE}🚀 Running pre-flight checks...${NC}"
echo ""

if ! check_backend; then
    echo -e "${RED}❌ Backend check failed. Please start the backend server.${NC}"
    exit 1
fi

check_frontend  # Frontend is optional for API testing

echo ""

# Test 1: Health Check
echo -e "${BLUE}1. Testing Health Check${NC}"
make_request "GET" "" "" ""
health_response=$(curl -s "$BASE_URL/health")
if echo "$health_response" | jq . >/dev/null 2>&1; then
    echo -e "${GREEN}✓ Health endpoint returning valid JSON${NC}"
    echo "$health_response" | jq .
else
    echo -e "${RED}✗ Health endpoint not returning valid JSON${NC}"
fi
echo ""

# Test 2: User Registration
echo -e "${BLUE}2. Testing User Registration${NC}"
registration_data='{
  "email": "'$TEST_EMAIL_REGISTER'",
  "password": "'$TEST_PASSWORD'",
  "firstName": "Test",
  "lastName": "User"
}'
make_request "POST" "/auth/register" "$registration_data"

# Test 3: User Login (if registration failed, try login)
echo -e "${BLUE}3. Testing User Login${NC}"
login_data='{
  "email": "'$TEST_EMAIL_LOGIN'",
  "password": "'$TEST_PASSWORD'"
}'
make_request "POST" "/auth/login" "$login_data"

# Test 4: Resume Grader (Public Endpoint)
test_resume_grader

# Check if we have a token for protected endpoints
if [ -z "$ACCESS_TOKEN" ]; then
    echo -e "${RED}❌ No access token obtained. Cannot test protected endpoints.${NC}"
    echo -e "${YELLOW}💡 This might be normal for first run. Check:${NC}"
    echo "   1. Supabase environment variables are correct"
    echo "   2. Database schema is created in Supabase"
    echo "   3. CORS is configured properly"
    echo ""
    echo -e "${BLUE}🔧 Continuing with non-authenticated tests...${NC}"
    echo ""
else
    AUTH_HEADER="Authorization: Bearer $ACCESS_TOKEN"

    # Test 5: Get Current User
    echo -e "${BLUE}5. Testing Get Current User${NC}"
    make_request "GET" "/auth/me" "" "$AUTH_HEADER"

    # Test 6: Create Job
    echo -e "${BLUE}6. Testing Create Job${NC}"
    job_data='{
      "title": "Software Engineer",
      "company": "Test Company",
      "location": "Remote",
      "url": "https://example.com/job",
      "description": "A great software engineering position",
      "salary_min": 80000,
      "salary_max": 120000,
      "job_type": "Full-time",
      "source": "other",
      "is_remote": true,
      "tags": ["javascript", "react", "node.js"]
    }'
    make_request "POST" "/jobs" "$job_data" "$AUTH_HEADER"

    # Test 7: Get Jobs
    echo -e "${BLUE}7. Testing Get Jobs${NC}"
    make_request "GET" "/jobs" "" "$AUTH_HEADER"

    # Test 8: Get User Profile
    echo -e "${BLUE}8. Testing Get User Profile${NC}"
    make_request "GET" "/users/profile" "" "$AUTH_HEADER"

    # Test 9: Update User Profile
    echo -e "${BLUE}9. Testing Update User Profile${NC}"
    profile_data='{
      "first_name": "Test",
      "last_name": "User",
      "skills": ["JavaScript", "React", "Node.js"],
      "target_roles": ["Software Engineer", "Frontend Developer"],
      "experience_years": 3
    }'
    make_request "PUT" "/users/profile" "$profile_data" "$AUTH_HEADER"

    # Test 10: Get Applications
    echo -e "${BLUE}10. Testing Get Applications${NC}"
    make_request "GET" "/applications" "" "$AUTH_HEADER"

    # Test 11: Job Match Analysis
    echo -e "${BLUE}11. Testing Job Match Analysis${NC}"
    # First, let's try to get a job ID from the jobs list
    jobs_response=$(curl -s -H "Authorization: Bearer $ACCESS_TOKEN" "$API_URL/jobs")
    job_id=$(echo "$jobs_response" | jq -r '.jobs[0].id // empty' 2>/dev/null)

    if [ -n "$job_id" ] && [ "$job_id" != "null" ]; then
        match_data='{"job_id": "'$job_id'"}'
        make_request "POST" "/ai/job-match" "$match_data" "$AUTH_HEADER"
    else
        echo -e "${YELLOW}⚠️  No jobs found to test job matching${NC}"
    fi

    # Test 12: Logout
    echo -e "${BLUE}12. Testing Logout${NC}"
    make_request "POST" "/auth/logout" "" "$AUTH_HEADER"
fi

# Test 13: Rate Limiting
echo -e "${BLUE}13. Testing Rate Limiting${NC}"
echo -e "${YELLOW}Making 5 rapid requests to test rate limiting...${NC}"
for i in {1..5}; do
    status=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/health")
    if [ "$status" = "429" ]; then
        echo -e "${GREEN}✓ Rate limiting working (got 429 on request $i)${NC}"
        break
    elif [ "$i" = "5" ]; then
        echo -e "${YELLOW}⚠️  Rate limiting not triggered (all requests succeeded)${NC}"
    fi
done
echo ""

echo -e "${BLUE}======================================${NC}"
echo -e "${BLUE}  LOCAL TESTING COMPLETE${NC}"
echo -e "${BLUE}======================================${NC}"
echo ""
echo -e "${GREEN}✅ Local API testing finished!${NC}"
echo ""
echo -e "${YELLOW}💡 Next steps:${NC}"
echo "   1. If tests failed, check backend logs: cd backend && npm run dev"
echo "   2. Test frontend integration: cd frontend && npm start"
echo "   3. Test production deployment: ./scripts/test-production.sh"
echo ""
echo -e "${BLUE}📁 Project structure:${NC}"
echo "   • Backend API: $BASE_URL"
echo "   • Frontend App: $FRONTEND_URL"
echo "   • Test Scripts: $PROJECT_ROOT/scripts/"
