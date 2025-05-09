import { Router } from 'express';
import { authenticate, isAdmin, checkUserResourceOwnership } from '../../middleware/authenticate';
import { userExistsMiddleware } from '../../middleware/userExist';
import * as StreamersController from '../../controllers/streamersController';
import { isStreamerModerator, isModerator } from '../../middleware/isModerator';
const router = Router({ mergeParams: true });

router.get('/', StreamersController.getStreamerModerators);

router.use('/:modusername', isModerator, isStreamerModerator);

router.get('/:modusername', StreamersController.getStreamerModeratorByUsername);
router.put('/:modusername', StreamersController.addStreamerModerator);
router.delete('/:modusername', StreamersController.deleteStreamerModerator);
export default router;
