require('dotenv').config();

module.exports = {
  env: process.env.NODE_ENV,
  port: process.env.PORT,
  database_url: process.env.DATABASE_URL,
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN,
  },
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  spaces: {
    endpoint: process.env.DO_SPACE_ENDPOINT,
    accessKey: process.env.DO_SPACE_ACCESS_KEY,
    secretKey: process.env.DO_SPACE_SECRET_KEY,
    bucket: process.env.DO_SPACE_BUCKET,
  },
};
