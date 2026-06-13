# 🤖 AI Usage Guide - Consultation Recording Manager

**Last Updated:** 2026-06-13  
**AI Model:** Google Gemini 1.5 Flash  
**Purpose:** Automatic transcription & summarization of consultation recordings

---

## 📌 Overview

This application uses **Google Gemini 1.5 Flash** to automatically:
1. Convert audio/video recordings to text (transcription)
2. Generate professional summaries
3. Extract actionable insights from consultations

---

## 🔧 AI Model Details

### **Model Name:** `gemini-1.5-flash`

**Why This Model?**
- ✅ **Multimodal:** Accepts audio, video, and text inputs
- ✅ **Large Context:** Can process long consultation recordings
- ✅ **Fast:** Low latency for quick turnaround
- ✅ **Cost-Effective:** Affordable API pricing
- ✅ **Reliable:** Official Google Gemini API

**Model Capabilities:**
- Audio transcription (speech-to-text)
- Video processing
- Content summarization
- Information extraction
- JSON structured output

---

## 🚀 How AI is Used in This Project

### **1. Transcription Pipeline**

**Flow:**
```
User uploads audio/video file
    ↓
Backend receives file via Multer
    ↓
File uploaded to Google Gemini File API
    ↓
Gemini processes & transcribes content
    ↓
Result saved to MongoDB
    ↓
Temporary file deleted from Gemini API
    ↓
User views transcript in frontend
```

**Code Location:** `backend/src/services/geminiService.ts`

**Example Output:**
```json
{
  "transcript": "Speaker 1: Good morning... Speaker 2: Hello...",
  "summary": "Patient consultation regarding...",
  "actionItems": ["Follow-up appointment", "Prescription refill"]
}
```

---

### **2. Backend Integration**

**Setup:**
```typescript
// backend/src/config/gemini.ts
import { GoogleGenerativeAI } from '@google/genai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ 
  model: 'gemini-1.5-flash' 
});
```

**API Call Example:**
```typescript
// backend/src/services/geminiService.ts
async function transcribeRecording(filePath: string) {
  const file = await ai.files.upload({
    file: await fs.promises.readFile(filePath),
  });

  const result = await model.generateContent([
    {
      fileData: {
        mimeType: 'audio/mpeg',
        fileUri: file.uri,
      },
    },
    {
      text: 'Transcribe this audio and provide summary...'
    }
  ]);

  // Parse JSON response
  const output = JSON.parse(result.response.text());
  
  // Save to DB
  await Recording.findByIdAndUpdate(recordingId, output);
  
  // Clean up
  await ai.files.delete(file.name);
}
```

---

### **3. Prompt Engineering**

**The Prompt Used:**
```
You are a professional consultation transcription assistant. 
Analyze this audio recording and provide a structured JSON response with:

1. "transcript": Complete word-for-word transcription with [Speaker X: text] formatting
2. "summary": Professional 2-3 sentence summary of the consultation
3. "actionItems": Array of follow-up actions or recommendations
4. "keyPoints": Array of key discussion topics

Return ONLY valid JSON, no additional text.
```

**Why This Format?**
- ✅ Structured JSON makes parsing reliable
- ✅ Specific instructions reduce hallucinations
- ✅ Speaker identification helps track conversation flow
- ✅ Action items extraction provides clinical value

---

## 📊 API Integration

### **Google Gemini API Key Setup**

**1. Get Free API Key:**
- Go to: https://ai.google.dev
- Sign in with Google account
- Click **"Get API Key"**
- Copy the key
- Add to `.env`:
  ```
  GEMINI_API_KEY=your-api-key-here
  ```

**2. API Pricing:**
- **Free Tier:** 15 requests/minute, 60 requests/day
- **Paid Tier:** $0.075 per 1M input tokens, $0.30 per 1M output tokens
- **Free enough for:** ~1-2 recordings/day per user

**3. Error Handling:**
```typescript
if (!process.env.GEMINI_API_KEY) {
  console.warn('GEMINI_API_KEY missing. Using mock transcription.');
  return { 
    transcript: '[Mock] Transcription disabled', 
    summary: '[Mock] No AI processing' 
  };
}
```

**If API key is missing:** App defaults to mock responses (no errors)

---

## 🔄 Workflow Example

### **User Uploads Recording:**

**Step 1: Frontend Upload**
```javascript
// frontend/src/services/api.ts
const formData = new FormData();
formData.append('file', audioFile);
formData.append('clientId', clientId);

const response = await API.post('/recordings', formData);
```

**Step 2: Backend Processing**
```typescript
// backend/src/controllers/recordingController.ts
const recording = await Recording.create({
  userId,
  clientId,
  fileName: file.originalname,
  fileUrl: cloudinaryUrl,
  status: 'processing'
});

// Async processing (doesn't block response)
processWithGemini(recording._id, filePath);

res.json({ recordingId: recording._id, status: 'processing' });
```

**Step 3: Async AI Processing**
```typescript
async function processWithGemini(recordingId: string, filePath: string) {
  try {
    const result = await geminiService.transcribeRecording(filePath);
    
    await Recording.findByIdAndUpdate(recordingId, {
      transcription: result.transcript,
      summary: result.summary,
      status: 'completed'
    });
  } catch (error) {
    console.error('Gemini processing failed:', error);
    await Recording.findByIdAndUpdate(recordingId, {
      status: 'failed',
      error: error.message
    });
  }
}
```

