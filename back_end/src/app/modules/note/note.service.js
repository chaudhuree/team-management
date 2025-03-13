const httpStatus = require('http-status');
const prisma = require('../../utils/prisma');
const ApiError = require('../../errors/ApiError');

const createNote = async (payload) => {
  const { content, projectId } = payload;

  // Get the latest version number for this project's notes
  const latestNote = await prisma.note.findFirst({
    where: {
      projectId,
    },
    orderBy: {
      version: 'desc',
    },
  });

  const version = latestNote ? latestNote.version + 1 : 1;

  const note = await prisma.note.create({
    data: {
      content,
      version,
      project: {
        connect: { id: projectId },
      },
    },
    include: {
      project: true,
    },
  });

  return note;
};

const getProjectNotes = async (projectId) => {
  const notes = await prisma.note.findMany({
    where: {
      projectId,
    },
    orderBy: {
      version: 'desc',
    },
    include: {
      project: true,
    },
  });

  return notes;
};

const updateNote = async (id, payload) => {
  const note = await prisma.note.findUnique({
    where: { id },
    include: {
      project: true,
    },
  });

  if (!note) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Note not found');
  }

  // Create a new version instead of updating the existing one
  const newNote = await prisma.note.create({
    data: {
      content: payload.content,
      version: note.version + 1,
      project: {
        connect: { id: note.projectId },
      },
    },
    include: {
      project: true,
    },
  });

  return newNote;
};

const getNoteHistory = async (projectId) => {
  const notes = await prisma.note.findMany({
    where: {
      projectId,
    },
    orderBy: {
      version: 'desc',
    },
    include: {
      project: true,
    },
  });

  return notes;
};

const deleteNote = async (id) => {
  const note = await prisma.note.findUnique({
    where: { id },
  });

  if (!note) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Note not found');
  }

  await prisma.note.delete({
    where: { id },
  });

  return note;
};

module.exports.NoteService = {
  createNote,
  getProjectNotes,
  updateNote,
  getNoteHistory,
  deleteNote,
};
