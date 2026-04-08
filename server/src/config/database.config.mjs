import mysql from 'mysql2/promise';

export const dbConfig = {
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "testuser",
    password: process.env.DB_PASSWORD || "pw",
    database: process.env.DB_NAME || "embr",
    port: 3306,
    waitForConnections: true,
    connectionLimit: 5,
    maxIDle: 10,
    idleTimeout: 120000,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0,
};

export const pool = mysql.createPool(dbConfig);
