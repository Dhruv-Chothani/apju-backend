import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const adminSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  name: {
    type: String,
    default: 'APJU Admin'
  },
  role: {
    type: String,
    default: 'admin',
    enum: ['admin']
  }
}, {
  timestamps: true
});

// Hash password before saving
adminSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Static methods for authentication
adminSchema.statics.findByEmail = function(email) {
  return this.findOne({ email: email.toLowerCase() });
};

adminSchema.statics.verifyPassword = async function(password, hashedPassword) {
  return await bcrypt.compare(password, hashedPassword);
};

// Instance method to check password
adminSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Create default admin if none exists
adminSchema.statics.createDefaultAdmin = async function() {
  try {
    const existingAdmin = await this.findOne();
    if (!existingAdmin) {
      const defaultAdmin = new this({
        email: 'apju@admin.com',
        password: 'apju@admin123',
        name: 'APJU Admin'
      });
      await defaultAdmin.save();
      console.log('✅ Default admin created: apju@admin.com / apju@admin123');
    }
  } catch (error) {
    console.error('❌ Error creating default admin:', error);
  }
};

const Admin = mongoose.model('Admin', adminSchema);

// Initialize default admin
Admin.createDefaultAdmin();

export default Admin;
