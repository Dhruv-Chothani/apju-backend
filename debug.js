import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config({ path: './src/.env' });

const app = express();
const PORT = process.env.PORT || 5000;

// MongoDB connection
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/apju_media_hub';
    await mongoose.connect(mongoURI);
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Simple content model for testing
const ContentSchema = new mongoose.Schema({
  title: String,
  description: String,
  content: String,
  content_type: String,
  media_url: String,
  video_url: String,
  show_on_home: Boolean,
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

const Content = mongoose.model('Content', ContentSchema);

// Middleware
app.use(express.json());

// Test routes
app.get('/api/content/type/:type', async (req, res) => {
  try {
    const { type } = req.params;
    console.log(`🔍 Fetching content by type: ${type}`);
    
    const content = await Content.find({ content_type: type })
      .sort({ created_at: -1 })
      .lean();

    res.json({
      success: true,
      data: content
    });
  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({ message: 'Failed to fetch content' });
  }
});

app.get('/api/content/all', async (req, res) => {
  try {
    const content = await Content.find({})
      .sort({ created_at: -1 })
      .lean();

    res.json({
      success: true,
      data: content
    });
  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({ message: 'Failed to fetch content' });
  }
});

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Debug API is running',
    timestamp: new Date().toISOString()
  });
});

// Start server
const startServer = async () => {
  await connectDB();
  
  app.listen(PORT, () => {
    console.log(`🚀 Debug server running on http://localhost:${PORT}`);
    console.log(`🔍 Test endpoints:`);
    console.log(`   GET http://localhost:${PORT}/api/content/type/blog`);
    console.log(`   GET http://localhost:${PORT}/api/content/type/photo`);
    console.log(`   GET http://localhost:${PORT}/api/content/type/video`);
    console.log(`   GET http://localhost:${PORT}/api/content/all`);
    console.log(`   GET http://localhost:${PORT}/api/health`);
  });
};

startServer();
