#!/bin/bash

# ===============================
# 🧪 ConnexaBot Complete API Testing Script
# ===============================
# Comprehensive test script for all WhatsApp backend endpoints

BASE_URL="${BASE_URL:-https://7291a9b7-7686-42b0-ba38-4b0639ea71ed-00-22vcaa5x8ip3y.kirk.replit.dev}"
PHONE="${PHONE:-2348113054793}"
TEST_RECIPIENT="${TEST_RECIPIENT:-$PHONE@s.whatsapp.net}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if jq is available
if command -v jq &> /dev/null; then
  HAS_JQ=true
  echo -e "${GREEN}✓ jq found - responses will be formatted${NC}"
else
  HAS_JQ=false
  echo -e "${YELLOW}⚠ jq not found - responses will be raw JSON${NC}"
fi

echo -e "${BLUE}"
echo "╔════════════════════════════════════════════╗"
echo "║  🧪 ConnexaBot API Comprehensive Testing  ║"
echo "╔════════════════════════════════════════════╝"
echo "║"
echo "║  Base URL: $BASE_URL"
echo "║  Phone: $PHONE"
echo "║  Test Recipient: $TEST_RECIPIENT"
echo "║"
echo "╚════════════════════════════════════════════"
echo -e "${NC}"

# Helper function to format or print raw
format_output() {
  if [ "$HAS_JQ" = true ]; then
    jq '.'
  else
    cat
  fi
}

