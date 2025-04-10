import { Router } from 'express';
import { authenticate, isAdmin, checkUserResourceOwnership } from '../../middleware/authenticate';
import * as SettingsController from '../../controllers/usersSettingsController'; 
const router = Router();


router.get('/', SettingsController.getUserSettings)

router.patch('/', SettingsController.updateUserSettings)

// router.get('/token', SettingsController.getUserToken)
// router.patch('/token', SettingsController.updateUserToken)

export default router;