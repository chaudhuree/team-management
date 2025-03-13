const cron = require('node-cron');
const prisma = require('./prisma');
const { getIO } = require('./socket');

// Initialize cron job to check project deadlines
let deadlineJob;

/**
 * Check project deadlines and send notifications for projects with deadlines approaching
 * - 4 days left: Warning notification (orange)
 * - 1 day left: Urgent notification (red)
 */
const checkDeadlines = async () => {
  try {
    const now = new Date();
    const projects = await prisma.project.findMany({
      include: {
        team: true,
        assignments: {
          include: {
            user: true,
          },
        },
      },
    });

    for (const project of projects) {
      const deadline = new Date(project.deadline);
      const daysLeft = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24));

      // Check if deadline is 4 days or 1 day away
      if (daysLeft === 4 || daysLeft === 1) {
        // Get team leader
        const teamLeader = await prisma.user.findFirst({
          where: {
            teamId: project.teamId,
            isTeamLeader: true,
          },
        });

        // Create notification for team leader
        if (teamLeader) {
          await createDeadlineNotification(
            teamLeader.id,
            project,
            daysLeft
          );
        }

        // Create notifications for assigned users
        for (const assignment of project.assignments) {
          await createDeadlineNotification(
            assignment.user.id,
            project,
            daysLeft
          );
        }

        // Send real-time notification via Socket.IO
        const io = getIO();
        if (io) {
          io.to(`team_${project.teamId}`).emit('deadlineAlert', {
            projectId: project.id,
            projectName: project.name,
            daysLeft,
            deadline: project.deadline,
          });
        }
      }
    }
  } catch (error) {
    console.error('Error checking deadlines:', error);
  }
};

/**
 * Create a deadline notification for a user
 */
const createDeadlineNotification = async (userId, project, daysLeft) => {
  const urgency = daysLeft === 1 ? 'URGENT' : 'WARNING';
  
  await prisma.notification.create({
    data: {
      title: `${urgency}: Project Deadline Approaching`,
      content: `Project "${project.name}" has ${daysLeft} day${daysLeft > 1 ? 's' : ''} left until the deadline.`,
      type: 'DEADLINE',
      isRead: false,
      userId,
    },
  });
};

/**
 * Start the cron job to check deadlines daily at midnight
 */
const startDeadlineChecker = () => {
  // Stop existing job if it's running
  if (deadlineJob) {
    deadlineJob.stop();
  }

  // Schedule job to run at midnight every day
  deadlineJob = cron.schedule('0 0 * * *', async () => {
    console.log('Running deadline check job...');
    await checkDeadlines();
  });

  console.log('Deadline checker scheduled');
};

module.exports = {
  checkDeadlines,
  startDeadlineChecker,
}; 