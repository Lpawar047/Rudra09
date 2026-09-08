import { Response } from 'express';
import { query } from '../config/db';
import { AuthenticatedRequest } from '../middleware/auth';

export async function getRecoveryCases(req: AuthenticatedRequest, res: Response) {
  try {
    const { search, status, priority, employee_id, location, page = '1', limit = '20' } = req.query;
    const user = req.user!;

    const pageNum = Math.max(1, parseInt(String(page), 10) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(String(limit), 10) || 20));
    const offset = (pageNum - 1) * limitNum;

    let baseSql = `
      FROM recovery_cases r
      JOIN loans l ON r.loan_id = l.id
      JOIN customers c ON l.customer_id = c.id
      LEFT JOIN vehicles v ON l.vehicle_id = v.id
      LEFT JOIN users emp ON r.assigned_employee_id = emp.id
      LEFT JOIN users mgr ON r.assigned_manager_id = mgr.id
    `;

    const params: any[] = [];
    const conditions: string[] = [];

    // Role-based scoping
    if (user.role === 'EMPLOYEE') {
      conditions.push('r.assigned_employee_id = $' + (params.length + 1));
      params.push(user.id);
    } else if (user.role === 'MANAGER') {
      conditions.push('(r.assigned_manager_id = $' + (params.length + 1) + ' OR r.assigned_manager_id IS NULL)');
      params.push(user.id);
    }

    if (search && String(search).trim() !== '') {
      const cleanTerm = String(search).trim();
      const idx = params.length + 1;
      params.push(`%${cleanTerm}%`);

      conditions.push(
        `(LOWER(l.loan_account_number) LIKE LOWER($${idx}) OR ` +
        `LOWER(c.full_name) LIKE LOWER($${idx}) OR ` +
        `LOWER(c.phone) LIKE LOWER($${idx}) OR ` +
        `LOWER(v.registration_number) LIKE LOWER($${idx}) OR ` +
        `LOWER(v.engine_number) LIKE LOWER($${idx}) OR ` +
        `LOWER(v.chassis_number) LIKE LOWER($${idx}) OR ` +
        `LOWER(v.model) LIKE LOWER($${idx}) OR ` +
        `LOWER(c.city) LIKE LOWER($${idx}) OR ` +
        `LOWER(c.address) LIKE LOWER($${idx}))`
      );
    }

    if (status && String(status).trim() !== '') {
      conditions.push('r.status = $' + (params.length + 1));
      params.push(status);
    }

    if (priority && String(priority).trim() !== '') {
      conditions.push('r.priority = $' + (params.length + 1));
      params.push(priority);
    }

    if (employee_id && String(employee_id).trim() !== '') {
      conditions.push('r.assigned_employee_id = $' + (params.length + 1));
      params.push(employee_id);
    }

    if (location && String(location).trim() !== '') {
      conditions.push('(r.location LIKE $' + (params.length + 1) + ' OR c.city LIKE $' + (params.length + 1) + ')');
      params.push(`%${location}%`);
    }

    const whereClause = conditions.length > 0 ? ' WHERE ' + conditions.join(' AND ') : '';

    // 1. Fetch total count for pagination metadata
    const countSql = `SELECT COUNT(*) as total ${baseSql} ${whereClause}`;
    const countRes = await query(countSql, params);
    const total = parseInt(countRes.rows[0]?.total || countRes.rows[0]?.count || '0', 10);
    const totalPages = Math.ceil(total / limitNum) || 1;

    // 2. Fetch paginated records
    let selectSql = `
      SELECT 
        r.id, r.loan_id, r.assigned_employee_id, r.assigned_manager_id, r.priority, r.status,
        r.due_date, r.last_followup_date, r.next_followup_date, r.location, r.remarks, r.created_at, r.updated_at,
        l.loan_account_number, l.outstanding_amount, l.total_overdue, l.dpd, l.emi_amount, l.emi_due_date,
        c.id as customer_id, c.full_name as customer_name, c.phone as customer_phone, c.address as customer_address, c.city as customer_city,
        v.id as vehicle_id, v.registration_number, v.model as vehicle_model, v.status as vehicle_status, v.engine_number, v.chassis_number,
        emp.name as assigned_employee_name,
        mgr.name as assigned_manager_name
      ${baseSql}
      ${whereClause}
      ORDER BY r.id DESC
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `;

    const dataParams = [...params, limitNum, offset];
    const result = await query(selectSql, dataParams);

    // Format recovery_code (e.g. RC-001, RC-002, RC-012) for each row
    const cases = result.rows.map((row: any) => ({
      ...row,
      recovery_code: `RC-${String(row.id).padStart(3, '0')}`,
      proposal_no: row.loan_account_number,
    }));

    return res.json({
      cases,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages,
      },
    });
  } catch (error: any) {
    console.error('getRecoveryCases error:', error);
    return res.status(500).json({ message: 'Failed to fetch recovery cases.' });
  }
}

