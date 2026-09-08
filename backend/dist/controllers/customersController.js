"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCustomers = getCustomers;
exports.getCustomerById = getCustomerById;
exports.createCustomer = createCustomer;
exports.updateCustomer = updateCustomer;
exports.deleteCustomer = deleteCustomer;
const db_1 = require("../config/db");
async function getCustomers(req, res) {
    try {
        const { search, status, priority, employee_id, manager_id, city, state, min_pos, max_pos, page = 1, limit = 100 } = req.query;
        const user = req.user;
        let sql = `
      SELECT 
        c.id, c.customer_id, c.full_name, c.phone, c.alt_phone, c.email, c.address, c.city, c.state, c.pincode, c.employment_info, c.created_at,
        l.loan_account_number as proposal_no, l.loan_account_number, l.outstanding_amount, l.total_overdue, l.emi_amount, l.dpd, l.imported_excel_data,
        v.registration_number, v.model as vehicle_model, v.model as asset_desc, v.engine_number, v.chassis_number,
        r.id as case_id, r.status as case_status, r.priority, r.last_followup_date, r.next_followup_date,
        emp.name as assigned_employee_name,
        mgr.name as assigned_manager_name
      FROM customers c
      LEFT JOIN loans l ON l.customer_id = c.id
      LEFT JOIN vehicles v ON l.vehicle_id = v.id
      LEFT JOIN recovery_cases r ON r.loan_id = l.id
      LEFT JOIN users emp ON r.assigned_employee_id = emp.id
      LEFT JOIN users mgr ON r.assigned_manager_id = mgr.id
    `;
        const params = [];
        const conditions = [];
        // Role-based authorization scoping
        if (user.role === 'EMPLOYEE') {
            conditions.push('r.assigned_employee_id = $' + (params.length + 1));
            params.push(user.id);
        }
        else if (user.role === 'MANAGER') {
            conditions.push('(r.assigned_manager_id = $' + (params.length + 1) + ' OR r.assigned_manager_id IS NULL)');
            params.push(user.id);
        }
        // Comprehensive Case-Insensitive Multi-Field Database Search with COALESCE NULL safety
        if (search && String(search).trim() !== '') {
            const cleanTerm = String(search).trim();
            const searchTerm = `%${cleanTerm}%`;
            const idx = params.length + 1;
            params.push(searchTerm);
            conditions.push(`(LOWER(COALESCE(c.full_name, '')) LIKE LOWER($${idx}) OR ` +
                `LOWER(COALESCE(c.phone, '')) LIKE LOWER($${idx}) OR ` +
                `LOWER(COALESCE(c.alt_phone, '')) LIKE LOWER($${idx}) OR ` +
                `LOWER(COALESCE(c.customer_id, '')) LIKE LOWER($${idx}) OR ` +
                `LOWER(COALESCE(c.address, '')) LIKE LOWER($${idx}) OR ` +
                `LOWER(COALESCE(c.city, '')) LIKE LOWER($${idx}) OR ` +
                `LOWER(COALESCE(c.state, '')) LIKE LOWER($${idx}) OR ` +
                `LOWER(COALESCE(l.loan_account_number, '')) LIKE LOWER($${idx}) OR ` +
                `LOWER(COALESCE(v.registration_number, '')) LIKE LOWER($${idx}) OR ` +
                `LOWER(COALESCE(v.engine_number, '')) LIKE LOWER($${idx}) OR ` +
                `LOWER(COALESCE(v.chassis_number, '')) LIKE LOWER($${idx}) OR ` +
                `LOWER(COALESCE(v.model, '')) LIKE LOWER($${idx}) OR ` +
                `LOWER(COALESCE(CAST(r.id AS TEXT), '')) LIKE LOWER($${idx}) OR ` +
                `LOWER(COALESCE(CAST(l.imported_excel_data AS TEXT), '')) LIKE LOWER($${idx}))`);
        }
        // Advanced Filters
        if (status && String(status).trim() !== '') {
            const idx = params.length + 1;
            params.push(status);
            conditions.push(`r.status = $${idx}`);
        }
        if (priority && String(priority).trim() !== '') {
            const idx = params.length + 1;
            params.push(priority);
            conditions.push(`r.priority = $${idx}`);
        }
        if (employee_id && String(employee_id).trim() !== '') {
            const idx = params.length + 1;
            params.push(employee_id);
            conditions.push(`r.assigned_employee_id = $${idx}`);
        }
        if (manager_id && String(manager_id).trim() !== '') {
            const idx = params.length + 1;
            params.push(manager_id);
            conditions.push(`r.assigned_manager_id = $${idx}`);
        }
        if (city && String(city).trim() !== '') {
            const idx = params.length + 1;
            params.push(`%${city}%`);
            conditions.push(`LOWER(COALESCE(c.city, '')) LIKE LOWER($${idx})`);
        }
        if (state && String(state).trim() !== '') {
            const idx = params.length + 1;
            params.push(`%${state}%`);
            conditions.push(`LOWER(COALESCE(c.state, '')) LIKE LOWER($${idx})`);
        }
        if (min_pos && !isNaN(Number(min_pos))) {
            const idx = params.length + 1;
            params.push(Number(min_pos));
            conditions.push(`l.outstanding_amount >= $${idx}`);
        }
        if (max_pos && !isNaN(Number(max_pos))) {
            const idx = params.length + 1;
            params.push(Number(max_pos));
            conditions.push(`l.outstanding_amount <= $${idx}`);
        }
        if (conditions.length > 0) {
            sql += ' WHERE ' + conditions.join(' AND ');
        }
        sql += ' ORDER BY c.id DESC';
        const result = await (0, db_1.query)(sql, params);
        return res.json({
            customers: result.rows,
            total_count: result.rows.length
        });
    }
    catch (error) {
        console.error('getCustomers error:', error);
        return res.status(500).json({ message: 'Failed to fetch customer search results.' });
    }
}
async function getCustomerById(req, res) {
    try {
        const { id } = req.params;
        const customerRes = await (0, db_1.query)('SELECT * FROM customers WHERE id = $1', [id]);
        if (customerRes.rows.length === 0) {
            return res.status(404).json({ message: 'Customer not found.' });
        }
        const loansRes = await (0, db_1.query)(`SELECT 
         l.*, 
         l.loan_account_number as proposal_no,
         l.imported_excel_data,
         v.registration_number, v.model, v.model as asset_desc, v.engine_number, v.chassis_number, v.status as vehicle_status,
         r.id as case_id, r.status as case_status, r.priority, r.assigned_employee_id, r.assigned_manager_id,
         emp.name as assigned_employee_name,
         mgr.name as assigned_manager_name
       FROM loans l 
       LEFT JOIN vehicles v ON l.vehicle_id = v.id 
       LEFT JOIN recovery_cases r ON r.loan_id = l.id 
       LEFT JOIN users emp ON r.assigned_employee_id = emp.id
       LEFT JOIN users mgr ON r.assigned_manager_id = mgr.id
       WHERE l.customer_id = $1`, [id]);
        let followups = [];
        let payments = [];
        if (loansRes.rows.length > 0 && loansRes.rows[0].case_id) {
            const caseId = loansRes.rows[0].case_id;
            const folRes = await (0, db_1.query)(`SELECT f.*, u.name as created_by_name 
         FROM followups f 
         LEFT JOIN users u ON f.created_by = u.id 
         WHERE f.case_id = $1 
         ORDER BY f.id DESC`, [caseId]);
            followups = folRes.rows;
            const payRes = await (0, db_1.query)(`SELECT p.*, u.name as collected_by_name 
         FROM payments p 
         LEFT JOIN users u ON p.collected_by = u.id 
         WHERE p.case_id = $1 
         ORDER BY p.id DESC`, [caseId]);
            payments = payRes.rows;
        }
        return res.json({
            customer: customerRes.rows[0],
            loans: loansRes.rows,
            followups,
            payments,
        });
    }
    catch (error) {
        console.error('getCustomerById error:', error);
        return res.status(500).json({ message: 'Failed to fetch customer details.' });
    }
}
async function createCustomer(req, res) {
    try {
        const { customer_id, full_name, phone, alt_phone, email, address, city, state, pincode, employment_info } = req.body;
        if (!full_name || !phone || !address || !city || !state) {
            return res.status(400).json({ message: 'Full name, phone, address, city, and state are required.' });
        }
        const sql = `
      INSERT INTO customers (customer_id, full_name, phone, alt_phone, email, address, city, state, pincode, employment_info)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `;
        const result = await (0, db_1.query)(sql, [
            customer_id || `CUST-${Date.now().toString().slice(-6)}`,
            full_name,
            phone,
            alt_phone || null,
            email || null,
            address,
            city,
            state,
            pincode || null,
            employment_info || null,
        ]);
        return res.status(201).json({ customer: result.rows[0] });
    }
    catch (error) {
        console.error('createCustomer error:', error);
        return res.status(500).json({ message: 'Failed to create customer.' });
    }
}
async function updateCustomer(req, res) {
    try {
        const { id } = req.params;
        const { customer_id, full_name, phone, alt_phone, email, address, city, state, pincode, employment_info } = req.body;
        const existing = await (0, db_1.query)('SELECT * FROM customers WHERE id = $1', [id]);
        if (existing.rows.length === 0) {
            return res.status(404).json({ message: 'Customer not found.' });
        }
        const sql = `
      UPDATE customers
      SET customer_id = $1, full_name = $2, phone = $3, alt_phone = $4, email = $5, address = $6, city = $7, state = $8, pincode = $9, employment_info = $10, updated_at = CURRENT_TIMESTAMP
      WHERE id = $11
    `;
        await (0, db_1.query)(sql, [
            customer_id || existing.rows[0].customer_id,
            full_name || existing.rows[0].full_name,
            phone || existing.rows[0].phone,
            alt_phone || existing.rows[0].alt_phone,
            email || existing.rows[0].email,
            address || existing.rows[0].address,
            city || existing.rows[0].city,
            state || existing.rows[0].state,
            pincode || existing.rows[0].pincode,
            employment_info || existing.rows[0].employment_info,
            id,
        ]);
        return res.json({ message: 'Customer updated successfully.' });
    }
    catch (error) {
        console.error('updateCustomer error:', error);
        return res.status(500).json({ message: 'Failed to update customer.' });
    }
}
async function deleteCustomer(req, res) {
    try {
        const { id } = req.params;
        await (0, db_1.query)('DELETE FROM customers WHERE id = $1', [id]);
        return res.json({ message: 'Customer deleted successfully.' });
    }
    catch (error) {
        console.error('deleteCustomer error:', error);
        return res.status(500).json({ message: 'Failed to delete customer.' });
    }
}
