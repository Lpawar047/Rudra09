"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLoans = getLoans;
exports.getLoanById = getLoanById;
exports.createLoan = createLoan;
exports.updateLoan = updateLoan;
const db_1 = require("../config/db");
async function getLoans(req, res) {
    try {
        const { search, status } = req.query;
        let sql = `
      SELECT l.*, c.full_name as customer_name, c.phone as customer_phone, v.registration_number, v.model as vehicle_model
      FROM loans l
      JOIN customers c ON l.customer_id = c.id
      LEFT JOIN vehicles v ON l.vehicle_id = v.id
    `;
        const params = [];
        const conditions = [];
        if (search && String(search).trim() !== '') {
            const cleanTerm = String(search).trim();
            const idx = params.length + 1;
            params.push(`%${cleanTerm}%`);
            conditions.push(`(LOWER(l.loan_account_number) LIKE LOWER($${idx}) OR ` +
                `LOWER(c.full_name) LIKE LOWER($${idx}) OR ` +
                `LOWER(c.phone) LIKE LOWER($${idx}) OR ` +
                `LOWER(v.registration_number) LIKE LOWER($${idx}) OR ` +
                `LOWER(v.model) LIKE LOWER($${idx}))`);
        }
        if (status) {
            conditions.push('l.status = $' + (params.length + 1));
            params.push(status);
        }
        if (conditions.length > 0) {
            sql += ' WHERE ' + conditions.join(' AND ');
        }
        sql += ' ORDER BY l.id DESC';
        const result = await (0, db_1.query)(sql, params);
        return res.json({ loans: result.rows });
    }
    catch (error) {
        console.error('getLoans error:', error);
        return res.status(500).json({ message: 'Failed to fetch loans.' });
    }
}
async function getLoanById(req, res) {
    try {
        const { id } = req.params;
        const sql = `
      SELECT l.*, c.full_name as customer_name, c.phone as customer_phone, c.address as customer_address, v.registration_number, v.model as vehicle_model
      FROM loans l
      JOIN customers c ON l.customer_id = c.id
      LEFT JOIN vehicles v ON l.vehicle_id = v.id
      WHERE l.id = $1
    `;
        const result = await (0, db_1.query)(sql, [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Loan account not found.' });
        }
        return res.json({ loan: result.rows[0] });
    }
    catch (error) {
        console.error('getLoanById error:', error);
        return res.status(500).json({ message: 'Failed to fetch loan details.' });
    }
}
async function createLoan(req, res) {
    try {
        const { loan_account_number, customer_id, vehicle_id, loan_amount, outstanding_amount, emi_amount, emi_due_date, total_overdue, dpd, start_date, status } = req.body;
        if (!loan_account_number || !customer_id) {
            return res.status(400).json({ message: 'Loan account number and customer ID are required.' });
        }
        const sql = `
      INSERT INTO loans (loan_account_number, customer_id, vehicle_id, loan_amount, outstanding_amount, emi_amount, emi_due_date, total_overdue, dpd, start_date, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `;
        const result = await (0, db_1.query)(sql, [
            loan_account_number.trim(),
            customer_id,
            vehicle_id || null,
            loan_amount || 0,
            outstanding_amount || 0,
            emi_amount || 0,
            emi_due_date || null,
            total_overdue || 0,
            dpd || 0,
            start_date || null,
            status || 'ACTIVE',
        ]);
        return res.status(201).json({ loan: result.rows[0] });
    }
    catch (error) {
        console.error('createLoan error:', error);
        return res.status(500).json({ message: 'Failed to create loan account.' });
    }
}
async function updateLoan(req, res) {
    try {
        const { id } = req.params;
        const { loan_account_number, outstanding_amount, emi_amount, emi_due_date, total_overdue, dpd, status } = req.body;
        const existing = await (0, db_1.query)('SELECT * FROM loans WHERE id = $1', [id]);
        if (existing.rows.length === 0) {
            return res.status(404).json({ message: 'Loan not found.' });
        }
        const sql = `
      UPDATE loans
      SET loan_account_number = $1, outstanding_amount = $2, emi_amount = $3, emi_due_date = $4, total_overdue = $5, dpd = $6, status = $7, updated_at = CURRENT_TIMESTAMP
      WHERE id = $8
    `;
        await (0, db_1.query)(sql, [
            loan_account_number || existing.rows[0].loan_account_number,
            outstanding_amount !== undefined ? outstanding_amount : existing.rows[0].outstanding_amount,
            emi_amount !== undefined ? emi_amount : existing.rows[0].emi_amount,
            emi_due_date !== undefined ? emi_due_date : existing.rows[0].emi_due_date,
            total_overdue !== undefined ? total_overdue : existing.rows[0].total_overdue,
            dpd !== undefined ? dpd : existing.rows[0].dpd,
            status || existing.rows[0].status,
            id,
        ]);
        return res.json({ message: 'Loan updated successfully.' });
    }
    catch (error) {
        console.error('updateLoan error:', error);
        return res.status(500).json({ message: 'Failed to update loan.' });
    }
}
