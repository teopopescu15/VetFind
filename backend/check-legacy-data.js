// Check if legacy tables contain any data before removal
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'vetfinder',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
});

const checkLegacyTables = async () => {
  try {
    console.log('🔍 Checking legacy tables for data...\n');

    // Check clinics table
    const clinicsResult = await pool.query('SELECT COUNT(*) FROM clinics');
    const clinicsCount = parseInt(clinicsResult.rows[0].count);
    console.log(`📊 clinics table: ${clinicsCount} rows`);

    // Check services table
    const servicesResult = await pool.query('SELECT COUNT(*) FROM services');
    const servicesCount = parseInt(servicesResult.rows[0].count);
    console.log(`📊 services table: ${servicesCount} rows`);

    // Check reviews table
    const reviewsResult = await pool.query('SELECT COUNT(*) FROM reviews');
    const reviewsCount = parseInt(reviewsResult.rows[0].count);
    console.log(`📊 reviews table: ${reviewsCount} rows`);

    // Check appointments table
    const appointmentsResult = await pool.query('SELECT COUNT(*) FROM appointments');
    const appointmentsCount = parseInt(appointmentsResult.rows[0].count);
    console.log(`📊 appointments table: ${appointmentsCount} rows\n`);

    const totalRows = clinicsCount + servicesCount + reviewsCount + appointmentsCount;

    if (totalRows === 0) {
      console.log('✅ All legacy tables are EMPTY. Safe to remove!');
    } else {
      console.log(`⚠️  WARNING: Found ${totalRows} total rows in legacy tables.`);
      console.log('   Consider migrating data before removal or confirm deletion is intentional.');

      if (clinicsCount > 0) {
        const sampleClinics = await pool.query('SELECT id, name, city FROM clinics LIMIT 3');
        console.log('\n📋 Sample clinics data:');
        sampleClinics.rows.forEach(clinic => {
          console.log(`   - ID ${clinic.id}: ${clinic.name} (${clinic.city})`);
        });
      }
    }

    await pool.end();
    process.exit(totalRows > 0 ? 1 : 0);
  } catch (error) {
    console.error('❌ Error checking legacy tables:', error.message);
    await pool.end();
    process.exit(1);
  }
};

checkLegacyTables();
