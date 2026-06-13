# Project Notes & AI Usage: AuraConsult

**AuraConsult (Consultation Recording Manager)** is a secure, full-stack clinical transcription and summarization platform. It enables clinicians to upload consultation audio/video recordings, organize them by patient, search across content, and review automatically generated transcripts and summaries powered by Google Gemini 1.5 Flash.

---

## 🚀 Core Features & Implementation

1. **Secure Access Controls:** JWT-based authentication restricts data access. passwords are encrypted using bcryptjs, securing patient privacy.
2. **Intake & Client Manager:** Group consultations under specific client profiles, enabling chronological review of patient history.
3. **Smart Media Hosting:** Automatically integrates with Cloudinary for scalable media serving, with a local file storage fallback for zero-configuration testing.
4. **Background AI Pipeline:** Audio/video files are uploaded and processed asynchronously in the background. The server returns immediately, allowing the UI to display a live processing state while Gemini works.
5. **Interactive Details Console:** Offers a custom media player with tabbed widgets showing:
   - **Verbatim Transcript:** Searchable transcript with speaker tags and timestamps.
   - **AI Summary & Action Items:** Clinical summaries and actionable recommendations extracted by Gemini.
   - **Clinician Notes:** Persistent manual notes recorded during upload.

---

## 💻 Technical Stack

- **Frontend:** React, TypeScript, Tailwind CSS (Dark/Glassmorphic design system), Axios, Lucide Icons.
- **Backend:** Node.js, Express.js, TypeScript.
- **Database:** Mongoose & MongoDB (Atlas support).
- **Media Storage:** Cloudinary & Multer.
- **AI Processing:** `@google/genai` (Official Google Gen AI SDK) communicating with `gemini-1.5-flash`.

---

## 🤖 AI Integration & Usage Details

### 1. Model Selection
We selected **`gemini-1.5-flash`** due to its multimodal capability (accepting large audio and video files natively) and fast latency.

### 2. File Upload & Prompt Engineering
- The backend uses the Gemini File API (`ai.files.upload`) to temporarily stage audio or video files directly in Google's infrastructure.
- We prompt the model to act as a **professional clinical assistant** with strict instructions to return a structured JSON response containing:
  - Verbatim transcript with speaker tags and timestamps.
  - A professional summary.
  - Actionable clinical insights.
- The prompt enforces a strict JSON output shape which the backend parses, saves to MongoDB, and then deletes the temporary file from the Gemini API using `ai.files.delete` for data sanitation.

---

## 🌐 Deployment Instructions

### Backend Deployment (Render)
1. Push your code to GitHub.
2. Log in to [Render](https://render.com) and create a new **Web Service**.
3. Link your GitHub repository and set:
   - **Build Command:** `npm install && npm run build` (make sure to cd to backend folder or configure root directory to `backend`)
   - **Start Command:** `npm start`
4. Add the following **Environment Variables**:
   - `PORT`: `5000`
   - `MONGODB_URI`: *Your MongoDB Atlas connection string*
   - `JWT_SECRET`: *Your JWT secret key*
   - `GEMINI_API_KEY`: *Your Google AI Studio Gemini API Key*
   - `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` *(Optional Cloudinary credentials)*

### Frontend Deployment (Vercel)
1. Log in to [Vercel](https://vercel.com) and click **Add New > Project**.
2. Select your repository, specify the `frontend` folder as the root directory.
3. Configure build settings:
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. Add **Environment Variables**:
   - `VITE_API_URL`: *Your Render backend URL (e.g. `https://your-backend.onrender.com/api`)*

---

## 📂 Git & GitHub Setup
To upload your code to GitHub:
1. Open terminal inside the root directory (`consultation-recording-manager`) and run:
   ```bash
   git init
   git add .
   git commit -m "Initial commit - AuraConsult Consultation Manager"
   ```
2. Create a new repository on your GitHub account.
3. Link it and push your code:
   ```bash
   git remote add origin https://github.com/your-username/your-repo-name.git
   git branch -M main
   git push -u origin main
   ```

---

## 🎥 Demo Video Guide
To create your demo video (max 1 GB), use screen recording software (e.g. Loom, OBS, or Windows Game Bar `Win + Alt + R`):
1. **Introduction (30s):** Introduce AuraConsult, the target audience (clinicians), and the tech stack.
2. **Auth Flow (30s):** Demonstrate registering a new doctor account and signing in.
3. **Patient Management (30s):** Click "+ Create Client" and add a test patient.
4. **Recording Upload (60s):** Drag & drop a sample audio/video file. Note the upload progress, and explain how the server runs the Gemini AI pipeline in the background.
5. **AI Insights Review (90s):** Play the audio/video. Toggle between the **Transcript** tab (showing keyword search highlighting), the **AI Summary** tab (showing the summarized clinical facts and insights), and the **Clinician Notes** tab.
