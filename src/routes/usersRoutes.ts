import { Router } from 'express';
import { authenticate, isAdmin, checkUserResourceOwnership } from '../middleware/authenticate';
import * as UserController from '../controllers/usersController';
import { userExistsMiddleware } from '../middleware/userExist';
import followingRoutes from './subroutes/followingRoutes';
import followerRoutes from './subroutes/followerRoutes';
import userSettingsRoutes from './subroutes/userSettingsRoutes';

const router = Router();

router.get('/', authenticate, isAdmin, UserController.getAllUsersInfo)
router.get('/brief', authenticate, isAdmin, UserController.getAllUsers)

router.use('/:username', userExistsMiddleware)

router.get('/:username', UserController.exists)
router.patch('/:username/ban', authenticate, isAdmin, UserController.banUser)
router.patch('/:username/unban', authenticate, isAdmin, UserController.unbanUser)
router.patch('/:username/role', authenticate, isAdmin, UserController.changeUsersRole)
router.get('/:username/role', authenticate, isAdmin, UserController.getUserRole)

router.use('/:username/settings', authenticate, checkUserResourceOwnership, userSettingsRoutes)

// router.patch('/:username/settings/:id', authenticate,  UserController.updateUserSetting)
// router.patch('/:username/settings', authenticate,  UserController.updateUserSettings)
router.get('/:username/profile', UserController.getUserProfile)

// router.get('/:username/followers',  UserController.getUserFollowers)
// router.get('/:username/following',  UserController.getUserFollowing)
// router.get('/:username/followers/count',  UserController.getUserFollowersCount)
// router.get('/:username/following/count',  UserController.getUserFollowingCount)

router.use('/:username/followers', followerRoutes)
router.use('/:username/following', followingRoutes)


export default router;