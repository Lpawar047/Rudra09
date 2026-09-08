import { Response } from 'express';
import { query } from '../config/db';
import { AuthenticatedRequest } from '../middleware/auth';

export async function createPayment(req: AuthenticatedRequest, res: Response) {
  try {
    const { case_id, customer_id, amount, payment_mode, transaction_ref, remarks } = req.body;
    const user = req.user!;

    if (!case_id || !amount || !payment_mode) {
      return res.status(400).json({ message: 'Case ID, payment amount, and payment mode are required.' });
    }

    // Find recovery case & loan details
    const caseRes = await query('SELECT r.*, l.id as loan_id, l.outstanding_amount, l.customer_id as loan_cust_id FROM recovery_cases r JOIN loans l ON r.loan_id = l.id WHERE r.id = $1', [case_id]);
    if (caseRes.rows.length === 0) {
      return res.status(404).json({ message: 'Recovery case not found.' });
    }

    const currentCase = caseRes.rows[0];
    const custId = customer_id || currentCase.loan_cust_id;
    const numericAmount = parseFloat(amount);

    const insertSql = `
      INSERT INTO payments (case_id, customer_id, amount, payment_mode, transaction_ref, collected_by, remarks)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;

    const result = await query(insertSql, [
      case_id,
      custId,
      numericAmount,
      payment_mode,
      transaction_ref || null,
      user.id,
      remarks || null,
    ]);

    // Deduct payment amount from loan outstanding_amount
    const newOutstanding = Math.max(0, parseFloat(currentCase.outstanding_amount) - numericAmount);
    let caseStatus = currentCase.status;

    if (newOutstanding === 0) {
      caseStatus = 'RECOVERED';
      await query('UPDATE loans SET outstanding_amount = 0, status = $1 WHERE id = $2', ['RECOVERED', currentCase.loan_id]);
    } else {
      await query('UPDATE loans SET outstanding_amount = $1 WHERE id = $2', [newOutstanding, currentCase.loan_id]);
    }

    await query('UPDATE recovery_cases SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2', [caseStatus, case_id]);

    await query(
      'INSERT INTO activity_logs (user_id, action, entity_type, entity_id, details) VALUES ($1, $2, $3, $4, $5)',
      [user.id, 'RECORD_PAYMENT', 'PAYMENT', result.rows[0].id || result.lastID, `Recorded collection of ₹${numericAmount} for case #${case_id}`]
    );

    return res.status(201).json({ payment: result.rows[0] });
  } catch (error: any) {
    console.error('createPayment error:', error);
    return res.status(500).json({ message: 'Failed to record payment collection.' });
  }
}

export async function getPayments(req: AuthenticatedRequest, res: Response) {
  try {
    const { case_id } = req.query;
    const user = req.user!;

    let sql = `
      SELECT 
        p.*,
        u.name as collected_by_name,
        c.full_name as customer_name,
        c.phone as customer_phone,
        l.loan_account_number
      FROM payments p
      JOIN customers c ON p.customer_id = c.id
      JOIN recovery_cases r ON p.case_id = r.id
      JOIN loans l ON r.loan_id = l.id
      LEFT JOIN users u ON p.collected_by = u.id
    `;
    const params: any[] = [];

    if (user.role === 'EMPLOYEE') {
      sql += ' WHERE r.assigned_employee_id = $1';
      params.push(user.id);
      if (case_id) {
        sql += ' AND p.case_id = $2';
        params.push(case_id);
      }
    } else if (case_id) {
      sql += ' WHERE p.case_id = $1';
      params.push(case_id);
    }

    sql += ' ORDER BY p.id DESC';
    const result = await query(sql, params);
    return res.json({ payments: result.rows });
  } catch (error: any) {
    console.error('getPayments error:', error);
    return res.status(500).json({ message: 'Failed to fetch payments.' });
  }
}
