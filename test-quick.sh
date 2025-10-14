
#!/bin/bash

# Quick API Test Script
# Tests only essential endpoints

# Auto-detect URL
if [ -n "$REPL_SLUG" ]; then
  BASE_URL="https://${REPL_SLUG}.${REPL_OWNER}.repl.co"
else
  BASE_URL="http://localhost:5000"
fi

PHONE="${1:-2348113054793}"

echo "🧪 Quick API Test"
echo "Base URL: $BASE_URL"
echo "Phone: $PHONE"
echo ""

echo "1. Health Check..."
curl -s --max-time 5 "$BASE_URL/health" | jq '.' 2>/dev/null || echo "Failed"

echo -e "\n2. API Health..."
curl -s --max-time 5 "$BASE_URL/api/health" | jq '.' 2>/dev/null || echo "Failed"

echo -e "\n3. Connection Status..."
curl -s --max-time 5 "$BASE_URL/api/status/$PHONE" | jq '.' 2>/dev/null || echo "Failed"

echo -e "\n4. Get Chats..."
curl -s --max-time 5 "$BASE_URL/api/chats/$PHONE" | jq '.' 2>/dev/null || echo "Failed"

echo -e "\n✅ Quick test complete!"
