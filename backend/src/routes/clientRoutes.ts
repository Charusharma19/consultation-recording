import { Router } from 'express';
import { getClients, createClient, getClientById } from '../controllers/clientController';
import { authenticateJWT } from '../middleware/auth';

const router = Router();

// Protect all client routes with JWT authentication
router.use(authenticateJWT as any);

router.get('/', getClients);
router.post('/', createClient);
router.get('/:id', getClientById);

export default router;
