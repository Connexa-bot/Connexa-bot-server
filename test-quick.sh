
#!/bin/bash

# Quick API Test Script
# Tests only essential endpoints
# Usage: ./test-quick.sh [BASE_URL] [PHONE]
# Example: ./test-quick.sh https://your-repl-url.replit.dev 2348113054793

# Auto-detect URL or use provided URL
if [ -n "$1" ] && [[ "$1" == http* ]]; then
  BASE_URL="$1"
  PHONE="${2:-2348113054793}"
elif [ -n "$REPLIT_DEV_DOMAIN" ]; then
  BASE_URL="https://${REPLIT_DEV_DOMAIN}"
  PHONE="${1:-2348113054793}"
elif [ -n "$REPL_SLUG" ]; then
  BASE_URL="https://${REPL_SLUG}.${REPL_OWNER}.repl.co"
  PHONE="${1:-2348113054793}"
else
  BASE_URL="http://localhost:5000"
  PHONE="${1:-2348113054793}"
fi

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
