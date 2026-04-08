export const serverConfig = {
    port: process.env.PORT || 3100,
    corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    environment: process.env.NODE_ENV || 'development'
};
