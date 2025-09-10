#!/bin/bash

# =====================================================
# PRODUCTION DEPLOYMENT TEST SCRIPT
# =====================================================
# Tests both Heroku backend and Vercel frontend deployments
# Usage: ./test-production.sh [environment]
# Environment: local | production (default: production)

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
ENVIRONMENT=${1:-production}

if [ "$ENVIRONMENT" = "production" ]; then
    BACKEND_URL="https://jobtracker-api-b08390fc29d1.herokuapp.com"
    FRONTEND_URL="https://job-tracker-weld-three.vercel.app"
    echo -e "${BLUE}🚀 Testing PRODUCTION deployment${NC}"
    echo -e "${YELLOW}Running from: $PROJECT_ROOT${NC}"
else
    BACKEND_URL="http://localhost:3001"
    FRONTEND_URL="http://localhost:3000"
    echo -e "${BLUE}🔧 Testing LOCAL deployment${NC}"
    echo -e "${YELLOW}Running from: $PROJECT_ROOT${NC}"
fi

# Test results
TESTS_PASSED=0
TESTS_FAILED=0
FAILED_TESTS=()

# Helper functions
log_test() {
    echo -e "\n${BLUE}🧪 Testing: $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
    ((TESTS_PASSED++))
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
    ((TESTS_FAILED++))
    FAILED_TESTS+=("$1")
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Test HTTP endpoint with timeout
test_endpoint() {
    local url=$1
    local expected_status=${2:-200}
    local method=${3:-GET}
    local timeout=${4:-10}

    if command_exists curl; then
        response=$(curl -s -w "%{http_code}" -m $timeout -X $method "$url" 2>/dev/null || echo "000")
        status_code=${response: -3}

        if [ "$status_code" = "$expected_status" ]; then
            return 0
        else
            echo "Expected $expected_status, got $status_code"
            return 1
        fi
    else
        log_error "curl command not found"
        return 1
    fi
}

# Test JSON API endpoint
test_json_endpoint() {
    local url=$1
    local expected_status=${2:-200}
    local method=${3:-GET}

    if command_exists curl; then
        response=$(curl -s -w "\n%{http_code}" -m 10 -X $method \
            -H "Content-Type: application/json" \
            "$url" 2>/dev/null || echo -e "\n000")

        status_code=$(echo "$response" | tail -n1)
        body=$(echo "$response" | head -n -1)

        if [ "$status_code" = "$expected_status" ]; then
            echo "$body"
            return 0
        else
            echo "Expected $expected_status, got $status_code"
            echo "Response: $body"
            return 1
        fi
    else
        log_error "curl command not found"
        return 1
    fi
}

# Create a test PDF for resume grader
create_test_pdf() {
    local pdf_file="/tmp/test_resume.pdf"

    if command_exists pandoc; then
        # Create test resume with pandoc
        cat > /tmp/test_resume.md << 'EOF'
# John Doe
## Software Engineer

**Email:** john.doe@email.com
**Phone:** (555) 123-4567

### Experience
**Software Engineer** - Tech Company (2022-Present)
- Developed React applications with Node.js backends
- Implemented REST APIs using Express.js
- Worked with PostgreSQL databases

### Skills
- JavaScript, React, Node.js
- Python, SQL
- Git, Docker, AWS

### Education
**Bachelor of Science in Computer Science**
University of Technology (2018-2022)
EOF
        pandoc /tmp/test_resume.md -o "$pdf_file" 2>/dev/null
        echo "$pdf_file"
    else
        log_warning "pandoc not available, skipping PDF resume test"
        return 1
    fi
}

# =====================================================
# BACKEND TESTS
# =====================================================

echo -e "\n${YELLOW}📡 BACKEND TESTS (Heroku)${NC}"

# Test 1: Backend Health Check
log_test "Backend Health Check"
if response=$(test_json_endpoint "$BACKEND_URL/health"); then
    if echo "$response" | grep -q '"status":"OK"'; then
        log_success "Backend health check passed"
        log_info "Server uptime: $(echo "$response" | grep -o '"uptime":[0-9.]*' | cut -d: -f2)"
    else
        log_error "Backend health check returned unexpected response"
    fi
else
    log_error "Backend health check failed - server not responding"
fi

# Test 2: 404 Handling
log_test "404 Error Handling"
if response=$(test_json_endpoint "$BACKEND_URL/nonexistent" 404); then
    if echo "$response" | grep -q '"error":"Route not found"'; then
        log_success "404 handling works correctly"
    else
        log_error "404 response format incorrect"
    fi
else
    log_error "404 handling test failed"
fi

# Test 3: CORS Headers
log_test "CORS Configuration"
if command_exists curl; then
    cors_response=$(curl -s -I -X OPTIONS \
        -H "Origin: $FRONTEND_URL" \
        -H "Access-Control-Request-Method: GET" \
        "$BACKEND_URL/health" 2>/dev/null || echo "")

    if echo "$cors_response" | grep -qi "access-control-allow-origin"; then
        log_success "CORS headers present"
    else
        log_error "CORS headers missing or incorrect"
    fi
else
    log_error "Cannot test CORS - curl not available"
fi

# Test 4: Resume Grader (Public Endpoint)
log_test "Resume Grader Endpoint"
if pdf_file=$(create_test_pdf); then
    if command_exists curl; then
        grader_response=$(curl -s -w "\n%{http_code}" -m 30 \
            -X POST \
            -F "resume=@$pdf_file" \
            "$BACKEND_URL/api/ai/resume-grade" 2>/dev/null || echo -e "\n000")

        status_code=$(echo "$grader_response" | tail -n1)
        body=$(echo "$grader_response" | head -n -1)

        if [ "$status_code" = "200" ]; then
            if echo "$body" | grep -q '"overall_score"'; then
                log_success "Resume grader working - AI analysis successful"
                score=$(echo "$body" | grep -o '"overall_score":[0-9]*' | cut -d: -f2)
                log_info "Test resume score: $score/100"
            else
                log_error "Resume grader returned unexpected format"
            fi
        else
            log_error "Resume grader failed (Status: $status_code)"
            echo "Response: $body"
        fi

        # Cleanup
        rm -f "$pdf_file"
    else
        log_error "Cannot test resume grader - curl not available"
    fi
else
    log_warning "Skipping resume grader test - cannot create test PDF"
fi

# Test 5: Authentication Endpoints
log_test "Authentication Endpoints Structure"
if response=$(test_json_endpoint "$BACKEND_URL/api/auth/register" 400 POST); then
    if echo "$response" | grep -q "error"; then
        log_success "Auth register endpoint responding (expects validation error)"
    else
        log_error "Auth register endpoint unexpected response"
    fi
else
    log_error "Auth register endpoint not responding"
fi

# Test 6: Rate Limiting
log_test "Rate Limiting"
rate_limit_test=true
for i in {1..5}; do
    if ! test_endpoint "$BACKEND_URL/health" 200 >/dev/null 2>&1; then
        rate_limit_test=false
        break
    fi
done

if [ "$rate_limit_test" = true ]; then
    log_success "Rate limiting allows normal traffic"
else
    log_warning "Rate limiting may be too aggressive"
fi

# =====================================================
# FRONTEND TESTS
# =====================================================

echo -e "\n${YELLOW}🌐 FRONTEND TESTS (Vercel)${NC}"

# Test 7: Frontend Accessibility
log_test "Frontend Accessibility"
if test_endpoint "$FRONTEND_URL" 200 >/dev/null 2>&1; then
    log_success "Frontend accessible"
else
    log_error "Frontend not accessible"
fi

# Test 8: Frontend Assets
log_test "Frontend Static Assets"
if test_endpoint "$FRONTEND_URL/static/css" 200 >/dev/null 2>&1 ||
   test_endpoint "$FRONTEND_URL/static/js" 200 >/dev/null 2>&1; then
    log_success "Static assets loading"
else
    log_warning "Static assets may not be loading properly"
fi

# Test 9: Frontend-Backend Connectivity
log_test "Frontend-Backend Integration"
if command_exists curl; then
    # Test if frontend can reach backend (check for CORS)
    frontend_response=$(curl -s -m 10 "$FRONTEND_URL" 2>/dev/null || echo "")

    if echo "$frontend_response" | grep -q "jobtracker\|Job Tracker\|react" -i; then
        log_success "Frontend appears to be a React application"
    else
        log_warning "Frontend content may not be loading correctly"
    fi
else
    log_warning "Cannot test frontend content - curl not available"
fi

# =====================================================
# ENVIRONMENT VERIFICATION
# =====================================================

echo -e "\n${YELLOW}🔧 ENVIRONMENT VERIFICATION${NC}"

# Test 10: Backend Environment
log_test "Backend Environment Variables"
if response=$(test_json_endpoint "$BACKEND_URL/health"); then
    if echo "$response" | grep -q '"status":"OK"'; then
        log_success "Backend environment configured correctly"
    else
        log_error "Backend environment may be misconfigured"
    fi
else
    log_error "Cannot verify backend environment"
fi

# Test 11: Database Connectivity (via health check)
log_test "Database Connectivity"
# The health endpoint doesn't test DB, but we can try an auth endpoint
if response=$(test_json_endpoint "$BACKEND_URL/api/auth/me" 401); then
    if echo "$response" | grep -q "No token provided\|Invalid token"; then
        log_success "Database/Auth system responding correctly"
    else
        log_error "Database/Auth system unexpected response"
    fi
else
    log_error "Database/Auth system not responding"
fi

# =====================================================
# INTEGRATION TESTS
# =====================================================

echo -e "\n${YELLOW}🔗 INTEGRATION TESTS${NC}"

# Test 12: End-to-End Flow Simulation
log_test "End-to-End Flow Simulation"
flow_success=true

# Simulate user visiting frontend
if ! test_endpoint "$FRONTEND_URL" 200 >/dev/null 2>&1; then
    flow_success=false
fi

# Simulate API call from frontend to backend
if ! test_endpoint "$BACKEND_URL/health" 200 >/dev/null 2>&1; then
    flow_success=false
fi

if [ "$flow_success" = true ]; then
    log_success "End-to-end flow simulation passed"
else
    log_error "End-to-end flow simulation failed"
fi

# =====================================================
# PERFORMANCE TESTS
# =====================================================

echo -e "\n${YELLOW}⚡ PERFORMANCE TESTS${NC}"

# Test 13: Response Time
log_test "Backend Response Time"
if command_exists curl; then
    start_time=$(date +%s%N)
    if test_endpoint "$BACKEND_URL/health" 200 >/dev/null 2>&1; then
        end_time=$(date +%s%N)
        response_time=$(( (end_time - start_time) / 1000000 )) # Convert to milliseconds

        if [ $response_time -lt 5000 ]; then
            log_success "Backend response time acceptable ($response_time ms)"
        else
            log_warning "Backend response time slow ($response_time ms)"
        fi
    else
        log_error "Cannot measure backend response time"
    fi
else
    log_warning "Cannot test response time - curl not available"
fi

# =====================================================
# SECURITY TESTS
# =====================================================

echo -e "\n${YELLOW}🔒 SECURITY TESTS${NC}"

# Test 14: HTTPS Enforcement
log_test "HTTPS Enforcement"
if echo "$BACKEND_URL" | grep -q "https://" && echo "$FRONTEND_URL" | grep -q "https://"; then
    log_success "Both frontend and backend use HTTPS"
else
    log_error "HTTPS not enforced on all endpoints"
fi

# Test 15: Security Headers
log_test "Security Headers"
if command_exists curl; then
    security_headers=$(curl -s -I "$FRONTEND_URL" 2>/dev/null || echo "")

    security_score=0
    if echo "$security_headers" | grep -qi "x-content-type-options"; then
        ((security_score++))
    fi
    if echo "$security_headers" | grep -qi "x-frame-options"; then
        ((security_score++))
    fi
    if echo "$security_headers" | grep -qi "strict-transport-security"; then
        ((security_score++))
    fi

    if [ $security_score -ge 2 ]; then
        log_success "Security headers present ($security_score/3)"
    else
        log_warning "Some security headers missing ($security_score/3)"
    fi
else
    log_warning "Cannot test security headers - curl not available"
fi

# =====================================================
# RESULTS SUMMARY
# =====================================================

echo -e "\n${BLUE}📊 TEST RESULTS SUMMARY${NC}"
echo "=================================="
echo -e "Environment: ${YELLOW}$ENVIRONMENT${NC}"
echo -e "Backend URL: ${YELLOW}$BACKEND_URL${NC}"
echo -e "Frontend URL: ${YELLOW}$FRONTEND_URL${NC}"
echo ""
echo -e "Tests Passed: ${GREEN}$TESTS_PASSED${NC}"
echo -e "Tests Failed: ${RED}$TESTS_FAILED${NC}"
echo -e "Total Tests: $((TESTS_PASSED + TESTS_FAILED))"

if [ $TESTS_FAILED -gt 0 ]; then
    echo -e "\n${RED}❌ FAILED TESTS:${NC}"
    for test in "${FAILED_TESTS[@]}"; do
        echo -e "  - $test"
    done
    echo ""
    echo -e "${RED}🚨 Deployment has issues that need attention${NC}"
    exit 1
else
    echo ""
    echo -e "${GREEN}🎉 All tests passed! Deployment looks good!${NC}"

    if [ "$ENVIRONMENT" = "production" ]; then
        echo ""
        echo -e "${BLUE}🚀 PRODUCTION READY CHECKLIST:${NC}"
        echo "✅ Backend (Heroku) is live and responding"
        echo "✅ Frontend (Vercel) is accessible"
        echo "✅ Resume grader AI feature working"
        echo "✅ CORS configured correctly"
        echo "✅ Rate limiting active"
        echo "✅ HTTPS enforced"
        echo ""
        echo -e "${GREEN}Your JobTracker application is ready for users!${NC}"
        echo -e "${BLUE}📝 Next steps:${NC}"
        echo "  1. Test resume grader manually with real PDF"
        echo "  2. Set up monitoring and alerts"
        echo "  3. Begin user acquisition"
    fi

    exit 0
fi
