import { Router } from 'express';
import { authenticate, isAdmin, checkUserResourceOwnership } from '../middleware/authenticate';
import * as Streams from '../controllers/streamController';
import { hasStreamerToken, isValidStreamerToken } from '../middleware/isStreamer';
const router = Router();

router.get('/', Streams.getAllStreams);
router.get('/notify/start', hasStreamerToken, isValidStreamerToken, Streams.notifyStreamStart);
router.get('/notify/end', hasStreamerToken, isValidStreamerToken, Streams.notifyStreamEnd);

export default router;