export async function getRecoveryCaseById(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;
    const user = req.user!;

    let sql = `
      SELECT 
        r.id, r.loan_id, r.assigned_employee_id, r.assigned_manager_id, r.priority, r.status,
        r.due_date, r.last_followup_date, r.next_followup_date, r.location, r.remarks, r.created_at, r.updated_at,
        l.loan_account_number, l.outstanding_amount, l.total_overdue, l.dpd, l.emi_amount, l.emi_due_date, l.loan_amount,
        c.id as customer_id, c.customer_id as cust_code, c.full_name as customer_name, c.phone as customer_phone, c.alt_phone, c.email as customer_email, c.address as customer_address, c.city as customer_city, c.state as customer_state, c.pincode, c.employment_info,
        v.id as vehicle_id, v.registration_number, v.vehicle_type, v.manufacturer, v.model as vehicle_model, v.variant, v.chassis_number, v.engine_number, v.location as vehicle_location, v.status as vehicle_status,
        emp.name as assigned_employee_name,
        mgr.name as assigned_manager_name
      FROM recovery_cases r
      JOIN loans l ON r.loan_id = l.id
      JOIN customers c ON l.customer_id = c.id
      LEFT JOIN vehicles v ON l.vehicle_id = v.id
      LEFT JOIN users emp ON r.assigned_employee_id = emp.id
      LEFT JOIN users mgr ON r.assigned_manager_id = mgr.id
      WHERE r.id = $1
    `;

    const result = await query(sql, [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Recovery case not found.' });
    }

    const caseData = result.rows[0];
    caseData.recovery_code = `RC-${String(caseData.id).padStart(3, '0')}`;
    caseData.proposal_no = caseData.loan_account_number;

    // Security restriction for EMPLOYEE
    if (user.role === 'EMPLOYEE' && caseData.assigned_employee_id !== user.id) {
      return res.status(403).json({ message: 'Access denied to this recovery case.' });
    }

    // Fetch followups
    const followupsRes = await query(
      `SELECT f.*, u.name as created_by_name 
       FROM followups f 
       LEFT JOIN users u ON f.created_by = u.id 
       WHERE f.case_id = $1 
       ORDER BY f.id DESC`,
      [id]
    );

    // Fetch payments
    const paymentsRes = await query(
      `SELECT p.*, u.name as collected_by_name 
       FROM payments p 
       LEFT JOIN users u ON p.collected_by = u.id 
       WHERE p.case_id = $1 
       ORDER BY p.id DESC`,
      [id]
    );

    // Fetch assignment history
    const assignmentsRes = await query(
      `SELECT ca.*, emp.name as employee_name, assigner.name as assigned_by_name, prev.name as previous_employee_name
       FROM case_assignments ca
       JOIN users emp ON ca.employee_id = emp.id
       JOIN users assigner ON ca.assigned_by = assigner.id
       LEFT JOIN users prev ON ca.previous_employee_id = prev.id
       WHERE ca.case_id = $1
       ORDER BY ca.id DESC`,
      [id]
    );

    return res.json({
      case: caseData,
      followups: followupsRes.rows,
      payments: paymentsRes.rows,
      assignments: assignmentsRes.rows,
    });
  } catch (error: any) {
    console.error('getRecoveryCaseById error:', error);
    return res.status(500).json({ message: 'Failed to fetch case details.' });
  }
}

