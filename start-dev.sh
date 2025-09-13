#!/bin/bash

# Research Portfolio Development Startup Script
echo "🚀 Starting Research Portfolio Development Environment..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

# Function to check if a port is in use
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null ; then
        return 0  # Port is in use
    else
        return 1  # Port is free
    fi
}

# Kill any existing processes on our ports
echo "🧹 Cleaning up existing processes..."
if check_port 3001; then
    echo "   Killing process on port 3001 (backend)"
    lsof -ti:3001 | xargs kill -9 2>/dev/null || true
fi

if check_port 5174; then
    echo "   Killing process on port 5174 (frontend)"
    lsof -ti:5174 | xargs kill -9 2>/dev/null || true
fi

# Start backend server
echo "🔧 Starting backend server..."
cd backend
if [ ! -d "node_modules" ]; then
    echo "   Installing backend dependencies..."
    npm install
fi

# Start backend in background
npm run dev &
BACKEND_PID=$!
cd ..

# Wait a moment for backend to start
echo "⏳ Waiting for backend to initialize..."
sleep 3

# Check if backend is running
if ! check_port 3001; then
    echo "❌ Backend failed to start on port 3001"
    kill $BACKEND_PID 2>/dev/null || true
    exit 1
fi

echo "✅ Backend is running on http://localhost:3001"

# Start frontend server
echo "🎨 Starting frontend server..."
if [ ! -d "node_modules" ]; then
    echo "   Installing frontend dependencies..."
    npm install
fi

# Start frontend in background
npm run dev &
FRONTEND_PID=$!

# Wait for frontend to start
echo "⏳ Waiting for frontend to initialize..."
sleep 5

# Check if frontend is running
if ! check_port 5174; then
    echo "❌ Frontend failed to start on port 5174"
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null || true
    exit 1
fi

echo "✅ Frontend is running on http://localhost:5174"

# Display status
echo ""
echo "🎉 Research Portfolio is now running!"
echo ""
echo "📊 Frontend: http://localhost:5174"
echo "🔧 Backend API: http://localhost:3001"
echo "🔍 Health Check: http://localhost:3001/api/health"
echo ""
echo "🔐 Admin Login:"
echo "   Username: admin"
echo "   Password: admin123"
echo ""
echo "📝 To stop the servers, press Ctrl+C or run:"
echo "   kill $BACKEND_PID $FRONTEND_PID"
echo ""

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Shutting down servers..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null || true
    echo "✅ Servers stopped"
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Keep script running
echo "Press Ctrl+C to stop all servers..."
wait
