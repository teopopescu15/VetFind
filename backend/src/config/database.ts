import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// Database configuration
export const databaseConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'VetFind',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
  connectionString: process.env.DATABASE_URL,
  // Connection pool settings
  max: 20, // maximum number of clients in the pool
  idleTimeoutMillis: 30000, // how long a client is allowed to remain idle before being closed
  connectionTimeoutMillis: 2000, // how long to try to connect before timing out
};

// Create connection pool
export const pool = new Pool(
  databaseConfig.connectionString
    ? {
        connectionString: databaseConfig.connectionString,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
      }
    : {
        host: databaseConfig.host,
        port: databaseConfig.port,
        database: databaseConfig.database,
        user: databaseConfig.user,
        password: databaseConfig.password,
        max: databaseConfig.max,
        idleTimeoutMillis: databaseConfig.idleTimeoutMillis,
        connectionTimeoutMillis: databaseConfig.connectionTimeoutMillis,
      }
);

// Test database connection
export const connectDatabase = async (): Promise<void> => {
  try {
    const client = await pool.connect();
    console.log('✅ Database connected successfully to:', databaseConfig.database);

    // Test the connection
    const result = await client.query('SELECT NOW()');
    console.log('📅 Database time:', result.rows[0].now);

    client.release();
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    throw error;
  }
};

// Graceful shutdown
export const closeDatabaseConnection = async (): Promise<void> => {
  await pool.end();
  console.log('Database connection pool closed');
};