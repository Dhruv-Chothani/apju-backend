import mongoose from 'mongoose';

const contentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000
  },
  content: {
    type: String,
    default: ''
  },
  media_url: {
    type: String,
    default: ''
  },
  video_url: {
    type: String,
    default: ''
  },
  content_type: {
    type: String,
    required: true,
    enum: ['blog', 'photo', 'video'],
    default: 'blog'
  },
  show_on_home: {
    type: Boolean,
    default: false
  },
  home_priority: {
    type: Number,
    default: 0,
    min: 0,
    max: 10
  },
  // Image storage fields for MongoDB
  image: {
    type: Buffer,
    default: null
  },
  imageType: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// Index for better query performance
contentSchema.index({ content_type: 1, show_on_home: 1 });
contentSchema.index({ created_at: -1 });

// Virtual to get image URL if image exists
contentSchema.virtual('imageUrl').get(function() {
  if (this.image && this.imageType) {
    return `/api/content/image/${this._id}`;
  }
  return this.media_url;
});

// Ensure virtual fields are included in JSON output
contentSchema.set('toJSON', { virtuals: true });
contentSchema.set('toObject', { virtuals: true });

// Ensure only 3 items can be marked for homepage
contentSchema.pre('save', async function(next) {
  if (this.show_on_home) {
    try {
      const homeCount = await this.constructor.countDocuments({ 
        show_on_home: true,
        _id: { $ne: this._id }
      });
      
      if (homeCount >= 3) {
        // If we already have 3 items, don't allow another one
        this.show_on_home = false;
      }
    } catch (error) {
      console.error('Error checking home content count:', error);
    }
  }
  next();
});

// Static method to get homepage content (max 3 items)
contentSchema.statics.getHomeContent = function() {
  return this.find({ show_on_home: true })
    .sort({ home_priority: -1, created_at: -1 })
    .limit(3);
};

// Static method to get content by type
contentSchema.statics.getByType = function(type) {
  return this.find({ content_type: type })
    .sort({ created_at: -1 });
};

// Method to toggle homepage display
contentSchema.methods.toggleHomeDisplay = async function() {
  if (this.show_on_home) {
    // If currently showing on home, remove from home
    this.show_on_home = false;
    this.home_priority = 0;
  } else {
    // If not showing on home, check if we can add it
    const homeCount = await this.constructor.countDocuments({ 
      show_on_home: true,
      _id: { $ne: this._id }
    });
    
    if (homeCount < 3) {
      this.show_on_home = true;
      this.home_priority = 1;
    } else {
      throw new Error('Maximum 3 items can be displayed on homepage');
    }
  }
  
  return this.save();
};

const Content = mongoose.model('Content', contentSchema);

export default Content;
