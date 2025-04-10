import { Router } from 'express';
import { authenticate, isAdmin, checkUserResourceOwnership } from '../middleware/authenticate';
import * as Streams from '../controllers/streamController';

const router = Router();

router.get('/', Streams.getAllStreams);
router.get('/notify/start', Streams.notifyStreamStart);
router.get('/notify/end', Streams.notifyStreamEnd);

export default router;