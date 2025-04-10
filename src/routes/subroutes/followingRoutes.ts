import { Router } from 'express';
import { authenticate, isAdmin, checkUserResourceOwnership } from '../../middleware/authenticate';
import * as UserController from '../../controllers/usersController';
import { userExistsMiddleware } from '../../middleware/userExist';

const router = Router();

router.get('/', UserController.getUserFollowing)
router.get('/count', UserController.getUserFollowingCount)

export default router;