import { Router } from 'express';
import { authenticate, isAdmin, checkUserResourceOwnership } from '../middleware/authenticate';
import { isStreamer } from '../middleware/isStreamer';
import * as Streams from '../controllers/streamController';
import { hasStreamerToken, isValidStreamerToken } from '../middleware/isStreamer';
import { resolveStreamerTokenCache } from '../middleware/cache';
import { userExistsMiddleware } from '../middleware/userExist';
import cors from 'cors';

const host = process.env.STREAM_HOST_VIDEO || "http://localhost:80/";

const corsOptions = {
    origin: host,
    methods: ['GET'],
};

const router = Router();

router.get('/', Streams.getAllStreams);

router.use('/notify', hasStreamerToken, isValidStreamerToken);

router.get('/notify/start', Streams.notifyStreamStart);
router.get('/notify/end', Streams.notifyStreamEnd);
router.get('/token', cors(corsOptions), resolveStreamerTokenCache, Streams.resolveStreamerToken);

router.use('/:username', authenticate, userExistsMiddleware, isStreamer, checkUserResourceOwnership);
router.get('/:username/:id', Streams.getStream);
router.patch('/:username/:id', Streams.patchStream);
router.delete('/:username/:id', Streams.softDeleteStream);

export default router;