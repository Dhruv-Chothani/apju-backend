import multer from 'multer';

// For Vercel serverless deployment, use memory storage
const storage = multer.memoryStorage();

export const uploadSingle = multer({ 
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit
  }
}).single("media");
