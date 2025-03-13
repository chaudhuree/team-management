const catchAsync = require('../../utils/catchAsync');
const sendResponse = require('../../utils/sendResponse');
const { DashboardService } = require('./dashboard.service');

/**
 * Get dashboard statistics
 */
const getDashboardStats = catchAsync(async (req, res) => {
  const userId = req.user.id;
  const result = await DashboardService.getDashboardStats(userId);
  
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Dashboard statistics retrieved successfully',
    data: result,
  });
});

const DashboardController = {
  getDashboardStats,
};

module.exports = DashboardController;
