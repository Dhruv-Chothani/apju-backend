import UserCount from '../models/userCount.model.js';

const userCountController = {
  // Simple direct user count endpoint (no login required)
  getUserCount: async (req, res) => {
    try {
      const stats = await UserCount.getLoginStats();
      
      res.json({
        success: true,
        userCount: stats.totalLogins,
        data: stats
      });
    } catch (error) {
      console.error('Get user count error:', error);
      res.status(500).json({ 
        success: false,
        message: 'Server error' 
      });
    }
  },

  // Login with count tracking
  loginWithCount: async (req, res) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ 
          success: false,
          message: 'Email and password are required' 
        });
      }

      // Static credentials check (same as admin)
      if (email === 'apju@admin.com' && password === 'apju@admin123') {
        // Increment login count
        const userCount = await UserCount.incrementLogin(email);
        
        res.json({
          success: true,
          message: 'Login successful',
          user: {
            id: 'static-admin',
            email: 'apju@admin.com',
            name: 'APJU Admin',
            role: 'admin'
          },
          loginStats: {
            loginCount: userCount.loginCount,
            lastLogin: userCount.lastLogin
          }
        });
      } else {
        return res.status(401).json({ 
          success: false,
          message: 'Invalid credentials' 
        });
      }
    } catch (error) {
      console.error('Login with count error:', error);
      res.status(500).json({ 
        success: false,
        message: 'Server error during login' 
      });
    }
  },

  // Get user login count
  getUserLoginCount: async (req, res) => {
    try {
      const { email } = req.params;
      
      if (!email) {
        return res.status(400).json({ 
          success: false,
          message: 'Email is required' 
        });
      }

      const userCount = await UserCount.findByEmail(email);
      
      if (!userCount) {
        return res.status(404).json({ 
          success: false,
          message: 'User login data not found' 
        });
      }

      res.json({
        success: true,
        data: {
          email: userCount.email,
          loginCount: userCount.loginCount,
          lastLogin: userCount.lastLogin,
          isActive: userCount.isActive,
          createdAt: userCount.createdAt
        }
      });
    } catch (error) {
      console.error('Get user login count error:', error);
      res.status(500).json({ 
        success: false,
        message: 'Server error' 
      });
    }
  },

  // Get all users login counts
  getAllUsersLoginCount: async (req, res) => {
    try {
      const users = await UserCount.find().sort({ loginCount: -1 });
      
      res.json({
        success: true,
        data: users.map(user => ({
          email: user.email,
          loginCount: user.loginCount,
          lastLogin: user.lastLogin,
          isActive: user.isActive,
          createdAt: user.createdAt
        }))
      });
    } catch (error) {
      console.error('Get all users login count error:', error);
      res.status(500).json({ 
        success: false,
        message: 'Server error' 
      });
    }
  },

  // Get login statistics
  getLoginStats: async (req, res) => {
    try {
      const stats = await UserCount.getLoginStats();
      
      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Get login stats error:', error);
      res.status(500).json({ 
        success: false,
        message: 'Server error' 
      });
    }
  },

  // Reset user login count
  resetUserLoginCount: async (req, res) => {
    try {
      const { email } = req.params;
      
      if (!email) {
        return res.status(400).json({ 
          success: false,
          message: 'Email is required' 
        });
      }

      const userCount = await UserCount.findOneAndUpdate(
        { email: email.toLowerCase() },
        { 
          $set: { 
            loginCount: 0, 
            lastLogin: null,
            isActive: false 
          }
        },
        { new: true }
      );

      if (!userCount) {
        return res.status(404).json({ 
          success: false,
          message: 'User login data not found' 
        });
      }

      res.json({
        success: true,
        message: 'User login count reset successfully',
        data: {
          email: userCount.email,
          loginCount: userCount.loginCount
        }
      });
    } catch (error) {
      console.error('Reset user login count error:', error);
      res.status(500).json({ 
        success: false,
        message: 'Server error' 
      });
    }
  },

  // Delete user login data
  deleteUserLoginData: async (req, res) => {
    try {
      const { email } = req.params;
      
      if (!email) {
        return res.status(400).json({ 
          success: false,
          message: 'Email is required' 
        });
      }

      const result = await UserCount.deleteOne({ email: email.toLowerCase() });

      if (result.deletedCount === 0) {
        return res.status(404).json({ 
          success: false,
          message: 'User login data not found' 
        });
      }

      res.json({
        success: true,
        message: 'User login data deleted successfully'
      });
    } catch (error) {
      console.error('Delete user login data error:', error);
      res.status(500).json({ 
        success: false,
        message: 'Server error' 
      });
    }
  }
};

export default userCountController;
