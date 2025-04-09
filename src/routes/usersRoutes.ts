import { Router } from 'express';
import { authenticate, isAdmin, checkUserResourceOwnership } from '../middleware/authenticate';
import * as UserController from '../controllers/usersController';
import { userExistsMiddleware } from '../middleware/userExist';
import followingRoutes from './followingRoutes';
import followerRoutes from './followerRoutes';
const router = Router();

router.get('/', authenticate, isAdmin, UserController.getAllUsersInfo)
router.get('/brief', authenticate, isAdmin, UserController.getAllUsers)
router.get('/:username', userExistsMiddleware, UserController.exists)
router.patch('/:username/ban', authenticate, isAdmin, userExistsMiddleware, UserController.banUser)
router.patch('/:username/unban', authenticate, isAdmin, userExistsMiddleware, UserController.unbanUser)
router.patch('/:username/role', authenticate, isAdmin, userExistsMiddleware, UserController.changeUsersRole)
router.get('/:username/role', authenticate, isAdmin, userExistsMiddleware, UserController.getUserRole)
router.get('/:username/settings', authenticate, userExistsMiddleware, checkUserResourceOwnership, UserController.getUserSettings)
// router.patch('/:username/settings/:id', authenticate, userExistsMiddleware, UserController.updateUserSetting)
// router.patch('/:username/settings', authenticate, userExistsMiddleware, UserController.updateUserSettings)
router.get('/:username/profile', authenticate, userExistsMiddleware, checkUserResourceOwnership, UserController.getUserProfile)

// router.get('/:username/followers', userExistsMiddleware, UserController.getUserFollowers)
// router.get('/:username/following', userExistsMiddleware, UserController.getUserFollowing)
// router.get('/:username/followers/count', userExistsMiddleware, UserController.getUserFollowersCount)
// router.get('/:username/following/count', userExistsMiddleware, UserController.getUserFollowingCount)

router.use('/:username/followers', userExistsMiddleware, followerRoutes)
router.use('/:username/following', userExistsMiddleware, followingRoutes)


export default router;