import { Response } from 'express';
import { query } from '../config/db';
import { AuthenticatedRequest } from '../middleware/auth';

export async function assignCase(req: AuthenticatedRequest, res: Response) {
  try {
    const { case_id, employee_id, remarks, manager_id } = req.body;
    const user = req.user!;

    // Sanitize and validate inputs
    if (case_id === undefined || case_id === null || employee_id === undefined || employee_id === null) {
      return res.status(400).json({ message: 'Case ID and Employee ID are required.' });
    }

    const cleanCaseId = typeof case_id === 'number' 
      ? case_id 
      : parseInt(String(case_id).replace(/^RC-?/i, '').trim(), 10);
    const cleanEmployeeId = typeof employee_id === 'number'
      ? employee_id
      : parseInt(String(employee_id).trim(), 10);

    if (isNaN(cleanCaseId) || cleanCaseId <= 0) {
      return res.status(400).json({ message: 'Invalid Case ID format.' });
    }
    if (isNaN(cleanEmployeeId) || cleanEmployeeId <= 0) {
      return res.status(400).json({ message: 'Invalid Employee ID format.' });
    }

    // Verify case exists and retrieve its dossier for the assignment popup
    const caseRes = await query(
      `SELECT 
        r.id, r.loan_id, r.assigned_employee_id, r.assigned_manager_id, r.priority, r.status,
        r.taluka, r.location,
        l.loan_account_number, l.outstanding_amount, l.total_overdue, l.dpd, l.emi_amount,
        c.full_name as customer_name, c.phone as customer_phone, c.address as customer_address,
        v.registration_number, v.model as vehicle_model, v.manufacturer as vehicle_make
       FROM recovery_cases r
       JOIN loans l ON r.loan_id = l.id
       LEFT JOIN customers c ON l.customer_id = c.id
       LEFT JOIN vehicles v ON l.vehicle_id = v.id
       WHERE r.id = $1`,
      [cleanCaseId]
    );

    if (caseRes.rows.length === 0) {
      return res.status(404).json({ message: `Recovery case #${cleanCaseId} not found.` });
    }

    const currentCase = caseRes.rows[0];
    const previousEmployeeId = currentCase.assigned_employee_id || null;

    // Verify target employee exists
    const empRes = await query(
      'SELECT id, name, email, phone, department, status, role FROM users WHERE id = $1',
      [cleanEmployeeId]
    );
    if (empRes.rows.length === 0) {
      return res.status(404).json({ message: `Target employee with ID ${cleanEmployeeId} was not found.` });
    }
    const targetEmployee = empRes.rows[0];

    if (targetEmployee.status === 'DISABLED' || targetEmployee.status === 'REJECTED') {
      return res.status(400).json({ 
        message: `Cannot assign case to ${targetEmployee.name} because their account status is ${targetEmployee.status}.` 
      });
    }

    // Determine manager attribution
    let assignedManagerId = currentCase.assigned_manager_id;
    if (user.role === 'MANAGER') {
      assignedManagerId = user.id;
    } else if (manager_id) {
      const cleanMgrId = parseInt(String(manager_id), 10);
      if (!isNaN(cleanMgrId) && cleanMgrId > 0) {
        assignedManagerId = cleanMgrId;
      }
    }

    // Determine new status: if PENDING or Unpaid, elevate to ASSIGNED
    const newStatus = (currentCase.status === 'PENDING' || currentCase.status === 'Unpaid' || !currentCase.status)
      ? 'ASSIGNED'
      : currentCase.status;

    // Update recovery_cases
    await query(
      `UPDATE recovery_cases 
       SET assigned_employee_id = $1, 
           assigned_manager_id = $2, 
           status = $3, 
           updated_at = CURRENT_TIMESTAMP 
       WHERE id = $4`,
      [cleanEmployeeId, assignedManagerId, newStatus, cleanCaseId]
    );

    // Insert into case_assignments history table
    const assignmentNote = remarks && String(remarks).trim() 
      ? String(remarks).trim() 
      : 'Assigned by management';

    await query(
      `INSERT INTO case_assignments (case_id, employee_id, assigned_by, previous_employee_id, remarks)
       VALUES ($1, $2, $3, $4, $5)`,
      [cleanCaseId, cleanEmployeeId, user.id, previousEmployeeId, assignmentNote]
    );

    // Log activity
    await query(
      'INSERT INTO activity_logs (user_id, action, entity_type, entity_id, details) VALUES ($1, $2, $3, $4, $5)',
      [
        user.id, 
        'ASSIGN_CASE', 
        'RECOVERY_CASE', 
        cleanCaseId, 
        `Assigned case #${cleanCaseId} (${currentCase.loan_account_number}) to ${targetEmployee.name} (${targetEmployee.email})`
      ]
    );

    // Fetch assigner name for confirmation response
    const assignerRes = await query('SELECT name FROM users WHERE id = $1', [user.id]);
    const assignerName = assignerRes.rows[0]?.name || user.email;

    return res.json({
      success: true,
      message: `Case #${cleanCaseId} successfully assigned to ${targetEmployee.name}.`,
      assignment: {
        case_id: cleanCaseId,
        recovery_code: `RC-${String(cleanCaseId).padStart(3, '0')}`,
        loan_account_number: currentCase.loan_account_number,
        customer_name: currentCase.customer_name || 'N/A',
        customer_phone: currentCase.customer_phone || 'N/A',
        customer_address: currentCase.customer_address || 'N/A',
        vehicle_reg_no: currentCase.registration_number || 'N/A',
        vehicle_model: currentCase.vehicle_model || 'N/A',
        vehicle_make: currentCase.vehicle_make || '',
        taluka: currentCase.taluka || 'All Talukas',
        total_overdue: parseFloat(String(currentCase.total_overdue || currentCase.outstanding_amount || 0)),
        dpd: currentCase.dpd || 0,
        status: newStatus,
        employee_id: cleanEmployeeId,
        employee_name: targetEmployee.name,
        employee_email: targetEmployee.email,
        employee_phone: targetEmployee.phone || '',
        employee_dept: targetEmployee.department || 'Field Officer',
        assigned_by_id: user.id,
        assigned_by_name: assignerName,
        assigned_at: new Date().toISOString(),
        remarks: assignmentNote,
      },
    });
  } catch (error: any) {
    console.error('assignCase error:', error);
    return res.status(500).json({ message: error.message || 'Failed to assign case.' });
  }
}

export async function getAssignments(req: AuthenticatedRequest, res: Response) {
  try {
    const sql = `
      SELECT 
        ca.*,
        l.loan_account_number,
        c.full_name as customer_name,
        v.registration_number,
        emp.name as employee_name,
        emp.email as employee_email,
        assigner.name as assigned_by_name,
        prev.name as previous_employee_name,
        r.taluka
      FROM case_assignments ca
      JOIN recovery_cases r ON ca.case_id = r.id
      JOIN loans l ON r.loan_id = l.id
      LEFT JOIN customers c ON l.customer_id = c.id
      LEFT JOIN vehicles v ON l.vehicle_id = v.id
      JOIN users emp ON ca.employee_id = emp.id
      JOIN users assigner ON ca.assigned_by = assigner.id
      LEFT JOIN users prev ON ca.previous_employee_id = prev.id
      ORDER BY ca.id DESC
    `;
    const result = await query(sql);
    return res.json({ assignments: result.rows });
  } catch (error: any) {
    console.error('getAssignments error:', error);
    return res.status(500).json({ message: 'Failed to fetch assignment history.' });
  }
}
