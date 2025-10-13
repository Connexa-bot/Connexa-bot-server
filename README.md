# ConnexaBot WhatsApp Backend Server

A powerful WhatsApp backend server built with Baileys and MongoDB, designed for easy deployment on Koyeb or any cloud platform.

## 🚀 Features

- **WhatsApp Integration**: Full-featured WhatsApp API using Baileys
- **MongoDB Storage**: Persistent storage for chats, contacts, messages, and sessions
- **Real-time Updates**: WebSocket support for live notifications
- **AI Capabilities**: Integrated OpenAI for smart replies and automation
- **RESTful API**: Complete REST API for all WhatsApp operations
- **Cloud-Ready**: Optimized for deployment on Koyeb, Render, or Railway

## 📋 Prerequisites

- Node.js 18+ 
- MongoDB Atlas account (free tier works)
- OpenAI API key (optional, for AI features)

## 🛠️ Installation

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd connexabot-server
npm install
```

### 2. Environment Setup

Create a `.env` file or set environment variables:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Connection (REQUIRED for production)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/connexabot

# WhatsApp Session
AUTH_DIR=./auth
MEDIA_DIR=./media

# AI Features (Optional)
OPENAI_API_KEY=your_openai_api_key

# Server URL (auto-detected on Replit/Koyeb)
SERVER_URL=http://localhost:5000
```

### 3. Get MongoDB Connection String

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Create a database user
4. Get connection string from "Connect" → "Connect your application"
5. Replace `<password>` with your password
6. Add to `MONGODB_URI` environment variable

## 🚀 Deployment on Koyeb

### Method 1: Using GitHub (Recommended)

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <your-github-repo>
   git push -u origin main
   ```

2. **Deploy on Koyeb**
   - Go to [Koyeb Dashboard](https://app.koyeb.com)
   - Click "Create App"
   - Select "GitHub" as deployment method
   - Choose your repository
   - Koyeb will auto-detect the Dockerfile

3. **Set Environment Variables**
   - In Koyeb app settings, add:
     - `MONGODB_URI`: Your MongoDB connection string
     - `OPENAI_API_KEY`: Your OpenAI key (optional)
     - `NODE_ENV`: production
     - `PORT`: 5000

4. **Deploy**
   - Click "Deploy"
   - Your app will be available at `https://your-app.koyeb.app`

### Method 2: Using Koyeb CLI

```bash
# Install Koyeb CLI
npm install -g @koyeb/cli

# Login
koyeb login

# Deploy
koyeb app create connexabot \
  --git https://github.com/yourusername/connexabot-server \
  --git-branch main \
  --env MONGODB_URI=your_mongodb_uri \
  --env NODE_ENV=production \
  --ports 5000:http \
  --routes /:5000
```

## 🔧 Development

### Run Locally

```bash
npm start
```

Server will start on `http://localhost:5000`

### API Documentation

See `API_DOCUMENTATION.md` for complete API reference.

### Frontend Integration

Use the `API.js` file in your React/React Native frontend:

```javascript
import { API_ENDPOINTS, callAPI } from './API.js';

// Connect WhatsApp
const result = await callAPI(API_ENDPOINTS.CONNECT('2349154347487'));

// Get chats
const chats = await callAPI(API_ENDPOINTS.GET_CHATS('2349154347487'));

// Send message
await callAPI(API_ENDPOINTS.SEND_MESSAGE('2349154347487', 'recipient@s.whatsapp.net', 'Hello!'));
```

Set your backend URL in frontend `.env`:

```env
REACT_APP_API_URL=https://your-app.koyeb.app
# or
VITE_API_URL=https://your-app.koyeb.app
```

## 📊 MongoDB Collections

The app automatically creates these collections:

- **chats**: All WhatsApp conversations
- **contacts**: User contacts
- **messages**: Message history
- **sessions**: WhatsApp session data

## 🔐 Security Notes

- Never commit `.env` file
- Always use environment variables for secrets
- MongoDB connection string should be kept secure
- Use MongoDB IP whitelist for additional security

## 🐛 Troubleshooting

### MongoDB Connection Failed

Make sure your MongoDB URI is correct:
- Format: `mongodb+srv://username:password@cluster.mongodb.net/database`
- Check username/password are correct
- Whitelist your IP or use `0.0.0.0/0` for all IPs (development only)

### WhatsApp Connection Issues

- Check AUTH_DIR has write permissions
- Ensure phone number format is correct (no + or spaces)
- QR code expires after 60 seconds - refresh if needed

### Port Already in Use

Change PORT in environment variables:
```bash
PORT=3000 npm start
```

## 📝 License

ISC

## 🤝 Support

For issues and questions, please open an issue on GitHub.

---

**Note**: This backend works seamlessly with GitHub push/pull workflows. All data persists in MongoDB, making it perfect for cloud deployments on Koyeb, Railway, or Render.
