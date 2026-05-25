#!/bin/bash
echo "🚀 Starting PulseHR — Next-Gen HR Portal..."
echo ""

# Start backend
cd "$(dirname "$0")/backend" && node server.js &
BACKEND_PID=$!

sleep 1
echo "✅ Backend running at http://localhost:5000"

# Start frontend
cd "$(dirname "$0")/frontend" && npm run dev &
FRONTEND_PID=$!

sleep 2
echo "✅ Frontend running at http://localhost:3000"
echo ""
echo "🌐 Open http://localhost:3000 in your browser"
echo ""
echo "Press Ctrl+C to stop both servers..."

trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; echo 'Servers stopped.'" EXIT
wait
