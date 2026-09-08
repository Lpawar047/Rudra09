"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assignCase = assignCase;
exports.getAssignments = getAssignments;
const db_1 = require("../config/db");
async function assignCase(req, res) {
    try {
        const { case_id, employee_id, remarks } = req.body;
        const user = req.user;
        if (!case_id || !employee_id) {
            return res.status(400).json({ message: 'Case ID and Employee ID are required.' });
        }
        const caseRes = await (0, db_1.query)('SELECT * FROM recovery_cases WHERE id = $1', [case_id]);
        if (caseRes.rows.length === 0) {
            return res.status(404).json({ message: 'Recovery case not found.' });
        }
        const currentCase = caseRes.rows[0];
        const previousEmployeeId = currentCase.assigned_employee_id || null;
        // Update case with new employee and status
        const newStatus = currentCase.status === 'PENDING' ? 'ASSIGNED' : currentCase.status;
        await (0, db_1.query)(`UPDATE recovery_cases 
       SET assigned_employee_id = $1, status = $2, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $3`, [employee_id, newStatus, case_id]);
        // Insert into case_assignments history table
        await (0, db_1.query)(`INSERT INTO case_assignments (case_id, employee_id, assigned_by, previous_employee_id, remarks)
       VALUES ($1, $2, $3, $4, $5)`, [case_id, employee_id, user.id, previousEmployeeId, remarks || 'Reassigned by management']);
        // Log activity
        await (0, db_1.query)('INSERT INTO activity_logs (user_id, action, entity_type, entity_id, details) VALUES ($1, $2, $3, $4, $5)', [user.id, 'ASSIGN_CASE', 'RECOVERY_CASE', case_id, `Assigned case #${case_id} to employee ID ${employee_id}`]);
        return res.json({ message: 'Case assigned successfully.' });
    }
    catch (error) {
        console.error('assignCase error:', error);
        return res.status(500).json({ message: 'Failed to assign case.' });
    }
}
async function getAssignments(req, res) {
    try {
        const sql = `
      SELECT 
        ca.*,
        l.loan_account_number,
        c.full_name as customer_name,
        v.registration_number,
        emp.name as employee_name,
        assigner.name as assigned_by_name,
        prev.name as previous_employee_name
      FROM case_assignments ca
      JOIN recovery_cases r ON ca.case_id = r.id
      JOIN loans l ON r.loan_id = l.id
      JOIN customers c ON l.customer_id = c.id
      LEFT JOIN vehicles v ON l.vehicle_id = v.id
      JOIN users emp ON ca.employee_id = emp.id
      JOIN users assigner ON ca.assigned_by = assigner.id
      LEFT JOIN users prev ON ca.previous_employee_id = prev.id
      ORDER BY ca.id DESC
    `;
        const result = await (0, db_1.query)(sql);
        return res.json({ assignments: result.rows });
    }
    catch (error) {
        console.error('getAssignments error:', error);
        return res.status(500).json({ message: 'Failed to fetch assignment history.' });
    }
}
