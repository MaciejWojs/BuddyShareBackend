import { Router } from 'express';
import { authenticate, isAdmin, checkUserResourceOwnership } from '../../middleware/authenticate';
import * as UserController from '../../controllers/usersController';
import { userExistsMiddleware } from '../../middleware/userExist';
import { attachStreamerIfExists } from '../../middleware/isStreamer';

const router = Router();

router.get('/', UserController.getUserFollowers)
router.get('/count', UserController.getUserFollowersCount)

router.use('/follow', authenticate)

router.post('/follow/:username', userExistsMiddleware, attachStreamerIfExists, UserController.followUser)
router.delete('/follow/:username', userExistsMiddleware, attachStreamerIfExists, UserController.unfollowUser)


export default router;