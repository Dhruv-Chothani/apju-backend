import mongoose from 'mongoose';

// Import Visitor model with error handling
let Visitor;
try {
  Visitor = require('../models/visitor.model.js').default;
} catch (error) {
  console.log('⚠️ Visitor model not available, using fallback');
  Visitor = null;
}

const visitorController = {
  // Track website visit
  trackVisit: async (req, res) => {
    try {
      const ip = req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for'] || 'unknown';
      const userAgent = req.headers['user-agent'] || '';
      
      // Check if MongoDB is connected
      if (mongoose.connection.readyState !== 1 || !Visitor) {
        return res.json({
          success: true,
          message: 'Visit tracked (database not connected)',
          stats: {
            totalVisits: 0,
            uniqueVisitors: 0,
            averageVisitsPerVisitor: 0,
            note: "Database not connected - returning default values"
          }
        });
      }

      const visitor = await Visitor.trackVisit(ip, userAgent);
      const stats = await Visitor.getVisitorStats();
      
      res.json({
        success: true,
        message: 'Visit tracked successfully',
        visitor: {
          ip: ip.substring(0, 10) + '***', // Partial IP for privacy
          visitCount: visitor?.visitCount || 1,
          lastVisit: visitor?.lastVisit || new Date()
        },
        stats
      });
    } catch (error) {
      console.error('Track visit error:', error);
      res.json({
        success: true,
        message: 'Visit tracked (with error)',
        stats: {
          totalVisits: 0,
          uniqueVisitors: 0,
          averageVisitsPerVisitor: 0,
          note: "Error occurred - returning default values"
        }
      });
    }
  },

  // Get visitor statistics
  getVisitorStats: async (req, res) => {
    try {
      // Check if MongoDB is connected
      if (mongoose.connection.readyState !== 1 || !Visitor) {
        return res.json({
          success: true,
          stats: {
            totalVisits: 0,
            uniqueVisitors: 0,
            averageVisitsPerVisitor: 0,
            note: "Database not connected - returning default values"
          }
        });
      }

      const stats = await Visitor.getVisitorStats();
      
      res.json({
        success: true,
        stats
      });
    } catch (error) {
      console.error('Get visitor stats error:', error);
      res.json({
        success: true,
        stats: {
          totalVisits: 0,
          uniqueVisitors: 0,
          averageVisitsPerVisitor: 0,
          note: "Error occurred - returning default values"
        }
      });
    }
  },

  // Get simple visit count (main endpoint you need)
  getVisitCount: async (req, res) => {
    try {
      // Check if MongoDB is connected
      if (mongoose.connection.readyState !== 1 || !Visitor) {
        return res.json({
          success: true,
          visitCount: 0,
          note: "Database not connected - returning default values"
        });
      }

      const totalVisits = await Visitor.getTotalVisits();
      
      res.json({
        success: true,
        visitCount: totalVisits
      });
    } catch (error) {
      console.error('Get visit count error:', error);
      res.json({
        success: true,
        visitCount: 0,
        note: "Error occurred - returning default values"
      });
    }
  },

  // Reset all visitor data
  resetVisits: async (req, res) => {
    try {
      // Check if MongoDB is connected
      if (mongoose.connection.readyState !== 1 || !Visitor) {
        return res.json({
          success: false,
          message: 'Database not connected'
        });
      }

      await Visitor.deleteMany({});
      
      res.json({
        success: true,
        message: 'All visitor data reset successfully'
      });
    } catch (error) {
      console.error('Reset visits error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to reset visitor data'
      });
    }
  }
};

export default visitorController;
