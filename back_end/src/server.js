const app = require('./app');
const config = require('./config');
const prisma = require('./app/utils/prisma');
const { Server } = require('socket.io');
const { initializeSocket } = require('./app/utils/socket');
const { startDeadlineChecker } = require('./app/utils/cronJobs');

async function bootstrap() {
  try {
    await prisma.$connect();
    console.log('🗄️ Database connection successful');

    const server = app.listen(config.port, () => {
      console.log(`🚀 Server running on port ${config.port}`);
    });

    // Initialize Socket.IO
    initializeSocket(server);
    console.log('🔌 Socket.IO initialized');

    // Start cron jobs
    startDeadlineChecker();
    console.log('⏰ Cron jobs initialized');
  } catch (error) {
    console.error('Failed to connect database:', error);
  }
}

bootstrap();
