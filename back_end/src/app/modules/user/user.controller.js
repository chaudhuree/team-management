const catchAsync = require('../../utils/catchAsync');
const sendResponse = require('../../utils/sendResponse');
const { UserService } = require('./user.service');

/**
 * Register a new individual user
 */
const registerIndividual = catchAsync(async (req, res) => {
  const result = await UserService.registerIndividual(req.body);
  
  sendResponse(res, {
    success: true,
    statusCode: 201,
    message: 'Registration successful. Your account is pending approval from the team leader.',
    data: result,
  });
});

/**
 * Login individual user
 */
const loginIndividual = catchAsync(async (req, res) => {
  const result = await UserService.loginIndividual(req.body);
  
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Logged in successfully',
    data: result,
  });
});

/**
 * Create user by team leader
 */
const createUserByTeamLeader = catchAsync(async (req, res) => {
  const result = await UserService.createUserByTeamLeader(req.user.teamId, req.body);
  
  sendResponse(res, {
    success: true,
    statusCode: 201,
    message: 'User created successfully',
    data: result,
  });
});

/**
 * Get pending users for approval
 */
const getPendingUsers = catchAsync(async (req, res) => {
  const result = await UserService.getPendingUsers(req.user.teamId);
  
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Pending users retrieved successfully',
    data: result,
  });
});

/**
 * Approve user
 */
const approveUser = catchAsync(async (req, res) => {
  const result = await UserService.approveUser(req.params.id);
  
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'User approved successfully',
    data: result,
  });
});

/**
 * Reject user
 */
const rejectUser = catchAsync(async (req, res) => {
  const result = await UserService.rejectUser(req.params.id);
  
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'User rejected successfully',
    data: result,
  });
});

/**
 * Get team members
 */
const getTeamMembers = catchAsync(async (req, res) => {
  const result = await UserService.getTeamMembers(req.user.teamId);
  
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Team members retrieved successfully',
    data: result,
  });
});

/**
 * Update user profile
 */
const updateProfile = catchAsync(async (req, res) => {
  const result = await UserService.updateProfile(req.user.id, req.body);
  
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Profile updated successfully',
    data: result,
  });
});

/**
 * Update user role by team leader
 */
const updateUserRole = catchAsync(async (req, res) => {
  const result = await UserService.updateUserRole(req.params.id, req.body, req.user.teamId);
  
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'User role updated successfully',
    data: result,
  });
});

/**
 * Delete user
 */
const deleteUser = catchAsync(async (req, res) => {
  const result = await UserService.deleteUser(req.params.id, req.user.teamId);
  
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'User deleted successfully',
    data: result,
  });
});

/**
 * Change password
 */
const changePassword = catchAsync(async (req, res) => {
  const result = await UserService.changePassword(req.user.id, req.body);
  
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Password changed successfully',
    data: result,
  });
});

/**
 * Forgot password
 */
const forgotPassword = catchAsync(async (req, res) => {
  const result = await UserService.forgotPassword(req.body.email);
  
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'OTP sent successfully',
    data: result,
  });
});

/**
 * Reset password
 */
const resetPassword = catchAsync(async (req, res) => {
  const result = await UserService.resetPassword(req.body);
  
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Password reset successfully',
    data: result,
  });
});

/**
 * Get user notifications
 */
const getUserNotifications = catchAsync(async (req, res) => {
  const result = await UserService.getUserNotifications(req.user.id);
  
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Notifications retrieved successfully',
    data: result,
  });
});

/**
 * Mark notification as read
 */
const markNotificationAsRead = catchAsync(async (req, res) => {
  const result = await UserService.markNotificationAsRead(req.params.id, req.user.id);
  
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Notification marked as read',
    data: result,
  });
});

/**
 * Get current user information
 */
const getCurrentUser = catchAsync(async (req, res) => {
  const userId = req.user.id;
  const result = await UserService.getCurrentUser(userId);
  
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'User information retrieved successfully',
    data: result,
  });
});

const UserController = {
  registerIndividual,
  loginIndividual,
  createUserByTeamLeader,
  getPendingUsers,
  approveUser,
  rejectUser,
  getUserNotifications,
  markNotificationAsRead,
  updateProfile,
  changePassword,
  forgotPassword,
  resetPassword,
  getCurrentUser,
  getTeamMembers,
  updateUserRole,
  deleteUser,
};

module.exports = { UserController };
