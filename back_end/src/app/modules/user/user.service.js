const prisma = require('../../utils/prisma');
const AppError = require('../../errors/AppError');
const bcrypt = require('bcryptjs');
const { createToken } = require('../../utils/jwt.utils');
const generateOTP = require('../../utils/generateOTP');
const ApiError = require('../../errors/ApiError');
const httpStatus = require('http-status');

/**
 * Register a new individual user
 */
const registerIndividual = async (userData) => {
  // Validate user data
  if (!userData.name || !userData.email || !userData.password || !userData.teamName) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Please provide all required fields');
  }

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email: userData.email },
  });

  if (existingUser) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'User already exists');
  }

  // Check if team exists
  const team = await prisma.team.findUnique({
    where: { name: userData.teamName },
  });

  if (!team) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Team not found');
  }

  // Find the department if specified
  let department;
  if (userData.department) {
    department = await prisma.department.findFirst({
      where: {
        name: userData.department,
        teamId: team.id
      }
    });

    if (!department) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Department not found in the specified team');
    }
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(userData.password, 10);

  // Create user
  const user = await prisma.user.create({
    data: {
      name: userData.name,
      email: userData.email,
      password: hashedPassword,
      team: {
        connect: { id: team.id }
      },
      department: department ? {
        connect: { id: department.id }
      } : undefined,
      photo: userData.photo,
      photoKey: userData.photoKey,
    },
    include: {
      team: true,
      department: true,
    },
  });

  return user;
};

/**
 * Login individual user
 */
const loginIndividual = async (loginData) => {
  const { email, password } = loginData;

  const user = await prisma.user.findUnique({
    where: {
      email,
    },
    include: {
      team: {
        select: {
          id: true,
          name: true,
          logo: true,
        },
      },
      department: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  if (!user) {
    throw new AppError('User not found', 404);
  }

  // Check if user is approved
  if (!user.isApproved) {
    throw new AppError('Your account is pending approval from the team leader', 403);
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new AppError('Invalid credentials', 401);
  }

  const token = createToken({ userId: user.id, teamId: user.teamId });

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      photo: user.photo,
      team: user.team,
      department: user.department,
      isTeamLeader: user.isTeamLeader,
    },
  };
};

/**
 * Create user by team leader
 */
const createUserByTeamLeader = async (teamId, userData) => {
  const { name, email, role, departmentId, photo } = userData;

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (existingUser) {
    throw new AppError('User already exists with this email', 400);
  }

  // Check if department exists and belongs to the team
  if (departmentId) {
    const department = await prisma.department.findFirst({
      where: {
        id: departmentId,
        teamId,
      },
    });

    if (!department) {
      throw new AppError('Department not found or does not belong to the team', 404);
    }
  }

  // Hash default password (123456)
  const hashedPassword = await bcrypt.hash('123456', 12);

  // Create user
  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role,
      teamId,
      departmentId,
      photo,
      isApproved: true, // Auto-approved since created by team leader
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isApproved: true,
      team: {
        select: {
          id: true,
          name: true,
        },
      },
      department: {
        select: {
          id: true,
          name: true,
        },
      },
      createdAt: true,
    },
  });

  return {
    ...user,
    password: '123456', // Return default password
  };
};

/**
 * Get pending users for approval
 */
const getPendingUsers = async (teamId) => {
  const pendingUsers = await prisma.user.findMany({
    where: {
      teamId,
      isApproved: false,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      department: {
        select: {
          id: true,
          name: true,
        },
      },
      createdAt: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return pendingUsers;
};

/**
 * Approve user
 */
const approveUser = async (userId) => {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });

  if (!user) {
    throw new AppError('User not found', 404);
  }

  if (user.isApproved) {
    throw new AppError('User is already approved', 400);
  }

  const updatedUser = await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      isApproved: true,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isApproved: true,
      team: {
        select: {
          id: true,
          name: true,
        },
      },
      department: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  // Create notification for the approved user with title
  await prisma.notification.create({
    data: {
      title: 'Account Approved',
      content: 'Your account has been approved. You can now log in.',
      type: 'APPROVAL',
      userId,
    },
  });

  return updatedUser;
};

/**
 * Reject user
 */
const rejectUser = async (userId) => {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });

  if (!user) {
    throw new AppError('User not found', 404);
  }

  if (user.isApproved) {
    throw new AppError('Cannot reject an already approved user', 400);
  }

  await prisma.user.delete({
    where: {
      id: userId,
    },
  });

  return { message: 'User rejected and removed successfully' };
};

/**
 * Get team members
 */
const getTeamMembers = async (teamId) => {
  const members = await prisma.user.findMany({
    where: {
      teamId,
      isApproved: true,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      photo: true,
      isTeamLeader: true,
      department: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: {
      name: 'asc',
    },
  });

  return members;
};

/**
 * Update user profile
 */
const updateProfile = async (userId, updateData) => {
  // Remove sensitive fields that shouldn't be updated
  const { password, isApproved, isTeamLeader, teamId, ...updateFields } = updateData;

  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });

  if (!user) {
    throw new AppError('User not found', 404);
  }

  // If updating department, verify it belongs to the user's team
  if (updateFields.departmentId) {
    const department = await prisma.department.findFirst({
      where: {
        id: updateFields.departmentId,
        teamId: user.teamId,
      },
    });

    if (!department) {
      throw new AppError('Department not found or does not belong to your team', 404);
    }
  }

  const result = await prisma.user.update({
    where: {
      id: userId,
    },
    data: updateFields,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      photo: true,
      department: {
        select: {
          id: true,
          name: true,
        },
      },
      team: {
        select: {
          id: true,
          name: true,
        },
      },
      updatedAt: true,
    },
  });

  return result;
};

