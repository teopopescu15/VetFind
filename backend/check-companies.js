require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'vetfinder',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
});

async function checkCompanies() {
  try {
    // Check all companies
    const companies = await pool.query('SELECT id, user_id, name, email, created_at FROM companies ORDER BY created_at DESC');
    console.log('\n=== COMPANIES IN DATABASE ===');
    console.log('Total companies:', companies.rows.length);
    companies.rows.forEach(c => {
      console.log(`ID: ${c.id}, User ID: ${c.user_id}, Name: ${c.name}, Created: ${c.created_at}`);
    });

    // Check users
    const users = await pool.query('SELECT id, email, role FROM users ORDER BY created_at DESC');
    console.log('\n=== USERS IN DATABASE ===');
    console.log('Total users:', users.rows.length);
    users.rows.forEach(u => {
      console.log(`ID: ${u.id}, Email: ${u.email}, Role: ${u.role}`);
    });

    await pool.end();
  } catch (error) {
    console.error('Error:', error);
    await pool.end();
    process.exit(1);
  }
}

checkCompanies();
