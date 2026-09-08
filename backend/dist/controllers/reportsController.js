"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDashboardMetrics = getDashboardMetrics;
exports.getRecoveryReports = getRecoveryReports;
exports.getEmployeeReports = getEmployeeReports;
exports.exportReportsExcel = exportReportsExcel;
const db_1 = require("../config/db");
const xlsx_1 = __importDefault(require("xlsx"));
async function getDashboardMetrics(req, res) {
    try {
        const user = req.user;
        let userFilter = '';
        const params = [];
        if (user.role === 'EMPLOYEE') {
            userFilter = ' WHERE r.assigned_employee_id = $1';
            params.push(user.id);
        }
        else if (user.role === 'MANAGER') {
            userFilter = ' WHERE (r.assigned_manager_id = $1 OR r.assigned_manager_id IS NULL)';
            params.push(user.id);
        }
        // Total Cases
        const casesCountRes = await (0, db_1.query)(`SELECT COUNT(*) as count FROM recovery_cases r ${userFilter}`, params);
        const totalCases = parseInt(casesCountRes.rows[0].count, 10) || 0;
        // Status breakdown
        const statusRes = await (0, db_1.query)(`SELECT r.status, COUNT(*) as count FROM recovery_cases r ${userFilter} GROUP BY r.status`, params);
        const statusCounts = {
            Paid: 0,
            Unpaid: 0,
            PENDING: 0,
            ASSIGNED: 0,
            IN_PROGRESS: 0,
            CONTACTED: 0,
            PROMISE_TO_PAY: 0,
            RECOVERED: 0,
            CLOSED: 0,
            UNABLE_TO_CONTACT: 0,
            LEGAL_ACTION: 0,
        };
        statusRes.rows.forEach(row => {
            if (row.status) {
                statusCounts[row.status] = parseInt(row.count, 10) || 0;
            }
        });
        // Financial totals
        const financialRes = await (0, db_1.query)(`SELECT 
        COALESCE(SUM(l.outstanding_amount), 0) as total_outstanding,
        COALESCE(SUM(l.loan_amount), 0) as total_loan
       FROM recovery_cases r
       JOIN loans l ON r.loan_id = l.id
       ${userFilter}`, params);
        const totalOutstanding = parseFloat(financialRes.rows[0].total_outstanding) || 0;
        // Collected total
        let collectedSql = `
      SELECT COALESCE(SUM(p.amount), 0) as total_collected 
      FROM payments p
      JOIN recovery_cases r ON p.case_id = r.id
      ${userFilter}
    `;
        const collectedRes = await (0, db_1.query)(collectedSql, params);
        const totalCollected = parseFloat(collectedRes.rows[0].total_collected) || 0;
        const recoveryPercentage = totalOutstanding + totalCollected > 0
            ? ((totalCollected / (totalOutstanding + totalCollected)) * 100).toFixed(1)
            : '0.0';
        // Recent cases
        const recentCasesSql = `
      SELECT r.id, l.loan_account_number, c.full_name as customer_name, v.registration_number, r.status, r.priority, l.outstanding_amount
      FROM recovery_cases r
      JOIN loans l ON r.loan_id = l.id
      JOIN customers c ON l.customer_id = c.id
      LEFT JOIN vehicles v ON l.vehicle_id = v.id
      ${userFilter}
      ORDER BY r.id DESC LIMIT 5
    `;
        const recentCasesRes = await (0, db_1.query)(recentCasesSql, params);
        // Employee leaderboard / performance
        const empPerformanceSql = `
      SELECT 
        u.id, u.name,
        COUNT(r.id) as assigned_cases,
        SUM(CASE WHEN r.status = 'RECOVERED' OR r.status = 'CLOSED' THEN 1 ELSE 0 END) as completed_cases,
        COALESCE(SUM(p.amount), 0) as recovered_amount
      FROM users u
      LEFT JOIN recovery_cases r ON r.assigned_employee_id = u.id
      LEFT JOIN payments p ON p.collected_by = u.id
      WHERE u.role = 'EMPLOYEE'
      GROUP BY u.id, u.name
      ORDER BY recovered_amount DESC LIMIT 5
    `;
        const empPerformanceRes = await (0, db_1.query)(empPerformanceSql);
        // Recent follow-ups
        const recentFollowupsSql = `
      SELECT f.id, f.case_id, f.followup_type, f.contact_result, f.remarks, f.followup_date, u.name as created_by_name, l.loan_account_number
      FROM followups f
      JOIN recovery_cases r ON f.case_id = r.id
      JOIN loans l ON r.loan_id = l.id
      LEFT JOIN users u ON f.created_by = u.id
      ${userFilter}
      ORDER BY f.id DESC LIMIT 5
    `;
        const recentFollowupsRes = await (0, db_1.query)(recentFollowupsSql, params);
        // Activity logs for admin
        let activityLogs = [];
        if (user.role === 'ADMIN') {
            const logsRes = await (0, db_1.query)(`SELECT a.*, u.name as user_name FROM activity_logs a LEFT JOIN users u ON a.user_id = u.id ORDER BY a.id DESC LIMIT 10`);
            activityLogs = logsRes.rows;
        }
        return res.json({
            metrics: {
                total_cases: totalCases,
                pending_cases: statusCounts.PENDING,
                assigned_cases: statusCounts.ASSIGNED,
                in_progress: statusCounts.IN_PROGRESS,
                contacted: statusCounts.CONTACTED,
                promise_to_pay: statusCounts.PROMISE_TO_PAY,
                recovered: statusCounts.RECOVERED,
                closed: statusCounts.CLOSED,
                unable_to_contact: statusCounts.UNABLE_TO_CONTACT,
                legal_action: statusCounts.LEGAL_ACTION,
                recovery_percentage: parseFloat(recoveryPercentage),
                total_outstanding_amount: totalOutstanding,
                total_collected_amount: totalCollected,
            },
            status_distribution: statusCounts,
            recent_cases: recentCasesRes.rows,
            employee_performance: empPerformanceRes.rows,
            recent_followups: recentFollowupsRes.rows,
            activity_logs: activityLogs,
        });
    }
    catch (error) {
        console.error('getDashboardMetrics error:', error);
        return res.status(500).json({ message: 'Failed to generate dashboard metrics.' });
    }
}
async function getRecoveryReports(req, res) {
    try {
        const { start_date, end_date, employee_id, status, location } = req.query;
        let sql = `
      SELECT 
        r.id as case_id, r.status, r.priority, r.created_at,
        l.loan_account_number, l.outstanding_amount, l.dpd, l.emi_amount,
        c.full_name as customer_name, c.phone as customer_phone, c.city as location,
        v.registration_number, v.model as vehicle_model,
        emp.name as employee_name,
        COALESCE(SUM(p.amount), 0) as total_collected
      FROM recovery_cases r
      JOIN loans l ON r.loan_id = l.id
      JOIN customers c ON l.customer_id = c.id
      LEFT JOIN vehicles v ON l.vehicle_id = v.id
      LEFT JOIN users emp ON r.assigned_employee_id = emp.id
      LEFT JOIN payments p ON p.case_id = r.id
    `;
        const params = [];
        const conditions = [];
        if (status) {
            conditions.push('r.status = $' + (params.length + 1));
            params.push(status);
        }
        if (employee_id) {
            conditions.push('r.assigned_employee_id = $' + (params.length + 1));
            params.push(employee_id);
        }
        if (location) {
            conditions.push('c.city LIKE $' + (params.length + 1));
            params.push(`%${location}%`);
        }
        if (conditions.length > 0) {
            sql += ' WHERE ' + conditions.join(' AND ');
        }
        sql += ' GROUP BY r.id, l.id, c.id, v.id, emp.id ORDER BY r.id DESC';
        const result = await (0, db_1.query)(sql, params);
        return res.json({ report: result.rows });
    }
    catch (error) {
        console.error('getRecoveryReports error:', error);
        return res.status(500).json({ message: 'Failed to generate recovery report.' });
    }
}
async function getEmployeeReports(req, res) {
    try {
        const sql = `
      SELECT 
        u.id, u.name, u.email, u.phone, u.department, u.status,
        COUNT(r.id) as total_assigned_cases,
        SUM(CASE WHEN r.status = 'RECOVERED' THEN 1 ELSE 0 END) as recovered_cases,
        SUM(CASE WHEN r.status = 'CLOSED' THEN 1 ELSE 0 END) as closed_cases,
        SUM(CASE WHEN r.status = 'PENDING' OR r.status = 'ASSIGNED' THEN 1 ELSE 0 END) as pending_cases,
        COALESCE(SUM(p.amount), 0) as total_recovery_amount
      FROM users u
      LEFT JOIN recovery_cases r ON r.assigned_employee_id = u.id
      LEFT JOIN payments p ON p.collected_by = u.id
      WHERE u.role = 'EMPLOYEE'
      GROUP BY u.id
      ORDER BY total_recovery_amount DESC
    `;
        const result = await (0, db_1.query)(sql);
        return res.json({ employee_reports: result.rows });
    }
    catch (error) {
        console.error('getEmployeeReports error:', error);
        return res.status(500).json({ message: 'Failed to generate employee report.' });
    }
}
async function exportReportsExcel(req, res) {
    try {
        const { status, employee_id, location } = req.query;
        let sql = `
      SELECT 
        r.id as case_id, r.status, r.priority, r.created_at,
        l.loan_account_number as proposal_no, l.outstanding_amount, l.dpd, l.emi_amount, l.total_overdue,
        c.full_name as customer_name, c.phone as customer_phone, c.address as residence_address, c.city as location,
        v.registration_number, v.model as vehicle_model, v.engine_number, v.chassis_number,
        emp.name as employee_name,
        COALESCE(SUM(p.amount), 0) as total_collected
      FROM recovery_cases r
      JOIN loans l ON r.loan_id = l.id
      JOIN customers c ON l.customer_id = c.id
      LEFT JOIN vehicles v ON l.vehicle_id = v.id
      LEFT JOIN users emp ON r.assigned_employee_id = emp.id
      LEFT JOIN payments p ON p.case_id = r.id
    `;
        const params = [];
        const conditions = [];
        if (status) {
            conditions.push('r.status = $' + (params.length + 1));
            params.push(status);
        }
        if (employee_id) {
            conditions.push('r.assigned_employee_id = $' + (params.length + 1));
            params.push(employee_id);
        }
        if (location) {
            conditions.push('c.city LIKE $' + (params.length + 1));
            params.push(`%${location}%`);
        }
        if (conditions.length > 0) {
            sql += ' WHERE ' + conditions.join(' AND ');
        }
        sql += ' GROUP BY r.id, l.id, c.id, v.id, emp.id ORDER BY r.id DESC';
        const result = await (0, db_1.query)(sql, params);
        const formattedRows = result.rows.map(r => ({
            'Recovery Code': 'RC-' + String(r.case_id).padStart(3, '0'),
            'Proposal No': r.proposal_no || 'N/A',
            'Customer Name': r.customer_name || 'N/A',
            'Phone': r.customer_phone || 'N/A',
            'Location': r.location || 'N/A',
            'Registration Number': r.registration_number || 'N/A',
            'Vehicle Model': r.vehicle_model || 'N/A',
            'Engine No': r.engine_number || 'N/A',
            'Chassis No': r.chassis_number || 'N/A',
            'POS / Outstanding': r.outstanding_amount || 0,
            'EMI Amount': r.emi_amount || 0,
            'Total Due': r.total_overdue || 0,
            'DPD': r.dpd || 0,
            'Status': r.status || 'PENDING',
            'Assigned Employee': r.employee_name || 'Unassigned',
            'Total Collected': r.total_collected || 0,
            'Created Date': r.created_at ? new Date(r.created_at).toLocaleDateString() : 'N/A'
        }));
        const wb = xlsx_1.default.utils.book_new();
        const ws = xlsx_1.default.utils.json_to_sheet(formattedRows);
        xlsx_1.default.utils.book_append_sheet(wb, ws, 'Recovery_Report');
        const buffer = xlsx_1.default.write(wb, { type: 'buffer', bookType: 'xlsx' });
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="RUDRA_Recovery_Report_${Date.now()}.xlsx"`);
        return res.send(buffer);
    }
    catch (error) {
        console.error('exportReportsExcel error:', error);
        return res.status(500).json({ message: 'Failed to export Excel report.' });
    }
}
