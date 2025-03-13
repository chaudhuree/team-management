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
  assignUserToProject,
  getUserProjects,
  duplicateProject,
  deleteProject,
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

module.exports = router;
