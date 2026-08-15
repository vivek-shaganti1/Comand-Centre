#!/bin/bash
# ==========================================================
# STARK 24/7 COMMAND CENTER DAEMON INSTALLER (macOS)
# ==========================================================
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )/.." && pwd )"
PLIST_NAME="com.stark.commandcenter.plist"
USER_LAUNCH_AGENTS="$HOME/Library/LaunchAgents"

echo "🦾 Installing Stark Command Center 24/7 Background Sentinel..."

# 1. Ensure scripts are executable
chmod +x "$DIR/scripts/run-server.sh"
chmod +x "$DIR/scripts/setup-stark-daemon.sh"

# 2. Prepare LaunchAgents directory
mkdir -p "$USER_LAUNCH_AGENTS"
mkdir -p "$DIR/data"

# 3. Copy plist
cp "$DIR/scripts/$PLIST_NAME" "$USER_LAUNCH_AGENTS/$PLIST_NAME"

# 4. Unload old if running & load new daemon
launchctl unload "$USER_LAUNCH_AGENTS/$PLIST_NAME" 2>/dev/null
launchctl load "$USER_LAUNCH_AGENTS/$PLIST_NAME"

echo "✅ Stark 24/7 Background Daemon successfully registered and running!"
echo "📡 Server is active on port 4000. Logs at: $DIR/data/stark_daemon.log"
echo "💡 To stop daemon later: launchctl unload $USER_LAUNCH_AGENTS/$PLIST_NAME"
