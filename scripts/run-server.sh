#!/bin/bash
# Stark Command Center 24/7 Background Server Launcher
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )/.." && pwd )"
cd "$DIR/server"

# Ensure dependencies are installed
if [ ! -d "node_modules" ]; then
  npm install --silent
fi

# Run with Node in 24/7 daemon mode
exec node server.js
