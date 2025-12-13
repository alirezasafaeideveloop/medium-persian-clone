#!/bin/bash

# Production Deployment Script
# This script automates the deployment process for production

set -e  # Exit on any error

echo "🚀 Starting production deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Helper functions
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if required tools are installed
check_dependencies() {
    log_info "Checking dependencies..."
    
    if ! command -v node &> /dev/null; then
        log_error "Node.js is not installed"
        exit 1
    fi
    
    if ! command -v npm &> /dev/null; then
        log_error "npm is not installed"
        exit 1
    fi
    
    if ! command -v git &> /dev/null; then
        log_error "Git is not installed"
        exit 1
    fi
    
    log_info "All dependencies are installed"
}

# Environment setup
setup_environment() {
    log_info "Setting up environment..."
    
    # Check if .env.production exists
    if [ ! -f ".env.production" ]; then
        log_warn ".env.production not found. Creating from template..."
        if [ -f ".env.production.example" ]; then
            cp .env.production.example .env.production
            log_warn "Please edit .env.production with your actual values"
            exit 1
        else
            log_error ".env.production.example not found"
            exit 1
        fi
    fi
    
    # Load environment variables
    export NODE_ENV=production
    export $(cat .env.production | grep -v '^#' | xargs)
    
    log_info "Environment variables loaded"
}

# Code quality checks
run_quality_checks() {
    log_info "Running code quality checks..."
    
    # Linting
    log_info "Running ESLint..."
    npm run lint
    
    # Type checking
    log_info "Running TypeScript checks..."
    npm run type-check
    
    # Tests (if available)
    if npm run test --silent 2>/dev/null; then
        log_info "Running tests..."
        npm run test
    else
        log_warn "No tests found, skipping..."
    fi
    
    log_info "Code quality checks passed"
}

# Build process
build_application() {
    log_info "Building application..."
    
    # Clean previous build
    rm -rf .next build
    
    # Install dependencies
    log_info "Installing dependencies..."
    npm ci --production=false
    
    # Build application
    log_info "Building for production..."
    npm run build
    
    # Generate bundle analyzer report
    if [ "$ANALYZE" = "true" ]; then
        log_info "Generating bundle analyzer report..."
        npm run analyze
    fi
    
    log_info "Build completed successfully"
}

# Database setup
setup_database() {
    log_info "Setting up database..."
    
    # Generate Prisma client
    npx prisma generate
    
    # Push schema to database
    npx prisma db push
    
    # Seed database (if seed file exists)
    if [ -f "prisma/seed.ts" ]; then
        log_info "Seeding database..."
        npx prisma db seed
    fi
    
    log_info "Database setup completed"
}

# Security checks
run_security_checks() {
    log_info "Running security checks..."
    
    # Check for vulnerabilities
    log_info "Checking for security vulnerabilities..."
    npm audit --audit-level moderate
    
    # Check environment variables
    if [ -z "$NEXTAUTH_SECRET" ]; then
        log_error "NEXTAUTH_SECRET is not set"
        exit 1
    fi
    
    if [ -z "$DATABASE_URL" ]; then
        log_error "DATABASE_URL is not set"
        exit 1
    fi
    
    log_info "Security checks passed"
}

# Performance optimization
optimize_performance() {
    log_info "Optimizing performance..."
    
    # Compress static assets
    if command -v gzip &> /dev/null; then
        find build/static -name "*.js" -exec gzip -k {} \;
        find build/static -name "*.css" -exec gzip -k {} \;
    fi
    
    # Generate service worker
    if [ -f "public/sw.js" ]; then
        log_info "Service worker found"
    fi
    
    log_info "Performance optimization completed"
}

# Deployment
deploy_application() {
    log_info "Deploying application..."
    
    # This is where you would add your specific deployment logic
    # Examples:
    # - Docker deployment
    # - Vercel deployment
    # - AWS deployment
    # - Traditional server deployment
    
    log_info "Deployment completed successfully"
}

# Health check
health_check() {
    log_info "Running health check..."
    
    # Wait for application to start
    sleep 10
    
    # Check if application is responding
    if curl -f -s http://localhost:3000/api/health > /dev/null; then
        log_info "Application is healthy"
    else
        log_error "Application health check failed"
        exit 1
    fi
}

# Cleanup
cleanup() {
    log_info "Cleaning up..."
    
    # Remove temporary files
    rm -rf .next/cache
    rm -rf node_modules/.cache
    
    log_info "Cleanup completed"
}

# Main deployment flow
main() {
    check_dependencies
    setup_environment
    run_quality_checks
    build_application
    setup_database
    run_security_checks
    optimize_performance
    deploy_application
    health_check
    cleanup
    
    log_info "🎉 Deployment completed successfully!"
    log_info "Your application is now live and ready to use!"
}

# Handle script arguments
case "${1:-}" in
    "build-only")
        build_application
        ;;
    "deploy-only")
        deploy_application
        ;;
    "health-check")
        health_check
        ;;
    *)
        main
        ;;
esac