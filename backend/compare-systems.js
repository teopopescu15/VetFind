// Compare data between legacy (clinics) and new (companies) systems
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'vetfinder',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
});

const compareSystems = async () => {
  try {
    console.log('🔍 Comparing OLD (clinics) vs NEW (companies) systems...\n');

    // Count legacy data
    const clinicsResult = await pool.query('SELECT COUNT(*) FROM clinics');
    const clinicsCount = parseInt(clinicsResult.rows[0].count);

    const servicesResult = await pool.query('SELECT COUNT(*) FROM services');
    const servicesCount = parseInt(servicesResult.rows[0].count);

    console.log('📊 OLD SYSTEM (Legacy):');
    console.log(`   - Clinics: ${clinicsCount}`);
    console.log(`   - Services: ${servicesCount}\n`);

    // Count new data
    const companiesResult = await pool.query('SELECT COUNT(*) FROM companies');
    const companiesCount = parseInt(companiesResult.rows[0].count);

    const companyServicesResult = await pool.query('SELECT COUNT(*) FROM company_services');
    const companyServicesCount = parseInt(companyServicesResult.rows[0].count);

    console.log('📊 NEW SYSTEM (Active):');
    console.log(`   - Companies: ${companiesCount}`);
    console.log(`   - Company Services: ${companyServicesCount}\n`);

    // Check for duplicate names
    const duplicateCheck = await pool.query(`
      SELECT c.name as clinic_name, co.name as company_name
      FROM clinics c
      FULL OUTER JOIN companies co ON LOWER(c.name) = LOWER(co.name)
      LIMIT 10
    `);

    if (duplicateCheck.rows.length > 0) {
      console.log('🔄 Potential duplicates (same name in both systems):');
      duplicateCheck.rows.forEach(row => {
        if (row.clinic_name && row.company_name) {
          console.log(`   - "${row.clinic_name}" exists in BOTH systems`);
        }
      });
      console.log('');
    }

    // Show sample legacy data
    const sampleClinics = await pool.query(`
      SELECT id, name, city, owner_id, created_at
      FROM clinics
      ORDER BY created_at DESC
      LIMIT 5
    `);

    console.log('📋 Legacy CLINICS (5 most recent):');
    sampleClinics.rows.forEach(clinic => {
      console.log(`   - [${clinic.id}] ${clinic.name} (${clinic.city}) - Owner: ${clinic.owner_id} - Created: ${clinic.created_at.toISOString().split('T')[0]}`);
    });
    console.log('');

    // Show sample new data
    const sampleCompanies = await pool.query(`
      SELECT id, name, city, user_id, created_at
      FROM companies
      ORDER BY created_at DESC
      LIMIT 5
    `);

    console.log('📋 NEW COMPANIES (5 most recent):');
    if (sampleCompanies.rows.length > 0) {
      sampleCompanies.rows.forEach(company => {
        console.log(`   - [${company.id}] ${company.name} (${company.city}) - User: ${company.user_id} - Created: ${company.created_at.toISOString().split('T')[0]}`);
      });
    } else {
      console.log('   (No companies found in new system)');
    }
    console.log('');

    // Recommendation
    console.log('💡 RECOMMENDATION:');
    if (companiesCount === 0 && clinicsCount > 0) {
      console.log('   ⚠️  You have data in OLD system but NONE in NEW system!');
      console.log('   ⚠️  This suggests the app is using legacy data.');
      console.log('   ⚠️  MIGRATION REQUIRED before deletion!');
    } else if (companiesCount > 0 && clinicsCount > 0) {
      console.log('   ℹ️  Both systems have data. Check if legacy is still used.');
      console.log('   ℹ️  If frontend only uses NEW system, legacy can be removed.');
    } else if (companiesCount > 0 && clinicsCount === 0) {
      console.log('   ✅ Only NEW system has data. Safe to remove legacy tables.');
    } else {
      console.log('   ⚠️  No data in either system.');
    }

    await pool.end();
  } catch (error) {
    console.error('❌ Error comparing systems:', error.message);
    await pool.end();
    process.exit(1);
  }
};

compareSystems();
