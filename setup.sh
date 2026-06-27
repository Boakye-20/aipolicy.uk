#!/bin/bash

echo "================================================"
echo "UK AI Policy Tracker - Next.js Setup"
echo "================================================"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed!"
    echo "Please install Node.js 18+ from https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js version: $(node --version)"
echo ""

# Check if CSV file exists
if [ ! -f "data/uk_ai_policy_powerbi_ready.csv" ]; then
    echo "⚠️  WARNING: CSV file not found!"
    echo ""
    echo "Please copy your CSV file to the data directory:"
    echo "  cp /path/to/your/uk_ai_policy_powerbi_ready.csv ./data/"
    echo ""
    read -p "Do you want to continue anyway? (y/n) " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
else
    echo "✅ CSV file found"
fi

echo ""
echo "Installing dependencies..."
npm install

if [ $? -eq 0 ]; then
    echo ""
    echo "================================================"
    echo "✅ Setup Complete!"
    echo "================================================"
    echo ""
    echo "To start the development server:"
    echo "  npm run dev"
    echo ""
    echo "Then open: http://localhost:3000"
    echo ""
    echo "To build for production:"
    echo "  npm run build"
    echo "  npm start"
    echo ""
else
    echo ""
    echo "❌ Installation failed. Please check the errors above."
    exit 1
fi
