const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Get dashboard statistics for a user
 */
const getDashboardStats = async (userId) => {
  // Get user info to determine if they're a team leader
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { team: true }
  });

  if (!user) {
    throw new Error('User not found');
  }

  const teamId = user.teamId;
  const isLeader = user.role === 'LEADER';

  // Get team members count
  const totalMembers = await prisma.user.count({
    where: { teamId }
  });

  // Get active projects count
  const activeProjects = await prisma.project.count({
    where: {
      teamId,
      NOT: {
        status: {
          hasSome: ['COMPLETED', 'CANCELLED']
        }
      }
    }
  });

  // Get pending notifications count
  const pendingNotifications = await prisma.notification.count({
    where: {
      userId,
      isRead: false
    }
  });

  // Get recent projects
  const recentProjects = await prisma.project.findMany({
    where: { teamId },
    orderBy: { createdAt: 'desc' },
    take: 5,
    include: {
      assignments: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              role: true
            }
          }
        }
      }
    }
  });

  // Format recent projects for the frontend
  const formattedRecentProjects = recentProjects.map(project => ({
    id: project.id,
    name: project.name,
    type: project.type,
    deadline: project.deadline,
    status: project.status,
    assignedUsers: project.assignments.map(assignment => ({
      id: assignment.user.id,
      name: assignment.user.name,
      role: assignment.user.role
    }))
  }));

  return {
    totalMembers,
    activeProjects,
    pendingNotifications,
    recentProjects: formattedRecentProjects
  };
};

const DashboardService = {
  getDashboardStats
};

module.exports = { DashboardService };
