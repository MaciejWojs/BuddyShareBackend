import { Router } from 'express';
import { authenticate, isAdmin, checkUserResourceOwnership } from '../middleware/authenticate';
import { userExistsMiddleware } from '../middleware/userExist';
import * as StreamersController from '../controllers/streamersController';
import { isStreamer } from '../middleware/isStreamer';
import {isStreamerModerator, isModerator } from '../middleware/isModerator';
import moderatorRoutes from './subroutes/moderatorRoutes';
const router = Router({ mergeParams: true }); // Dodaj mergeParams: true

router.get('/',  authenticate, isAdmin, StreamersController.getAllStreamers);

router.get('/:username', userExistsMiddleware, isStreamer, StreamersController.getStreamerByUsername);

router.get('/:username/token', userExistsMiddleware, isStreamer, checkUserResourceOwnership,  StreamersController.getStreamerToken);

router.patch('/:username/token',userExistsMiddleware, isStreamer,   StreamersController.updateStreamerToken);
// router.get('/:username/moderators', authenticate, userExistsMiddleware, isStreamer, StreamersController.getStreamerModerators);

// router.get('/:username/moderators/:modusername', authenticate, userExistsMiddleware, isStreamer, StreamersController.getStreamerModerators);

// router.put('/:username/moderators/:modusername', userExistsMiddleware, isStreamer, isModerator, isStreamerModerator, StreamersController.addStreamerModerator);

// router.delete('/:username/moderators/:modusername', userExistsMiddleware, isStreamer, isModerator, isStreamerModerator, StreamersController.deleteStreamerModerator);


router.use('/:username/moderators', authenticate, userExistsMiddleware, isStreamer, moderatorRoutes)








export default router;
