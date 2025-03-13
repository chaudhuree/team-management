const { PrismaClient } = require('@prisma/client');
const ApiError = require('../../errors/ApiError');
const httpStatus = require('http-status');

const prisma = new PrismaClient();

/**
 * Create a new department
 * @param {string} teamId - Team ID
 * @param {object} departmentData - Department data
 * @returns {Promise<object>} - Created department
 */
const createDepartment = async (teamId, departmentData) => {
  // Check if department already exists for the team
  const existingDepartment = await prisma.department.findFirst({
    where: {
      name: departmentData.name,
      teamId,
    },
  });

  if (existingDepartment) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Department already exists for this team');
  }

  // Create department
  const department = await prisma.department.create({
    data: {
      name: departmentData.name,
      teamId,
    },
  });

  return department;
};

/**
 * Get all departments for a team
 * @param {string} teamId - Team ID
 * @returns {Promise<Array>} - List of departments
 */
const getDepartments = async (teamId) => {
  const departments = await prisma.department.findMany({
    where: {
      teamId,
    },
    include: {
      _count: {
        select: {
          members: true,
        },
      },
    },
  });

  return departments;
};

/**
 * Get department by ID
 * @param {string} id - Department ID
 * @param {string} teamId - Team ID
 * @returns {Promise<object>} - Department
 */
const getDepartmentById = async (id, teamId) => {
  const department = await prisma.department.findFirst({
    where: {
      id,
      teamId,
    },
    include: {
      members: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          isTeamLeader: true,
          photo: true,
        },
      },
    },
  });

  if (!department) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Department not found');
  }

  return department;
};

/**
 * Update department
 * @param {string} id - Department ID
 * @param {object} updateData - Department update data
 * @param {string} teamId - Team ID
 * @returns {Promise<object>} - Updated department
 */
const updateDepartment = async (id, updateData, teamId) => {
  // Check if department exists
  const department = await prisma.department.findFirst({
    where: {
      id,
      teamId,
    },
  });

  if (!department) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Department not found');
  }

  // Check if department name already exists
  if (updateData.name) {
    const existingDepartment = await prisma.department.findFirst({
      where: {
        name: updateData.name,
        teamId,
        id: {
          not: id,
        },
      },
    });

    if (existingDepartment) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Department name already exists');
    }
  }

  // Update department
  const updatedDepartment = await prisma.department.update({
    where: {
      id,
    },
    data: updateData,
  });

  return updatedDepartment;
};

/**
 * Delete department
 * @param {string} id - Department ID
 * @param {string} teamId - Team ID
 * @returns {Promise<object>} - Deleted department
 */
const deleteDepartment = async (id, teamId) => {
  // Check if department exists
  const department = await prisma.department.findFirst({
    where: {
      id,
      teamId,
    },
    include: {
      members: true,
    },
  });

  if (!department) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Department not found');
  }

  // Check if department has members
  if (department.members.length > 0) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      'Cannot delete department with members. Please reassign members first.'
    );
  }

  // Check if it's one of the default departments
  if (['Frontend', 'Backend', 'UI'].includes(department.name)) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      'Cannot delete default departments (Frontend, Backend, UI)'
    );
  }

  // Delete department
  const deletedDepartment = await prisma.department.delete({
    where: {
      id,
    },
  });

  return deletedDepartment;
};

const DepartmentService = {
  createDepartment,
  getDepartments,
  getDepartmentById,
  updateDepartment,
  deleteDepartment,
};

module.exports = { DepartmentService };
