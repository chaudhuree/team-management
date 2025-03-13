const httpStatus = require('http-status');
const catchAsync = require('../../utils/catchAsync');
const sendResponse = require('../../utils/sendResponse');
const { NoteService } = require('./note.service');

const createNote = catchAsync(async (req, res) => {
  const result = await NoteService.createNote(req.body);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Note created successfully',
    data: result,
  });
});

const getProjectNotes = catchAsync(async (req, res) => {
  const result = await NoteService.getProjectNotes(req.params.projectId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Notes retrieved successfully',
    data: result,
  });
});

const updateNote = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await NoteService.updateNote(id, req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Note updated successfully',
    data: result,
  });
});

const getNoteHistory = catchAsync(async (req, res) => {
  const result = await NoteService.getNoteHistory(req.params.projectId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Note history retrieved successfully',
    data: result,
  });
});

const deleteNote = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await NoteService.deleteNote(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Note deleted successfully',
    data: result,
  });
});

module.exports = {
  createNote,
  getProjectNotes,
  updateNote,
  getNoteHistory,
  deleteNote,
};
