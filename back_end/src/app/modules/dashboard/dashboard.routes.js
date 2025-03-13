const express = require('express');
const DashboardController = require('./dashboard.controller');
const auth = require('../../middlewares/auth');

const router = express.Router();

// Get dashboard statistics - requires authentication
router.get('/stats', auth(), DashboardController.getDashboardStats);

module.exports = router;
