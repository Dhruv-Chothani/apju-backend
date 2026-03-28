import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';

// Import routes
import adminRoutes from './src/routes/admin.routes.js';
import contentRoutes from './src/routes/content.routes.js';
import userCountRoutes from './src/routes/userCount.routes.js';

// ES Module fix for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 5000;

/* ============================
   CORS – ALLOW ALL ORIGINS
============================ */
app.use(cors({
  origin: "*", // Allow all origins
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: ["*"], // Allow all headers
  credentials: false, // No credentials required
  optionsSuccessStatus: 200
}));

// Handle preflight requests explicitly
app.options('*', cors());

// Body parsing middleware - increased limits for file uploads
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// MongoDB connection
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb+srv://dhruv:123@cluster0.us4e5ih.mongodb.net/Up02?retryWrites=true&w=majority';
    
    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 10000, // Keep trying to send operations for 10 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      bufferCommands: false, // Disable mongoose buffering
    });
    
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    // Don't exit on Vercel, just log the error
    if (process.env.NODE_ENV !== 'production') {
      process.exit(1);
    }
  }
};

// Connect to database
connectDB();

// API routes
app.use('/api/admin', adminRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/user-count', userCountRoutes);

// Debug: Log all routes
app.use('/api/content', (req, res, next) => {
  console.log(`🔍 Content API Request: ${req.method} ${req.originalUrl}`);
  next();
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'APJU Media Hub API is running',
    timestamp: new Date().toISOString()
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'APJU Media Hub Backend API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      userCount: '/api/user-count/usercount',
      admin: '/api/admin',
      content: '/api/content',
      debug: '/api/debug/routes'
    },
    documentation: 'https://github.com/Dhruv-Chothani/backend-apju'
  });
});

// Debug endpoint to test content routes
app.get('/api/debug/routes', (req, res) => {
  const routes = [
    '/api/content/all',
    '/api/content/home',
    '/api/content/type/:type',
    '/api/content/:id',
    '/api/content/add',
    '/api/content/update/:id',
    '/api/content/:id',
    '/api/content/toggle-home/:id',
    '/api/user-count/usercount',
    '/api/user-count/login',
    '/api/user-count/user/:email',
    '/api/user-count/users',
    '/api/user-count/stats',
    '/api/user-count/reset/:email',
    '/api/user-count/user/:email (DELETE)'
  ];
  res.json({ routes });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.stack);
  res.status(500).json({
    message: 'Something went wrong!',
    error: err.message // Show full error details
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
  console.log(`🔗 Local: http://localhost:${PORT}`);
});

export default app;
