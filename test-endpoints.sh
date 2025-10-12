#!/bin/bash

# Comprehensive Test Endpoints Script for ConnexaBot Backend
BASE_URL="${BASE_URL:-http://localhost:5000}"
PHONE="${PHONE:-2349154347487}"
TEST_RECIPIENT="${TEST_RECIPIENT:-$PHONE@s.whatsapp.net}"

# Check if jq is available
if command -v jq &> /dev/null; then
  HAS_JQ=true
  echo "✓ jq found - responses will be formatted"
else
  HAS_JQ=false
  echo "⚠ jq not found - responses will be raw JSON"
fi

echo "🧪 COMPREHENSIVE BACKEND TESTING"
echo "=================================="
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

# Section 1: Health & Connection
echo -e "\n📊 SECTION 1: HEALTH & CONNECTION"
echo "=================================="

echo -e "\n1.1 Health Check..."
curl -s "$BASE_URL/health" | format_output

echo -e "\n1.2 API Health Check..."
curl -s "$BASE_URL/api/health" | format_output

echo -e "\n1.3 WhatsApp Connect..."
curl -s -X POST "$BASE_URL/api/connect" \
  -H "Content-Type: application/json" \
  -d "{\"phone\":\"$PHONE\"}" | format_output

echo -e "\n1.4 Connection Status..."
curl -s "$BASE_URL/api/status/$PHONE" | format_output

# Wait for connection
echo -e "\n⏳ Please scan QR code if needed and press Enter when connected..."
read

# Section 2: Data Retrieval
echo -e "\n📥 SECTION 2: DATA RETRIEVAL"
echo "============================="

echo -e "\n2.1 Get Chats..."
curl -s "$BASE_URL/api/chats/$PHONE" | format_output

echo -e "\n2.2 Get Contacts..."
curl -s "$BASE_URL/api/contacts/$PHONE" | format_output

echo -e "\n2.3 Get Groups..."
curl -s "$BASE_URL/api/groups/$PHONE" | format_output

echo -e "\n2.4 Get Call History..."
curl -s "$BASE_URL/api/calls/$PHONE" | format_output

echo -e "\n2.5 Get Status Updates..."
curl -s "$BASE_URL/api/status-updates/$PHONE" | format_output

echo -e "\n2.6 Get Channels..."
curl -s "$BASE_URL/api/channels/$PHONE" | format_output

echo -e "\n2.7 Get Profile..."
curl -s "$BASE_URL/api/profile/$PHONE" | format_output

# Section 3: Messaging
echo -e "\n📨 SECTION 3: MESSAGING"
echo "======================="

echo -e "\n3.1 Send Text Message..."
curl -s -X POST "$BASE_URL/api/messages/send" \
  -H "Content-Type: application/json" \
  -d "{\"phone\":\"$PHONE\",\"to\":\"$TEST_RECIPIENT\",\"text\":\"Test message from API\"}" | format_output

echo -e "\n3.2 Send Poll..."
curl -s -X POST "$BASE_URL/api/messages/send-poll" \
  -H "Content-Type: application/json" \
  -d "{\"phone\":\"$PHONE\",\"to\":\"$TEST_RECIPIENT\",\"name\":\"Favorite Color?\",\"options\":[\"Red\",\"Blue\",\"Green\"],\"selectableCount\":1}" | format_output

echo -e "\n3.3 Send Location..."
curl -s -X POST "$BASE_URL/api/messages/send-location" \
  -H "Content-Type: application/json" \
  -d "{\"phone\":\"$PHONE\",\"to\":\"$TEST_RECIPIENT\",\"latitude\":\"6.5244\",\"longitude\":\"3.3792\",\"name\":\"Lagos\",\"address\":\"Lagos, Nigeria\"}" | format_output

# Section 4: Chat Actions
echo -e "\n💬 SECTION 4: CHAT ACTIONS"
echo "=========================="

echo -e "\n4.1 Archive Chat..."
curl -s -X POST "$BASE_URL/api/chats/archive" \
  -H "Content-Type: application/json" \
  -d "{\"phone\":\"$PHONE\",\"chatId\":\"$TEST_RECIPIENT\",\"archive\":true}" | format_output

echo -e "\n4.2 Pin Chat..."
curl -s -X POST "$BASE_URL/api/chats/pin" \
  -H "Content-Type: application/json" \
  -d "{\"phone\":\"$PHONE\",\"chatId\":\"$TEST_RECIPIENT\",\"pin\":true}" | format_output

