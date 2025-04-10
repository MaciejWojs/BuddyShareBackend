import { Router } from 'express';
import { authenticate, isAdmin, checkUserResourceOwnership } from '../../middleware/authenticate';
import * as UserController from '../../controllers/usersController';
import { userExistsMiddleware } from '../../middleware/userExist';

const router = Router();

router.get('/',  UserController.getUserFollowers)
router.get('/count', UserController.getUserFollowersCount)
router.post('/follow/:username',authenticate, userExistsMiddleware, checkUserResourceOwnership, UserController.followUser)
router.delete('/follow/:username', authenticate, userExistsMiddleware, checkUserResourceOwnership,  UserController.unfollowUser)


export default router;