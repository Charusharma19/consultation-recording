import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { connectDB } from './config/db';
import authRoutes from './routes/authRoutes';
import clientRoutes from './routes/clientRoutes';
import recordingRoutes from './routes/recordingRoutes';

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();
const PORT = process.env.PORT || 5000;

// Connect to Database
connectDB();

// Middlewares
const corsOrigin = process.env.FRONTEND_URL || '*';
app.use(cors({
  origin: corsOrigin,
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ensure uploads folder exists and serve it statically
const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
app.use('/uploads', express.static(uploadDir));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/recordings', recordingRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date() });
});

// Start Express Server
app.listen(PORT, () => {
  console.log(`===================================================`);
  console.log(` Consultation Recording Manager Backend Running `);
  console.log(` Port: ${PORT}                                      `);
  console.log(` Local upload folder served at: http://localhost:${PORT}/uploads `);
  console.log(`===================================================`);
});
