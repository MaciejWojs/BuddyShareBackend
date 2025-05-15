import { Router } from 'express';
import { authenticate, isAdmin, checkUserResourceOwnership } from '../../middleware/authenticate';
import * as UserController from '../../controllers/usersController';
import { userExistsMiddleware } from '../../middleware/userExist';

const router = Router();

router.get('/', UserController.getUserFollowers)
router.get('/count', UserController.getUserFollowersCount)

router.use('/follow', authenticate)

router.post('/follow/:username', userExistsMiddleware,  UserController.followUser)
router.delete('/follow/:username', userExistsMiddleware, UserController.unfollowUser)


export default router;