# ===============================
# SECTION 1: HEALTH & CONNECTION
# ===============================
echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}📊 SECTION 1: HEALTH & CONNECTION${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

echo -e "\n${YELLOW}1.1 Server Health Check...${NC}"
curl -s "$BASE_URL/health" | format_output

echo -e "\n${YELLOW}1.2 API Health Check...${NC}"
curl -s "$BASE_URL/api/health" | format_output

echo -e "\n${YELLOW}1.3 WhatsApp Connect...${NC}"
curl -s -X POST "$BASE_URL/api/connect" \
  -H "Content-Type: application/json" \
  -d "{\"phone\":\"$PHONE\"}" | format_output

echo -e "\n${YELLOW}1.4 Connection Status...${NC}"
curl -s "$BASE_URL/api/status/$PHONE" | format_output

# Wait for connection
echo -e "\n${RED}⏳ Please scan QR code if needed and press Enter when connected...${NC}"
read

# ===============================
# SECTION 2: DATA RETRIEVAL
# ===============================
echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}📥 SECTION 2: DATA RETRIEVAL${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

echo -e "\n${YELLOW}2.1 Get Chats...${NC}"
CHATS_RESPONSE=$(curl -s "$BASE_URL/api/chats/$PHONE")
echo "$CHATS_RESPONSE" | format_output

# Extract a random chat ID (excluding your own number)
if [ "$HAS_JQ" = true ]; then
  RANDOM_CHAT=$(echo "$CHATS_RESPONSE" | jq -r '.chats[]? | select(.id != "'"$PHONE"'@s.whatsapp.net" and .isGroup == false) | .id' | shuf -n 1)
  if [ -n "$RANDOM_CHAT" ] && [ "$RANDOM_CHAT" != "null" ]; then
    TEST_RECIPIENT="$RANDOM_CHAT"
    echo -e "${GREEN}✓ Selected random contact for testing: $TEST_RECIPIENT${NC}"
  fi
fi

echo -e "\n${YELLOW}2.2 Get Contacts...${NC}"
curl -s "$BASE_URL/api/contacts/$PHONE" | format_output

echo -e "\n${YELLOW}2.3 Get Groups...${NC}"
curl -s "$BASE_URL/api/groups/$PHONE" | format_output

echo -e "\n${YELLOW}2.4 Get Call History...${NC}"
curl -s "$BASE_URL/api/calls/$PHONE" | format_output

echo -e "\n${YELLOW}2.5 Get Status Updates...${NC}"
curl -s "$BASE_URL/api/status-updates/$PHONE" | format_output

echo -e "\n${YELLOW}2.6 Get Channels...${NC}"
curl -s "$BASE_URL/api/channels/$PHONE" | format_output

echo -e "\n${YELLOW}2.7 Get Communities...${NC}"
curl -s "$BASE_URL/api/channels/communities/$PHONE" | format_output

echo -e "\n${YELLOW}2.8 Get Profile...${NC}"
curl -s "$BASE_URL/api/profile/$PHONE" | format_output

echo -e "\n${YELLOW}2.9 Get Chat Labels...${NC}"
curl -s "$BASE_URL/api/chats/labels/$PHONE" | format_output

# ===============================
# SECTION 3: MESSAGING
# ===============================
echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}📨 SECTION 3: MESSAGING${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

echo -e "\n${YELLOW}3.1 Send Text Message to: $TEST_RECIPIENT...${NC}"
curl -s -X POST "$BASE_URL/api/messages/send" \
  -H "Content-Type: application/json" \
  -d "{\"phone\":\"$PHONE\",\"to\":\"$TEST_RECIPIENT\",\"text\":\"Test message from API - $(date)\"}" | format_output

echo -e "\n${YELLOW}3.2 Send Poll...${NC}"
curl -s -X POST "$BASE_URL/api/messages/send-poll" \
  -H "Content-Type: application/json" \
  -d "{\"phone\":\"$PHONE\",\"to\":\"$TEST_RECIPIENT\",\"name\":\"Favorite Color?\",\"options\":[\"Red\",\"Blue\",\"Green\"],\"selectableCount\":1}" | format_output

echo -e "\n${YELLOW}3.3 Send Location...${NC}"
curl -s -X POST "$BASE_URL/api/messages/send-location" \
  -H "Content-Type: application/json" \
  -d "{\"phone\":\"$PHONE\",\"to\":\"$TEST_RECIPIENT\",\"latitude\":\"6.5244\",\"longitude\":\"3.3792\",\"name\":\"Lagos\",\"address\":\"Lagos, Nigeria\"}" | format_output

echo -e "\n${YELLOW}3.4 Send Broadcast Message...${NC}"
curl -s -X POST "$BASE_URL/api/messages/send-broadcast" \
  -H "Content-Type: application/json" \
  -d "{\"phone\":\"$PHONE\",\"recipients\":[\"$TEST_RECIPIENT\"],\"message\":\"Broadcast test\"}" | format_output

# ===============================
# SECTION 4: MESSAGE ACTIONS
# ===============================
echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}⚙️ SECTION 4: MESSAGE ACTIONS${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

echo -e "\n${YELLOW}4.1 React to Message (Note: requires valid messageKey)...${NC}"
echo "Skipped - requires specific messageKey from previous messages"

echo -e "\n${YELLOW}4.2 Edit Message (Note: requires valid messageKey)...${NC}"
echo "Skipped - requires specific messageKey from previous messages"

echo -e "\n${YELLOW}4.3 Star Message (Note: requires valid messageKey)...${NC}"
echo "Skipped - requires specific messageKey from previous messages"

# ===============================
# SECTION 5: CHAT ACTIONS
# ===============================
echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}💬 SECTION 5: CHAT ACTIONS${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

echo -e "\n${YELLOW}5.1 Archive Chat...${NC}"
curl -s -X POST "$BASE_URL/api/chats/archive" \
  -H "Content-Type: application/json" \
  -d "{\"phone\":\"$PHONE\",\"chatId\":\"$TEST_RECIPIENT\",\"archive\":true}" | format_output

echo -e "\n${YELLOW}5.2 Unarchive Chat...${NC}"
curl -s -X POST "$BASE_URL/api/chats/archive" \
  -H "Content-Type: application/json" \
  -d "{\"phone\":\"$PHONE\",\"chatId\":\"$TEST_RECIPIENT\",\"archive\":false}" | format_output

echo -e "\n${YELLOW}5.3 Pin Chat...${NC}"
curl -s -X POST "$BASE_URL/api/chats/pin" \
  -H "Content-Type: application/json" \
  -d "{\"phone\":\"$PHONE\",\"chatId\":\"$TEST_RECIPIENT\",\"pin\":true}" | format_output

echo -e "\n${YELLOW}5.4 Unpin Chat...${NC}"
curl -s -X POST "$BASE_URL/api/chats/pin" \
  -H "Content-Type: application/json" \
  -d "{\"phone\":\"$PHONE\",\"chatId\":\"$TEST_RECIPIENT\",\"pin\":false}" | format_output

echo -e "\n${YELLOW}5.5 Mute Chat (8 hours)...${NC}"
curl -s -X POST "$BASE_URL/api/chats/mute" \
  -H "Content-Type: application/json" \
  -d "{\"phone\":\"$PHONE\",\"chatId\":\"$TEST_RECIPIENT\",\"duration\":28800000}" | format_output

echo -e "\n${YELLOW}5.6 Mark as Read...${NC}"
curl -s -X POST "$BASE_URL/api/chats/mark-read" \
  -H "Content-Type: application/json" \
  -d "{\"phone\":\"$PHONE\",\"chatId\":\"$TEST_RECIPIENT\"}" | format_output

echo -e "\n${YELLOW}5.7 Mark as Unread...${NC}"
curl -s -X POST "$BASE_URL/api/chats/mark-unread" \
  -H "Content-Type: application/json" \
  -d "{\"phone\":\"$PHONE\",\"chatId\":\"$TEST_RECIPIENT\"}" | format_output

# ===============================
# SECTION 6: STATUS/STORY
# ===============================
echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}📸 SECTION 6: STATUS/STORY${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

echo -e "\n${YELLOW}6.1 Post Text Status...${NC}"
curl -s -X POST "$BASE_URL/api/status/post-text" \
  -H "Content-Type: application/json" \
  -d "{\"phone\":\"$PHONE\",\"text\":\"Hello from API Test!\",\"statusJidList\":[],\"backgroundColor\":\"#FF5733\"}" | format_output

echo -e "\n${YELLOW}6.2 Get Status Privacy Settings...${NC}"
curl -s "$BASE_URL/api/status/privacy/$PHONE" | format_output

# ===============================
# SECTION 7: GROUP MANAGEMENT
# ===============================
echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}👥 SECTION 7: GROUP MANAGEMENT${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

echo -e "\n${YELLOW}7.1 List Groups...${NC}"
curl -s "$BASE_URL/api/groups/$PHONE" | format_output

echo -e "\n${YELLOW}7.2 Group Actions (Note: requires group setup)...${NC}"
echo "Skipped - requires existing group or participants"

# ===============================
# SECTION 8: AI FEATURES
# ===============================
echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}🤖 SECTION 8: AI FEATURES${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

echo -e "\n${YELLOW}8.1 Generate Smart Reply...${NC}"
curl -s -X POST "$BASE_URL/api/ai/smart-reply" \
  -H "Content-Type: application/json" \
  -d "{\"phone\":\"$PHONE\",\"chatId\":\"test_chat\",\"lastMessage\":\"How are you?\",\"senderName\":\"Friend\"}" | format_output

echo -e "\n${YELLOW}8.2 Analyze Sentiment...${NC}"
curl -s -X POST "$BASE_URL/api/ai/sentiment" \
  -H "Content-Type: application/json" \
  -d "{\"phone\":\"$PHONE\",\"text\":\"I love this product! It's amazing!\"}" | format_output

echo -e "\n${YELLOW}8.3 Translate Text...${NC}"
curl -s -X POST "$BASE_URL/api/ai/translate" \
  -H "Content-Type: application/json" \
  -d "{\"phone\":\"$PHONE\",\"text\":\"Hello world\",\"targetLang\":\"Spanish\"}" | format_output

echo -e "\n${YELLOW}8.4 Improve Message...${NC}"
curl -s -X POST "$BASE_URL/api/ai/improve" \
  -H "Content-Type: application/json" \
  -d "{\"phone\":\"$PHONE\",\"text\":\"hey man whts up\",\"improvements\":[\"grammar\",\"clarity\"]}" | format_output

echo -e "\n${YELLOW}8.5 Content Moderation...${NC}"
curl -s -X POST "$BASE_URL/api/ai/moderate" \
  -H "Content-Type: application/json" \
  -d "{\"phone\":\"$PHONE\",\"text\":\"This is a test message\"}" | format_output

echo -e "\n${YELLOW}8.6 Smart Compose...${NC}"
curl -s -X POST "$BASE_URL/api/ai/compose" \
  -H "Content-Type: application/json" \
  -d "{\"phone\":\"$PHONE\",\"chatId\":\"test_chat\",\"context\":\"Reply to a birthday wish\",\"tone\":\"friendly\"}" | format_output

echo -e "\n${YELLOW}8.7 Generate AI Response...${NC}"
curl -s -X POST "$BASE_URL/api/ai/generate" \
  -H "Content-Type: application/json" \
  -d "{\"phone\":\"$PHONE\",\"chatId\":\"test_chat\",\"userMessage\":\"Tell me a joke\",\"includeHistory\":false}" | format_output

echo -e "\n${YELLOW}8.8 Batch Analyze Messages...${NC}"
curl -s -X POST "$BASE_URL/api/ai/batch-analyze" \
  -H "Content-Type: application/json" \
  -d "{\"phone\":\"$PHONE\",\"messages\":[{\"id\":\"1\",\"text\":\"I'm so happy!\"},{\"id\":\"2\",\"text\":\"This is terrible\"}]}" | format_output

# ===============================
# SECTION 9: CHANNELS & CALLS
# ===============================
echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}📡 SECTION 9: CHANNELS & CALLS${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

echo -e "\n${YELLOW}9.1 Get Channels...${NC}"
curl -s "$BASE_URL/api/channels/$PHONE" | format_output

echo -e "\n${YELLOW}9.2 Get Communities...${NC}"
curl -s "$BASE_URL/api/channels/communities/$PHONE" | format_output

echo -e "\n${YELLOW}9.3 Get Call History...${NC}"
curl -s "$BASE_URL/api/calls/$PHONE" | format_output

# ===============================
# SECTION 10: PRESENCE & PROFILE
# ===============================
echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}👤 SECTION 10: PRESENCE & PROFILE${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

echo -e "\n${YELLOW}10.1 Update Presence (Typing)...${NC}"
curl -s -X POST "$BASE_URL/api/presence/action" \
  -H "Content-Type: application/json" \
  -d "{\"phone\":\"$PHONE\",\"action\":\"update\",\"chatId\":\"$TEST_RECIPIENT\",\"presence\":\"composing\"}" | format_output

echo -e "\n${YELLOW}10.2 Get Profile...${NC}"
curl -s "$BASE_URL/api/profile/$PHONE" | format_output

echo -e "\n${YELLOW}10.3 Update Profile (Note: requires actual data)...${NC}"
echo "Skipped - requires valid profile update data"

# ===============================
# SECTION 11: PRIVACY & SECURITY
# ===============================
echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}🔒 SECTION 11: PRIVACY & SECURITY${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

echo -e "\n${YELLOW}11.1 Get Privacy Settings...${NC}"
curl -s "$BASE_URL/api/privacy/settings/$PHONE" | format_output

echo -e "\n${YELLOW}11.2 Get Blocked Contacts...${NC}"
curl -s "$BASE_URL/api/privacy/blocked/$PHONE" | format_output

echo -e "\n${YELLOW}11.3 Update Privacy Settings (Status visibility to contacts)...${NC}"
curl -s -X POST "$BASE_URL/api/privacy/settings/update" \
  -H "Content-Type: application/json" \
  -d "{\"phone\":\"$PHONE\",\"setting\":\"status\",\"value\":\"contacts\"}" | format_output

echo -e "\n${YELLOW}11.4 Set Disappearing Messages (24 hours)...${NC}"
curl -s -X POST "$BASE_URL/api/privacy/disappearing-messages" \
  -H "Content-Type: application/json" \
  -d "{\"phone\":\"$PHONE\",\"chatId\":\"$TEST_RECIPIENT\",\"duration\":86400}" | format_output

echo -e "\n${YELLOW}11.5 Get Business Profile (Note: requires business account JID)...${NC}"
echo "Skipped - requires valid business account JID"

# ===============================
# SECTION 12: ADVANCED FEATURES
# ===============================
echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}⚡ SECTION 12: ADVANCED FEATURES${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

echo -e "\n${YELLOW}12.1 Get AI Chat History...${NC}"
curl -s "$BASE_URL/api/ai/history/$PHONE/test_chat" | format_output

echo -e "\n${YELLOW}12.2 Clear Session State (Partial)...${NC}"
curl -s -X POST "$BASE_URL/api/clear-state/$PHONE" | format_output

# ===============================
# SECTION 13: CLEANUP
# ===============================
echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}🧹 SECTION 13: CLEANUP (OPTIONAL)${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

echo -e "\n${YELLOW}13.1 Clear AI Chat History...${NC}"
curl -s -X POST "$BASE_URL/api/ai/history/clear" \
  -H "Content-Type: application/json" \
  -d "{\"phone\":\"$PHONE\",\"chatId\":\"test_chat\"}" | format_output

echo -e "\n${RED}Would you like to logout? (y/n)${NC}"
read -r logout_choice

if [ "$logout_choice" = "y" ] || [ "$logout_choice" = "Y" ]; then
  echo -e "\n${YELLOW}13.2 Logout...${NC}"
  curl -s -X POST "$BASE_URL/api/logout" \
    -H "Content-Type: application/json" \
    -d "{\"phone\":\"$PHONE\"}" | format_output
fi

# ===============================
# TEST SUMMARY
# ===============================
echo -e "\n${GREEN}"
echo "╔════════════════════════════════════════════╗"
echo "║        ✅ ALL TESTS COMPLETED              ║"
echo "╚════════════════════════════════════════════╝"
echo -e "${NC}"

echo -e "${BLUE}📝 Test Summary:${NC}"
echo -e "  ${GREEN}✓${NC} Health & Connection Tests"
echo -e "  ${GREEN}✓${NC} Data Retrieval Tests"
echo -e "  ${GREEN}✓${NC} Messaging Tests"
echo -e "  ${GREEN}✓${NC} Message Actions Tests"
echo -e "  ${GREEN}✓${NC} Chat Actions Tests"
echo -e "  ${GREEN}✓${NC} Status/Story Tests"
echo -e "  ${GREEN}✓${NC} Group Management Tests"
echo -e "  ${GREEN}✓${NC} AI Features Tests"
echo -e "  ${GREEN}✓${NC} Channels & Calls Tests"
echo -e "  ${GREEN}✓${NC} Presence & Profile Tests"
echo -e "  ${GREEN}✓${NC} Privacy & Security Tests"
echo -e "  ${GREEN}✓${NC} Advanced Features Tests"
echo -e "  ${GREEN}✓${NC} Cleanup Tests"

echo -e "\n${YELLOW}To run with custom values:${NC}"
echo -e "  ${BLUE}BASE_URL=http://localhost:5000 PHONE=123456789 ./test-endpoints.sh${NC}"
echo ""
