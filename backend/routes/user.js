const express = require('express');
const { body } = require('express-validator');
const { runQuery, getQuery } = require('../config/database');
const { auth } = require('../middleware/auth');
const { handleValidationErrors } = require('../middleware/validation');

const router = express.Router();

// User profile validation
const validateProfileUpdate = [
  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),
  body('phone')
    .optional()
    .trim()
    .matches(/^[6-9]\d{9}$/)
    .withMessage('Please provide a valid 10-digit phone number'),
  body('address')
    .optional()
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage('Address must be between 10 and 500 characters'),
  handleValidationErrors
];

// Get user profile (protected route)
router.get('/profile', auth, async (req, res) => {
  try {
    const profile = await getQuery('SELECT * FROM user_profiles WHERE user_id = ?', [req.user.id]);

    if (!profile) {
      return res.json({
        success: true,
        profile: null,
        message: 'No profile found. You can create one by updating your profile.'
      });
    }

    res.json({
      success: true,
      profile
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to get user profile' });
  }
});

// Create or update user profile (protected route)
router.put('/profile', auth, validateProfileUpdate, async (req, res) => {
  try {
    const { firstName, lastName, phone, address } = req.body;
    const userId = req.user.id;

    // Check if profile exists
    const existingProfile = await getQuery('SELECT id FROM user_profiles WHERE user_id = ?', [userId]);

    if (existingProfile) {
      // Update existing profile
      await runQuery(
        `UPDATE user_profiles 
         SET first_name = ?, last_name = ?, phone = ?, address = ?, updated_at = CURRENT_TIMESTAMP 
         WHERE user_id = ?`,
        [firstName || null, lastName || null, phone || null, address || null, userId]
      );
    } else {
      // Create new profile
      await runQuery(
        'INSERT INTO user_profiles (user_id, first_name, last_name, phone, address) VALUES (?, ?, ?, ?, ?)',
        [userId, firstName || null, lastName || null, phone || null, address || null]
      );
    }

    // Get updated profile
    const updatedProfile = await getQuery('SELECT * FROM user_profiles WHERE user_id = ?', [userId]);

    res.json({
      success: true,
      message: existingProfile ? 'Profile updated successfully' : 'Profile created successfully',
      profile: updatedProfile
    });

  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Delete user profile (protected route)
router.delete('/profile', auth, async (req, res) => {
  try {
    const userId = req.user.id;

    // Check if profile exists
    const existingProfile = await getQuery('SELECT id FROM user_profiles WHERE user_id = ?', [userId]);
    if (!existingProfile) {
      return res.status(404).json({ error: 'No profile found for this user' });
    }

    // Delete profile
    await runQuery('DELETE FROM user_profiles WHERE user_id = ?', [userId]);

    res.json({
      success: true,
      message: 'Profile deleted successfully'
    });

  } catch (error) {
    console.error('Profile deletion error:', error);
    res.status(500).json({ error: 'Failed to delete profile' });
  }
});

// Change password (protected route)
router.put('/change-password', auth, [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('New password must be at least 8 characters long'),
  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error('Password confirmation does not match new password');
      }
      return true;
    }),
  handleValidationErrors
], async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    // Get current password hash
    const user = await getQuery('SELECT password_hash FROM users WHERE id = ?', [userId]);

    // Verify current password
    const bcrypt = require('bcryptjs');
    const isValidPassword = await bcrypt.compare(currentPassword, user.password_hash);

    if (!isValidPassword) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }

    // Hash new password
    const saltRounds = 12;
    const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    await runQuery(
      'UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [newPasswordHash, userId]
    );

    res.json({
      success: true,
      message: 'Password changed successfully'
    });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: 'Failed to change password' });
  }
});

// Get user dashboard data (protected route)
router.get('/dashboard', auth, async (req, res) => {
  try {
    const userId = req.user.id;

    // Get user info
    const user = await getQuery(
      'SELECT id, email, email_verified, created_at FROM users WHERE id = ?',
      [userId]
    );

    // Get profile
    const profile = await getQuery('SELECT * FROM user_profiles WHERE user_id = ?', [userId]);

    // Get shop
    const shop = await getQuery('SELECT * FROM shops WHERE user_id = ?', [userId]);

    // TODO: Add more dashboard data as features are implemented
    const dashboardData = {
      user,
      profile: profile || null,
      shop: shop || null,
      // Placeholder for future dashboard data
      recentActivity: [],
      quickStats: {
        totalProducts: 0,
        totalSales: 0,
        totalCustomers: 0,
        monthlyRevenue: 0
      }
    };

    res.json({
      success: true,
      dashboard: dashboardData
    });

  } catch (error) {
    console.error('Get dashboard error:', error);
    res.status(500).json({ error: 'Failed to get dashboard data' });
  }
});

// Delete user account (protected route)
router.delete('/account', auth, async (req, res) => {
  try {
    const userId = req.user.id;

    // This will cascade delete all related data (profile, shop, etc.)
    await runQuery('DELETE FROM users WHERE id = ?', [userId]);

    res.json({
      success: true,
      message: 'Account deleted successfully'
    });

  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({ error: 'Failed to delete account' });
  }
});

module.exports = router;
