require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'vetfinder',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
});

async function deleteCompany() {
  const userEmail = process.argv[2];

  if (!userEmail) {
    console.error('Usage: node delete-company.js <user-email>');
    console.error('Example: node delete-company.js teo@gmail.com');
    process.exit(1);
  }

  try {
    // Find user by email
    const userResult = await pool.query('SELECT id, email, role FROM users WHERE email = $1', [userEmail]);

    if (userResult.rows.length === 0) {
      console.error(`User with email "${userEmail}" not found`);
      await pool.end();
      process.exit(1);
    }

    const user = userResult.rows[0];
    console.log(`Found user: ID ${user.id}, Email: ${user.email}, Role: ${user.role}`);

    // Find company for this user
    const companyResult = await pool.query('SELECT id, name, email FROM companies WHERE user_id = $1', [user.id]);

    if (companyResult.rows.length === 0) {
      console.log('No company found for this user');
      await pool.end();
      return;
    }

    const company = companyResult.rows[0];
    console.log(`Found company: ID ${company.id}, Name: ${company.name}, Email: ${company.email}`);

    // Delete associated services first (due to foreign key constraint)
    const servicesResult = await pool.query('DELETE FROM company_services WHERE company_id = $1 RETURNING *', [company.id]);
    console.log(`Deleted ${servicesResult.rows.length} services for this company`);

    // Delete the company
    await pool.query('DELETE FROM companies WHERE id = $1', [company.id]);
    console.log(`✅ Successfully deleted company "${company.name}" for user ${userEmail}`);
    console.log('You can now create a new company with this account.');

    await pool.end();
  } catch (error) {
    console.error('Error:', error.message);
    await pool.end();
    process.exit(1);
  }
}

deleteCompany();
