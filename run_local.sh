#!/bin/bash

# Kill background processes on exit
trap "trap - SIGTERM && kill -- -$$" SIGINT SIGTERM EXIT

echo "Starting Agromarket locally..."

# 1. Setup Backend
echo "--> Setting up Backend..."
cd backend
if [ ! -d "venv" ]; then
    python3 -m venv venv
fi
source venv/bin/activate
pip install -r requirements.txt
# Use SQLite for local non-docker run
export DATABASE_URL="sqlite:///./agromarket.db"
# Run migrations/create tables (using seed.py side effect for now)
python seed.py &
# Start Backend
uvicorn main:app --reload --port 8000 &
BACKEND_PID=$!
cd ..

# 2. Setup Frontend
echo "--> Setting up Frontend..."
cd frontend
npm install
npm run dev &
FRONTEND_PID=$!
cd ..

echo "--> App running!"
echo "    Frontend: http://localhost:5173"
echo "    Backend: http://localhost:8000/docs"
echo "    (Using local SQLite database)"
echo "Press CTRL+C to stop."

wait
