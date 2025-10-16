
# ConnexaBot Deployment Guide

## Prerequisites
- MongoDB Atlas account (free tier)
- OpenAI API key (optional, for AI features)
- Koyeb account (for production deployment)

## Environment Variables

### Required
- `MONGODB_URI` - Your MongoDB connection string
- `PORT` - Server port (default: 3000)
- `NODE_ENV` - Environment (development/production)

### Optional
- `OPENAI_API_KEY` - For AI features
- `AUTH_DIR` - WhatsApp auth directory (default: ./auth)
- `MEDIA_DIR` - Media files directory (default: ./media)

## Deployment on Koyeb

### Step 1: Prepare Your Repository
```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

### Step 2: Deploy on Koyeb
1. Go to [Koyeb Dashboard](https://app.koyeb.com)
2. Click "Create App"
3. Select "GitHub" as source
4. Choose your repository
5. Configure environment variables:
   - `MONGODB_URI`
   - `OPENAI_API_KEY`
   - `NODE_ENV=production`
6. Click "Deploy"

### Step 3: Test Deployment
```bash
# Use the test script with your Koyeb URL
./test-endpoints.sh https://your-app.koyeb.app
```

## MongoDB Setup

1. Create cluster at [MongoDB Atlas](https://mongodb.com/cloud/atlas)
2. Create database user
3. Whitelist IP: 0.0.0.0/0 (for development)
4. Get connection string
5. Set as MONGODB_URI environment variable

## Troubleshooting

### Port Conflicts
- Ensure PORT environment variable is set correctly
- Kill existing processes: `pkill -f "node index.js"`

### MongoDB Connection Issues
- Verify connection string format
- Check IP whitelist settings
- Confirm username/password

### WhatsApp Connection
- Ensure AUTH_DIR has write permissions
- QR codes expire in 60 seconds
- Use correct phone number format (no +, spaces)

## Testing

Run comprehensive tests:
```bash
chmod +x test-endpoints.sh
./test-endpoints.sh https://your-deployment-url
```

Quick test:
```bash
chmod +x test-quick.sh
./test-quick.sh https://your-deployment-url
```
