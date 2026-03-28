import mongoose from 'mongoose';

const userCountSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  loginCount: {
    type: Number,
    default: 0
  },
  lastLogin: {
    type: Date,
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Static methods
userCountSchema.statics.findByEmail = function(email) {
  return this.findOne({ email: email.toLowerCase() });
};

userCountSchema.statics.incrementLogin = async function(email) {
  const userCount = await this.findOneAndUpdate(
    { email: email.toLowerCase() },
    { 
      $inc: { loginCount: 1 },
      $set: { lastLogin: new Date(), isActive: true }
    },
    { upsert: true, new: true }
  );
  return userCount;
};

userCountSchema.statics.getTotalLogins = async function() {
  const result = await this.aggregate([
    { $group: { _id: null, totalLogins: { $sum: '$loginCount' } } }
  ]);
  return result.length > 0 ? result[0].totalLogins : 0;
};

userCountSchema.statics.getActiveUsers = async function() {
  return await this.countDocuments({ isActive: true });
};

userCountSchema.statics.getLoginStats = async function() {
  const totalLogins = await this.getTotalLogins();
  const activeUsers = await this.getActiveUsers();
  const totalUsers = await this.countDocuments();
  
  return {
    totalLogins,
    activeUsers,
    totalUsers,
    averageLoginsPerUser: totalUsers > 0 ? Math.round(totalLogins / totalUsers * 100) / 100 : 0
  };
};

const UserCount = mongoose.model('UserCount', userCountSchema);

export default UserCount;
