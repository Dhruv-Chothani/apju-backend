import mongoose from 'mongoose';

const visitorSchema = new mongoose.Schema({
  ip: {
    type: String,
    required: true
  },
  userAgent: {
    type: String,
    default: ''
  },
  visitCount: {
    type: Number,
    default: 1
  },
  lastVisit: {
    type: Date,
    default: Date.now
  },
  firstVisit: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Static methods
visitorSchema.statics.trackVisit = async function(ip, userAgent = '') {
  try {
    const existingVisitor = await this.findOne({ ip });
    
    if (existingVisitor) {
      // Update existing visitor
      await this.updateOne(
        { ip },
        { 
          $inc: { visitCount: 1 },
          $set: { lastVisit: new Date(), userAgent }
        }
      );
      return await this.findOne({ ip });
    } else {
      // New visitor
      const newVisitor = new this({
        ip,
        userAgent,
        visitCount: 1,
        firstVisit: new Date(),
        lastVisit: new Date()
      });
      await newVisitor.save();
      return newVisitor;
    }
  } catch (error) {
    console.error('Error tracking visit:', error);
    return null;
  }
};

visitorSchema.statics.getTotalVisits = async function() {
  try {
    const result = await this.aggregate([
      { $group: { _id: null, totalVisits: { $sum: '$visitCount' } } }
    ]);
    return result.length > 0 ? result[0].totalVisits : 0;
  } catch (error) {
    console.error('Error getting total visits:', error);
    return 0;
  }
};

visitorSchema.statics.getUniqueVisitors = async function() {
  try {
    return await this.countDocuments();
  } catch (error) {
    console.error('Error getting unique visitors:', error);
    return 0;
  }
};

visitorSchema.statics.getVisitorStats = async function() {
  try {
    const totalVisits = await this.getTotalVisits();
    const uniqueVisitors = await this.getUniqueVisitors();
    
    return {
      totalVisits,
      uniqueVisitors,
      averageVisitsPerVisitor: uniqueVisitors > 0 ? Math.round(totalVisits / uniqueVisitors * 100) / 100 : 0
    };
  } catch (error) {
    console.error('Error getting visitor stats:', error);
    return {
      totalVisits: 0,
      uniqueVisitors: 0,
      averageVisitsPerVisitor: 0
    };
  }
};

const Visitor = mongoose.model('Visitor', visitorSchema);

export default Visitor;
