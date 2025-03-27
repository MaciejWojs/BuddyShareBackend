import { Router } from 'express';
import { authenticate } from '../middleware/authenticate';
import { exists, getAllUsers } from '../controllers/usersController';
const router = Router();

router.get('/:username/exists', exists)

router.get('/getAll', getAllUsers)

export default router;