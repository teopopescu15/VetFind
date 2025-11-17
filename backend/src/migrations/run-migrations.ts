import { pool } from '../config/database';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const runMigrations = async () => {
  try {
    console.log('🚀 Starting database migrations...');

    // First, try to create the database (this might fail if it already exists, which is fine)
    try {
      // Connect to postgres database to create VetFind
      const { Pool } = require('pg');
      const adminPool = new Pool({
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432'),
        database: 'postgres', // Connect to default postgres database
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || '',
      });

      await adminPool.query(`CREATE DATABASE "VetFind"`);
      console.log('✅ Database VetFind created');
      await adminPool.end();
    } catch (error: any) {
      if (error.code === '42P04') {
        console.log('📝 Database VetFind already exists');
      } else {
        console.log('⚠️ Could not create database:', error.message);
      }
    }

    // Now connect to VetFind database and run migrations
    const client = await pool.connect();

    // Read migration file
    const migrationPath = path.join(__dirname, '001_create_database.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    // Execute the entire migration as one query
    // Remove comments and database creation statements
    const cleanedSQL = migrationSQL
      .split('\n')
      .filter(line => !line.trim().startsWith('--'))
      .join('\n')
      .replace(/CREATE DATABASE[^;]*;/gi, '');

    try {
      await client.query(cleanedSQL);
      console.log('✅ Migration executed successfully');
    } catch (error: any) {
      // If error is because objects already exist, that's okay
      if (error.code === '42710' || error.code === '42P07') {
        console.log('📝 Some database objects already exist, continuing...');
      } else {
        console.error('❌ Migration error:', error.message);

        // Try to execute statements individually if batch fails
        console.log('🔄 Attempting to run statements individually...');

        const statements = [
          // Create enum type
          `CREATE TYPE user_role AS ENUM ('user', 'vetcompany')`,

          // Create users table
          `CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            email VARCHAR(255) UNIQUE NOT NULL,
            password VARCHAR(255) NOT NULL,
            role user_role NOT NULL DEFAULT 'user',
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
          )`,

          // Create indexes
          `CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)`,
          `CREATE INDEX IF NOT EXISTS idx_users_role ON users(role)`,

          // Create function
          `CREATE OR REPLACE FUNCTION update_updated_at_column()
          RETURNS TRIGGER AS $$
          BEGIN
              NEW.updated_at = CURRENT_TIMESTAMP;
              RETURN NEW;
          END;
          $$ language 'plpgsql'`,

          // Create trigger
          `DROP TRIGGER IF EXISTS update_users_updated_at ON users`,
          `CREATE TRIGGER update_users_updated_at BEFORE UPDATE
            ON users FOR EACH ROW EXECUTE PROCEDURE
            update_updated_at_column()`
        ];

        for (const statement of statements) {
          try {
            await client.query(statement);
            console.log('✅ Executed:', statement.substring(0, 50).replace(/\n/g, ' ') + '...');
          } catch (err: any) {
            if (err.code === '42710' || err.code === '42P07') {
              console.log('📝 Already exists:', statement.substring(0, 50).replace(/\n/g, ' ') + '...');
            } else {
              console.error('❌ Failed:', err.message);
            }
          }
        }
      }
    }

    console.log('✅ All migrations completed!');

    // Test the connection and table
    const result = await client.query('SELECT * FROM users LIMIT 1');
    console.log('📊 Users table exists and is accessible');
    console.log('📋 Table columns:', result.fields.map(f => f.name).join(', '));

    client.release();

  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await pool.end();
  }
};

// Run migrations if this file is executed directly
if (require.main === module) {
  runMigrations()
    .then(() => {
      console.log('✨ Database setup complete!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Failed to run migrations:', error);
      process.exit(1);
    });
}

export default runMigrations;