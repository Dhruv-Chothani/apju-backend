// server/src/routes/admin.routes.js
import express from 'express';
import adminController from '../controllers/admin.controller.js';

const router = express.Router();

// Public routes
router.post('/login', adminController.login);

// All routes are now public (no authentication required)
router.get('/profile', adminController.getProfile);
router.put('/profile', adminController.updateProfile);
router.put('/change-password', adminController.changePassword);

export default router;