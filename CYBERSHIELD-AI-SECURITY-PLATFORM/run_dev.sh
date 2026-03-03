#!/bin/bash

# CyberShield AI Development Server Startup Script

echo "🛡️ Starting CyberShield AI..."
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -f "README.md" ]; then
    echo -e "${RED}Error: Please run this script from the project root directory${NC}"
    exit 1
fi

# Function to cleanup on exit
cleanup() {
    echo ""
    echo -e "${YELLOW}Shutting down servers...${NC}"
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    exit 0
}

trap cleanup SIGINT SIGTERM

# Start Backend
echo -e "${CYAN}Starting Backend (FastAPI)...${NC}"
cd backend

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo -e "${YELLOW}Creating virtual environment...${NC}"
    python3 -m venv venv
fi

# Activate virtual environment and install dependencies
source venv/bin/activate 2>/dev/null || . venv/Scripts/activate 2>/dev/null

echo -e "${YELLOW}Installing backend dependencies...${NC}"
pip install -q -r requirements.txt

echo -e "${GREEN}Starting FastAPI server on http://localhost:8000${NC}"
uvicorn app.main:app --reload --port 8000 &
BACKEND_PID=$!

cd ..

# Start Frontend
echo ""
echo -e "${CYAN}Starting Frontend (React + Vite)...${NC}"
cd frontend

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}Installing frontend dependencies...${NC}"
    npm install
fi

echo -e "${GREEN}Starting Vite dev server on http://localhost:3000${NC}"
npm run dev &
FRONTEND_PID=$!

cd ..

echo ""
echo -e "${GREEN}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}   🛡️  CyberShield AI is running!${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "   ${CYAN}Frontend:${NC}  http://localhost:3000"
echo -e "   ${CYAN}Backend:${NC}   http://localhost:8000"
echo -e "   ${CYAN}API Docs:${NC}  http://localhost:8000/docs"
echo ""
echo -e "${YELLOW}Press Ctrl+C to stop all servers${NC}"
echo ""

# Wait for both processes
wait