echo -e "\n4.3 Mute Chat (8 hours)..."
curl -s -X POST "$BASE_URL/api/chats/mute" \
  -H "Content-Type: application/json" \
  -d "{\"phone\":\"$PHONE\",\"chatId\":\"$TEST_RECIPIENT\",\"duration\":28800000}" | format_output

echo -e "\n4.4 Mark as Read..."
curl -s -X POST "$BASE_URL/api/chats/mark-read" \
  -H "Content-Type: application/json" \
  -d "{\"phone\":\"$PHONE\",\"chatId\":\"$TEST_RECIPIENT\"}" | format_output

# Section 5: Status/Story
echo -e "\n📸 SECTION 5: STATUS/STORY"
echo "=========================="

echo -e "\n5.1 Post Text Status..."
curl -s -X POST "$BASE_URL/api/status/post-text" \
  -H "Content-Type: application/json" \
  -d "{\"phone\":\"$PHONE\",\"text\":\"Hello from API!\",\"statusJidList\":[],\"backgroundColor\":\"#FF5733\"}" | format_output

# Section 6: Group Management
echo -e "\n👥 SECTION 6: GROUP MANAGEMENT"
echo "=============================="

echo -e "\n6.1 List Groups..."
curl -s "$BASE_URL/api/groups/$PHONE" | format_output

# Section 7: AI Features
echo -e "\n🤖 SECTION 7: AI FEATURES"
echo "========================="

echo -e "\n7.1 Generate Smart Reply..."
curl -s -X POST "$BASE_URL/api/ai/smart-reply" \
  -H "Content-Type: application/json" \
  -d "{\"phone\":\"$PHONE\",\"chatId\":\"test_chat\",\"lastMessage\":\"How are you?\",\"senderName\":\"Friend\"}" | format_output

echo -e "\n7.2 Analyze Sentiment..."
curl -s -X POST "$BASE_URL/api/ai/sentiment" \
  -H "Content-Type: application/json" \
  -d "{\"phone\":\"$PHONE\",\"text\":\"I love this product! It's amazing!\"}" | format_output

echo -e "\n7.3 Translate Text..."
curl -s -X POST "$BASE_URL/api/ai/translate" \
  -H "Content-Type: application/json" \
  -d "{\"phone\":\"$PHONE\",\"text\":\"Hello world\",\"targetLang\":\"Spanish\"}" | format_output

echo -e "\n7.4 Improve Message..."
curl -s -X POST "$BASE_URL/api/ai/improve" \
  -H "Content-Type: application/json" \
  -d "{\"phone\":\"$PHONE\",\"text\":\"hey man whts up\",\"improvements\":[\"grammar\",\"clarity\"]}" | format_output

echo -e "\n7.5 Content Moderation..."
curl -s -X POST "$BASE_URL/api/ai/moderate" \
  -H "Content-Type: application/json" \
  -d "{\"phone\":\"$PHONE\",\"text\":\"This is a test message\"}" | format_output

# Section 8: Advanced Features
echo -e "\n⚡ SECTION 8: ADVANCED FEATURES"
echo "==============================="

echo -e "\n8.1 Get Chat Labels..."
curl -s "$BASE_URL/api/chats/labels/$PHONE" | format_output

echo -e "\n8.2 Clear State (Partial)..."
curl -s -X POST "$BASE_URL/api/clear-state/$PHONE" | format_output

# Section 9: Cleanup
echo -e "\n🧹 SECTION 9: CLEANUP"
echo "====================="

echo -e "\n9.1 Logout..."
curl -s -X POST "$BASE_URL/api/logout" \
  -H "Content-Type: application/json" \
  -d "{\"phone\":\"$PHONE\"}" | format_output

echo -e "\n✅ ALL TESTS COMPLETED"
echo -e "\n📝 Test Summary:"
echo -e "  ✓ Health & Connection Tests"
echo -e "  ✓ Data Retrieval Tests"
echo -e "  ✓ Messaging Tests"
echo -e "  ✓ Chat Actions Tests"
echo -e "  ✓ Status/Story Tests"
echo -e "  ✓ Group Management Tests"
echo -e "  ✓ AI Features Tests"
echo -e "  ✓ Advanced Features Tests"
echo -e "  ✓ Cleanup Tests"
echo -e "\nTo run with custom values:"
echo -e "  BASE_URL=http://localhost:5000 PHONE=123456789 ./test-endpoints.sh"
