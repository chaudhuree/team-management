const catchAsync = require('../../utils/catchAsync');
const sendResponse = require('../../utils/sendResponse');
const { DepartmentService } = require('./department.service');

/**
 * Create a new department
 */
const createDepartment = catchAsync(async (req, res) => {
  const result = await DepartmentService.createDepartment(req.user.teamId, req.body);
  
  sendResponse(res, {
    success: true,
    statusCode: 201,
    message: 'Department created successfully',
    data: result,
  });
});

/**
 * Get all departments for a team
 */
const getDepartments = catchAsync(async (req, res) => {
  const result = await DepartmentService.getDepartments(req.user.teamId);
  
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Departments retrieved successfully',
    data: result,
  });
});

/**
 * Get department by ID
 */
const getDepartmentById = catchAsync(async (req, res) => {
  const result = await DepartmentService.getDepartmentById(req.params.id, req.user.teamId);
  
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Department retrieved successfully',
    data: result,
  });
});

/**
 * Update department
 */
const updateDepartment = catchAsync(async (req, res) => {
  const result = await DepartmentService.updateDepartment(req.params.id, req.body, req.user.teamId);
  
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Department updated successfully',
    data: result,
  });
});

/**
 * Delete department
 */
const deleteDepartment = catchAsync(async (req, res) => {
  const result = await DepartmentService.deleteDepartment(req.params.id, req.user.teamId);
  
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Department deleted successfully',
    data: result,
  });
});

const DepartmentController = {
  createDepartment,
  getDepartments,
  getDepartmentById,
  updateDepartment,
  deleteDepartment,
};

module.exports = { DepartmentController };
