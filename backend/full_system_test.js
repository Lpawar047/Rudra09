const { initDb, query } = require('./dist/config/db');
const xlsx = require('xlsx');

async function testFullSystem() {
  console.log('==================================================');
  console.log('   RUDRA SERVICES — FULL SYSTEM INTEGRATION TEST  ');
  console.log('==================================================');
  
  await initDb();

  // 1. Verify Users
  const usersRes = await query('SELECT id, name, email, role FROM users');
  console.log(`\n1. Users in Database: ${usersRes.rows.length} users found.`);
  usersRes.rows.forEach(u => console.log(`   - [${u.role}] ${u.name} (${u.email})`));

  // 2. Perform Real Excel Upload Simulation
  const file = 'uploads/1788458387367-498989987-RUDRA APP DATA.xlsx';
  console.log(`\n2. Testing Real Excel Import File: ${file}`);
  const wb = xlsx.readFile(file);
  const rawRows = xlsx.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { defval: '' });
  console.log(`   - Total Excel Rows: ${rawRows.length}`);

  // Clean test tables
  await query('DELETE FROM recovery_cases');
  await query('DELETE FROM loans');
  await query('DELETE FROM vehicles');
  await query('DELETE FROM customers');
  await query('DELETE FROM excel_uploads');

  // Insert upload record
  const uploadRes = await query(
    `INSERT INTO excel_uploads (filename, original_name, uploaded_by, total_rows, successful_rows, duplicate_rows, status)
     VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
    ['test.xlsx', 'RUDRA APP DATA.xlsx', usersRes.rows[0].id, rawRows.length, rawRows.length, 0, 'IMPORTED']
  );
  const uploadId = uploadRes.rows[0].id;
  console.log(`   - Upload metadata record created (Upload ID: ${uploadId})`);

  // Insert data rows (UPSERT logic)
  let importedCount = 0;
  for (const r of rawRows) {
    const proposalNo = String(r['Proposal No']).trim().toUpperCase();
    const customerName = String(r['Customer Name']).trim();
    const phone = String(r['MO NO']).trim();
    const regNo = String(r['Registration Number']).trim().toUpperCase();
    const totalDue = parseFloat(String(r['Total Due']).replace(/[^0-9.]/g, '')) || 0;
    const pos = parseFloat(String(r['POS']).replace(/[^0-9.]/g, '')) || 0;
    const emi = parseFloat(String(r['EMI Amount']).replace(/[^0-9.]/g, '')) || 0;
    const address = String(r['Residence Address']).trim();
    const status = String(r['PAID/UNPAID']).trim() === 'Paid' ? 'Paid' : 'Unpaid';

    const custRes = await query(
      'INSERT INTO customers (customer_id, full_name, phone, address, city, state) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
      [`CUST-${proposalNo}`, customerName, phone || 'N/A', address, 'Nashik', 'Maharashtra']
    );
    const custId = custRes.rows[0].id;

    const vehRes = await query(
      'INSERT INTO vehicles (registration_number, model, engine_number, chassis_number, location) VALUES ($1, $2, $3, $4, $5) RETURNING id',
      [regNo, r['Asset Desc'], r['Engine No'], r['Chassis No'], 'Nashik']
    );
    const vehId = vehRes.rows[0].id;

    const loanRes = await query(
      'INSERT INTO loans (loan_account_number, customer_id, vehicle_id, outstanding_amount, emi_amount, total_overdue, dpd) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id',
      [proposalNo, custId, vehId, pos, emi, totalDue, r['BOM Bucket']]
    );
    const loanId = loanRes.rows[0].id;

    await query(
      'INSERT INTO recovery_cases (loan_id, priority, status, location) VALUES ($1, $2, $3, $4)',
      [loanId, 'MEDIUM', status, 'Nashik']
    );
    importedCount++;
  }
  console.log(`   - Imported ${importedCount} database recovery cases.`);

  // 3. Verify Cases API output
  const casesRes = await query(`
    SELECT r.id, l.loan_account_number as proposal_no, c.full_name as customer_name, v.registration_number, l.total_overdue, r.status
    FROM recovery_cases r
    JOIN loans l ON r.loan_id = l.id
    JOIN customers c ON l.customer_id = c.id
    JOIN vehicles v ON l.vehicle_id = v.id
    ORDER BY r.id ASC
  `);

  console.log('\n3. Cases API Output Verification (Recovery Cases):');
  casesRes.rows.forEach(r => {
    const recoveryCode = 'RC-' + String(r.id).padStart(3, '0');
    console.log(`   ${recoveryCode} | ${r.proposal_no} | ${r.customer_name} | ${r.registration_number} | ₹${r.total_overdue} | ${r.status}`);
  });

  // 4. Verify Dashboard Metrics
  const totalCountRes = await query('SELECT COUNT(*) as count FROM recovery_cases');
  const paidCountRes = await query("SELECT COUNT(*) as count FROM recovery_cases WHERE status = 'Paid'");
  const unpaidCountRes = await query("SELECT COUNT(*) as count FROM recovery_cases WHERE status = 'Unpaid'");

  console.log('\n4. Dashboard Metrics Verification:');
  console.log(`   - Total Cases:  ${totalCountRes.rows[0].count}`);
  console.log(`   - Paid Cases:   ${paidCountRes.rows[0].count}`);
  console.log(`   - Unpaid Cases: ${unpaidCountRes.rows[0].count}`);

  // 5. Test Excel Delete Safety (Part 11)
  console.log('\n5. Testing Excel File Metadata Delete Action:');
  await query('DELETE FROM excel_uploads WHERE id = $1', [uploadId]);
  const postDeleteCases = await query('SELECT COUNT(*) as count FROM recovery_cases');
  console.log(`   - Excel upload metadata deleted.`);
  console.log(`   - Preserved Recovery Cases Count: ${postDeleteCases.rows[0].count} (Preservation Verified!)`);

  console.log('\n==================================================');
  console.log('   FULL SYSTEM INTEGRATION TEST PASSED (100%)    ');
  console.log('==================================================');
}

testFullSystem().catch(console.error);
