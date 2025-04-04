import { Router } from 'express';
import { authenticate, isAdmin, checkUserResourceOwnership } from '../middleware/authenticate';
import { userExistsMiddleware } from '../middleware/userExist';
import * as StreamersController from '../controllers/streamersController';
import { isStreamer } from '../middleware/isStreamer';
import {isStreamerModerator, isModerator } from '../middleware/isModerator';
const router = Router();

router.get('/',  authenticate, isAdmin, StreamersController.getAllStreamers);

router.get('/:username', userExistsMiddleware, isStreamer, StreamersController.getStreamerByUsername);

router.get('/:username/moderators', authenticate, userExistsMiddleware, isStreamer, StreamersController.getStreamerModerators);

router.get('/:username/moderators/:modusername', authenticate, userExistsMiddleware, isStreamer, StreamersController.getStreamerModerators);

router.put('/:username/moderators/:modusername', userExistsMiddleware, isStreamer, isModerator, isStreamerModerator, StreamersController.addStreamerModerator);

router.delete('/:username/moderators/:modusername', userExistsMiddleware, isStreamer, isModerator, isStreamerModerator, StreamersController.deleteStreamerModerator);











export default router;
