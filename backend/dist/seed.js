"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = require("./config/db");
const password_1 = require("./utils/password");
async function seed() {
    console.log('🌱 Seeding Rudra Services database with realistic Indian demo data...');
    await (0, db_1.initDb)();
    // Clean existing tables (in order of foreign key dependencies)
    try {
        await (0, db_1.query)('DELETE FROM activity_logs');
        await (0, db_1.query)('DELETE FROM excel_import_errors');
        await (0, db_1.query)('DELETE FROM excel_uploads');
        await (0, db_1.query)('DELETE FROM payments');
        await (0, db_1.query)('DELETE FROM followups');
        await (0, db_1.query)('DELETE FROM case_assignments');
        await (0, db_1.query)('DELETE FROM recovery_cases');
        await (0, db_1.query)('DELETE FROM loans');
        await (0, db_1.query)('DELETE FROM vehicles');
        await (0, db_1.query)('DELETE FROM customers');
        await (0, db_1.query)('DELETE FROM users');
    }
    catch (err) {
        console.log('Notice during table cleanup (normal if starting fresh)');
    }
    // 1. Seed Users
    const defaultPasswordHash = await (0, password_1.hashPassword)('admin123');
    const mgrPasswordHash = await (0, password_1.hashPassword)('manager123');
    const empPasswordHash = await (0, password_1.hashPassword)('employee123');
    const usersData = [
        { name: 'Rudra Admin', email: 'admin@rudraservices.com', pass: defaultPasswordHash, role: 'ADMIN', phone: '+91 98200 11223', dept: 'Executive Ops', status: 'ACTIVE' },
        { name: 'Rajesh Sharma', email: 'manager@rudraservices.com', pass: mgrPasswordHash, role: 'MANAGER', phone: '+91 98200 44556', dept: 'Western Zone Recovery', status: 'ACTIVE' },
        { name: 'Sanjay Deshmukh', email: 'manager2@rudraservices.com', pass: mgrPasswordHash, role: 'MANAGER', phone: '+91 98200 77889', dept: 'Northern Zone Recovery', status: 'ACTIVE' },
        { name: 'Vikram Singh', email: 'employee@rudraservices.com', pass: empPasswordHash, role: 'EMPLOYEE', phone: '+91 98765 43210', dept: 'Field Recovery Team A', status: 'ACTIVE' },
        { name: 'Rahul Verma', email: 'rahul@rudraservices.com', pass: empPasswordHash, role: 'EMPLOYEE', phone: '+91 98765 11223', dept: 'Field Recovery Team A', status: 'ACTIVE' },
        { name: 'Priya Patel', email: 'priya@rudraservices.com', pass: empPasswordHash, role: 'EMPLOYEE', phone: '+91 98765 33445', dept: 'Field Recovery Team B', status: 'ACTIVE' },
        { name: 'Amit Kumar', email: 'amit@rudraservices.com', pass: empPasswordHash, role: 'EMPLOYEE', phone: '+91 98765 55667', dept: 'Field Recovery Team B', status: 'ACTIVE' },
        { name: 'Karan Mehra (Pending)', email: 'pending.emp@rudraservices.com', pass: empPasswordHash, role: 'EMPLOYEE', phone: '+91 98765 88990', dept: 'Field Recovery Team C', status: 'PENDING' },
        { name: 'Siddharth Roy (Disabled)', email: 'disabled.emp@rudraservices.com', pass: empPasswordHash, role: 'EMPLOYEE', phone: '+91 98765 44332', dept: 'Field Recovery Team C', status: 'DISABLED' },
        { name: 'Nikhil Joshi (Rejected)', email: 'rejected.emp@rudraservices.com', pass: empPasswordHash, role: 'EMPLOYEE', phone: '+91 98765 11998', dept: 'Field Recovery Team C', status: 'REJECTED', reason: 'Invalid address documentation provided.' },
    ];
    const userIds = {};
    for (const u of usersData) {
        const res = await (0, db_1.query)(`INSERT INTO users (name, email, password_hash, role, phone, department, status, rejection_reason)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id`, [u.name, u.email, u.pass, u.role, u.phone, u.dept, u.status, u.reason || null]);
        userIds[u.email] = res.rows.length > 0 ? res.rows[0].id : res.lastID;
    }
    console.log('✅ Users seeded: Admin, 2 Managers, 4 Employees');
    // 2. Seed Customers
    const customersData = [
        { code: 'CUST-1001', name: 'Ramesh Transport Co. (Ramesh Chand)', phone: '+91 98920 12345', alt: '+91 98920 54321', email: 'ramesh.trans@gmail.com', addr: 'Plot 42, Transport Nagar, Nigdi', city: 'Pune', state: 'Maharashtra', pin: '411044', emp: 'Self Employed - Logistics' },
        { code: 'CUST-1002', name: 'Sunil Gupte', phone: '+91 98111 22334', alt: '+91 98111 66778', email: 'sunil.gupte@yahoo.com', addr: 'B-204, Gokuldham Society, Goregaon East', city: 'Mumbai', state: 'Maharashtra', pin: '400063', emp: 'Private Fleet Operator' },
        { code: 'CUST-1003', name: 'Anil Yadav', phone: '+91 97654 99887', alt: '', email: 'anilyadav.heavy@gmail.com', addr: 'House No 118, Sector 15', city: 'Gurugram', state: 'Haryana', pin: '122001', emp: 'Independent Truck Driver' },
        { code: 'CUST-1004', name: 'Mahesh Patil', phone: '+91 99234 11223', alt: '+91 99234 44556', email: 'patil.mahesh@rediffmail.com', addr: 'Flat 12, Swagat Heights, Hadapsar', city: 'Pune', state: 'Maharashtra', pin: '411028', emp: 'Agri Goods Carrier' },
        { code: 'CUST-1005', name: 'Deepak Sharma', phone: '+91 98300 77112', alt: '', email: 'deepak.sharma@outlook.com', addr: '15/A, G.T. Road, Howrah', city: 'Kolkata', state: 'West Bengal', pin: '700001', emp: 'Intercity Bus Service' },
        { code: 'CUST-1006', name: 'Kavita Reddy', phone: '+91 98490 88776', alt: '+91 98490 11223', email: 'kreddy.logistics@gmail.com', addr: 'H.No 8-3-228, Ameerpet', city: 'Hyderabad', state: 'Telangana', pin: '500016', emp: 'Commercial Cab Operator' },
        { code: 'CUST-1007', name: 'Vijay Malhotra', phone: '+91 98100 99112', alt: '', email: 'vmalhotra@gmail.com', addr: 'C-45, Lajpat Nagar Part I', city: 'New Delhi', state: 'Delhi', pin: '110024', emp: 'Small Business Owner' },
    ];
    const customerIds = [];
    for (const c of customersData) {
        const res = await (0, db_1.query)(`INSERT INTO customers (customer_id, full_name, phone, alt_phone, email, address, city, state, pincode, employment_info)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING id`, [c.code, c.name, c.phone, c.alt, c.email, c.addr, c.city, c.state, c.pin, c.emp]);
        customerIds.push(res.rows.length > 0 ? res.rows[0].id : res.lastID);
    }
    console.log(`✅ Customers seeded: ${customerIds.length} customer records`);
    // 3. Seed Vehicles
    const vehiclesData = [
        { reg: 'MH12PQ8849', type: 'Heavy Commercial Truck', mfr: 'Tata Motors', model: 'Prima 2830.K', var: 'Tipper', chassis: 'MAT428015P3N10293', engine: 'CUMMINSISBE6.7-102', loc: 'Pune - Nigdi Yard', status: 'UNDER_RECOVERY' },
        { reg: 'MH02BZ1290', type: 'Light Commercial Vehicle', mfr: 'Mahindra', model: 'Bolero Pik-Up ExtraLong', var: 'FB 1.7T', chassis: 'MA1TA2BK6M2H88301', engine: 'm2DiCR4CYL80', loc: 'Goregaon West Parking', status: 'UNDER_RECOVERY' },
        { reg: 'HR55AC4410', type: 'Heavy Commercial Truck', mfr: 'Ashok Leyland', model: 'AVTR 3520', var: 'Haulage 8x2', chassis: 'MB1D4D5C9N8H22910', engine: 'H6E5RS32-99', loc: 'Gurugram Expressway Yard', status: 'UNDER_RECOVERY' },
        { reg: 'MH14CX7741', type: 'Mini Truck', mfr: 'Tata Motors', model: 'Ace Gold Diesel', var: 'BS6', chassis: 'MAT618032M1K99201', engine: '275IDIDI12', loc: 'Hadapsar Transport Hub', status: 'ACTIVE' },
        { reg: 'WB04E9921', type: 'Commercial Bus', mfr: 'Eicher Motors', model: 'Skyline Pro 3009', var: '36 Seater', chassis: 'MC2E1BDR8K7M11092', engine: 'E4944CYL120', loc: 'Kolkata Central Depot', status: 'RECOVERED' },
        { reg: 'TS07EY3340', type: 'Passenger Taxi', mfr: 'Maruti Suzuki', model: 'Tour S (Dzire)', var: 'CNG', chassis: 'MA3FBE11S00994821', engine: 'K12M1.2L', loc: 'Ameerpet Taxi Stand', status: 'UNDER_RECOVERY' },
        { reg: 'DL01C5678', type: 'SUV Commercial', mfr: 'Mahindra', model: 'Scorpio Classic', var: 'S11', chassis: 'MA1TA2SL7L8N44102', engine: 'mHawk132', loc: 'Lajpat Nagar Yard', status: 'RECOVERED' },
    ];
    const vehicleIds = [];
    for (const v of vehiclesData) {
        const res = await (0, db_1.query)(`INSERT INTO vehicles (registration_number, vehicle_type, manufacturer, model, variant, chassis_number, engine_number, location, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING id`, [v.reg, v.type, v.mfr, v.model, v.var, v.chassis, v.engine, v.loc, v.status]);
        vehicleIds.push(res.rows.length > 0 ? res.rows[0].id : res.lastID);
    }
    console.log(`✅ Vehicles seeded: ${vehicleIds.length} vehicle records`);
    // 4. Seed Loans
    const loansData = [
        { acc: 'LN-MH-2024-8849', cust: customerIds[0], veh: vehicleIds[0], loanAmt: 2800000, pos: 1450000, emi: 62500, due: '2026-08-05', overdue: 187500, dpd: 90, status: 'RECOVERY' },
        { acc: 'LN-MH-2024-1290', cust: customerIds[1], veh: vehicleIds[1], loanAmt: 950000, pos: 420000, emi: 22000, due: '2026-08-10', overdue: 66000, dpd: 65, status: 'RECOVERY' },
        { acc: 'LN-HR-2023-4410', cust: customerIds[2], veh: vehicleIds[2], loanAmt: 3400000, pos: 2100000, emi: 78000, due: '2026-07-28', overdue: 312000, dpd: 120, status: 'RECOVERY' },
        { acc: 'LN-MH-2024-7741', cust: customerIds[3], veh: vehicleIds[3], loanAmt: 550000, pos: 180000, emi: 14500, due: '2026-08-15', overdue: 29000, dpd: 40, status: 'OVERDUE' },
        { acc: 'LN-WB-2023-9921', cust: customerIds[4], veh: vehicleIds[4], loanAmt: 2200000, pos: 0, emi: 48000, due: '2026-06-10', overdue: 0, dpd: 0, status: 'RECOVERED' },
        { acc: 'LN-TS-2024-3340', cust: customerIds[5], veh: vehicleIds[5], loanAmt: 720000, pos: 390000, emi: 17500, due: '2026-08-01', overdue: 52500, dpd: 75, status: 'RECOVERY' },
        { acc: 'LN-DL-2023-5678', cust: customerIds[6], veh: vehicleIds[6], loanAmt: 1400000, pos: 0, emi: 31000, due: '2026-05-15', overdue: 0, dpd: 0, status: 'CLOSED' },
    ];
    const loanIds = [];
    for (const l of loansData) {
        const res = await (0, db_1.query)(`INSERT INTO loans (loan_account_number, customer_id, vehicle_id, loan_amount, outstanding_amount, emi_amount, emi_due_date, total_overdue, dpd, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING id`, [l.acc, l.cust, l.veh, l.loanAmt, l.pos, l.emi, l.due, l.overdue, l.dpd, l.status]);
        loanIds.push(res.rows.length > 0 ? res.rows[0].id : res.lastID);
    }
    console.log(`✅ Loans seeded: ${loanIds.length} loan accounts`);
    // 5. Seed Recovery Cases
    const casesData = [
        { loan: loanIds[0], emp: userIds['employee@rudraservices.com'], mgr: userIds['manager@rudraservices.com'], priority: 'CRITICAL', status: 'IN_PROGRESS', due: '2026-09-10', loc: 'Pune - Transport Nagar', remarks: 'Customer requested 7 days extension. Field visit conducted.' },
        { loan: loanIds[1], emp: userIds['rahul@rudraservices.com'], mgr: userIds['manager@rudraservices.com'], priority: 'HIGH', status: 'PROMISE_TO_PAY', due: '2026-09-08', loc: 'Mumbai - Goregaon East', remarks: 'Borrower promised payment via UPI by 8th Sep.' },
        { loan: loanIds[2], emp: userIds['priya@rudraservices.com'], mgr: userIds['manager2@rudraservices.com'], priority: 'CRITICAL', status: 'LEGAL_ACTION', due: '2026-09-15', loc: 'Gurugram Sector 15', remarks: 'Multiple default notices sent. Legal repossession order issued.' },
        { loan: loanIds[3], emp: userIds['amit@rudraservices.com'], mgr: userIds['manager@rudraservices.com'], priority: 'MEDIUM', status: 'CONTACTED', due: '2026-09-12', loc: 'Pune - Hadapsar', remarks: 'Spoke over phone. Customer agreed to clear 1 EMI.' },
        { loan: loanIds[4], emp: userIds['employee@rudraservices.com'], mgr: userIds['manager2@rudraservices.com'], priority: 'LOW', status: 'RECOVERED', due: '2026-08-20', loc: 'Kolkata Depot', remarks: 'Vehicle repossessed and auctioned. Full settlement received.' },
        { loan: loanIds[5], emp: userIds['priya@rudraservices.com'], mgr: userIds['manager2@rudraservices.com'], priority: 'HIGH', status: 'UNABLE_TO_CONTACT', due: '2026-09-05', loc: 'Hyderabad Ameerpet', remarks: 'Phone numbers switched off. Field verification in progress.' },
        { loan: loanIds[6], emp: userIds['rahul@rudraservices.com'], mgr: userIds['manager@rudraservices.com'], priority: 'LOW', status: 'CLOSED', due: '2026-05-30', loc: 'Delhi Lajpat Nagar', remarks: 'Full final payment received and loan closed.' },
    ];
    const caseIds = [];
    for (const c of casesData) {
        const res = await (0, db_1.query)(`INSERT INTO recovery_cases (loan_id, assigned_employee_id, assigned_manager_id, priority, status, due_date, location, remarks)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id`, [c.loan, c.emp, c.mgr, c.priority, c.status, c.due, c.loc, c.remarks]);
        const caseId = res.rows.length > 0 ? res.rows[0].id : res.lastID;
        caseIds.push(caseId);
        // Add initial assignment audit entry
        await (0, db_1.query)(`INSERT INTO case_assignments (case_id, employee_id, assigned_by, remarks)
       VALUES ($1, $2, $3, $4)`, [caseId, c.emp, c.mgr, 'Initial assignment by Zone Manager']);
    }
    console.log(`✅ Recovery Cases & Assignments seeded: ${caseIds.length} active recovery cases`);
    // 6. Seed Follow-ups
    const followupsData = [
        { case: caseIds[0], type: 'VISIT', result: 'CONTACTED', response: 'Met Mr. Ramesh at Transport Nagar. He promised partial payment of ₹50,000.', remarks: 'Vehicle inspected. Engine in running condition.', next: '2026-09-07', by: userIds['employee@rudraservices.com'] },
        { case: caseIds[1], type: 'PHONE_CALL', result: 'PROMISE_TO_PAY', response: 'Borrower agreed to transfer 2 EMIs of ₹44,000.', remarks: 'Send reminder SMS before due date.', next: '2026-09-08', by: userIds['rahul@rudraservices.com'] },
        { case: caseIds[2], type: 'VISIT', result: 'REFUSED', response: 'Borrower refused to surrender vehicle or clear dues.', remarks: 'Submitted escalation report for repossession squad.', next: '2026-09-10', by: userIds['priya@rudraservices.com'] },
        { case: caseIds[3], type: 'PHONE_CALL', result: 'CONTACTED', response: 'Customer acknowledged delay due to festive holidays.', remarks: 'Followup scheduled for next week.', next: '2026-09-12', by: userIds['amit@rudraservices.com'] },
        { case: caseIds[5], type: 'PHONE_CALL', result: 'WRONG_NUMBER', response: 'Alternate number belongs to an unrelated entity.', remarks: 'Need updated address verification.', next: '2026-09-06', by: userIds['priya@rudraservices.com'] },
    ];
    for (const f of followupsData) {
        await (0, db_1.query)(`INSERT INTO followups (case_id, followup_type, contact_result, customer_response, remarks, next_followup_date, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`, [f.case, f.type, f.result, f.response, f.remarks, f.next, f.by]);
    }
    console.log(`✅ Follow-ups seeded: ${followupsData.length} records`);
    // 7. Seed Payments
    const paymentsData = [
        { case: caseIds[4], cust: customerIds[4], amt: 2200000, mode: 'BANK_TRANSFER', ref: 'NEFT-SBIN2026082001', by: userIds['employee@rudraservices.com'], remarks: 'Full settlement payment post vehicle auction' },
        { case: caseIds[6], cust: customerIds[6], amt: 1400000, mode: 'CHEQUE', ref: 'CHQ-HDFC-991024', by: userIds['rahul@rudraservices.com'], remarks: 'Final foreclosure payment' },
        { case: caseIds[1], cust: customerIds[1], amt: 22000, mode: 'UPI', ref: 'UPI-RAZOR-88201', by: userIds['rahul@rudraservices.com'], remarks: 'Partial recovery EMI collection' },
    ];
    for (const p of paymentsData) {
        await (0, db_1.query)(`INSERT INTO payments (case_id, customer_id, amount, payment_mode, transaction_ref, collected_by, remarks)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`, [p.case, p.cust, p.amt, p.mode, p.ref, p.by, p.remarks]);
    }
    console.log(`✅ Payments seeded: ${paymentsData.length} collection receipts`);
    // 8. Seed Activity Logs
    await (0, db_1.query)(`INSERT INTO activity_logs (user_id, action, details)
     VALUES ($1, $2, $3), ($4, $5, $6)`, [
        userIds['admin@rudraservices.com'], 'DATABASE_SEED', 'Initial system seed with demo customers and vehicle cases',
        userIds['manager@rudraservices.com'], 'ASSIGN_CASE', 'Assigned initial batch of cases to field employees'
    ]);
    console.log('🎉 Database seeding complete!');
    process.exit(0);
}
seed().catch(err => {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
});
