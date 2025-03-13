const express = require('express');
const auth = require('../../middlewares/auth');
const { ENUM_USER_ROLE } = require('../../utils/constants');
const {
  createProject,
  getAllProjects,
  getProjectById,
  getProjectsByPhase,
  getProjectsByMonth,
  updateProject,
  updateProjectStatus,
  assignUserToProject,
  getUserProjects,
  duplicateProject,
  deleteProject,
  deleteProjectAssignment,
  createProjectNote,
  getProjectStatusHistory,
  getNoteHistory,
  updateProjectNote,
  deleteProjectNote,
} = require('./project.controller');

const router = express.Router();

router.post(
  '/create',
  auth(ENUM_USER_ROLE.LEADER),
  createProject
);

router.get(
  '/',
  auth(),
  getAllProjects
);

router.get(
  '/phase/:phase',
  auth(),
  getProjectsByPhase
);

router.get(
  '/month/:month',
  auth(),
  getProjectsByMonth
);

router.patch(
  '/:id',
  auth(ENUM_USER_ROLE.LEADER),
  updateProject
);

router.post(
  '/assign',
  auth(ENUM_USER_ROLE.LEADER),
  assignUserToProject
);

router.get(
  '/user/:userId',
  auth(),
  getUserProjects
);

router.post(
  '/duplicate',
  auth(ENUM_USER_ROLE.LEADER),
  duplicateProject
);

router.delete(
  '/:id',
  auth(ENUM_USER_ROLE.LEADER),
  deleteProject
);

router.get(
  '/:id',
  auth(),
  getProjectById
);

router.delete(
  '/assignments/:assignmentId',
  auth(ENUM_USER_ROLE.LEADER),
  deleteProjectAssignment
);

router.post(
  '/:projectId/status',
  auth(ENUM_USER_ROLE.LEADER),
  updateProjectStatus
);

router.post(
  '/notes',
  auth(),
  createProjectNote
);

router.get(
  '/:projectId/status-history',
  auth(),
  getProjectStatusHistory
);

router.get(
  '/notes/:noteId/history',
  auth(),
  getNoteHistory
);

router.patch(
  '/notes/:noteId',
  auth(),
  updateProjectNote
);

router.delete(
  '/notes/:noteId',
  auth(ENUM_USER_ROLE.LEADER),
  deleteProjectNote
);

module.exports = router;
