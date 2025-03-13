const prisma = require('../../utils/prisma');
const AppError = require('../../errors/AppError');
const bcrypt = require('bcryptjs');
const { createToken } = require('../../utils/jwt.utils');

/**
 * Register a new team with a team leader
 */
const registerTeam = async (teamData) => {
  console.log('Team data received in service:', teamData);
  
  // Extract data, handling both name and teamName for compatibility
  const name = teamData.name || teamData.teamName;
  const { password, logo } = teamData;

  if (!name) {
    throw new AppError('Team name is required', 400);
  }

  // Check if team already exists
  const existingTeam = await prisma.team.findUnique({
    where: {
      name,
    },
  });

  if (existingTeam) {
    throw new AppError('Team already exists with this name', 400);
  }

  // Hash team password
  const hashedPassword = await bcrypt.hash(password, 12);

  // Create team transaction
  const result = await prisma.$transaction(async (tx) => {
    // Create team
    const team = await tx.team.create({
      data: {
        name,
        password: hashedPassword,
        logo,
      },
    });

    // Create default departments (Frontend, Backend, UI)
    const departments = await Promise.all([
      tx.department.create({
        data: {
          name: 'Frontend',
          teamId: team.id,
        },
      }),
      tx.department.create({
        data: {
          name: 'Backend',
          teamId: team.id,
        },
      }),
      tx.department.create({
        data: {
          name: 'UI',
          teamId: team.id,
        },
      }),
    ]);

    // Create team leader account
    const leaderPassword = await bcrypt.hash('123456', 12);
    const leaderUsername = `${name.toLowerCase().replace(/\s+/g, '')}_leader`;
    
    const leader = await tx.user.create({
      data: {
        name: `${name} Leader`,
        email: `${leaderUsername}@${name.toLowerCase().replace(/\s+/g, '')}.com`,
        password: leaderPassword,
        role: 'LEADER',
        isTeamLeader: true,
        isApproved: true,
        teamId: team.id,
        departmentId: departments[0].id, // Default to Frontend department
      },
    });

    return {
      team,
      leader: {
        id: leader.id,
        name: leader.name,
        email: leader.email,
        role: leader.role,
      },
      leaderPassword: '123456', // Return the default password for the leader
    };
  });

  return result;
};

/**
 * Team login
 */
const loginTeam = async (loginData) => {
  const { name, password } = loginData;

  const team = await prisma.team.findUnique({
    where: {
      name,
    },
  });

  if (!team) {
    throw new AppError('Team not found', 404);
  }

  const isPasswordValid = await bcrypt.compare(password, team.password);
  if (!isPasswordValid) {
    throw new AppError('Invalid credentials', 401);
  }

  // Find team leader
  const teamLeader = await prisma.user.findFirst({
    where: {
      teamId: team.id,
      isTeamLeader: true,
    },
  });

  if (!teamLeader) {
    throw new AppError('Team leader not found', 404);
  }

  const token = createToken({ userId: teamLeader.id, teamId: team.id });

  return {
    token,
    team: {
      id: team.id,
      name: team.name,
      logo: team.logo,
    },
    user: {
      id: teamLeader.id,
      name: teamLeader.name,
      email: teamLeader.email,
      role: teamLeader.role,
    },
  };
};

/**
 * Get team details
 */
const getTeamDetails = async (teamId) => {
  const team = await prisma.team.findUnique({
    where: {
      id: teamId,
    },
    include: {
      members: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          isApproved: true,
          isTeamLeader: true,
          department: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
      departments: true,
    },
  });

  if (!team) {
    throw new AppError('Team not found', 404);
  }

  return team;
};

/**
 * Create a new department
 */
const createDepartment = async (teamId, departmentData) => {
  const { name } = departmentData;

  // Check if department already exists in the team
  const existingDepartment = await prisma.department.findFirst({
    where: {
      name,
      teamId,
    },
  });

  if (existingDepartment) {
    throw new AppError('Department already exists in this team', 400);
  }

  const department = await prisma.department.create({
    data: {
      name,
      teamId,
    },
  });

  return department;
};

/**
 * Update team details
 */
const updateTeam = async (teamId, updateData) => {
  const { name, logo } = updateData;

  // Check if team exists
  const team = await prisma.team.findUnique({
    where: {
      id: teamId,
    },
  });

  if (!team) {
    throw new AppError('Team not found', 404);
  }

  // If name is being updated, check if it's already taken
  if (name && name !== team.name) {
    const existingTeam = await prisma.team.findUnique({
      where: {
        name,
      },
    });

    if (existingTeam) {
      throw new AppError('Team name already exists', 400);
    }
  }

  const updatedTeam = await prisma.team.update({
    where: {
      id: teamId,
    },
    data: {
      name,
      logo,
    },
  });

  return updatedTeam;
};

/**
 * Change team password
 */
const changeTeamPassword = async (teamId, passwordData) => {
  const { currentPassword, newPassword } = passwordData;

  // Check if team exists
  const team = await prisma.team.findUnique({
    where: {
      id: teamId,
    },
  });

  if (!team) {
    throw new AppError('Team not found', 404);
  }

  // Verify current password
  const isPasswordValid = await bcrypt.compare(currentPassword, team.password);
  if (!isPasswordValid) {
    throw new AppError('Current password is incorrect', 401);
  }

  // Hash new password
  const hashedPassword = await bcrypt.hash(newPassword, 12);

  // Update team password
  await prisma.team.update({
    where: {
      id: teamId,
    },
    data: {
      password: hashedPassword,
    },
  });

  return { message: 'Team password updated successfully' };
};

const TeamService = {
  registerTeam,
  loginTeam,
  getTeamDetails,
  createDepartment,
  updateTeam,
  changeTeamPassword,
};

module.exports = { TeamService };
