#!/usr/bin/env bash
# Start DPDPA for Small Business - Backend + Frontend
# Run this from N:/chnayka/NVIDIA directory

echo "================================================"
echo "DPDPA for Small Business - Startup Script"
echo "Srujana Tech Fest 2026 | LS-04 | Folder: NVIDIA"
echo "================================================"

# Kill any existing processes on our ports
fuser -k 8000/tcp 2>/dev/null
fuser -k 5550/tcp 2>/dev/null

# Start Backend
echo "[1/2] Starting FastAPI backend on http://127.0.0.1:8000"
cd backend
pip install -r requirements.txt -q
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload &
BACKEND_PID=$!
cd ..

# Wait for backend to start
sleep 3

# Start Frontend
echo "[2/2] Starting React frontend on http://localhost:5550"
cd frontend
npm install -q
npm run dev -- --port 5550 &
FRONTEND_PID=$!
cd ..

echo ""
echo "================================================"
echo "Both servers started!"
echo "Backend:  http://127.0.0.1:8000/docs (Swagger UI)"
echo "Frontend: http://localhost:5550"
echo ""
echo "Backend PID: $BACKEND_PID"
echo "Frontend PID: $FRONTEND_PID"
echo ""
echo "Press Ctrl+C to stop both servers"
echo "================================================"

# Wait for both processes
wait $BACKEND_PID $FRONTEND_PID
