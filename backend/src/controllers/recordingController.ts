import { Response } from 'express';
import fs from 'fs';
import path from 'path';
import { Recording } from '../models/Recording';
import { Client } from '../models/Client';
import { AuthRequest } from '../middleware/auth';
import { isCloudinaryConfigured, cloudinary } from '../config/cloudinary';
import { processRecordingAI } from '../services/geminiService';

// Background processing function
const runBackgroundAIProcessing = async (
  recordingId: string,
  filePath: string,
  mimeType: string,
  clientName: string,
  notes: string,
  shouldDeleteFileAfter: boolean
) => {
  try {
    console.log(`[Background] Starting AI processing for recording ${recordingId}...`);
    const aiResult = await processRecordingAI(filePath, mimeType, clientName, notes);
    
    await Recording.findByIdAndUpdate(recordingId, {
      transcript: aiResult.transcript,
      summary: aiResult.summary,
      insights: aiResult.insights,
      status: 'completed',
    });
    
    console.log(`[Background] AI processing completed for recording ${recordingId}.`);
  } catch (error) {
    console.error(`[Background] AI processing failed for recording ${recordingId}:`, error);
    await Recording.findByIdAndUpdate(recordingId, {
      status: 'failed',
    });
  } finally {
    // Delete local temp file only if we uploaded to Cloudinary
    if (shouldDeleteFileAfter && fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
        console.log(`[Background] Cleaned up temp file: ${filePath}`);
      } catch (err) {
        console.error(`[Background] Failed to delete temp file ${filePath}:`, err);
      }
    }
  }
};

export const uploadRecording = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized.' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded.' });
    }

    const { title, clientId, date, notes } = req.body;

    if (!title || !clientId) {
      // Clean up uploaded file
      if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
      return res.status(400).json({ message: 'Title and Client ID are required.' });
    }

    // Verify client exists and belongs to user
    const client = await Client.findOne({ _id: clientId, user: req.user.id });
    if (!client) {
      if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
      return res.status(404).json({ message: 'Client not found.' });
    }

    const fileType = req.file.mimetype.startsWith('video/') ? 'video' : 'audio';
    let fileUrl = '';
    let shouldDeleteFileAfter = false;

    // Upload to Cloudinary if configured
    if (isCloudinaryConfigured()) {
      try {
        console.log('Uploading recording to Cloudinary...');
        const result = await cloudinary.uploader.upload(req.file.path, {
          resource_type: 'auto',
          folder: 'consultations',
        });
        fileUrl = result.secure_url;
        shouldDeleteFileAfter = true; // Delete the local temp file after Gemini processes it
      } catch (cloudErr) {
        console.error('Cloudinary upload error:', cloudErr);
        // Fallback to local storage if Cloudinary fails
        fileUrl = `/uploads/${req.file.filename}`;
        shouldDeleteFileAfter = false;
      }
    } else {
      // Local file hosting relative path
      fileUrl = `/uploads/${req.file.filename}`;
      shouldDeleteFileAfter = false; // Keep the file since it is the production URL source
    }

    // Create recording database entry
    const recording = new Recording({
      title,
      client: clientId,
      fileUrl,
      fileType,
      status: 'processing',
      date: date ? new Date(date) : new Date(),
      notes: notes || '',
      user: req.user.id,
    });

    await recording.save();

    // Trigger AI processing in background without awaiting
    runBackgroundAIProcessing(
      recording._id.toString(),
      req.file.path,
      req.file.mimetype,
      client.name,
      notes || '',
      shouldDeleteFileAfter
    );

    res.status(201).json(recording);
  } catch (error) {
    console.error('Upload recording error:', error);
    // Cleanup file if error occurs
    if (req.file && fs.existsSync(req.file.path)) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (err) {
        // ignore
      }
    }
    res.status(500).json({ message: 'Internal Server Error.' });
  }
};

