import AuthService from '../services/authService.js';
import asyncHandler from '../utils/errorHandler.js';

class AuthController {
  /**
   * @desc    Register new user
   * @route   POST /api/auth/register
   * @access  Public
   */
  static register = asyncHandler(async (req, res) => {
    const { email, password, name, phone } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({
        success: false,
        error: 'Please provide email, password, and name'
      });
    }

    const data = await AuthService.register(email, password, name, phone);
    
    res.status(201).json({
      success: true,
      data: {
        user: data.user,
        profile: data.profile,
        session: data.session
      }
    });
  });

  /**
   * @desc    Login user
   * @route   POST /api/auth/login
   * @access  Public
   */
  static login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Please provide email and password'
      });
    }

    const data = await AuthService.login(email, password);
    
    // Set HTTP-only cookie for secure token storage
    res.cookie('refreshToken', data.session.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'development',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });
    
    res.status(200).json({
      success: true,
      data: {
        access_token: data.session.access_token,
        user: {
          ...data.user,
          profile: data.profile
        }
      }
    });
  });

  /**
   * @desc    Get current user
   * @route   GET /api/auth/me
   * @access  Private
   */
  static getCurrentUser = asyncHandler(async (req, res) => {
    const user = await AuthService.getCurrentUser(req.token);
    res.status(200).json({
      success: true,
      data: user,
    });
  });

  /**
   * @desc    Logout user / clear cookie
   * @route   POST /api/auth/logout
   * @access  Private
   */
  static logout = asyncHandler(async (req, res) => {
    // Clear the refresh token cookie
    res.cookie('refreshToken', '', {
      httpOnly: true,
      expires: new Date(0)
    });
    
    // Invalidate the access token on server side if needed
    await AuthService.logout(req.token);
    
    res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });
  });

  /**
   * @desc    Refresh access token
   * @route   POST /api/auth/refresh-token
   * @access  Public (needs refresh token)
   */
  static refreshToken = asyncHandler(async (req, res) => {
    const refreshToken = req.cookies.refreshToken || req.body.refresh_token;
    
    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        error: 'No refresh token provided'
      });
    }

    const data = await AuthService.refreshSession(refreshToken);
    
    // Optionally set new refresh token cookie
    res.cookie('refreshToken', data.session.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });
    
    res.status(200).json({
      success: true,
      data: {
        access_token: data.session.access_token,
        user: data.user
      }
    });
  });

  /**
   * @desc    Request password reset
   * @route   POST /api/auth/request-password-reset
   * @access  Public
   */
  static requestPasswordReset = asyncHandler(async (req, res) => {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Please provide email'
      });
    }

    await AuthService.requestPasswordReset(email);
    
    res.status(200).json({
      success: true,
      message: 'Password reset email sent if account exists'
    });
  });

  /**
   * @desc    Reset password
   * @route   POST /api/auth/reset-password
   * @access  Public
   */
  static handlePasswordReset = asyncHandler(async (req, res) => {
    const { token, newPassword } = req.body;
    
    if (!token || !newPassword) {
      return res.status(400).json({
        success: false,
        error: 'Reset token and new password are required'
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 8 characters'
      });
    }

    await AuthService.completePasswordReset(newPassword, token);
    
    res.status(200).json({
      success: true,
      message: 'Password reset successfully'
    });
  });

  /**
   * @desc    Update user profile
   * @route   PUT /api/auth/update-profile
   * @access  Private
   */
  static updateProfile = asyncHandler(async (req, res) => {
    const { name, phone } = req.body;
    const userId = req.user.id;

    if (!name && !phone) {
      return res.status(400).json({
        success: false,
        error: 'Please provide name or phone to update'
      });
    }

    const updatedProfile = await AuthService.updateProfile(userId, { name, phone });
    
    res.status(200).json({
      success: true,
      data: updatedProfile
    });
  });

  /**
   * @desc    Update user password
   * @route   PUT /api/auth/update-password
   * @access  Private
   */
  static updatePassword = asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        error: 'Current and new password are required'
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        error: 'New password must be at least 8 characters'
      });
    }

    // First verify current password
    try {
      await AuthService.login(req.user.email, currentPassword);
    } catch (error) {
      return res.status(401).json({
        success: false,
        error: 'Current password is incorrect'
      });
    }

    // Then update to new password
    await AuthService.updatePassword(userId, newPassword);
    
    res.status(200).json({
      success: true,
      message: 'Password updated successfully'
    });
  });
}

export default AuthController;