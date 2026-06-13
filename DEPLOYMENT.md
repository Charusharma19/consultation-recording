# Deployment Guide - Consultation Recording Manager

## Quick Start

### Option 1: Local Docker Testing
Test the full stack locally before deploying to TanStack Cloud.

```bash
# 1. Copy and configure environment variables
cp .env.example .env

# 2. Edit .env with your actual values (or leave defaults for testing)
# nano .env

# 3. Build and run all services
docker-compose up --build

# 4. Access the app
# Frontend: http://localhost
# Backend API: http://localhost:5000
# MongoDB: localhost:27017
```

Stop containers:
```bash
docker-compose down
```

---

### Option 2: Deploy to TanStack Cloud

#### Prerequisites
- TanStack Cloud account (https://tanstack.cloud)
- GitHub account with the code pushed
- Environment secrets ready (see `.env.example`)

#### Step 1: Prepare MongoDB
Use MongoDB Atlas (free tier available):
1. Go to https://www.mongodb.com/cloud/atlas
2. Create a free cluster
3. Get the connection string: `mongodb+srv://username:password@cluster.mongodb.net/consultation-manager`

#### Step 2: Deploy Backend to TanStack Cloud

1. **Connect GitHub repo:**
   - Push this repo to GitHub
   - In TanStack Cloud, connect your GitHub account

2. **Create Backend Service:**
   - Service name: `consultation-backend`
   - Select Dockerfile: `backend/Dockerfile`
   - Port: `5000`
   - Environment Variables:
     ```
     MONGODB_URI=mongodb+srv://...
     JWT_SECRET=your-secret-key
     CLOUDINARY_CLOUD_NAME=your-value
     CLOUDINARY_API_KEY=your-value
     CLOUDINARY_API_SECRET=your-value
     GEMINI_API_KEY=your-value
     NODE_ENV=production
     FRONTEND_URL=https://your-frontend-url.tanstackcloud.io
     ```

3. **Deploy & get backend URL** (e.g., `https://consultation-backend.tanstackcloud.io`)

#### Step 3: Deploy Frontend to TanStack Cloud

1. **Create Frontend Service:**
   - Service name: `consultation-frontend`
   - Select Dockerfile: `frontend/Dockerfile`
   - Port: `80`
   - Environment Variables:
     ```
     VITE_API_URL=https://consultation-backend.tanstackcloud.io
     ```

2. **Update nginx.conf:**
   Replace `http://backend:5000` with your actual backend URL (from Step 2)

3. **Deploy & get frontend URL** (e.g., `https://consultation-frontend.tanstackcloud.io`)

---

## Environment Variables Reference

| Variable | Required | Example | Notes |
|----------|----------|---------|-------|
| `MONGODB_URI` | Yes | `mongodb+srv://...` | MongoDB Atlas connection string |
| `JWT_SECRET` | Yes | `any-random-string` | Used for token signing; keep secret |
| `CLOUDINARY_CLOUD_NAME` | No | `your-cloud` | For image uploads; optional |
| `CLOUDINARY_API_KEY` | No | `key123` | For image uploads; optional |
| `CLOUDINARY_API_SECRET` | No | `secret123` | For image uploads; optional |
| `GEMINI_API_KEY` | No | `AIzaSy...` | For AI transcription; optional |
| `NODE_ENV` | Yes | `production` | Set to `production` for deployments |
| `FRONTEND_URL` | Yes | `https://...` | Frontend domain for CORS |
| `PORT` | No | `5000` | Backend port (default: 5000) |

---

## Verification Checklist

After deployment:
- [ ] Frontend loads at TanStack Cloud URL
- [ ] Login/Register page displays
- [ ] Backend API responds (check Network tab in browser DevTools)
- [ ] Can create a user account
- [ ] Can upload a recording
- [ ] MongoDB Atlas shows database activity

---

## Troubleshooting

### "Cannot connect to MongoDB"
- Check `MONGODB_URI` is correct in TanStack Cloud env vars
- Ensure MongoDB Atlas allows connections from TanStack Cloud IPs (set IP whitelist to `0.0.0.0/0` for testing, restrict later)

### "Frontend shows CORS errors"
- Ensure `FRONTEND_URL` backend env var matches your actual frontend domain
- Check `nginx.conf` proxy rules are correct

### "Uploads not working"
- Cloudinary is optional; app defaults to local `backend/uploads/` folder (won't persist on restart; use Cloudinary for production)
- To enable: set `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`

### "Build fails"
- Ensure `backend/Dockerfile` copies all required files
- Check Node.js version in both Dockerfiles (currently `node:18-alpine`)

---

## Local Development

To run locally without Docker:

```bash
# Terminal 1: Backend
cd backend
npm install
npm run dev

# Terminal 2: Frontend
cd frontend
npm install
npm run dev
```

Then visit `http://localhost:5173`

---

## Contact & Support

For TanStack Cloud deployment issues, refer to:
- TanStack Cloud docs: https://tanstack.cloud/docs
- Docker docs: https://docs.docker.com
- MongoDB Atlas: https://docs.atlas.mongodb.com
