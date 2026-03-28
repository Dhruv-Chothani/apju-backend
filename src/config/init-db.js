import mongoose from 'mongoose';
import Admin from '../models/admin.model.js';
import Content from '../models/content.model.js';

const initDb = async () => {
  try {
    const mongoURI = 'mongodb+srv://dhruv:123@cluster0.us4e5ih.mongodb.net/Up02';
    await mongoose.connect(mongoURI);
    console.log('✅ Connected to MongoDB');

    // Create default admin if not exists
    await Admin.createDefaultAdmin();
    console.log('✅ Admin initialization completed');

    console.log('✅ Database initialization completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error initializing database:', error);
    process.exit(1);
  }
};

initDb();
