import { Router } from 'express';
import { generateSocialMediaImages, uploadMiddleware } from '../middleware/mediaMiddlewares';
import * as mediaController from '../controllers/mediaController';


const router = Router();

router.get('/', mediaController.getImage);

// router.post('/', uploadMiddleware, generateSocialMediaImages, mediaController.postImage)

export default router;
