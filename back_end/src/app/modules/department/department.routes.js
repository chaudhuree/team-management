const express = require('express');
const { DepartmentController } = require('./department.controller');
const auth = require('../../middlewares/auth');
const { UserRole } = require('@prisma/client');

const router = express.Router();

// All routes require authentication
router.use(auth());

// Routes for all team members
router.get('/', DepartmentController.getDepartments);
router.get('/:id', DepartmentController.getDepartmentById);

// Routes only for team leader
router.post('/', DepartmentController.createDepartment);
router.patch('/:id', DepartmentController.updateDepartment);
router.delete('/:id', DepartmentController.deleteDepartment);

module.exports = router;
