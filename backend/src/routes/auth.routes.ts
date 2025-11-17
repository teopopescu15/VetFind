import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';

const router = Router();
// Auth routes - use singleton instance (no binding needed with object literals)
router.post('/login', AuthController.login);
router.post('/signup', AuthController.signup);
router.post('/refresh', AuthController.refresh);
router.get('/verify', AuthController.verifyToken);

export default router;
