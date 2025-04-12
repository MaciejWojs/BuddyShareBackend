import { Router } from 'express';
import { authenticate, isAdmin, checkUserResourceOwnership } from '../middleware/authenticate';
import * as Streams from '../controllers/streamController';
import { hasStreamerToken, isValidStreamerToken } from '../middleware/isStreamer';
const router = Router();

router.get('/', Streams.getAllStreams);

router.use('/notify', hasStreamerToken, isValidStreamerToken);

router.get('/notify/start', Streams.notifyStreamStart);
router.get('/notify/end', Streams.notifyStreamEnd);

export default router;