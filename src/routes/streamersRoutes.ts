import { Router } from 'express';
import { authenticate, isAdmin, checkUserResourceOwnership } from '../middleware/authenticate';
import { userExistsMiddleware } from '../middleware/userExist';
import * as StreamersController from '../controllers/streamersController';
import { isStreamer } from '../middleware/isStreamer';
import { isStreamerModerator, isModerator } from '../middleware/isModerator';
import moderatorRoutes from './subroutes/moderatorRoutes';
const router = Router({ mergeParams: true }); // Dodaj mergeParams: true

router.get('/', authenticate, isAdmin, StreamersController.getAllStreamers);

router.use("/:username", userExistsMiddleware, isStreamer);

router.get('/:username', StreamersController.getStreamerByUsername);

router.use('/:username/token', checkUserResourceOwnership);

router.get('/:username/token', StreamersController.getStreamerToken);
router.patch('/:username/token', StreamersController.updateStreamerToken);
// router.get('/:username/moderators', authenticate,  StreamersController.getStreamerModerators);

// router.get('/:username/moderators/:modusername', authenticate,  StreamersController.getStreamerModerators);

// router.put('/:username/moderators/:modusername',  isModerator, isStreamerModerator, StreamersController.addStreamerModerator);

// router.delete('/:username/moderators/:modusername',  isModerator, isStreamerModerator, StreamersController.deleteStreamerModerator);


router.use('/:username/moderators', authenticate, moderatorRoutes)








export default router;
