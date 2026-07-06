#!/bin/bash
# Setup Chrome untuk scraper — Jalanin sekali aja

CHROME_PORT=9222

echo "🔧 Chrome Setup untuk Multi-Query Scraper"
echo "========================================="

# Check Chrome already running
echo -n "Checking Chrome status... "
if curl -s http://localhost:$CHROME_PORT/json/version >/dev/null 2>&1; then
    echo "✅ Already running"
    exit 0
fi

echo "Not running"
echo ""

# Try to start Chrome
echo "🚀 Starting Chrome with remote debugging..."
google-chrome --remote-debugging-port=$CHROME_PORT --user-data-dir=/tmp/chrome-debug --no-first-run --disable-gpu-sandbox >/dev/null 2>&1 &
CHROME_PID=$!
echo "   PID: $CHROME_PID"

# Wait for Chrome to start
echo -n "Waiting for Chrome to be ready... "
for i in {1..10}; do
    if curl -s http://localhost:$CHROME_PORT/json/version >/dev/null 2>&1; then
        echo "✅"
        BROWSER=$(curl -s http://localhost:$CHROME_PORT/json/version | grep -o '"Browser":"[^"]*"' | cut -d'"' -f4)
        echo ""
        echo "✨ Chrome ready!"
        echo "   Browser: $BROWSER"
        echo "   Port: $CHROME_PORT"
        echo ""
        echo "Now run: cd ~/.agents/skills/multi-query-scraper && python3 -u coba_kuliner.py"
        exit 0
    fi
    echo -n "."
    sleep 0.5
done

echo "❌"
echo "Chrome failed to start"
exit 1
