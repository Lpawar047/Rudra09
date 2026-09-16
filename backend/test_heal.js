const { Pool } = require('pg');
require('dotenv').config({ path: './.env' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function heal() {
  try {
    const missing = await pool.query('SELECT l.id, l.dpd, l.status FROM loans l LEFT JOIN recovery_cases r ON l.id = r.loan_id WHERE r.id IS NULL');
    console.log('Found missing recovery cases for loans:', missing.rows.length);
    for (const row of missing.rows) {
      const priority = (row.dpd || 0) > 90 ? 'CRITICAL' : (row.dpd || 0) > 60 ? 'HIGH' : 'MEDIUM';
      await pool.query(
        'INSERT INTO recovery_cases (loan_id, priority, status, location) VALUES ($1, $2, $3, $4)',
        [row.id, priority, row.status || 'PENDING', 'Nashik']
      );
    }
    const totalCases = await pool.query('SELECT COUNT(*) FROM recovery_cases');
    const totalLoans = await pool.query('SELECT COUNT(*) FROM loans');
    console.log('After healing - Total loans:', totalLoans.rows[0].count, 'Total recovery cases:', totalCases.rows[0].count);
  } catch (e) {
    console.error('Error:', e);
  } finally {
    await pool.end();
  }
}

heal();
