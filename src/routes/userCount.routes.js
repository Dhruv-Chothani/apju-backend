import express from 'express';
import userCountController from '../controllers/userCount.controller.js';

const router = express.Router();

// Simple direct user count endpoint (no login required)
router.get('/usercount', userCountController.getUserCount);

// Public routes
router.post('/login', userCountController.loginWithCount);

// User count routes
router.get('/user/:email', userCountController.getUserLoginCount);
router.get('/users', userCountController.getAllUsersLoginCount);
router.get('/stats', userCountController.getLoginStats);

// Management routes
router.put('/reset/:email', userCountController.resetUserLoginCount);
router.delete('/user/:email', userCountController.deleteUserLoginData);

export default router;
