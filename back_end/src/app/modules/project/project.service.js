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

  // Ensure deadline is a valid ISO date string
  let formattedDeadline;
  try {
    formattedDeadline = new Date(deadline).toISOString();
  } catch (error) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid deadline format');
  }

  // Create project with initial NOT_STARTED status
  const project = await prisma.project.create({
    data: {
      name,
      description,
      type,
      price,
      priority,
      deadline: formattedDeadline,
      milestones,
      projectStatus: 'NOT_STARTED',
      creationMonth: new Date().toISOString().slice(0, 7),
      team: {
        connect: { id: teamId },
      },
    },
  });

  // Handle assignments if provided
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
    include: {
      assignments: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              photo: true,
              role: true,
              department: {
                select: {
                  name: true
                }
              }
            }
          }
        }
      },
      notes: {
        orderBy: {
          version: 'desc'
        }
      },
      status: true
    }
  });

  if (!project) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Project not found');
  }

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

  // Check if user is already assigned to this phase
  const existingAssignment = await prisma.projectAssignment.findFirst({
    where: {
      projectId,
      userId,
      phase,
    },
  });

  if (existingAssignment) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'User is already assigned to this phase');
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
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          photo: true,
          role: true,
          department: {
            select: {
              name: true
            }
          }
        }
      },
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
        select: {
          id: true,
          name: true,
          projectStatus: true,
          deadline: true,
          type: true,
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

// Add new method to update project status
const updateProjectStatus = async (projectId, newStatus, comment = '', userId) => {
  if (!projectId) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Project ID is required');
  }

  if (!userId) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'User ID is required for status update');
  }

  const project = await prisma.project.findUnique({
    where: { id: projectId },
  });

  if (!project) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Project not found');
  }

  const oldStatus = project.projectStatus;

  // Create status history entry with proper project connection
  await prisma.projectStatusHistory.create({
    data: {
      oldStatus,
      newStatus,
      comment,
      project: {
        connect: { id: projectId }
      },
      updatedBy: {
        connect: { id: userId }
      }
    },
  });

  const updateData = {
    projectStatus: newStatus,
  };

  if (newStatus === 'DELIVERED') {
    updateData.deliveryDate = new Date().toISOString();
  }

  return prisma.project.update({
    where: { id: projectId },
    data: updateData,
    include: {
      statusHistory: {
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: {
          updatedBy: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      },
    },
  });
};

// Add new method to manage phase status
const updatePhaseStatus = async (projectId, phase, status) => {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
  });

  if (!project) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Project not found');
  }

  // Check if phase status already exists
  const existingStatus = await prisma.projectPhaseStatus.findFirst({
    where: {
      projectId,
      phase,
    },
  });

  if (existingStatus) {
    return prisma.projectPhaseStatus.update({
      where: { id: existingStatus.id },
      data: { status },
    });
  }

  return prisma.projectPhaseStatus.create({
    data: {
      projectId,
      phase,
      status,
    },
  });
};

const deleteProjectAssignment = async (assignmentId) => {
  // First check if the assignment exists
  const assignment = await prisma.projectAssignment.findUnique({
    where: { id: assignmentId },
  });

  if (!assignment) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Assignment not found');
  }

  // Delete the assignment
  const deletedAssignment = await prisma.projectAssignment.delete({
    where: { id: assignmentId },
  });

  return deletedAssignment;
};

const createProjectNote = async (projectId, content, userId, comment = '') => {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
  });

  if (!project) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Project not found');
  }

  // Create the note
  const newNote = await prisma.note.create({
    data: {
      content,
      version: 1,
      project: {
        connect: { id: projectId }
      },
      createdBy: {
        connect: { id: userId }
      },
      comment,
    },
    include: {
      createdBy: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  return newNote;
};

const getProjectStatusHistory = async (projectId) => {
  return prisma.projectStatusHistory.findMany({
    where: { projectId },
    orderBy: { createdAt: 'desc' },
    include: {
      updatedBy: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });
};

const getNoteHistory = async (noteId) => {
  const note = await prisma.note.findUnique({
    where: { id: noteId },
    include: {
      createdBy: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      history: {
        orderBy: {
          version: 'desc',
        },
        include: {
          createdBy: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      },
    },
  });

  if (!note) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Note not found');
  }

  return {
    current: note,
    history: note.history,
  };
};

const updateProjectNote = async (noteId, content, userId, comment = '') => {
  const existingNote = await prisma.note.findUnique({
    where: { id: noteId },
  });

  if (!existingNote) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Note not found');
  }

  // Create a history entry
  await prisma.noteHistory.create({
    data: {
      content: existingNote.content,
      version: existingNote.version,
      note: {
        connect: { id: noteId }
      },
      createdBy: {
        connect: { id: existingNote.createdById }
      },
      comment: existingNote.comment || 'Previous version'
    },
  });

  // Update the existing note
  const updatedNote = await prisma.note.update({
    where: { id: noteId },
    data: {
      content,
      version: existingNote.version + 1,
      comment,
      updatedAt: new Date(),
    },
    include: {
      createdBy: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  return updatedNote;
};

const deleteProjectNote = async (noteId) => {
  // First check if the note exists
  const note = await prisma.note.findUnique({
    where: { id: noteId },
    include: {
      history: true // Include only the history relation
    }
  });

  if (!note) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Note not found');
  }

  // Delete all history entries first
  if (note.history.length > 0) {
    await prisma.noteHistory.deleteMany({
      where: {
        noteId: noteId,
      },
    });
  }

  // Delete the main note
  const deletedNote = await prisma.note.delete({
    where: { id: noteId },
  });

  return deletedNote;
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
  updateProjectStatus,
  updatePhaseStatus,
  deleteProjectAssignment,
  createProjectNote,
  getProjectStatusHistory,
  getNoteHistory,
  updateProjectNote,
  deleteProjectNote,
};
