# Consultation Recording Manager

A full-stack application for managing consultation recordings, transcriptions, and summaries. Built with React, Express, TypeScript, MongoDB, and powered by Google Gemini AI.

![Status](https://img.shields.io/badge/status-production--ready-brightgreen)
![License](https://img.shields.io/badge/license-MIT-blue)
![Node](https://img.shields.io/badge/node-18%2B-brightgreen)

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Project Structure](#project-structure)
- [Configuration](#configuration)
- [Development](#development)
- [Deployment](#deployment)
- [API Endpoints](#api-endpoints)
- [Troubleshooting](#troubleshooting)

---

## ✨ Features

- **User Authentication**: Secure JWT-based login & registration
- **Recording Management**: Upload, store, and organize consultation recordings
- **AI Transcription**: Automatic speech-to-text using Google Gemini API
- **AI Summarization**: Generate consultation summaries from recordings
- **Client Management**: Organize consultations by client
- **File Storage**: Cloudinary integration for reliable image/file hosting (or local storage)
- **Responsive UI**: Modern React + Tailwind CSS frontend
- **Production Ready**: Docker support, environment configuration, error handling

---

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool & dev server
- **Tailwind CSS** - Styling
- **Axios** - HTTP client
- **React Router** - Navigation (via Context API)

### Backend
- **Node.js 18** - Runtime
- **Express.js** - Web framework
- **TypeScript** - Type safety
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **Google Gemini API** - AI transcription/summarization
- **Cloudinary** - File storage (optional)
- **Multer** - File upload handling

### DevOps
- **Docker** - Containerization
- **Docker Compose** - Local orchestration
- **Nginx** - Reverse proxy & static serving
- **MongoDB Atlas** - Cloud database (production)

---

## 📦 Prerequisites

- **Node.js** 18+ ([download](https://nodejs.org/))
- **npm** 9+ or **yarn**
- **MongoDB** (local or [Atlas](https://www.mongodb.com/cloud/atlas) for production)
- **Docker & Docker Compose** (optional, for containerized deployment)
- **Git** (for version control & deployment)

---

## 🚀 Quick Start

### Option 1: Local Development (No Docker)

```bash
# Clone or navigate to project
cd consultation-recording-manager

# Install root dependencies
npm install

# Install all subproject dependencies
npm run install:all

# Start backend dev server (Terminal 1)
npm run dev:backend

# Start frontend dev server (Terminal 2)
npm run dev:frontend
```

Then visit: **http://localhost:5173**

Backend API: **http://localhost:5000**

### Option 2: Docker Compose (Full Stack)

```bash
# Copy environment template
cp .env.example .env

# Edit .env with your values (MongoDB URI, API keys, etc.)
# nano .env  (or use any editor)

# Start all services (MongoDB + Backend + Frontend)
docker-compose up --build

# Or on Windows PowerShell:
.\start-docker.ps1
```



---

## 📂 Project Structure

```
consultation-recording-manager/
├── backend/
│   ├── src/
│   │   ├── index.ts              # App entry point
│   │   ├── config/               # Configuration files
│   │   │   ├── db.ts             # MongoDB connection
│   │   │   ├── cloudinary.ts     # Cloudinary setup
│   │   │   └── gemini.ts         # Gemini API config
│   │   ├── controllers/          # Route handlers
│   │   ├── models/               # Mongoose schemas
│   │   ├── routes/               # Express routes
│   │   ├── middleware/           # Auth, upload, etc.
│   │   └── services/             # Business logic
│   ├── Dockerfile               # Backend container image
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── main.tsx             # Entry point
│   │   ├── App.tsx              # Root component
│   │   ├── components/          # Reusable components
│   │   ├── pages/               # Page components
│   │   ├── context/             # Auth context
│   │   ├── services/            # API client
│   │   ├── assets/              # Images, icons
│   │   └── index.css            # Global styles
│   ├── public/                  # Static assets
│   ├── Dockerfile              # Frontend container image
│   ├── nginx.conf              # Reverse proxy config
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   └── tsconfig.json
├── docker-compose.yml          # Multi-service orchestration
├── .env.example                # Environment template
├── .dockerignore               # Docker build exclusions
├── DEPLOYMENT.md               # Deployment guide
└── README.md                   # This file
```

---

## ⚙️ Configuration

### Environment Variables

Create a `.env` file in the root (copy from `.env.example`):

```env
# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/consultation-manager

# JWT & Security
JWT_SECRET=your-secret-key-change-in-production

# Cloudinary (Image Storage)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Google Gemini API (AI Features)
GEMINI_API_KEY=your-gemini-api-key

# Server Config
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

**See [`.env.example`](.env.example) for all available variables.**

### MongoDB Setup

#### Local Development
MongoDB will run automatically via Docker Compose.

#### Production (MongoDB Atlas)
1. Create account: https://www.mongodb.com/cloud/atlas
2. Create free cluster
3. Add network access IP: `0.0.0.0/0` (restrict in production)
4. Create database user & copy connection string
5. Use connection string in `MONGODB_URI` env var

---

## 💻 Development

### Running Locally

**Terminal 1 - Backend:**
```bash
cd backend
npm install
npm run dev
# Runs on http://localhost:5000
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm install
npm run dev
# Runs on http://localhost:5173
```

### Building for Production

```bash
# Backend
cd backend
npm run build
node dist/index.js

# Frontend
cd frontend
npm run build
npm run preview
```

### Linting & Type Checking

```bash
# Frontend linting
cd frontend
npm run lint

# Backend (uses TypeScript strict mode)
cd backend
npm run build
```

---

## 🚢 Deployment

### Option 1: TanStack Cloud (Recommended)

See **[DEPLOYMENT.md](DEPLOYMENT.md)** for step-by-step instructions.

**Summary:**
1. Push code to GitHub
2. Connect TanStack Cloud to GitHub
3. Deploy Backend service (uses `backend/Dockerfile`)
4. Deploy Frontend service (uses `frontend/Dockerfile`)
5. Set environment variables in TanStack Cloud dashboard
6. Get live URLs

### Option 2: Docker Compose on VPS

```bash
# On your server:
git clone https://github.com/your-username/consultation-recording-manager.git
cd consultation-recording-manager
cp .env.example .env
# Edit .env with production values
docker-compose up -d
```

### Option 3: Traditional Deployment

1. Deploy backend to Render, Railway, Heroku, etc.
2. Deploy frontend to Vercel, Netlify, etc.
3. Ensure `FRONTEND_URL` and API endpoints are configured

---

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Create new account
- `POST /api/auth/login` - Login & get JWT token

### Clients
- `GET /api/clients` - List all clients
- `POST /api/clients` - Create new client
- `GET /api/clients/:id` - Get client details
- `PUT /api/clients/:id` - Update client
- `DELETE /api/clients/:id` - Delete client

### Recordings
- `GET /api/recordings` - List all recordings
- `POST /api/recordings` - Upload new recording
- `GET /api/recordings/:id` - Get recording details
- `DELETE /api/recordings/:id` - Delete recording
- `POST /api/recordings/:id/transcribe` - AI transcription
- `POST /api/recordings/:id/summarize` - AI summarization

### File Uploads
- `POST /api/upload` - Upload files (images, recordings)
- `GET /uploads/:filename` - Access uploaded files

*Authentication required: Include `Authorization: Bearer <token>` header in requests.*

---

## 🔧 Troubleshooting

### "Cannot connect to MongoDB"
- Check `MONGODB_URI` in `.env` is correct
- For MongoDB Atlas: ensure your IP is whitelisted (add `0.0.0.0/0` for testing)
- For local: ensure MongoDB container is running (`docker ps`)

### "Frontend shows CORS errors"
- Ensure `FRONTEND_URL` backend env var matches your actual frontend domain
- Check backend CORS middleware configuration in `backend/src/index.ts`

### "Uploads not working"
- Without Cloudinary: files save to `backend/uploads/` (local storage; won't persist across container restarts)
- With Cloudinary: set `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`

### "Docker build fails"
- Ensure Docker daemon is running
- Clear build cache: `docker-compose down && docker system prune`
- Check Node.js version: `node --version` (should be 18+)

### "Port already in use"
- Backend (5000): `lsof -i :5000` (macOS/Linux) or check Task Manager (Windows)
- Frontend (5173): `lsof -i :5173`
- MongoDB (27017): `lsof -i :27017`

---

## 📚 Additional Resources

- [Express Documentation](https://expressjs.com/)
- [React Documentation](https://react.dev/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Vite Documentation](https://vitejs.dev/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)
- [Google Gemini API](https://ai.google.dev/)
- [Docker Documentation](https://docs.docker.com/)

---

## 📝 License

This project is licensed under the MIT License. See LICENSE file for details.

---

## 🤝 Support

For issues, questions, or suggestions:
- Check [DEPLOYMENT.md](DEPLOYMENT.md) for deployment troubleshooting
- Review [.env.example](.env.example) for configuration reference
- Check backend logs: `docker logs consultation-backend`
- Check frontend console: Browser DevTools → Console tab

---

## 🎯 Next Steps

1. **Local Testing**: Run `docker-compose up --build` and test at `http://localhost`
2. **Configuration**: Copy `.env.example` to `.env` and fill in your values
3. **Deployment**: Follow [DEPLOYMENT.md](DEPLOYMENT.md) for TanStack Cloud or your hosting provider
4. **Customization**: Modify features, styling, or add new functionality as needed

---

**Happy coding! 🚀**
