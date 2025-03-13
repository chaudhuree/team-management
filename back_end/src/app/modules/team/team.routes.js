const express = require('express');
const { TeamController } = require('./team.controller');
const auth = require('../../middlewares/auth');

const router = express.Router();

// Public routes
router.post('/register', TeamController.registerTeam);
router.post('/login', TeamController.loginTeam);

// Protected routes
router.get('/:id', auth(), TeamController.getTeamDetails);
router.post('/:teamId/departments', auth(), TeamController.createDepartment);

// Profile routes - these don't use URL parameters but get the ID from the auth token
router.patch('/profile', auth(), TeamController.updateProfile);
router.patch('/change-password', auth(), TeamController.changePassword);

// These routes use URL parameters
router.patch('/:id', auth(), TeamController.updateTeam);
router.patch('/:id/change-password', auth(), TeamController.changeTeamPassword);

module.exports = router;
