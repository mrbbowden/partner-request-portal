#!/bin/bash

# Partner Request Portal Deployment Script
# This script automates the deployment process to Cloudflare Workers

set -e

echo "🚀 Starting deployment process..."

# Check if wrangler is installed
if ! command -v wrangler &> /dev/null; then
    echo "❌ Wrangler CLI is not installed. Please install it with: npm install -g wrangler"
    exit 1
fi

# Check if user is logged in
if ! wrangler whoami &> /dev/null; then
    echo "❌ You are not logged in to Cloudflare. Please run: wrangler login"
    exit 1
fi

echo "📦 Building the application..."
npm run build

echo "🗄️  Checking D1 database..."
# Check if database exists, if not create it
if ! wrangler d1 list | grep -q "partner-portal-db"; then
    echo "📊 Creating D1 database..."
    wrangler d1 create partner-portal-db
    echo "⚠️  Please update the database_id in wrangler.toml with the ID from above"
    echo "⚠️  Then run this script again"
    exit 1
fi

echo "📋 Applying database schema..."
wrangler d1 execute partner-portal-db --file=./schema.sql

echo "🌐 Deploying to Cloudflare Pages..."
wrangler pages deploy dist

echo "✅ Deployment completed successfully!"
echo "🌍 Your application is now live at: https://partner-request-portal.pages.dev"
echo ""
echo "📝 Next steps:"
echo "1. Configure your Zapier webhook URL if needed"
echo "2. Test the application functionality"
echo "3. Set up custom domain if desired"
