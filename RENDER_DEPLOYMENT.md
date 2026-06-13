# Render Deployment Guide

This guide will deploy your Consultation Recording Manager to **Render.com** (free tier available, auto-deploys on git push).

## 📋 Prerequisites

- GitHub account with repo pushed
- Render account (free at https://render.com)
- MongoDB Atlas account (free tier at https://mongodb.com/cloud/atlas)

---

## 🚀 Step 1: Set Up MongoDB Atlas (5 minutes)

1. **Create MongoDB Atlas Account**
   - Go to: https://www.mongodb.com/cloud/atlas
   - Sign up (free)
   - Create a free cluster

2. **Get Connection String**
   - In Atlas dashboard: **Clusters** → **Connect**
   - Select **"Drivers"** (not Compass)
   - Copy the connection string, replace placeholders:
   ```
   mongodb+srv://username:password@cluster0.xxxx.mongodb.net/consultation-manager?retryWrites=true&w=majority
   ```

3. **Add Network Access**
   - Go to **Security** → **Network Access**
   - Click **"Add IP Address"** → **"Allow Access from Anywhere"** (0.0.0.0/0)
   - Confirm

**Save this connection string—you'll need it in Step 3.**

---

## 🚀 Step 2: Connect GitHub to Render (2 minutes)

1. **Create Render Account**
   - Go to: https://render.com
   - Click **"Sign up"** → Choose **"GitHub"**
   - Authorize Render to access your GitHub account

---

## 🚀 Step 3: Deploy with render.yaml (2 minutes)

1. **In Render Dashboard**
   - Click **"New +"** → **"Blueprint"**
   - Select your GitHub repo (consultation-recording-manager)
   - **Branch:** `main`
   - Click **"Apply"**

2. **Configure Environment Variables**
   - After services are created, go to each service's **"Environment"** tab
   - Add these variables:

   **For Backend Service:**
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster0.xxxx.mongodb.net/consultation-manager
   JWT_SECRET=your-random-secret-key-generate-this
   CLOUDINARY_CLOUD_NAME=optional-leave-empty
   CLOUDINARY_API_KEY=optional-leave-empty
   CLOUDINARY_API_SECRET=optional-leave-empty
   GEMINI_API_KEY=optional-leave-empty
   NODE_ENV=production
   FRONTEND_URL=https://consultation-frontend.onrender.com
   ```

   **For Frontend Service:**
   ```
   VITE_API_URL=https://consultation-backend.onrender.com
   NODE_ENV=production
   ```

3. **Manual Deploy**
   - Both services will show as "Creating"
   - Wait ~10-15 minutes for builds to complete
   - Once live, you'll see green "Live" status

---

## ✅ After Deployment

### **Your Live URLs:**
```
Frontend: https://consultation-frontend.onrender.com
Backend:  https://consultation-backend.onrender.com
```

### **Test the Deployment**
1. Open frontend URL in browser
2. You should see **Login page** ✅
3. Try creating an account
4. Check browser **Network tab** → API calls should go to backend URL

---

## 🔧 Troubleshooting

### **"Backend service is restarting"**
- Check logs: Click service → **"Logs"** tab
- Common issues:
  - `MONGODB_URI` is wrong or MongoDB server is down
  - `JWT_SECRET` is not set
  - Port binding issue
- **Fix:** Update env vars, services will auto-redeploy

### **"Frontend shows blank page / CORS errors"**
- Check browser console (DevTools → Console tab)
- Ensure `VITE_API_URL` env var points to your backend URL
- Ensure backend `FRONTEND_URL` env var matches frontend URL
- **Fix:** Update env vars and manually redeploy frontend

### **"Uploads not working"**
- Without Cloudinary: uploads fail (not persistent on Render free tier)
- **Solution:** Set up Cloudinary:
  1. Go to https://cloudinary.com (free tier available)
  2. Get API credentials
  3. Set `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` env vars
  4. Services auto-redeploy

### **"Service keeps failing to build"**
- Check logs for build errors
- Common: Missing dependencies, Node version mismatch
- Try manually redeploying: Service page → **"Manual Deploy"** button

### **"Cold starts taking 5+ minutes"**
- Render free tier spins down after 15 min of inactivity
- To keep warm: Use UptimeRobot (free) to ping your backend every 14 minutes

---

## 🚀 Auto-Deploy on Code Push

Once deployed:
1. Make code changes locally
2. Commit & push to GitHub:
   ```bash
   git add .
   git commit -m "Your message"
   git push origin main
   ```
3. Render automatically rebuilds & deploys ✅

---

## 📊 Environment Variables Reference

| Variable | Required | Backend | Frontend | Example |
|----------|----------|---------|----------|---------|
| `MONGODB_URI` | Yes | ✅ | ❌ | `mongodb+srv://...` |
| `JWT_SECRET` | Yes | ✅ | ❌ | `any-random-string` |
| `CLOUDINARY_CLOUD_NAME` | No | ✅ | ❌ | `your-cloud` |
| `CLOUDINARY_API_KEY` | No | ✅ | ❌ | `key123` |
| `CLOUDINARY_API_SECRET` | No | ✅ | ❌ | `secret123` |
| `GEMINI_API_KEY` | No | ✅ | ❌ | `AIzaSy...` |
| `NODE_ENV` | Yes | ✅ | ✅ | `production` |
| `FRONTEND_URL` | Yes | ✅ | ❌ | `https://...onrender.com` |
| `VITE_API_URL` | Yes | ❌ | ✅ | `https://...onrender.com` |

---

## 💡 Tips & Best Practices

1. **Keep Free Tier Running**
   - Render free tier spins down after 15 min inactivity
   - Use UptimeRobot to ping backend every 14 min (free)

2. **Secure JWT_SECRET**
   - Generate strong random string: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
   - Don't commit `.env` to Git

3. **Monitor Costs**
   - Render free tier includes: 0.5 GB RAM, 0.5 GB disk per service
   - Paid tier: $7/month per service for better performance

4. **Enable Automatic Deploys**
   - Default enabled; any push to `main` redeploys
   - Can change in service settings

5. **Database Backups**
   - MongoDB Atlas free tier doesn't auto-backup
   - Manually export data periodically

---

## 🎯 Next Steps

1. **Create MongoDB Atlas cluster** (5 min)
2. **Connect Render to GitHub** (1 min)
3. **Deploy via Blueprint** (3 min) ← You're here
4. **Set environment variables** (2 min)
5. **Wait for builds to complete** (~15 min)
6. **Test at live URLs** ✅

---

## 📞 Support

- **Render Docs:** https://render.com/docs
- **MongoDB Docs:** https://docs.mongodb.com/
- **Check Backend Logs:** Service → Logs tab
- **Check Frontend Logs:** Browser DevTools → Console tab

---

**Your app is deploying to Render.com! 🚀**

Once deployed, share your frontend URL and I can help verify everything works.
