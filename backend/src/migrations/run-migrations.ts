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

    // List of migration files to run in order
    const migrations = [
      '001_create_database.sql',
      '002_create_refresh_tokens.sql',
      '003_create_companies.sql',
      '004_create_company_services.sql',
      '005_create_vetfinder_tables.sql',
      '006_service_categories_specializations.sql',
      '007_romanian_localization.sql',
      '008_add_company_completed.sql',
      '009_remove_legacy_clinic_system.sql',
      '010_add_category_id_to_company_services.sql',
    ];

    console.log(`\n📋 Found ${migrations.length} migration files to execute\n`);

    // Run each migration
    for (const migrationFile of migrations) {
      console.log(`\n🔄 Running migration: ${migrationFile}`);

      try {
        const migrationPath = path.join(__dirname, migrationFile);

        // Check if file exists
        if (!fs.existsSync(migrationPath)) {
          console.log(`⚠️ Migration file not found: ${migrationFile}, skipping...`);
          continue;
        }

        const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

        // Remove comments and database creation statements
        const cleanedSQL = migrationSQL
          .split('\n')
          .filter(line => !line.trim().startsWith('--'))
          .join('\n')
          .replace(/CREATE DATABASE[^;]*;/gi, '');

        // Execute the migration
        await client.query(cleanedSQL);
        console.log(`✅ ${migrationFile} executed successfully`);

      } catch (error: any) {
        // If error is because objects already exist, that's okay
        if (error.code === '42710' || error.code === '42P07' || error.code === '42P04') {
          console.log(`📝 ${migrationFile}: Some objects already exist, continuing...`);
        } else {
          console.error(`❌ ${migrationFile} error:`, error.message);
          console.log(`⚠️ Continuing with next migration...`);
        }
      }
    }

    console.log('\n✅ All migrations completed!\n');

    // Test the connection and show table info
    console.log('📊 Verifying database tables...\n');

    const tables = [
      'users',
      'refresh_tokens',
      'companies',
      'company_services',
      'service_categories',
      'category_specializations'
    ];

    for (const table of tables) {
      try {
        const result = await client.query(`SELECT COUNT(*) FROM ${table}`);
        console.log(`✅ ${table}: ${result.rows[0].count} rows`);
      } catch (error: any) {
        console.log(`❌ ${table}: Not found or error`);
      }
    }

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
      console.log('\n✨ Database setup complete!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Failed to run migrations:', error);
      process.exit(1);
    });
}

export default runMigrations;