/**
 * Update user role by team leader
 */
const updateUserRole = async (userId, roleData, teamId) => {
  const { role, departmentId } = roleData;

  const user = await prisma.user.findFirst({
    where: {
      id: userId,
      teamId,
    },
  });

  if (!user) {
    throw new AppError('User not found in your team', 404);
  }

  // If updating department, verify it belongs to the team
  if (departmentId) {
    const department = await prisma.department.findFirst({
      where: {
        id: departmentId,
        teamId,
      },
    });

    if (!department) {
      throw new AppError('Department not found or does not belong to your team', 404);
    }
  }

  const updatedUser = await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      role,
      departmentId,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      department: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  return updatedUser;
};

/**
 * Delete user
 */
const deleteUser = async (userId, teamId) => {
  const user = await prisma.user.findFirst({
    where: {
      id: userId,
      teamId,
    },
  });

  if (!user) {
    throw new AppError('User not found in your team', 404);
  }

  if (user.isTeamLeader) {
    throw new AppError('Cannot delete the team leader', 400);
  }

  await prisma.user.delete({
    where: {
      id: userId,
    },
  });

  return { message: 'User deleted successfully' };
};

/**
 * Change password
 */
const changePassword = async (userId, passwordData) => {
  const { currentPassword, newPassword } = passwordData;

  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });

  if (!user) {
    throw new AppError('User not found', 404);
  }

  const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
  if (!isPasswordValid) {
    throw new AppError('Current password is incorrect', 401);
  }

  const hashedPassword = await bcrypt.hash(newPassword, 12);

  await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      password: hashedPassword,
    },
  });

  return { message: 'Password changed successfully' };
};

/**
 * Forgot password
 */
const forgotPassword = async (email) => {
  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (!user) {
    throw new AppError('User not found with this email', 404);
  }

  // Generate OTP
  const otp = generateOTP();
  const otpExpiration = new Date();
  otpExpiration.setMinutes(otpExpiration.getMinutes() + 10); // OTP valid for 10 minutes

  await prisma.user.update({
    where: {
      id: user.id,
    },
    data: {
      resetOTP: otp,
      otpExpiration,
    },
  });

  // In a real application, send OTP via email
  // For now, we'll just return it in the response
  return {
    message: 'OTP sent to your email',
    otp, // In production, don't return this
  };
};

/**
 * Reset password
 */
const resetPassword = async (resetData) => {
  const { email, otp, newPassword } = resetData;

  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (!user) {
    throw new AppError('User not found with this email', 404);
  }

  if (user.resetOTP !== otp) {
    throw new AppError('Invalid OTP', 400);
  }

  const now = new Date();
  if (!user.otpExpiration || user.otpExpiration < now) {
    throw new AppError('OTP has expired', 400);
  }

  const hashedPassword = await bcrypt.hash(newPassword, 12);

  await prisma.user.update({
    where: {
      id: user.id,
    },
    data: {
      password: hashedPassword,
      resetOTP: null,
      otpExpiration: null,
    },
  });

  return { message: 'Password reset successfully' };
};

/**
 * Get user notifications
 */
const getUserNotifications = async (userId) => {
  const notifications = await prisma.notification.findMany({
    where: {
      userId,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return notifications;
};

/**
 * Mark notification as read
 */
const markNotificationAsRead = async (notificationId, userId) => {
  const notification = await prisma.notification.findFirst({
    where: {
      id: notificationId,
      userId,
    },
  });

  if (!notification) {
    throw new AppError('Notification not found', 404);
  }

  const updatedNotification = await prisma.notification.update({
    where: {
      id: notificationId,
    },
    data: {
      isRead: true,
    },
  });

  return updatedNotification;
};

/**
 * Get current user information
 */
const getCurrentUser = async (userId) => {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    include: {
      team: true,
      department: true,
    },
  });

  if (!user) {
    throw new AppError('User not found', 404);
  }

  // Check if user is team leader
  const isTeamLeader = user.isTeamLeader;

  // Format response
  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      isTeamLeader,
      status: user.status,
      photo: user.photo,
      department: user.department ? {
        id: user.department.id,
        name: user.department.name,
      } : null,
    },
    team: user.team ? {
      id: user.team.id,
      name: user.team.name,
      logo: user.team.logo,
    } : null,
  };
};

const UserService = {
  registerIndividual,
  loginIndividual,
  createUserByTeamLeader,
  getPendingUsers,
  approveUser,
  rejectUser,
  getTeamMembers,
  updateProfile,
  updateUserRole,
  deleteUser,
  changePassword,
  forgotPassword,
  resetPassword,
  getUserNotifications,
  markNotificationAsRead,
  getCurrentUser,
};

module.exports = { UserService };
