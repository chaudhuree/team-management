const { verifyToken } = require('../utils/jwt.utils');
const AppError = require('../errors/AppError');
const prisma = require('../utils/prisma');
const catchAsync = require('../utils/catchAsync');

const auth = (...requiredRoles) => {
  return catchAsync(async (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      throw new AppError('You are not authorized', 401);
    }

    const decoded = verifyToken(token);

    if (!decoded.userId) {
      throw new AppError('Invalid token', 401);
    }

    const user = await prisma.user.findUnique({
      where: {
        id: decoded.userId,
      },
      include: {
        team: {
          select: {
            id: true,
            name: true,
            logo: true,
          }
        },
        department: {
          select: {
            id: true,
            name: true,
          }
        }
      }
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    if (requiredRoles.length && !requiredRoles.includes(user.role)) {
      throw new AppError('You are not authorized', 403);
    }

    // Set teamId explicitly from decoded token or user's team relation
    req.user = user;
    req.user.teamId = decoded.teamId || user.teamId || (user.team ? user.team.id : null);
    
    // Log the user context for debugging
    console.log('Auth middleware user context:', {
      userId: req.user.id,
      teamId: req.user.teamId,
      isTeamLeader: req.user.isTeamLeader
    });
    
    next();
  });
};

module.exports = auth;
