const httpStatus = require('http-status');
const catchAsync = require('../../utils/catchAsync');
const sendResponse = require('../../utils/sendResponse');
const { ProjectService } = require('./project.service');

const createProject = catchAsync(async (req, res) => {
  const result = await ProjectService.createProject(req.body);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Project created successfully',
    data: result,
  });
});

const getAllProjects = catchAsync(async (req, res) => {
  const result = await ProjectService.getAllProjects(req.query);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Projects retrieved successfully',
    data: result,
  });
});

const getProjectsByPhase = catchAsync(async (req, res) => {
  const result = await ProjectService.getProjectsByPhase(req.params.phase);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Projects retrieved successfully',
    data: result,
  });
});

const getProjectsByMonth = catchAsync(async (req, res) => {
  const result = await ProjectService.getProjectsByMonth(req.params.month);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Projects retrieved successfully',
    data: result,
  });
});

const updateProject = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await ProjectService.updateProject(id, req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Project updated successfully',
    data: result,
  });
});

const assignUserToProject = catchAsync(async (req, res) => {
  const { projectId, userId, phase } = req.body;
  const result = await ProjectService.assignUserToProject(projectId, userId, phase);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User assigned to project successfully',
    data: result,
  });
});

const getUserProjects = catchAsync(async (req, res) => {
  const result = await ProjectService.getUserProjects(req.params.userId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User projects retrieved successfully',
    data: result,
  });
});

const duplicateProject = catchAsync(async (req, res) => {
  const { projectId, newMonth } = req.body;
  const result = await ProjectService.duplicateProject(projectId, newMonth);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Project duplicated successfully',
    data: result,
  });
});

const deleteProject = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await ProjectService.deleteProject(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Project deleted successfully',
    data: result,
  });
});

module.exports = {
  createProject,
  getAllProjects,
  getProjectsByPhase,
  getProjectsByMonth,
  updateProject,
  assignUserToProject,
  getUserProjects,
  duplicateProject,
  deleteProject,
};
