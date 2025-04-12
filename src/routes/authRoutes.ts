import { Router } from 'express';
import { login, register, getMe, logout, test, refreshToken } from '../controllers/authController';
import { authenticate } from '../middleware/authenticate';

const router = Router();

router.post('/login', login);
router.post('/register', register);
router.get('/me', authenticate, getMe);
router.get('/logout', logout);
router.get('/test', authenticate,  test);
router.post('/refresh-token', refreshToken);

export default router;