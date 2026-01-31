import { GenericContainer, Wait } from 'testcontainers';
import mysql from 'mysql2/promise';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Test database setup using testcontainers
 * Creates a disposable MySQL database seeded with init.sql
 */
export class TestDatabase {
  constructor() {
    this.container = null;
    this.pool = null;
    this.config = null;
  }

  /**
   * Start MySQL container and initialize database
   */
  async start() {
    console.log('Starting MySQL test container...');
    
    // Start MySQL container
    this.container = await new GenericContainer('mysql:8.3.0')
      .withEnvironment({
        MYSQL_ROOT_PASSWORD: 'testroot',
        MYSQL_DATABASE: 'embr',
        MYSQL_USER: 'testuser',
        MYSQL_PASSWORD: 'testpw',
      })
      .withExposedPorts(3306)
      .withWaitStrategy(Wait.forLogMessage(/ready for connections/))
      .withStartupTimeout(120000)
      .start();

    const host = this.container.getHost();
    const port = this.container.getMappedPort(3306);

    this.config = {
      host,
      port,
      user: 'testuser',
      password: 'testpw',
      database: 'embr',
      waitForConnections: true,
      connectionLimit: 10,
    };

    console.log(`MySQL container started at ${host}:${port}`);

    // Create connection pool
    this.pool = mysql.createPool(this.config);

    // Wait for MySQL to be ready and seed the database
    await this.seedDatabase();

    return this.config;
  }

  /**
   * Seed the database with init.sql
   */
  async seedDatabase() {
    console.log('Seeding database with init.sql...');
    
    const initSqlPath = path.join(__dirname, '../../../docker/ddl/init.sql');
    const sql = await fs.readFile(initSqlPath, 'utf-8');

    // Split SQL by statements (simple approach - may need adjustment for complex SQL)
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    let connection;
    try {
      connection = await this.pool.getConnection();
      
      for (const statement of statements) {
        try {
          await connection.query(statement);
        } catch (error) {
          // Log but continue - some statements may fail (e.g., CREATE DATABASE IF NOT EXISTS)
          if (!error.message.includes('database exists')) {
            console.warn(`Warning executing SQL: ${error.message}`);
          }
        }
      }
      
      console.log('Database seeded successfully');
    } finally {
      if (connection) connection.release();
    }
  }

  /**
   * Get database connection pool
   */
  getPool() {
    return this.pool;
  }

  /**
   * Get database configuration
   */
  getConfig() {
    return this.config;
  }

  /**
   * Clean up database (truncate all tables but keep structure)
   */
  async cleanup() {
    if (!this.pool) return;

    let connection;
    try {
      connection = await this.pool.getConnection();
      
      // Disable foreign key checks
      await connection.query('SET FOREIGN_KEY_CHECKS = 0');
      
      // Truncate tables in reverse order of dependencies
      const tables = [
        'temperature',
        'battery',
        'position',
        'hotspot',
        'bot_mission_assignment',
        'mission',
        'bot',
      ];
      
      for (const table of tables) {
        await connection.query(`TRUNCATE TABLE ${table}`);
      }
      
      // Re-enable foreign key checks
      await connection.query('SET FOREIGN_KEY_CHECKS = 1');
      
      console.log('Database cleaned');
    } finally {
      if (connection) connection.release();
    }
  }

  /**
   * Stop container and close connections
   */
  async stop() {
    if (this.pool) {
      await this.pool.end();
      this.pool = null;
    }

    if (this.container) {
      await this.container.stop();
      this.container = null;
    }

    console.log('Test database stopped');
  }
}

/**
 * Create a test database instance for integration tests
 */
export async function createTestDatabase() {
  const testDb = new TestDatabase();
  await testDb.start();
  return testDb;
}
