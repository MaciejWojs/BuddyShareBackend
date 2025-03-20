import { Router } from 'express';
import { login, register, getMe, logout, test } from '../controllers/authController';
import { authenticate } from '../middleware/authenticate';

const router = Router();

router.post('/login', login);
router.post('/register', register);
router.get('/me', authenticate, getMe);
router.get('/logout', logout);
router.get('/test', test);

export default router;