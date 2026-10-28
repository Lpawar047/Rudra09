import { Response } from 'express';
import { query } from '../config/db';
import { AuthenticatedRequest } from '../middleware/auth';
import { normalizeTaluka } from '../utils/taluka';

export async function getRecoveryCases(req: AuthenticatedRequest, res: Response) {
  try {
    const { 
      search, 
      status, 
      priority, 
      employee_id, 
      location, 
      taluka,
      bucket, 
      bom_bucket, 
      sort_by, 
      sort_order, 
      page = '1', 
      limit = '20' 
    } = req.query;
    const user = req.user!;

    const pageNum = Math.max(1, parseInt(String(page), 10) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(String(limit), 10) || 20));
    const offset = (pageNum - 1) * limitNum;

    let baseSql = `
      FROM recovery_cases r
      JOIN loans l ON r.loan_id = l.id
      LEFT JOIN customers c ON l.customer_id = c.id
      LEFT JOIN vehicles v ON l.vehicle_id = v.id
      LEFT JOIN users emp ON r.assigned_employee_id = emp.id
      LEFT JOIN users mgr ON r.assigned_manager_id = mgr.id
    `;

    const params: any[] = [];
    const conditions: string[] = [];

    // Role-based scoping: Field officers strictly view their assigned cases only
    if (user.role === 'EMPLOYEE') {
      conditions.push('r.assigned_employee_id = $' + (params.length + 1));
      params.push(user.id);
    } else if (user.role === 'MANAGER') {
      if (req.query.scope === 'mine' || req.query.assigned_only === 'true') {
        conditions.push('(r.assigned_manager_id = $' + (params.length + 1) + ' OR r.assigned_manager_id IS NULL)');
        params.push(user.id);
      }
    }

    // Search filter across entire dataset
    if (search && String(search).trim() !== '') {
      const cleanTerm = String(search).trim();
      const idx = params.length + 1;
      params.push(`%${cleanTerm}%`);

      const numMatch = cleanTerm.replace(/^RC-?/i, '').trim();
      let idCondition = '';
      if (/^\d+$/.test(numMatch)) {
        const idIdx = params.length + 1;
        params.push(parseInt(numMatch, 10));
        idCondition = ` OR r.id = $${idIdx}`;
      }

      conditions.push(
        `(LOWER(l.loan_account_number) LIKE LOWER($${idx}) OR ` +
        `LOWER(COALESCE(c.full_name, '')) LIKE LOWER($${idx}) OR ` +
        `LOWER(COALESCE(c.phone, '')) LIKE LOWER($${idx}) OR ` +
        `LOWER(COALESCE(v.registration_number, '')) LIKE LOWER($${idx}) OR ` +
        `LOWER(COALESCE(v.engine_number, '')) LIKE LOWER($${idx}) OR ` +
        `LOWER(COALESCE(v.chassis_number, '')) LIKE LOWER($${idx}) OR ` +
        `LOWER(COALESCE(v.model, '')) LIKE LOWER($${idx}) OR ` +
        `LOWER(COALESCE(c.city, '')) LIKE LOWER($${idx}) OR ` +
        `LOWER(COALESCE(c.address, '')) LIKE LOWER($${idx})${idCondition})`
      );
    }

    // Status filter - 'ALL' or '' means all authorized cases
    if (status && String(status).trim() !== '') {
      const statusClean = String(status).trim();
      if (statusClean.toUpperCase() !== 'ALL' && statusClean.toUpperCase() !== 'ALL_CASES') {
        conditions.push('LOWER(r.status) = LOWER($' + (params.length + 1) + ')');
        params.push(statusClean);
      }
    }

    // Priority filter
    if (priority && String(priority).trim() !== '') {
      const priorityClean = String(priority).trim();
      if (priorityClean.toUpperCase() !== 'ALL') {
        conditions.push('UPPER(r.priority) = UPPER($' + (params.length + 1) + ')');
        params.push(priorityClean);
      }
    }

    // Employee assignment filter
    if (employee_id && String(employee_id).trim() !== '') {
      const empIdClean = String(employee_id).trim();
      if (empIdClean.toUpperCase() === 'UNASSIGNED') {
        conditions.push('r.assigned_employee_id IS NULL');
      } else if (empIdClean.toUpperCase() !== 'ALL') {
        conditions.push('r.assigned_employee_id = $' + (params.length + 1));
        params.push(parseInt(empIdClean, 10));
      }
    }

    // Location / City filter
    if (location && String(location).trim() !== '') {
      const locIdx = params.length + 1;
      params.push(`%${String(location).trim()}%`);
      conditions.push('(LOWER(COALESCE(r.location, \'\')) LIKE LOWER($' + locIdx + ') OR LOWER(COALESCE(c.city, \'\')) LIKE LOWER($' + locIdx + '))');
    }

    // Taluka filter - exact match on dedicated normalized column
    if (taluka && String(taluka).trim() !== '') {
      const cleanTaluka = String(taluka).trim();
      if (cleanTaluka.toUpperCase() !== 'ALL' && cleanTaluka.toUpperCase() !== 'ALL TALUKAS') {
        conditions.push('r.taluka = $' + (params.length + 1));
        params.push(cleanTaluka);
      }
    }

    // Server-side BOM Bucket filter
    const activeBucket = String(bucket || bom_bucket || '').trim().toUpperCase();
    if (activeBucket && activeBucket !== 'ALL') {
      if (activeBucket === 'BOM 1' || activeBucket === 'BOM1') {
        conditions.push('(COALESCE(l.dpd, 0) <= 30)');
      } else if (activeBucket === 'BOM 2' || activeBucket === 'BOM2') {
        conditions.push('(l.dpd > 30 AND l.dpd <= 60)');
      } else if (activeBucket === 'BOM 3' || activeBucket === 'BOM3') {
        conditions.push('(l.dpd > 60 AND l.dpd <= 90)');
      } else if (activeBucket.includes('4') || activeBucket.includes('4+')) {
        conditions.push('(l.dpd > 90)');
      }
    }

    const whereClause = conditions.length > 0 ? ' WHERE ' + conditions.join(' AND ') : '';

    // 1. Fetch total count for pagination metadata
    const countSql = `SELECT COUNT(*) as total ${baseSql} ${whereClause}`;
    const countRes = await query(countSql, params);
    const total = parseInt(countRes.rows[0]?.total || countRes.rows[0]?.count || '0', 10);
    const totalPages = Math.ceil(total / limitNum) || 1;

    // 2. Build sorting
    const sortMap: Record<string, string> = {
      id: 'r.id',
      recovery_code: 'r.id',
      proposal_no: 'l.loan_account_number',
      loan_account_number: 'l.loan_account_number',
      customer_name: 'c.full_name',
      outstanding_amount: 'l.outstanding_amount',
      emi_amount: 'l.emi_amount',
      total_due: 'l.total_overdue',
      total_overdue: 'l.total_overdue',
      dpd: 'l.dpd',
      status: 'r.status',
      priority: 'r.priority',
      taluka: 'r.taluka',
      created_at: 'r.created_at',
      updated_at: 'r.updated_at',
    };

    const sortCol = sort_by && sortMap[String(sort_by).toLowerCase()] ? sortMap[String(sort_by).toLowerCase()] : 'r.id';
    const sortDir = String(sort_order).toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

    // 3. Fetch paginated records
    let selectSql = `
      SELECT 
        r.id, r.loan_id, r.assigned_employee_id, r.assigned_manager_id, r.priority, r.status,
        r.due_date, r.last_followup_date, r.next_followup_date, r.location, r.taluka, r.remarks, r.created_at, r.updated_at,
        l.loan_account_number, l.outstanding_amount, l.total_overdue, l.dpd, l.emi_amount, l.emi_due_date,
        c.id as customer_id, c.full_name as customer_name, c.phone as customer_phone, c.address as customer_address, c.city as customer_city,
        v.id as vehicle_id, v.registration_number, v.model as vehicle_model, v.status as vehicle_status, v.engine_number, v.chassis_number,
        emp.name as assigned_employee_name,
        mgr.name as assigned_manager_name
      ${baseSql}
      ${whereClause}
      ORDER BY ${sortCol} ${sortDir}
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `;

    const dataParams = [...params, limitNum, offset];
    const result = await query(selectSql, dataParams);

    // Format fields (recovery_code, proposal_no, bom_bucket, total_due) for each row
    const cases = result.rows.map((row: any) => {
      const dpd = row.dpd || 0;
      const bomBucket = dpd <= 30 ? 'BOM 1' : dpd <= 60 ? 'BOM 2' : dpd <= 90 ? 'BOM 3' : 'BOM 4+';
      return {
        ...row,
        recovery_code: `RC-${String(row.id).padStart(3, '0')}`,
        proposal_no: row.loan_account_number,
        bom_bucket: bomBucket,
        total_due: parseFloat(String(row.total_overdue || row.outstanding_amount || 0)),
      };
    });

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
        r.due_date, r.last_followup_date, r.next_followup_date, r.location, r.taluka, r.remarks, r.created_at, r.updated_at,
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

    // Authorization guard: Employees can only view cases assigned to them
    if (user.role === 'EMPLOYEE' && caseData.assigned_employee_id !== user.id) {
      return res.status(403).json({ message: 'Access denied: You are not assigned to this recovery case.' });
    }

    caseData.recovery_code = `RC-${String(caseData.id).padStart(3, '0')}`;
    caseData.proposal_no = caseData.loan_account_number;

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
    const { loan_id, assigned_employee_id, assigned_manager_id, priority, status, due_date, location, taluka, remarks } = req.body;

    if (!loan_id) {
      return res.status(400).json({ message: 'Loan ID is required.' });
    }

    const normalizedTaluka = taluka ? normalizeTaluka(taluka) : null;

    const sql = `
      INSERT INTO recovery_cases (loan_id, assigned_employee_id, assigned_manager_id, priority, status, due_date, location, taluka, remarks)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
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
      normalizedTaluka,
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
    const { priority, status, due_date, next_followup_date, location, taluka, remarks } = req.body;
    const user = req.user!;

    const existingRes = await query('SELECT * FROM recovery_cases WHERE id = $1', [id]);
    if (existingRes.rows.length === 0) {
      return res.status(404).json({ message: 'Recovery case not found.' });
    }

    const currentCase = existingRes.rows[0];

    if (user.role === 'EMPLOYEE' && currentCase.assigned_employee_id !== user.id) {
      return res.status(403).json({ message: 'Permission denied to update this case.' });
    }

    const normalizedTaluka = taluka !== undefined ? (taluka ? normalizeTaluka(taluka) : null) : currentCase.taluka;

    const sql = `
      UPDATE recovery_cases
      SET priority = $1, status = $2, due_date = $3, next_followup_date = $4, location = $5, taluka = $6, remarks = $7, updated_at = CURRENT_TIMESTAMP
      WHERE id = $8
    `;

    await query(sql, [
      priority || currentCase.priority,
      status || currentCase.status,
      due_date !== undefined ? due_date : currentCase.due_date,
      next_followup_date !== undefined ? next_followup_date : currentCase.next_followup_date,
      location !== undefined ? location : currentCase.location,
      normalizedTaluka,
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
