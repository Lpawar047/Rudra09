"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createFollowup = createFollowup;
exports.getFollowups = getFollowups;
const db_1 = require("../config/db");
async function createFollowup(req, res) {
    try {
        const { case_id, followup_type, contact_result, customer_response, remarks, next_followup_date } = req.body;
        const user = req.user;
        if (!case_id || !followup_type || !contact_result) {
            return res.status(400).json({ message: 'Case ID, follow-up type, and contact result are required.' });
        }
        const insertSql = `
      INSERT INTO followups (case_id, followup_type, contact_result, customer_response, remarks, next_followup_date, created_by)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;
        const result = await (0, db_1.query)(insertSql, [
            case_id,
            followup_type,
            contact_result,
            customer_response || null,
            remarks || null,
            next_followup_date || null,
            user.id,
        ]);
        // Automatically update case's last_followup_date and next_followup_date, and status if applicable
        let newStatus = undefined;
        if (contact_result === 'PROMISE_TO_PAY') {
            newStatus = 'PROMISE_TO_PAY';
        }
        else if (contact_result === 'CONTACTED') {
            newStatus = 'CONTACTED';
        }
        else if (contact_result === 'NOT_CONTACTED' || contact_result === 'CUSTOMER_UNAVAILABLE') {
            newStatus = 'UNABLE_TO_CONTACT';
        }
        let updateCaseSql = 'UPDATE recovery_cases SET last_followup_date = CURRENT_TIMESTAMP';
        const caseParams = [];
        if (next_followup_date) {
            updateCaseSql += ', next_followup_date = $' + (caseParams.length + 1);
            caseParams.push(next_followup_date);
        }
        if (newStatus) {
            updateCaseSql += ', status = $' + (caseParams.length + 1);
            caseParams.push(newStatus);
        }
        updateCaseSql += ' WHERE id = $' + (caseParams.length + 1);
        caseParams.push(case_id);
        await (0, db_1.query)(updateCaseSql, caseParams);
        return res.status(201).json({ followup: result.rows[0] });
    }
    catch (error) {
        console.error('createFollowup error:', error);
        return res.status(500).json({ message: 'Failed to record follow-up.' });
    }
}
async function getFollowups(req, res) {
    try {
        const { case_id } = req.query;
        const user = req.user;
        let sql = `
      SELECT 
        f.*,
        u.name as created_by_name,
        l.loan_account_number,
        c.full_name as customer_name
      FROM followups f
      JOIN recovery_cases r ON f.case_id = r.id
      JOIN loans l ON r.loan_id = l.id
      JOIN customers c ON l.customer_id = c.id
      LEFT JOIN users u ON f.created_by = u.id
    `;
        const params = [];
        if (user.role === 'EMPLOYEE') {
            sql += ' WHERE r.assigned_employee_id = $1';
            params.push(user.id);
            if (case_id) {
                sql += ' AND f.case_id = $2';
                params.push(case_id);
            }
        }
        else if (case_id) {
            sql += ' WHERE f.case_id = $1';
            params.push(case_id);
        }
        sql += ' ORDER BY f.id DESC';
        const result = await (0, db_1.query)(sql, params);
        return res.json({ followups: result.rows });
    }
    catch (error) {
        console.error('getFollowups error:', error);
        return res.status(500).json({ message: 'Failed to fetch follow-ups.' });
    }
}
