const express = require('express');
const { UserController } = require('./user.controller');
const auth = require('../../middlewares/auth');
const { UserRole } = require('@prisma/client');
const { ENUM_USER_ROLE } = require('../../utils/constants');

const router = express.Router();

// Public routes
router.post('/register', UserController.registerIndividual);
router.post('/login', UserController.loginIndividual);
router.post('/forgot-password', UserController.forgotPassword);
router.post('/reset-password', UserController.resetPassword);

// Protected routes - All authenticated users
router.get('/me', auth(), UserController.getCurrentUser);
router.get('/notifications', auth(), UserController.getUserNotifications);
router.patch('/notifications/:id/read', auth(), UserController.markNotificationAsRead);
router.patch('/profile', auth(), UserController.updateProfile);
router.patch('/change-password', auth(), UserController.changePassword);

// Protected routes - Team Leader only
router.get('/pending', auth(), UserController.getPendingUsers);
router.post('/create', auth(), UserController.createUserByTeamLeader);
router.get('/team-members', auth(), UserController.getTeamMembers);
router.patch('/:id/approve', auth(), UserController.approveUser);
router.delete('/:id/reject', auth(), UserController.rejectUser);
router.patch('/:id/role', auth(), UserController.updateUserRole);
router.delete('/:id', auth(), UserController.deleteUser);

// Add these routes to your existing user routes
router.get('/:id', auth(), UserController.getUserById);
router.patch('/:id/role', auth(ENUM_USER_ROLE.LEADER), UserController.updateUserRole);

module.exports = router;