**Step 4: Frontend Polling**
```typescript
// Check status every 5 seconds
useEffect(() => {
  const interval = setInterval(async () => {
    const { data } = await API.get(`/recordings/${recordingId}`);
    if (data.status === 'completed') {
      setTranscript(data.transcription);
      setSummary(data.summary);
    }
  }, 5000);
}, []);
```

---

## 📁 File Processing

### **Supported File Types:**
- **Audio:** MP3, WAV, OGG, FLAC, M4A
- **Video:** MP4, WebM, MKV
- **Max File Size:** 1 GB (Gemini File API limit)
- **Recommended:** MP3 or WAV for best results

### **File Upload & Storage:**

**With Cloudinary (Recommended for Production):**
```typescript
const cloudinary = require('cloudinary').v2;
const upload = await cloudinary.uploader.upload(filePath, {
  resource_type: 'auto',
  folder: 'consultation-recordings'
});
recordingUrl = upload.secure_url;
```

**Without Cloudinary (Local Storage for Testing):**
```typescript
const uploadDir = path.join(process.cwd(), 'uploads');
const fileName = `${Date.now()}-${file.originalname}`;
const filePath = path.join(uploadDir, fileName);
await fs.promises.copyFile(file.path, filePath);
recordingUrl = `${baseURL}/uploads/${fileName}`;
```

---

## 🔒 Data Privacy & Security

### **How Data is Handled:**

1. **Temporary File Staging:**
   - Files uploaded to Gemini API
   - Processed immediately
   - Deleted after processing
   - NOT stored by Google

2. **Transcript Storage:**
   - Saved to your MongoDB database
   - Encrypted in transit (HTTPS)
   - Access controlled by JWT auth
   - User can delete anytime

3. **No Model Training:**
   - Google does NOT train models on user data
   - Your consultations remain private
   - Data retention: 30 days max in Gemini's temp storage

---

## 📈 Performance Metrics

### **Processing Time:**
- **5 min audio:** ~30-60 seconds
- **30 min video:** ~2-5 minutes
- **60 min recording:** ~5-15 minutes

### **Cost Estimation:**
- **Per Recording (30 min):** ~$0.002 - $0.01 USD
- **100 recordings/month:** ~$0.50-$1.00 USD
- **Within free tier limit:** No cost

---

## 🛠️ Troubleshooting AI Features

### **Issue: "Transcription failed"**
**Causes:**
- API key not set
- File corrupted or unsupported format
- Network timeout

**Solution:**
```bash
# Check API key
echo $GEMINI_API_KEY

# Test with smaller file
# Check backend logs
docker logs consultation-backend
```

### **Issue: "Blank transcript"**
**Causes:**
- Poor audio quality
- Heavy background noise
- Non-speech content

**Solution:**
- Re-record with better audio quality
- Check Gemini error logs
- Use WAV or MP3 format

### **Issue: "API quota exceeded"**
**Cause:** Free tier limit reached (60 requests/day)

**Solution:**
- Wait 24 hours
- Upgrade to Gemini API paid tier
- Batch requests (1 per minute minimum)

---

## 🔄 How to Enable/Disable AI Features

### **Enable AI (Default)**
```bash
GEMINI_API_KEY=your-api-key
```

### **Disable AI (Mock Mode)**
```bash
# Don't set GEMINI_API_KEY in .env
# App will use mock responses
```

### **Switch Between Models**
**Current:** `gemini-1.5-flash`  
**Alternative:** `gemini-2.0-flash` (if available)

```typescript
// backend/src/config/gemini.ts
const model = genAI.getGenerativeModel({ 
  model: 'gemini-2.0-flash'  // Change here
});
```

---

## 📚 AI Features by Endpoint

| Endpoint | AI Usage | Required? | Cost |
|----------|----------|-----------|------|
| `POST /api/auth/*` | None | - | Free |
| `POST /api/recordings` | File staging | No | $0.001-0.01 |
| `POST /api/recordings/:id/transcribe` | Transcription | No | $0.001-0.01 |
| `POST /api/recordings/:id/summarize` | Summarization | No | $0.0005-0.005 |
| `GET /api/recordings/:id` | None (retrieval only) | - | Free |

---

## 🎯 Best Practices for AI Features

1. **File Format:** Use MP3 or WAV for best results
2. **Audio Quality:** Clear speech, minimal background noise
3. **File Size:** Keep under 500 MB for faster processing
4. **Error Handling:** Always wrap API calls in try-catch
5. **Async Processing:** Don't block user responses
6. **Rate Limiting:** Implement 1 request/minute per user
7. **Monitoring:** Log all AI API calls for debugging

---

## 📞 Support & Resources

- **Google Gemini API Docs:** https://ai.google.dev/docs
- **API Key Setup:** https://ai.google.dev/tutorials/setup
- **Model Documentation:** https://ai.google.dev/models
- **Pricing:** https://ai.google.dev/pricing
- **Status Page:** https://status.gemini.google.com

---

## 🔮 Future AI Enhancements

**Potential Features:**
- Real-time streaming transcription
- Multi-language support
- Speaker diarization (identify who spoke)
- Custom model fine-tuning
- Sentiment analysis
- Entity extraction (names, dates, medications)
- Clinical NLP for medical terminology

---

## 📄 Current Implementation Status

- ✅ Basic transcription working
- ✅ Summary generation working
- ✅ Async processing working
- ✅ Error handling implemented
- ✅ Mock fallback enabled
- ⚠️ Rate limiting not yet implemented
- ⚠️ Multi-language support pending
- ⚠️ Advanced NLP features pending

---

**For project setup, see [PROJECT_NOTES.md](PROJECT_NOTES.md)  
For deployment, see [DEPLOY_NOW.md](DEPLOY_NOW.md)**
