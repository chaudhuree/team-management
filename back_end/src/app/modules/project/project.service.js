const httpStatus = require('http-status');
const prisma = require('../../utils/prisma');
const ApiError = require('../../errors/ApiError');
const { checkDeadlines } = require('../../utils/cronJobs');

const createProject = async (payload) => {
  const {
    name,
    description,
    type,
    price,
    priority,
    deadline,
    milestones,
    teamId,
    assignedUsers,
  } = payload;

  // Create project with initial status based on type
  const initialStatus = [];
  if (type === 'FULL_STACK' || type === 'FRONTEND_ONLY') {
    initialStatus.push('Frontend/Started');
  }
  if (type === 'FULL_STACK') {
    initialStatus.push('Backend/Started');
  }
  if (type === 'FULL_STACK' || type === 'UI_ONLY') {
    initialStatus.push('UI/Started');
  }

  // Ensure deadline is a valid ISO date string
  let formattedDeadline;
  try {
    formattedDeadline = new Date(deadline).toISOString();
  } catch (error) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid deadline format. Please provide a valid date.');
  }

  const project = await prisma.project.create({
    data: {
      name,
      description,
      type,
      price,
      priority,
      deadline: formattedDeadline,
      milestones,
      status: initialStatus,
      creationMonth: new Date().toISOString().slice(0, 7), // YYYY-MM format
      team: {
        connect: { id: teamId },
      },
    },
  });

  // Assign users if provided
  if (assignedUsers && assignedUsers.length > 0) {
    const assignments = assignedUsers.map((assignment) => ({
      userId: assignment.userId,
      phase: assignment.phase,
      projectId: project.id,
    }));

    await prisma.projectAssignment.createMany({
      data: assignments,
    });
  }

  // Start deadline checker for the project
  checkDeadlines();

  return project;
};

const getAllProjects = async (filters) => {
  const { teamId, priority, month, search } = filters;
  const where = {};

  if (teamId) {
    where.teamId = teamId;
  }

  if (priority) {
    where.priority = priority;
  }

  if (month) {
    where.creationMonth = month;
  }

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ];
  }

  const projects = await prisma.project.findMany({
    where,
    include: {
      assignments: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              photo: true,
            },
          },
        },
      },
      notes: {
        orderBy: {
          version: 'desc',
        },
        take: 1,
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return projects;
};

const getProjectById = async (id) => {
  const project = await prisma.project.findUnique({
    where: { id },
  });
  return project;
};

const getProjectsByPhase = async (phase) => {
  const projects = await prisma.project.findMany({
    where: {
      OR: [
        { type: 'FULL_STACK' },
        ...(phase === 'FRONTEND' ? [{ type: 'FRONTEND_ONLY' }] : []),
        ...(phase === 'UI' ? [{ type: 'UI_ONLY' }] : []),
      ],
    },
    include: {
      assignments: {
        where: {
          phase,
        },
        include: {
          user: true,
        },
      },
    },
  });

  return projects;
};

const getProjectsByMonth = async (month) => {
  const projects = await prisma.project.findMany({
    where: {
      creationMonth: month,
    },
    include: {
      assignments: {
        include: {
          user: true,
        },
      },
    },
  });

  return projects;
};

const updateProject = async (id, payload) => {
  const project = await prisma.project.findUnique({
    where: { id },
  });

  if (!project) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Project not found');
  }

  const updatedProject = await prisma.project.update({
    where: { id },
    data: payload,
    include: {
      assignments: {
        include: {
          user: true,
        },
      },
    },
  });

  // Check deadlines after update
  if (payload.deadline) {
    checkDeadlines();
  }

  return updatedProject;
};

const assignUserToProject = async (projectId, userId, phase) => {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
  });

  if (!project) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Project not found');
  }

  const assignment = await prisma.projectAssignment.create({
    data: {
      project: {
        connect: { id: projectId },
      },
      user: {
        connect: { id: userId },
      },
      phase,
    },
    include: {
      user: true,
      project: true,
    },
  });

  return assignment;
};

const getUserProjects = async (userId) => {
  const assignments = await prisma.projectAssignment.findMany({
    where: {
      userId,
    },
    include: {
      project: {
        include: {
          assignments: {
            include: {
              user: true,
            },
          },
        },
      },
    },
  });

  return assignments;
};

const duplicateProject = async (projectId, newMonth) => {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      assignments: true,
    },
  });

  if (!project) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Project not found');
  }

  const {
    id,
    createdAt,
    updatedAt,
    creationMonth,
    assignments,
    ...projectData
  } = project;

  const duplicatedProject = await prisma.project.create({
    data: {
      ...projectData,
      creationMonth: newMonth,
      assignments: {
        create: assignments.map(({ id, createdAt, updatedAt, ...assignment }) => assignment),
      },
    },
    include: {
      assignments: {
        include: {
          user: true,
        },
      },
    },
  });

  return duplicatedProject;
};

const deleteProject = async (id) => {
  const project = await prisma.project.findUnique({
    where: { id },
  });

  if (!project) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Project not found');
  }

  // Delete all related assignments and notes first
  await prisma.$transaction([
    prisma.projectAssignment.deleteMany({
      where: { projectId: id },
    }),
    prisma.note.deleteMany({
      where: { projectId: id },
    }),
    prisma.project.delete({
      where: { id },
    }),
  ]);

  return project;
};

module.exports.ProjectService = {
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
};
