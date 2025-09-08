#!/bin/bash
# =====================================================
# BACKEND API TESTING SCRIPT
# Run with: chmod +x test-api.sh && ./test-api.sh
# =====================================================

BASE_URL="http://localhost:3001"
API_URL="$BASE_URL/api"

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
echo -e "${BLUE}  JOB TRACKER API TESTING SCRIPT${NC}"
echo -e "${BLUE}======================================${NC}"
echo ""

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
}

# Test 1: Health Check
echo -e "${BLUE}1. Testing Health Check${NC}"
make_request "GET" "" "" ""
if curl -s "$BASE_URL/health" > /dev/null; then
    echo -e "${GREEN}✓ Health endpoint accessible${NC}"
else
    echo -e "${RED}✗ Health endpoint failed${NC}"
    echo -e "${RED}Make sure backend is running on port 3001${NC}"
    exit 1
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

# Check if we have a token
if [ -z "$ACCESS_TOKEN" ]; then
    echo -e "${RED}✗ No access token obtained. Cannot test protected endpoints.${NC}"
    echo -e "${YELLOW}Please check your Supabase configuration and database setup.${NC}"
    exit 1
fi

AUTH_HEADER="Authorization: Bearer $ACCESS_TOKEN"

# Test 4: Get Current User
echo -e "${BLUE}4. Testing Get Current User${NC}"
make_request "GET" "/auth/me" "" "$AUTH_HEADER"

# Test 5: Create Job
echo -e "${BLUE}5. Testing Create Job${NC}"
job_data='{
  "title": "Software Engineer",
  "company": "Test Company",
  "location": "Remote",
  "url": "https://example.com/job",
  "description": "A great software engineering position",
  "salary_min": 80000,
  "salary_max": 120000,
  "job_type": "Full-time",
  "source": "manual",
  "is_remote": true,
  "tags": ["javascript", "react", "node.js"]
}'
make_request "POST" "/jobs" "$job_data" "$AUTH_HEADER"

# Test 6: Get Jobs
echo -e "${BLUE}6. Testing Get Jobs${NC}"
make_request "GET" "/jobs" "" "$AUTH_HEADER"

# Test 7: Get User Profile
echo -e "${BLUE}7. Testing Get User Profile${NC}"
make_request "GET" "/users/profile" "" "$AUTH_HEADER"

# Test 8: Update User Profile
echo -e "${BLUE}8. Testing Update User Profile${NC}"
profile_data='{
  "first_name": "Test",
  "last_name": "User",
  "skills": ["JavaScript", "React", "Node.js"],
  "target_roles": ["Software Engineer", "Frontend Developer"],
  "experience_years": 3
}'
make_request "PUT" "/users/profile" "$profile_data" "$AUTH_HEADER"

# Test 9: Get Applications
echo -e "${BLUE}9. Testing Get Applications${NC}"
make_request "GET" "/applications" "" "$AUTH_HEADER"

# Test 10: Logout
echo -e "${BLUE}10. Testing Logout${NC}"
make_request "POST" "/auth/logout" "" "$AUTH_HEADER"

echo -e "${BLUE}======================================${NC}"
echo -e "${BLUE}  TESTING COMPLETE${NC}"
echo -e "${BLUE}======================================${NC}"
echo ""
echo -e "${YELLOW}If any tests failed, check:${NC}"
echo "1. Backend server is running (npm run dev in backend/)"
echo "2. Supabase environment variables are correct"
echo "3. Database schema is created in Supabase"
echo "4. CORS is configured properly"
echo ""
echo -e "${GREEN}Next step: Test the frontend integration!${NC}"
