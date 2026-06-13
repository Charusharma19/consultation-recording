# 🚀 Deploy to Render in 3 Steps

**Your project is ready for production!** Follow this quick guide to go live on Render.com.

---

## **Step 1️⃣: Prepare MongoDB Atlas (5 minutes)**

### A. Create MongoDB Account
- Go to: https://www.mongodb.com/cloud/atlas
- Sign up (free tier available)
- Create a free shared cluster (AWS, any region)

### B. Get Connection String
1. In MongoDB Atlas Dashboard → **"Databases"** → Click **"Connect"** on your cluster
2. Choose **"Drivers"** (not Compass)
3. Select **"Node.js"** and copy the connection string:
   ```
   mongodb+srv://username:password@cluster0.xxxx.mongodb.net/consultation-manager?retryWrites=true&w=majority
   ```
4. Replace `username` and `password` with your database user credentials
5. **Save this string** (you'll need it in Step 3)

### C. Whitelist IP Addresses
1. Still in MongoDB Atlas → **"Security"** → **"Network Access"**
2. Click **"Add IP Address"**
3. Select **"Allow Access from Anywhere"** (0.0.0.0/0) for now
4. Click **"Confirm"**

✅ **MongoDB is ready!**

---

## **Step 2️⃣: Connect Render to GitHub (2 minutes)**

### A. Create Render Account
1. Go to: https://render.com
2. Click **"Sign Up"**
3. Choose **"GitHub"** as signup method
4. **Authorize Render** to access your GitHub

### B. Connect Repository
1. In Render Dashboard, click **"New +"** → **"Blueprint"**
2. Search for your repo: `consultation-recording` (or your GitHub username)
3. Select the repo
4. **Branch:** `main`
5. Click **"Connect"**

✅ **Render is ready!**

---

## **Step 3️⃣: Deploy Services (3 minutes)**

Render will automatically detect the `render.yaml` file and create services. Follow the deployment:

### A. Wait for Blueprint Processing
- Render will show: **"Creating services..."**
- Wait ~1-2 minutes

### B. Configure Backend Environment Variables
When the services appear, click on **`consultation-backend`** service:

1. Go to **"Environment"** tab
2. Add these variables:
   ```
   MONGODB_URI=mongodb+srv://your-username:your-password@cluster0.xxxx.mongodb.net/consultation-manager?retryWrites=true&w=majority
   JWT_SECRET=your-random-secret-key-goes-here
   NODE_ENV=production
   FRONTEND_URL=https://consultation-frontend.onrender.com
   ```
   
   *(Optional - leave blank if you don't have these)*
   ```
   CLOUDINARY_CLOUD_NAME=
   CLOUDINARY_API_KEY=
   CLOUDINARY_API_SECRET=
   GEMINI_API_KEY=
   ```

3. Click **"Save Changes"**
4. Render will **auto-redeploy** the backend

### C. Configure Frontend Environment Variables
Click on **`consultation-frontend`** service:

1. Go to **"Environment"** tab
2. Verify this variable:
   ```
   VITE_API_URL=https://consultation-backend.onrender.com
   NODE_ENV=production
   ```
3. Click **"Save Changes"**
4. Render will **auto-redeploy** the frontend

✅ **Services are deploying!**

---

## **Step 4️⃣: Wait for Deployment (~15 minutes)**

- Both services will show **"Deploying..."**
- Check progress in each service's **"Logs"** tab
- Once complete, you'll see **"Live"** with a green checkmark

---

## **✅ Your Live Application**

Once both services are **"Live"**, you're deployed! 🎉

```
🌍 Frontend:  https://consultation-frontend.onrender.com
🔌 Backend:   https://consultation-backend.onrender.com
```

### Test Your App
1. Open frontend URL in your browser
2. You should see the **Login page**
3. Try creating an account
4. Check **DevTools** (F12) → **Network tab** → API calls should reach your backend URL

---

## **🔧 Troubleshooting**

### **"Backend service shows 'Build Failed'"**
- Check the **"Logs"** tab for error messages
- Common issues:
  - `MONGODB_URI` is incorrect or MongoDB is down
  - Dependencies not found
  - Node version mismatch
- **Fix:** Update env vars and click **"Manual Deploy"** button

### **"Frontend shows blank page"**
- Open browser **DevTools** (F12) → **Console tab**
- Look for CORS or API errors
- **Fix:** Ensure `VITE_API_URL` matches your backend URL exactly

### **"Cannot connect to MongoDB"**
- Test your connection string in MongoDB Compass
- Ensure IP whitelist includes `0.0.0.0/0`
- Check MongoDB user password doesn't have special characters that need URL encoding
- **Fix:** Update `MONGODB_URI` and redeploy

### **"Service keeps crashing"**
- Click service → **"Logs"** tab
- Look for error messages
- Most common: Missing `MONGODB_URI` env var
- **Fix:** Add missing env vars and redeploy

### **"Cold start takes 5+ minutes"**
- Render free tier spins down after 15 min of inactivity
- **Solution:** Use UptimeRobot (free) to ping backend every 14 minutes

---

## **🔄 Auto-Deploy on Code Changes**

After initial deployment, every time you push to GitHub, Render automatically rebuilds and deploys:

```bash
# Make changes locally
git add .
git commit -m "Your message"
git push origin main

# Render automatically rebuilds! ✅
```

---

## **💰 Pricing (Render Free Tier)**

- **Backend Service:** Free (0.5 GB RAM, 0.5 GB disk)
- **Frontend Service:** Free (0.5 GB RAM, 0.5 GB disk)
- **MongoDB Atlas:** Free (0.5 GB storage)
- **Total Cost:** $0/month

**Note:** Free tier spins down after 15 minutes of inactivity (cold start takes time). Upgrade to paid ($7+/month per service) for always-on.

---

## **📚 Helpful Links**

- Render Dashboard: https://dashboard.render.com
- MongoDB Atlas: https://cloud.mongodb.com
- API Documentation: [RENDER_DEPLOYMENT.md](./RENDER_DEPLOYMENT.md)
- Full Documentation: [README.md](./README.md)
- Full Deployment Guide: [DEPLOYMENT.md](./DEPLOYMENT.md)

---

## **🎯 You're Done!** 🎉

Your Consultation Recording Manager is now deployed to production!

**Frontend:** https://consultation-frontend.onrender.com  
**Backend:** https://consultation-backend.onrender.com

Happy coding! 🚀
