import express from 'express';
import AuthController from '../controllers/authController.js';
import { authenticate } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Public routes
router.post('/register', AuthController.register);
router.post('/login', AuthController.login);

router.post('/refresh-token', AuthController.refreshToken);
router.post('/request-password-reset', AuthController.requestPasswordReset);
router.post('/reset-password', AuthController.handlePasswordReset);

// Protected routes (require authentication)
router.get('/me', authenticate, AuthController.getCurrentUser);
router.post('/logout', authenticate, AuthController.logout);
router.put('/update-profile', authenticate, AuthController.updateProfile);
router.put('/update-password', authenticate, AuthController.updatePassword);

export default router;