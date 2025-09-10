#!/bin/bash

# =====================================================
# MASTER TEST RUNNER FOR JOB TRACKER
# =====================================================
# Run from root directory: ./scripts/test-all.sh [environment]
# Environment: local | production | all (default: all)

# Get script directory and project root
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
PROJECT_ROOT="$( cd "$SCRIPT_DIR/.." &> /dev/null && pwd )"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

ENVIRONMENT=${1:-all}

echo -e "${PURPLE}╔══════════════════════════════════════════╗${NC}"
echo -e "${PURPLE}║         JOB TRACKER TEST SUITE           ║${NC}"
echo -e "${PURPLE}╚══════════════════════════════════════════╝${NC}"
echo ""
echo -e "${CYAN}Project Root: $PROJECT_ROOT${NC}"
echo -e "${CYAN}Test Environment: $ENVIRONMENT${NC}"
echo ""

# Check script permissions
check_script_permissions() {
    local script=$1
    if [ ! -x "$script" ]; then
        echo -e "${YELLOW}⚠️  Making $script executable...${NC}"
        chmod +x "$script"
    fi
}

# Display project status
show_project_status() {
    echo -e "${BLUE}📊 PROJECT STATUS${NC}"
    echo "=================================="

    # Check if processes are running locally
    if [ "$ENVIRONMENT" = "local" ] || [ "$ENVIRONMENT" = "all" ]; then
        echo -e "${YELLOW}Local Development:${NC}"

        # Check backend
        if curl -s http://localhost:3001/health >/dev/null 2>&1; then
            echo -e "  Backend (3001): ${GREEN}✅ Running${NC}"
        else
            echo -e "  Backend (3001): ${RED}❌ Not running${NC}"
        fi

        # Check frontend
        if curl -s http://localhost:3000 >/dev/null 2>&1; then
            echo -e "  Frontend (3000): ${GREEN}✅ Running${NC}"
        else
            echo -e "  Frontend (3000): ${RED}❌ Not running${NC}"
        fi
        echo ""
    fi

    if [ "$ENVIRONMENT" = "production" ] || [ "$ENVIRONMENT" = "all" ]; then
        echo -e "${YELLOW}Production Deployment:${NC}"

        # Check Heroku backend
        if curl -s https://jobtracker-api-b08390fc29d1.herokuapp.com/health >/dev/null 2>&1; then
            echo -e "  Heroku Backend: ${GREEN}✅ Live${NC}"
        else
            echo -e "  Heroku Backend: ${RED}❌ Down${NC}"
        fi

        # Check Vercel frontend
        if curl -s https://job-tracker-weld-three.vercel.app >/dev/null 2>&1; then
            echo -e "  Vercel Frontend: ${GREEN}✅ Live${NC}"
        else
            echo -e "  Vercel Frontend: ${RED}❌ Down${NC}"
        fi
        echo ""
    fi
}

# Run test with error handling
run_test() {
    local test_name=$1
    local script_path=$2
    local args=${3:-""}

    echo -e "${PURPLE}╔══════════════════════════════════════════╗${NC}"
    echo -e "${PURPLE}║  $test_name${NC}"
    echo -e "${PURPLE}╚══════════════════════════════════════════╝${NC}"
    echo ""

    check_script_permissions "$script_path"

    if [ -f "$script_path" ]; then
        if $script_path $args; then
            echo ""
            echo -e "${GREEN}✅ $test_name PASSED${NC}"
            return 0
        else
            echo ""
            echo -e "${RED}❌ $test_name FAILED${NC}"
            return 1
        fi
    else
        echo -e "${RED}❌ Test script not found: $script_path${NC}"
        return 1
    fi
}

