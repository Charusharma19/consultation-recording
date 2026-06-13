import { Router } from 'express';
import {
  uploadRecording,
  getRecordings,
  getRecordingById,
  processRecording,
  deleteRecording,
} from '../controllers/recordingController';
import { authenticateJWT } from '../middleware/auth';
import { upload } from '../middleware/upload';

const router = Router();

// Protect all recording routes with JWT authentication
router.use(authenticateJWT as any);

router.post('/upload', upload.single('file'), uploadRecording);
router.get('/', getRecordings);
router.get('/:id', getRecordingById);
router.post('/:id/process', processRecording);
router.delete('/:id', deleteRecording);

export default router;
