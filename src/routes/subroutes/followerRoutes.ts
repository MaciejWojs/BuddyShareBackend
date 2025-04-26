import { Router } from 'express';
import { authenticate, isAdmin, checkUserResourceOwnership } from '../../middleware/authenticate';
import * as UserController from '../../controllers/usersController';
import { userExistsMiddleware } from '../../middleware/userExist';

const router = Router();

router.get('/', UserController.getUserFollowers)
router.get('/count', UserController.getUserFollowersCount)

router.use('/follow', authenticate, userExistsMiddleware, checkUserResourceOwnership)

router.post('/follow/:username', UserController.followUser)
router.delete('/follow/:username', UserController.unfollowUser)


export default router;