# Main test execution
main() {
    cd "$PROJECT_ROOT" || exit 1

    show_project_status

    local tests_run=0
    local tests_passed=0
    local tests_failed=0
    local failed_tests=()

    # Run tests based on environment
    case $ENVIRONMENT in
        "local")
            echo -e "${BLUE}🔧 Running LOCAL tests only...${NC}"
            echo ""

            if run_test "LOCAL DEVELOPMENT API TESTS" "$SCRIPT_DIR/test-local.sh"; then
                ((tests_passed++))
            else
                ((tests_failed++))
                failed_tests+=("Local Development Tests")
            fi
            ((tests_run++))
            ;;

        "production")
            echo -e "${BLUE}🚀 Running PRODUCTION tests only...${NC}"
            echo ""

            if run_test "PRODUCTION DEPLOYMENT TESTS" "$SCRIPT_DIR/test-production.sh" "production"; then
                ((tests_passed++))
            else
                ((tests_failed++))
                failed_tests+=("Production Deployment Tests")
            fi
            ((tests_run++))
            ;;

        "all")
            echo -e "${BLUE}🎯 Running ALL tests...${NC}"
            echo ""

            # Local tests first
            if run_test "LOCAL DEVELOPMENT API TESTS" "$SCRIPT_DIR/test-local.sh"; then
                ((tests_passed++))
            else
                ((tests_failed++))
                failed_tests+=("Local Development Tests")
            fi
            ((tests_run++))

            echo ""
            echo -e "${CYAN}═══════════════════════════════════════════${NC}"
            echo ""

            # Production tests second
            if run_test "PRODUCTION DEPLOYMENT TESTS" "$SCRIPT_DIR/test-production.sh" "production"; then
                ((tests_passed++))
            else
                ((tests_failed++))
                failed_tests+=("Production Deployment Tests")
            fi
            ((tests_run++))
            ;;

        *)
            echo -e "${RED}❌ Invalid environment: $ENVIRONMENT${NC}"
            echo -e "${YELLOW}Usage: $0 [local|production|all]${NC}"
            exit 1
            ;;
    esac

    # Final summary
    echo ""
    echo -e "${PURPLE}╔══════════════════════════════════════════╗${NC}"
    echo -e "${PURPLE}║            FINAL SUMMARY                 ║${NC}"
    echo -e "${PURPLE}╚══════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "Environment: ${YELLOW}$ENVIRONMENT${NC}"
    echo -e "Tests Run: ${BLUE}$tests_run${NC}"
    echo -e "Tests Passed: ${GREEN}$tests_passed${NC}"
    echo -e "Tests Failed: ${RED}$tests_failed${NC}"

    if [ $tests_failed -gt 0 ]; then
        echo ""
        echo -e "${RED}❌ FAILED TEST SUITES:${NC}"
        for test in "${failed_tests[@]}"; do
            echo -e "  • $test"
        done
        echo ""
        echo -e "${RED}🚨 Some tests failed. Check the output above for details.${NC}"

        echo ""
        echo -e "${YELLOW}💡 TROUBLESHOOTING TIPS:${NC}"
        echo "   1. For local tests: Ensure backend and frontend are running"
        echo "   2. For production tests: Check Heroku and Vercel deployments"
        echo "   3. Check environment variables are set correctly"
        echo "   4. Review individual test output for specific errors"

        exit 1
    else
        echo ""
        echo -e "${GREEN}🎉 ALL TESTS PASSED! 🎉${NC}"

        if [ "$ENVIRONMENT" = "all" ] || [ "$ENVIRONMENT" = "production" ]; then
            echo ""
            echo -e "${GREEN}✅ PRODUCTION READY CHECKLIST:${NC}"
            echo "   ✅ Backend (Heroku) is live and responding"
            echo "   ✅ Frontend (Vercel) is accessible"
            echo "   ✅ Resume grader AI feature working"
            echo "   ✅ Authentication system functional"
            echo "   ✅ Database connectivity confirmed"
            echo "   ✅ CORS configured correctly"
            echo ""
            echo -e "${BLUE}🚀 Your JobTracker application is ready for users!${NC}"
        fi

        exit 0
    fi
}

# Show usage if help requested
if [ "$1" = "-h" ] || [ "$1" = "--help" ]; then
    echo -e "${BLUE}JobTracker Test Suite${NC}"
    echo ""
    echo -e "${YELLOW}Usage:${NC}"
    echo "  $0 [environment]"
    echo ""
    echo -e "${YELLOW}Environments:${NC}"
    echo "  local       - Test local development environment only"
    echo "  production  - Test production deployment only"
    echo "  all         - Test both local and production (default)"
    echo ""
    echo -e "${YELLOW}Examples:${NC}"
    echo "  $0              # Test everything"
    echo "  $0 local        # Test local development only"
    echo "  $0 production   # Test production deployment only"
    echo ""
    echo -e "${YELLOW}Prerequisites:${NC}"
    echo "  • curl installed"
    echo "  • jq installed (optional, for prettier JSON output)"
    echo "  • pandoc installed (optional, for resume PDF testing)"
    echo ""
    echo -e "${YELLOW}Local Development:${NC}"
    echo "  • Backend running: cd backend && npm run dev"
    echo "  • Frontend running: cd frontend && npm start"
    echo ""
    exit 0
fi

# Run main function
main "$@"
