#!/bin/bash

# Test Endpoints Script for ConnexaBot Backend
BASE_URL="${BASE_URL:-https://1b6bc53f-e595-4c09-bbdf-56c62421c642-00-18ocnnrogz8bw.kirk.replit.dev}"
PHONE="${PHONE:-2349154347487}"

# Check if jq is available
if command -v jq &> /dev/null; then
  HAS_JQ=true
  echo "✓ jq found - responses will be formatted"
else
  HAS_JQ=false
  echo "⚠ jq not found - responses will be raw JSON"
fi

echo "🧪 TESTING BACKEND ENDPOINTS"
echo "================================"
echo "Base URL: $BASE_URL"
echo "Phone: $PHONE"
echo ""

# Helper function to format or print raw
format_output() {
  if [ "$HAS_JQ" = true ]; then
    jq '.'
  else
    cat
  fi
}

# Test 1: Health Check
echo -e "\n1️⃣ Testing Health Check..."
curl -s "$BASE_URL/health" | format_output

# Test 2: API Health Check
echo -e "\n2️⃣ Testing API Health Check..."
curl -s "$BASE_URL/api/health" | format_output

# Test 3: Connect WhatsApp
echo -e "\n3️⃣ Testing WhatsApp Connect..."
curl -s -X POST "$BASE_URL/api/connect" \
  -H "Content-Type: application/json" \
  -d "{\"phone\":\"$PHONE\"}" | format_output

# Test 4: Check Status
echo -e "\n4️⃣ Testing Connection Status..."
curl -s "$BASE_URL/api/status/$PHONE" | format_output

# Wait for user to scan QR
echo -e "\n⏳ Please scan QR code if needed and press Enter when connected..."
read

# Test 5: Get Chats
echo -e "\n5️⃣ Testing Get Chats..."
curl -s "$BASE_URL/api/chats/$PHONE" | format_output

# Test 6: Get Calls
echo -e "\n6️⃣ Testing Get Calls..."
curl -s "$BASE_URL/api/calls/$PHONE" | format_output

# Test 7: Get Status Updates
echo -e "\n7️⃣ Testing Status Updates..."
curl -s "$BASE_URL/api/status-updates/$PHONE" | format_output

# Test 8: Get Profile
echo -e "\n8️⃣ Testing Get Profile..."
curl -s "$BASE_URL/api/profile/$PHONE" | format_output

# Test 9: Get Contacts
echo -e "\n9️⃣ Testing Get Contacts..."
curl -s "$BASE_URL/api/contacts/$PHONE" | format_output

# Test 10: Clear State (Partial)
echo -e "\n🔟 Testing Clear State (Partial)..."
curl -s -X POST "$BASE_URL/api/clear-state/$PHONE" | format_output

# Test 11: Logout
echo -e "\n1️⃣1️⃣ Testing Logout..."
curl -s -X POST "$BASE_URL/api/logout" \
  -H "Content-Type: application/json" \
  -d "{\"phone\":\"$PHONE\"}" | format_output

echo -e "\n✅ ALL TESTS COMPLETED"
echo -e "\nTo run with custom values:"
echo -e "  BASE_URL=http://localhost:5000 PHONE=123456789 ./test-endpoints.sh"
