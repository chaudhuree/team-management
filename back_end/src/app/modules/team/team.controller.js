const catchAsync = require('../../utils/catchAsync');
const sendResponse = require('../../utils/sendResponse');
const { TeamService } = require('./team.service');

/**
 * Register a new team with a team leader
 */
const registerTeam = catchAsync(async (req, res) => {
  console.log('Team registration request body:', req.body);
  const result = await TeamService.registerTeam(req.body);
  
  sendResponse(res, {
    success: true,
    statusCode: 201,
    message: 'Team registered successfully with a team leader',
    data: result,
  });
});

/**
 * Team login
 */
const loginTeam = catchAsync(async (req, res) => {
  const result = await TeamService.loginTeam(req.body);
  
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Team logged in successfully',
    data: result,
  });
});

/**
 * Get team details
 */
const getTeamDetails = catchAsync(async (req, res) => {
  const result = await TeamService.getTeamDetails(req.params.id);
  
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Team details retrieved successfully',
    data: result,
  });
});

/**
 * Create a new department
 */
const createDepartment = catchAsync(async (req, res) => {
  const result = await TeamService.createDepartment(req.params.teamId, req.body);
  
  sendResponse(res, {
    success: true,
    statusCode: 201,
    message: 'Department created successfully',
    data: result,
  });
});

/**
 * Update team details
 */
const updateTeam = catchAsync(async (req, res) => {
  const result = await TeamService.updateTeam(req.params.id, req.body);
  
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Team updated successfully',
    data: result,
  });
});

/**
 * Change team password
 */
const changeTeamPassword = catchAsync(async (req, res) => {
  const result = await TeamService.changeTeamPassword(req.params.id, req.body);
  
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Team password changed successfully',
    data: result,
  });
});

const TeamController = {
  registerTeam,
  loginTeam,
  getTeamDetails,
  createDepartment,
  updateTeam,
  changeTeamPassword,
};

module.exports = { TeamController };