export const getRecordings = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized.' });
    }

    const { clientId, search } = req.query;
    const filter: any = { user: req.user.id };

    if (clientId) {
      filter.client = clientId;
    }

    // Perform population to get client names for searching/filtering
    let recordings = await Recording.find(filter)
      .populate('client')
      .sort({ date: -1 });

    // Client-side search matching title, notes, transcript, summary, or client name
    if (search) {
      const searchStr = (search as string).toLowerCase();
      recordings = recordings.filter((rec: any) => {
        const titleMatch = rec.title.toLowerCase().includes(searchStr);
        const notesMatch = rec.notes?.toLowerCase().includes(searchStr);
        const transcriptMatch = rec.transcript?.toLowerCase().includes(searchStr);
        const summaryMatch = rec.summary?.toLowerCase().includes(searchStr);
        const clientNameMatch = rec.client?.name.toLowerCase().includes(searchStr);
        return titleMatch || notesMatch || transcriptMatch || summaryMatch || clientNameMatch;
      });
    }

    res.status(200).json(recordings);
  } catch (error) {
    console.error('Fetch recordings error:', error);
    res.status(500).json({ message: 'Internal Server Error.' });
  }
};

export const getRecordingById = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized.' });
    }

    const recording = await Recording.findOne({
      _id: req.params.id,
      user: req.user.id,
    }).populate('client');

    if (!recording) {
      return res.status(404).json({ message: 'Recording not found.' });
    }

    res.status(200).json(recording);
  } catch (error) {
    console.error('Fetch recording details error:', error);
    res.status(500).json({ message: 'Internal Server Error.' });
  }
};

export const processRecording = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized.' });
    }

    const recording = await Recording.findOne({
      _id: req.params.id,
      user: req.user.id,
    }).populate('client');

    if (!recording) {
      return res.status(404).json({ message: 'Recording not found.' });
    }

    if (recording.status === 'processing') {
      return res.status(400).json({ message: 'Recording is already processing.' });
    }

    // Determine the file path for processing
    let filePath = '';
    let shouldDeleteFileAfter = false;
    let mimeType = recording.fileType === 'video' ? 'video/mp4' : 'audio/mpeg';

    if (recording.fileUrl.startsWith('/uploads/')) {
      filePath = path.join(process.cwd(), recording.fileUrl);
      shouldDeleteFileAfter = false;
    } else {
      // File is on Cloudinary, we would need to download it or pass the URL to Gemini
      // Since Gemini files can be uploaded from path, we can try to download it locally to temp,
      // or if that fails, we can trigger the mock logic.
      // For simplicity, if we don't have local file, we will run the mock logic using the helper.
      console.log('Re-processing remote Cloudinary file. Passing file Url...');
      filePath = recording.fileUrl; // In this case processRecordingAI will handle remote URLs or fall back
    }

    recording.status = 'processing';
    await recording.save();

    const clientName = (recording.client as any)?.name || 'Client';

    // Trigger AI processing in background
    runBackgroundAIProcessing(
      recording._id.toString(),
      filePath,
      mimeType,
      clientName,
      recording.notes || '',
      shouldDeleteFileAfter
    );

    res.status(200).json({ message: 'AI processing re-triggered.', recording });
  } catch (error) {
    console.error('Re-process recording error:', error);
    res.status(500).json({ message: 'Internal Server Error.' });
  }
};

export const deleteRecording = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized.' });
    }

    const recording = await Recording.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!recording) {
      return res.status(404).json({ message: 'Recording not found.' });
    }

    // Delete local file if it exists
    if (recording.fileUrl.startsWith('/uploads/')) {
      const filePath = path.join(process.cwd(), recording.fileUrl);
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
          console.log(`Deleted local file: ${filePath}`);
        } catch (err) {
          console.error(`Failed to delete local file ${filePath}:`, err);
        }
      }
    } else if (isCloudinaryConfigured()) {
      // Delete from Cloudinary
      // Extract public_id from Cloudinary URL (e.g. consultations/abc123xyz)
      try {
        const parts = recording.fileUrl.split('/');
        const fileNameWithExt = parts[parts.length - 1];
        const folderPart = parts[parts.length - 2];
        const publicId = `${folderPart}/${fileNameWithExt.split('.')[0]}`;
        
        console.log(`Deleting file from Cloudinary with publicId: ${publicId}`);
        await cloudinary.uploader.destroy(publicId, {
          resource_type: recording.fileType === 'video' ? 'video' : 'image',
        });
      } catch (cloudDelErr) {
        console.error('Failed to delete file from Cloudinary:', cloudDelErr);
      }
    }

    await Recording.deleteOne({ _id: recording._id });
    res.status(200).json({ message: 'Recording deleted successfully.' });
  } catch (error) {
    console.error('Delete recording error:', error);
    res.status(500).json({ message: 'Internal Server Error.' });
  }
};
