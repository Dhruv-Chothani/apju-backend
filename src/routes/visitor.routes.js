import express from 'express';
import visitorController from '../controllers/visitor.controller.js';

const router = express.Router();

// Main endpoint - simple visit count
router.get('/visitcount', visitorController.getVisitCount);

// Track visit
router.post('/track', visitorController.trackVisit);

// Get detailed statistics
router.get('/stats', visitorController.getVisitorStats);

// Reset data (admin only)
router.delete('/reset', visitorController.resetVisits);

export default router;
