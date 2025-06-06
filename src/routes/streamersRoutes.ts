import { Router } from 'express';
import { authenticate, isAdmin, checkUserResourceOwnership, optionalAuthenticate } from '../middleware/authenticate';
import { userExistsMiddleware } from '../middleware/userExist';
import * as StreamersController from '../controllers/streamersController';
import { isStreamer } from '../middleware/isStreamer';
import { subscriptionRelationExists, subscriptionRelationNotExists } from '../middleware/subscriptionRelation';
import { isStreamerModerator, isModerator } from '../middleware/isModerator';
import moderatorRoutes from './subroutes/moderatorRoutes';
const router = Router({ mergeParams: true }); // Dodaj mergeParams: true

router.get('/', authenticate, isAdmin, StreamersController.getAllStreamers);


router.use("/:username", userExistsMiddleware, isStreamer);

router.get('/:username', optionalAuthenticate, StreamersController.getStreamerByUsername);
router.get('/:username/stats/top-users-in-chat', StreamersController.getTopChatUsersForStreamer);
router.get('/:username/stats/streaming-raport', StreamersController.getRaportForStreamer);


router.use('/:username/token', authenticate, userExistsMiddleware, checkUserResourceOwnership);

router.get('/:username/token', StreamersController.getStreamerToken);
router.patch('/:username/token', StreamersController.updateStreamerToken);
// router.get('/:username/moderators', authenticate,  StreamersController.getStreamerModerators);

// router.get('/:username/moderators/:modusername', authenticate,  StreamersController.getStreamerModerators);

// router.put('/:username/moderators/:modusername',  isModerator, isStreamerModerator, StreamersController.addStreamerModerator);

// router.delete('/:username/moderators/:modusername',  isModerator, isStreamerModerator, StreamersController.deleteStreamerModerator);


router.use('/:username/moderators', authenticate, moderatorRoutes)

router.get('/:username/subscribers', authenticate, checkUserResourceOwnership, StreamersController.getStreamerSubscribers);

router.put('/:username/subscribers', authenticate, subscriptionRelationNotExists, StreamersController.updateStreamerSubscription);

router.delete('/:username/subscribers', authenticate, subscriptionRelationExists, StreamersController.deleteStreamerSubscription);








export default router;
