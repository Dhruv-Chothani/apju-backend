import express from 'express';
import contentController from '../controllers/content.controller.js';
import { uploadSingle } from '../middleware/upload.js';

const router = express.Router();

// All routes are now public (no authentication required)
router.get('/all', contentController.getAllContent);
router.get('/home', contentController.getHomeContent);
router.get('/type/:type', contentController.getContentByType);
router.get('/:id', contentController.getContentById);

// Image serving route
router.get('/image/:id', contentController.getImage);

// Content management routes - no authentication required
router.post('/add', uploadSingle, contentController.addContent);
router.put('/update/:id', uploadSingle, contentController.updateContent);
router.delete('/:id', contentController.deleteContent);
router.put('/toggle-home/:id', contentController.toggleHomeDisplay);

export default router;
