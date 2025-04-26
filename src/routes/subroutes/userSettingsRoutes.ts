
import { Router } from 'express';
import { authenticate, isAdmin, checkUserResourceOwnership } from '../../middleware/authenticate';
import * as SettingsController from '../../controllers/usersSettingsController'; 

const router = Router();


router.get('/', SettingsController.getUserSettings)

// router.patch('/', authenticate, SettingsController.updateUserSettings)

// router.get('/token', authenticate, SettingsController.getUserToken)
// router.patch('/token', authenticate, SettingsController.updateUserToken)



export default router;