export async function createRecoveryCase(req: AuthenticatedRequest, res: Response) {
  try {
    const { loan_id, assigned_employee_id, assigned_manager_id, priority, status, due_date, location, remarks } = req.body;

    if (!loan_id) {
      return res.status(400).json({ message: 'Loan ID is required.' });
    }

    const sql = `
      INSERT INTO recovery_cases (loan_id, assigned_employee_id, assigned_manager_id, priority, status, due_date, location, remarks)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;

    const result = await query(sql, [
      loan_id,
      assigned_employee_id || null,
      assigned_manager_id || null,
      priority || 'MEDIUM',
      status || 'PENDING',
      due_date || null,
      location || null,
      remarks || null,
    ]);

    const newCase = result.rows[0];

    if (assigned_employee_id) {
      await query(
        `INSERT INTO case_assignments (case_id, employee_id, assigned_by, remarks)
         VALUES ($1, $2, $3, $4)`,
        [newCase.id || result.lastID, assigned_employee_id, req.user!.id, 'Initial case assignment']
      );
    }

    return res.status(201).json({ case: newCase });
  } catch (error: any) {
    console.error('createRecoveryCase error:', error);
    return res.status(500).json({ message: 'Failed to create recovery case.' });
  }
}

export async function updateRecoveryCase(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;
    const { priority, status, due_date, next_followup_date, location, remarks } = req.body;
    const user = req.user!;

    const existingRes = await query('SELECT * FROM recovery_cases WHERE id = $1', [id]);
    if (existingRes.rows.length === 0) {
      return res.status(404).json({ message: 'Recovery case not found.' });
    }

    const currentCase = existingRes.rows[0];

    if (user.role === 'EMPLOYEE' && currentCase.assigned_employee_id !== user.id) {
      return res.status(403).json({ message: 'Permission denied to update this case.' });
    }

    const sql = `
      UPDATE recovery_cases
      SET priority = $1, status = $2, due_date = $3, next_followup_date = $4, location = $5, remarks = $6, updated_at = CURRENT_TIMESTAMP
      WHERE id = $7
    `;

    await query(sql, [
      priority || currentCase.priority,
      status || currentCase.status,
      due_date !== undefined ? due_date : currentCase.due_date,
      next_followup_date !== undefined ? next_followup_date : currentCase.next_followup_date,
      location !== undefined ? location : currentCase.location,
      remarks !== undefined ? remarks : currentCase.remarks,
      id,
    ]);

    await query(
      'INSERT INTO activity_logs (user_id, action, entity_type, entity_id, details) VALUES ($1, $2, $3, $4, $5)',
      [user.id, 'UPDATE_CASE', 'RECOVERY_CASE', id, `Updated case status to ${status || currentCase.status}`]
    );

    return res.json({ message: 'Recovery case updated successfully.' });
  } catch (error: any) {
    console.error('updateRecoveryCase error:', error);
    return res.status(500).json({ message: 'Failed to update recovery case.' });
  }
}

export async function deleteRecoveryCase(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;
    await query('DELETE FROM recovery_cases WHERE id = $1', [id]);

    await query(
      'INSERT INTO activity_logs (user_id, action, entity_type, entity_id, details) VALUES ($1, $2, $3, $4, $5)',
      [req.user!.id, 'DELETE_CASE', 'RECOVERY_CASE', id, `Deleted recovery case ID ${id}`]
    );

    return res.json({ message: 'Recovery case deleted successfully.' });
  } catch (error: any) {
    console.error('deleteRecoveryCase error:', error);
    return res.status(500).json({ message: 'Failed to delete recovery case.' });
  }
}
