const express = require('express');
const router = express.Router();
const userRoutes = require('../modules/user/user.routes');
const teamRoutes = require('../modules/team/team.routes');
const dashboardRoutes = require('../modules/dashboard/dashboard.routes');
const departmentRoutes = require('../modules/department/department.routes');
const projectRoutes = require('../modules/project/project.routes');
const chatRoutes = require('../modules/chat/chat.routes');

const modulesRoutes = [
    {
        path: '/users',
        route: userRoutes
    },
    {
        path: '/teams',
        route: teamRoutes
    },
    {
        path: '/dashboard',
        route: dashboardRoutes
    },
    {
        path: '/departments',
        route: departmentRoutes
    },
    {
        path: '/projects',
        route: projectRoutes
    },
    {
        path: '/chats',
        route: chatRoutes
    }
]

modulesRoutes.forEach(route => {
    router.use(route.path, route.route);
})

module.exports = router;
