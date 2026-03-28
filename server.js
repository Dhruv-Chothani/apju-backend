import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Import routes
import adminRoutes from './src/routes/admin.routes.js';
import contentRoutes from './src/routes/content.routes.js';
import userCountRoutes from './src/routes/userCount.routes.js';
import visitorRoutes from './src/routes/visitor.routes.js';

// ES Module fix for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

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
    console.log('🔗 Connecting to MongoDB...');
    console.log('📍 MongoDB URI:', process.env.MONGO_URI ? 'Configured' : 'Using fallback');
    
    const mongoURI = process.env.MONGO_URI || 'mongodb://dhruv:123@cluster0-shard-00-00.us4e5ih.mongodb.net:27017,cluster0-shard-00-01.us4e5ih.mongodb.net:27017,cluster0-shard-00-02.us4e5ih.mongodb.net/Up02?ssl=true&replicaSet=atlas-13i8dw-shard-0&authSource=admin&retryWrites=true&w=majority';
    
    const options = {
      serverSelectionTimeoutMS: 10000, // Keep trying to send operations for 10 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      bufferCommands: false, // Disable mongoose buffering
    };
    
    await mongoose.connect(mongoURI, options);
    
    console.log('✅ MongoDB connected successfully');
    console.log(`📊 Database: ${mongoose.connection.name}`);
    console.log(`🌐 Host: ${mongoose.connection.host}`);
    
  } catch (error) {
    console.error('❌ MongoDB connection error:');
    console.error('   Error Code:', error.code);
    console.error('   Error Message:', error.message);
    
    // Handle specific IP whitelist error
    if (error.message.includes('IP that isn\'t whitelisted')) {
      console.log('');
      console.log('🔧 SOLUTION: Add your IP to MongoDB Atlas Whitelist');
      console.log('   1. Go to: https://cloud.mongodb.com/');
      console.log('   2. Navigate to your cluster → Network Access');
      console.log('   3. Add your current IP address');
      console.log('   4. Or use 0.0.0.0/0 for all IPs (not recommended for production)');
      console.log('');
    }
    
    // Don't exit on Vercel, just log the error
    if (process.env.NODE_ENV !== 'production') {
      console.log('⚠️ Continuing without database connection (API will return default values)');
      // Don't exit - continue with server running
    } else {
      console.log('⚠️ Running in production mode - continuing without database');
    }
  }
};

// Start server only after database connection
const startServer = async () => {
  await connectDB();
  
  // API routes
  app.use('/api/admin', adminRoutes);
  app.use('/api/content', contentRoutes);
  app.use('/api/user-count', userCountRoutes);
  app.use('/api/visitor', visitorRoutes);

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
        visitorCount: '/api/visitor/visitcount',
        trackVisit: '/api/visitor/track',
        visitorStats: '/api/visitor/stats',
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
      '/api/user-count/user/:email (DELETE)',
      '/api/visitor/visitcount',
      '/api/visitor/track',
      '/api/visitor/stats',
      '/api/visitor/reset (DELETE)'
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
  
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
    console.log(`🔗 Local: http://localhost:${PORT}`);
    console.log(`📚 API Documentation: http://localhost:${PORT}/api/debug/routes`);
  });
};

// Start server
startServer();

export default app;
