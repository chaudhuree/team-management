const httpStatus = require('http-status');
const catchAsync = require('../../utils/catchAsync');
const sendResponse = require('../../utils/sendResponse');
const { ProjectService } = require('./project.service');

// src/app/modules/project/project.controller.js
const createProject = catchAsync(async (req, res) => {
  try {
    const result = await ProjectService.createProject(req.body);
    sendResponse(res, {
      statusCode: httpStatus.CREATED,
      success: true,
      message: 'Project created successfully',
      data: result,
    });
  } catch (error) {
    console.error('Error creating project:', error); // Log the error
    sendResponse(res, {
      statusCode: httpStatus.INTERNAL_SERVER_ERROR,
      success: false,
      message: 'Failed to create project',
      error: error, // Include the error for debugging
    });
  }
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

const getProjectById = catchAsync(async (req, res) => {
  const result = await ProjectService.getProjectById(req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Project retrieved successfully',
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

const updateProjectStatus = catchAsync(async (req, res) => {
  const { status, comment } = req.body;
  const { projectId } = req.params;
  const userId = req.user.id; // Get the user ID from the authenticated request
  
  const result = await ProjectService.updateProjectStatus(projectId, status, comment, userId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Project status updated successfully',
    data: result,
  });
});

const updatePhaseStatus = catchAsync(async (req, res) => {
  const { projectId, phase, status } = req.body;
  const result = await ProjectService.updatePhaseStatus(projectId, phase, status);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Phase status updated successfully',
    data: result,
  });
});

const deleteProjectAssignment = catchAsync(async (req, res) => {
  const { assignmentId } = req.params;
  const result = await ProjectService.deleteProjectAssignment(assignmentId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Assignment deleted successfully',
    data: result,
  });
});

const createProjectNote = catchAsync(async (req, res) => {
  const { projectId, content, parentNoteId, comment } = req.body;
  const result = await ProjectService.createProjectNote(
    projectId,
    content,
    req.user.id,
    parentNoteId,
    comment
  );
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Note created successfully',
    data: result,
  });
});

const getProjectStatusHistory = catchAsync(async (req, res) => {
  const { projectId } = req.params;
  const result = await ProjectService.getProjectStatusHistory(projectId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Status history retrieved successfully',
    data: result,
  });
});

const getNoteHistory = catchAsync(async (req, res) => {
  const { noteId } = req.params;
  const result = await ProjectService.getNoteHistory(noteId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Note history retrieved successfully',
    data: result,
  });
});

const updateProjectNote = catchAsync(async (req, res) => {
  const { noteId } = req.params;
  const { content, comment } = req.body;
  const userId = req.user.id;

  const result = await ProjectService.updateProjectNote(
    noteId,
    content,
    userId,
    comment
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Note updated successfully',
    data: result,
  });
});

const deleteProjectNote = catchAsync(async (req, res) => {
  const { noteId } = req.params;
  
  const result = await ProjectService.deleteProjectNote(noteId);
  
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Note deleted successfully',
    data: result,
  });
});

module.exports = {
  createProject,
  getAllProjects,
  getProjectById,
  getProjectsByPhase,
  getProjectsByMonth,
  updateProject,
  assignUserToProject,
  getUserProjects,
  duplicateProject,
  deleteProject,
  updateProjectStatus,
  updatePhaseStatus,
  deleteProjectAssignment,
  createProjectNote,
  getProjectStatusHistory,
  getNoteHistory,
  updateProjectNote,
  deleteProjectNote,
};
