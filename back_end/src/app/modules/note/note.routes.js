const express = require('express');
const auth = require('../../middlewares/auth');
const {
  createNote,
  getProjectNotes,
  updateNote,
  getNoteHistory,
  deleteNote,
} = require('./note.controller');

const router = express.Router();

router.post(
  '/create',
  auth(),
  createNote
);

router.get(
  '/project/:projectId',
  auth(),
  getProjectNotes
);

router.patch(
  '/:id',
  auth(),
  updateNote
);

router.get(
  '/history/:projectId',
  auth(),
  getNoteHistory
);

router.delete(
  '/:id',
  auth(),
  deleteNote
);

module.exports = router;
