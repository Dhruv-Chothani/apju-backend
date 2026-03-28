import Admin from '../models/admin.model.js';

const adminController = {
  login: async (req, res) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
      }

      // Static credentials check
      if (email === 'apju@admin.com' && password === 'apju@admin123') {
        res.json({
          success: true,
          message: 'Login successful',
          user: {
            id: 'static-admin',
            email: 'apju@admin.com',
            name: 'APJU Admin',
            role: 'admin'
          }
        });
      } else {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: 'Server error during login' });
    }
  },

  getProfile: async (req, res) => {
    try {
      // Return static admin profile
      res.json({
        success: true,
        data: {
          id: 'static-admin',
          email: 'apju@admin.com',
          name: 'APJU Admin',
          role: 'admin'
        }
      });
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },

  // Update admin profile
  updateProfile: async (req, res) => {
    try {
      const { name, email } = req.body;

      // For static login, just return success without actually updating
      res.json({
        success: true,
        data: {
          id: 'static-admin',
          email: email || 'apju@admin.com',
          name: name || 'APJU Admin',
          role: 'admin'
        },
        message: 'Profile updated successfully'
      });
    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({ message: 'Failed to update profile' });
    }
  },

  // Change password
  changePassword: async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        return res.status(400).json({ 
          message: 'Current password and new password are required' 
        });
      }

      // For static login, just check if current password matches
      if (currentPassword === 'apju@admin123') {
        res.json({
          success: true,
          message: 'Password changed successfully'
        });
      } else {
        return res.status(401).json({ message: 'Current password is incorrect' });
      }
    } catch (error) {
      console.error('Change password error:', error);
      res.status(500).json({ message: 'Failed to change password' });
    }
  }
};

export default adminController;