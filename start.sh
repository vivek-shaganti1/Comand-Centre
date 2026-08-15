#!/bin/bash
# ==========================================================
# STARK AVENGERS COMMAND CENTER LAUNCHER
# ==========================================================
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

echo "🦾 Powering up Arc Reactor Core..."
echo "🤖 Initializing 20 Specialized Autonomous Agents..."

# Start Server
cd "$DIR/server"
node server.js &
SERVER_PID=$!

# Wait 1 sec for server to bind port
sleep 1

# Start Client
cd "$DIR/client"
npx vite --port 5173 &
CLIENT_PID=$!

echo "======================================================"
echo "🌟 COMMAND CENTER HUD IS READY AT: http://localhost:5173"
echo "📡 BACKEND & TELEGRAM SENTINEL AT: http://localhost:4000"
echo "======================================================"

trap "kill $SERVER_PID $CLIENT_PID 2>/dev/null" EXIT
wait
