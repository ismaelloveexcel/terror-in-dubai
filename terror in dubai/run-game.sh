#!/bin/bash

echo "========================================"
echo "  SAVE ISMAEL - Game Launcher"
echo "========================================"
echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    echo ""
    npm run install:all
    echo ""
fi

echo "Starting game..."
echo ""
echo "Server will run on: http://localhost:3000"
echo "Client will run on: http://localhost:5173"
echo ""
echo "Press Ctrl+C to stop"
echo ""

npm run dev
