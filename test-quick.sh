
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

echo -e "\nℹ️  If you see a QR code or linking code above, scan it or enter it in WhatsApp now."
echo -e "Press ENTER after linking to continue..."
read -r

echo -e "\n4. Verifying connection..."
MAX_RETRIES=30
RETRY_COUNT=0
CONNECTED=false

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
  STATUS=$(curl -s --max-time 5 "$BASE_URL/api/status/$PHONE")
  
  if command -v jq &> /dev/null; then
    IS_CONNECTED=$(echo "$STATUS" | jq -r '.connected // false' 2>/dev/null)
    if [ "$IS_CONNECTED" = "true" ]; then
      CONNECTED=true
      echo "$STATUS" | jq '.' 2>/dev/null || echo "$STATUS"
      echo "✅ Connected!"
      break
    fi
  fi
  
  RETRY_COUNT=$((RETRY_COUNT + 1))
  if [ $RETRY_COUNT -lt $MAX_RETRIES ]; then
    echo "⏳ Waiting for connection... (attempt $RETRY_COUNT/$MAX_RETRIES)"
    sleep 2
  fi
done

if [ "$CONNECTED" = false ]; then
  echo "❌ Connection timeout"
  exit 1
fi

echo -e "\n5. Get Chats (waiting for sync)..."
MAX_RETRIES=15
RETRY_COUNT=0

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
  CHATS=$(curl -s --max-time 5 "$BASE_URL/api/chats/$PHONE")
  
  if command -v jq &> /dev/null; then
    COUNT=$(echo "$CHATS" | jq -r '.count // 0' 2>/dev/null)
    if [ "$COUNT" -gt 0 ]; then
      echo "$CHATS" | jq '.' 2>/dev/null || echo "$CHATS"
      echo "✅ Found $COUNT chats"
      break
    fi
  else
    echo "$CHATS"
    break
  fi
  
  RETRY_COUNT=$((RETRY_COUNT + 1))
  if [ $RETRY_COUNT -lt $MAX_RETRIES ]; then
    echo "⏳ Waiting for chats to sync... (attempt $RETRY_COUNT/$MAX_RETRIES)"
    sleep 2
  else
    echo "$CHATS" | jq '.' 2>/dev/null || echo "$CHATS"
    echo "⚠️ No chats found yet"
  fi
done

echo -e "\n✅ Quick test complete!"
