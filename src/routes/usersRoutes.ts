import { Router } from 'express';
import { authenticate, isAdmin, checkUserResourceOwnership } from '../middleware/authenticate';
import * as UserController from '../controllers/usersController';
import { userExistsMiddleware } from '../middleware/userExist';
import followingRoutes from './subroutes/followingRoutes';
import followerRoutes from './subroutes/followerRoutes';
import userSettingsRoutes from './subroutes/userSettingsRoutes';
import { notifactionExist } from '../middleware/notifactionExist';
import { attachStreamerIfExists } from '../middleware/isStreamer';

const router = Router();

router.get('/', authenticate, isAdmin, UserController.getAllUsersInfo)
router.get('/brief', authenticate, isAdmin, UserController.getAllUsers)

router.use('/:username', userExistsMiddleware)

router.get('/:username', UserController.exists)
router.patch('/:username/ban', authenticate, isAdmin, UserController.banUser)
router.patch('/:username/unban', authenticate, isAdmin, UserController.unbanUser)
router.patch('/:username/role', authenticate, isAdmin, UserController.changeUsersRole)
router.get('/:username/role', authenticate, isAdmin, UserController.getUserRole)

router.use('/:username/notifications', authenticate, checkUserResourceOwnership)
router.use('/:username/notifications/:id', notifactionExist)
router.get('/:username/notifications', UserController.getUserNotifications)
router.put('/:username/notifications', UserController.updateUserNotificationsInBulk)
router.patch('/:username/notifications/:id', UserController.updateUserNotification)
router.delete('/:username/notifications', UserController.deleteUserNotificationsInBulk)
router.delete('/:username/notifications/:id', UserController.deleteUserNotification)

router.use('/:username/settings', authenticate, checkUserResourceOwnership, userSettingsRoutes)

// router.patch('/:username/settings/:id', authenticate,  UserController.updateUserSetting)
// router.patch('/:username/settings', authenticate,  UserController.updateUserSettings)
router.get('/:username/profile', UserController.getUserProfile)
router.patch('/:username/profile', authenticate, checkUserResourceOwnership, UserController.patchUserProfile)

router.get('/:username/subscriptions', authenticate, checkUserResourceOwnership, UserController.getUserSubscriptions)

// router.get('/:username/followers',  UserController.getUserFollowers)
// router.get('/:username/following',  UserController.getUserFollowing)
// router.get('/:username/followers/count',  UserController.getUserFollowersCount)
// router.get('/:username/following/count',  UserController.getUserFollowingCount)

router.use('/:username/followers', followerRoutes)
router.use('/:username/following', followingRoutes)



export default router;