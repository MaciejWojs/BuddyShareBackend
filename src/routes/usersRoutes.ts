import { Router } from 'express';
import { authenticate } from '../middleware/authenticate';
import { exists } from '../controllers/usersController';
const router = Router();

router.get('/:username/exists', exists)

export default router;