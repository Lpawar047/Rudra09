import { Response } from 'express';
import { query } from '../config/db';
import { AuthenticatedRequest } from '../middleware/auth';
import * as xlsx from 'xlsx';
import path from 'path';

// Target Excel Column Dictionary Mapping
const COLUMN_MAPPINGS: Record<string, string[]> = {
  loan_account_number: [
    'proposal no', 'proposal_no', 'proposal', 'proposal no.', 'loan account number', 
    'loan account no', 'account number', 'loan no', 'loan account', 'account no', 
    'loan_acc_no', 'loan_account', 'loan_no', 'loan_number', 'lan', 'agreement_no', 
    'agreement no', 'contract_no', 'loan_id'
  ],
  customer_name: [
    'customer name', 'borrower name', 'customer', 'borrower', 'name', 'client name', 
    'party name', 'party', 'customer_name', 'borrower_name', 'cust_name', 'hirer_name'
  ],
  phone: [
    'mo no', 'mo_no', 'mono', 'mobile no', 'mobile number', 'phone', 'contact number', 
    'mobile', 'phone number', 'contact', 'contact no', 'phone_no', 'mobile_no', 'contact_no', 'mo no.'
  ],
  address: [
    'residence address', 'residence_address', 'res_address', 'customer address', 
    'location address', 'address', 'cust_address', 'full_address', 'addr'
  ],
  city: [
    'city', 'location', 'town', 'district', 'branch', 'area', 'zone', 'place'
  ],
  state: [
    'state', 'province', 'region'
  ],
  vehicle_number: [
    'registration number', 'registration no', 'reg no', 'reg_no', 'vehicle number', 
    'vehicle reg no', 'vehicle no', 'veh_no', 'veh_reg_no', 'rc_no', 'reg number'
  ],
  vehicle_model: [
    'asset desc', 'asset_desc', 'asset description', 'vehicle model', 'model', 
    'vehicle name', 'car model', 'make model', 'vehicle_make', 'asset'
  ],
  engine_number: [
    'engine no', 'engine_no', 'engine number', 'engine_num', 'eng_no', 'engine no.'
  ],
  chassis_number: [
    'chassis no', 'chassis_no', 'chassis number', 'chassis_num', 'chas_no', 'chassis no.'
  ],
  outstanding_amount: [
    'pos', 'outstanding amount', 'total outstanding', 'balance', 'outstanding', 
    'due amount', 'pos_amount', 'principal_balance'
  ],
  emi_amount: [
    'emi amount', 'emi_amount', 'emi', 'monthly emi', 'emi_amt', 'installment_amount'
  ],
  total_overdue: [
    'total due', 'total_due', 'overdue_amount', 'overdue', 'total_overdue', 'total_due_amount', 'total due amount'
  ],
  dpd: [
    'bom bucket', 'bom_bucket', 'bucket', 'days past due', 'dpd', 'overdue days', 'days overdue', 'ageing'
  ],
  recovery_status: [
    'paid/unpaid', 'paid_unpaid', 'paid', 'unpaid', 'recovery status', 'status', 'case status', 'disposition'
  ],
  assigned_employee: [
    'assigned employee', 'employee email', 'assigned officer', 'agent', 'field_officer', 'assigned_to'
  ],
};

function normalizeHeader(str: string): string {
  return String(str || '').toLowerCase().trim().replace(/[^a-z0-9]/g, '');
}

function findMappedKey(header: string): string | null {
  const norm = normalizeHeader(header);
  if (!norm) return null;
  
  for (const [key, aliases] of Object.entries(COLUMN_MAPPINGS)) {
    if (aliases.some(alias => normalizeHeader(alias) === norm)) {
      return key;
    }
  }
  return null;
}

function parseBomBucketToDpd(bucketVal: any): number {
  const str = String(bucketVal || '').toUpperCase().trim();
  if (!str) return 30;
  
  const digitMatch = str.match(/\d+/);
  if (digitMatch) {
    const num = parseInt(digitMatch[0], 10);
    if (num <= 5) return num * 30;
    return num;
  }
  
  if (str.includes('BOM 1') || str.includes('BOM1')) return 30;
  if (str.includes('BOM 2') || str.includes('BOM2')) return 60;
  if (str.includes('BOM 3') || str.includes('BOM3')) return 90;
  if (str.includes('BOM 4') || str.includes('BOM4')) return 120;
  
  return 30;
}

function parsePaidUnpaidStatus(val: any): string {
  const str = String(val || '').toUpperCase().trim();
  if (str === 'PAID' || str.includes('PAID')) return 'Paid';
  if (str === 'UNPAID' || str.includes('UNPAID')) return 'Unpaid';
  if (str.includes('PTP') || str.includes('PROMISE')) return 'PROMISE_TO_PAY';
  if (str.includes('LEGAL')) return 'LEGAL_ACTION';
  return 'Unpaid';
}

function parseNumeric(val: any): number {
  if (val === null || val === undefined || val === '') return 0;
  if (typeof val === 'number') return isNaN(val) ? 0 : val;
  const cleaned = String(val).replace(/[^0-9.]/g, '');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
}

export async function uploadExcel(req: AuthenticatedRequest, res: Response) {
  try {
    // STAGE 1: FILE UPLOAD VERIFICATION & DEBUG LOGGING
    console.log("Content-Type:", req.headers["content-type"]);
    console.log("req.file:", req.file ? {
        fieldname: req.file.fieldname,
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size
    } : null);
    console.log("req.files:", (req as any).files);

    if (!req.file) {
      return res.status(400).json({ 
        message: 'STAGE 1 FILE UPLOAD ERROR: No file received under field name "file". Check field name and multipart boundary.' 
      });
    }

    const userId = req.user!.id;
    const filePath = req.file.path;
    const originalName = req.file.originalname;

    // STAGE 2: EXCEL PARSING & VALIDATION
    let workbook: xlsx.WorkBook;
    try {
      workbook = xlsx.readFile(filePath);
    } catch (parseErr: any) {
      console.error('[STAGE 2 EXCEL PARSING ERROR]:', parseErr);
      return res.status(400).json({ message: `STAGE 2 EXCEL PARSING ERROR: Failed to read .xlsx file structure (${parseErr.message})` });
    }

    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    const rawRows: any[] = xlsx.utils.sheet_to_json(sheet, { defval: '' });

    if (rawRows.length === 0) {
      return res.status(400).json({ message: 'STAGE 2 EXCEL PARSING ERROR: Uploaded Excel file contains no data rows.' });
    }

    const firstRow = rawRows[0];
    const detectedHeaders = Object.keys(firstRow);

    const mappedHeaderMap: Record<string, string> = {};
    const unmappedColumns: string[] = [];

    detectedHeaders.forEach((h) => {
      const mappedKey = findMappedKey(h);
      if (mappedKey) {
        mappedHeaderMap[h] = mappedKey;
      } else {
        unmappedColumns.push(h);
      }
    });

    const parsedRows: any[] = [];
    const validationErrors: any[] = [];
    const seenProposalsInFile = new Set<string>();

    let validCount = 0;
    let failedCount = 0;
    let duplicateCount = 0;

    const dbProposalsRes = await query('SELECT loan_account_number FROM loans');
    const existingDbProposals = new Set(
      dbProposalsRes.rows.map((r: any) => String(r.loan_account_number).toUpperCase().trim())
    );

    rawRows.forEach((row, index) => {
      const rowNum = index + 2;
      const mappedRow: any = {};
      
      Object.keys(row).forEach((h) => {
        const targetKey = mappedHeaderMap[h];
        if (targetKey) {
          mappedRow[targetKey] = row[h];
        }
      });

      const rawProposal = mappedRow.loan_account_number || row['Proposal No'] || row['Proposal No.'] || row['Proposal'] || row['Loan Account Number'];
      const rawCustomerName = mappedRow.customer_name || row['Customer Name'] || row['Borrower Name'] || row['Name'];
      const rawPhone = mappedRow.phone || row['MO NO'] || row['Mobile No'] || row['Phone'];
      const rawRegNo = mappedRow.vehicle_number || row['Registration Number'] || row['Reg No'];
      const rawPos = mappedRow.outstanding_amount || row['POS'] || row['Outstanding Amount'];
      const rawEmi = mappedRow.emi_amount || row['EMI Amount'];
      const rawTotalDue = mappedRow.total_overdue || row['Total Due'];
      const rawAddress = mappedRow.address || row['Residence Address'] || row['Address'];
      const rawEngine = mappedRow.engine_number || row['Engine No'] || row['Engine Number'];
      const rawChassis = mappedRow.chassis_number || row['Chassis No'] || row['Chassis Number'];
      const rawAssetDesc = mappedRow.vehicle_model || row['Asset Desc'] || row['Asset Description'];
      const rawBomBucket = mappedRow.dpd || row['BOM Bucket'];
      const rawPaidStatus = mappedRow.recovery_status || row['PAID/UNPAID'];

      const proposalNo = String(rawProposal || '').trim().toUpperCase();
      const customerName = String(rawCustomerName || '').trim();
      const phoneStr = String(rawPhone || '').trim();
      const regNo = String(rawRegNo || '').trim().toUpperCase();

      let hasError = false;

      if (!proposalNo) {
        hasError = true;
        validationErrors.push({
          row_number: rowNum,
          field: 'Proposal No',
          original_value: rawProposal || 'N/A',
          error_type: 'MISSING_REQUIRED',
          error_message: 'Missing required Loan Account Number / Proposal No.',
        });
      }

      if (!customerName) {
        hasError = true;
        validationErrors.push({
          row_number: rowNum,
          field: 'Customer Name',
          loan_account_number: proposalNo || 'N/A',
          original_value: rawCustomerName || 'N/A',
          error_type: 'MISSING_REQUIRED',
          error_message: 'Missing required Customer / Borrower Name.',
        });
      }

      if (hasError) {
        failedCount++;
        return;
      }

      let isFileDuplicate = false;
      if (seenProposalsInFile.has(proposalNo)) {
        isFileDuplicate = true;
        duplicateCount++;
      } else {
        seenProposalsInFile.add(proposalNo);
      }

      const isDbDuplicate = existingDbProposals.has(proposalNo);
      if (isDbDuplicate && !isFileDuplicate) {
        duplicateCount++;
      }

      validCount++;

      const pos = parseNumeric(rawPos);
      const emi = parseNumeric(rawEmi);
      const totalDue = parseNumeric(rawTotalDue);
      const dpd = parseBomBucketToDpd(rawBomBucket);
      const caseStatus = parsePaidUnpaidStatus(rawPaidStatus);

      parsedRows.push({
        row_number: rowNum,
        loan_account_number: proposalNo,
        customer_name: customerName,
        phone: phoneStr || 'N/A',
        address: rawAddress ? String(rawAddress).trim() : 'Address Not Provided',
        city: mappedRow.city || row['City'] || row['Location'] || 'Nashik',
        state: mappedRow.state || row['State'] || 'Maharashtra',
        vehicle_number: regNo || `REG-${proposalNo}`,
        vehicle_model: rawAssetDesc ? String(rawAssetDesc).trim() : 'Commercial Vehicle',
        engine_number: rawEngine ? String(rawEngine).trim() : null,
        chassis_number: rawChassis ? String(rawChassis).trim() : null,
        outstanding_amount: pos,
        emi_amount: emi,
        total_overdue: totalDue || pos,
        dpd,
        bom_bucket: rawBomBucket ? String(rawBomBucket).trim() : `BOM ${Math.ceil(dpd / 30)}`,
        recovery_status: caseStatus,
        assigned_employee: mappedRow.assigned_employee || '',
        is_duplicate: isDbDuplicate || isFileDuplicate,
        raw_excel_data: row,
      });
    });

    // Save Upload Log
    const uploadRecordRes = await query(
      `INSERT INTO excel_uploads (filename, original_name, uploaded_by, total_rows, successful_rows, failed_rows, duplicate_rows, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id`,
      [path.basename(filePath), originalName, userId, rawRows.length, validCount, failedCount, duplicateCount, 'VALIDATED']
    );

    const uploadId = uploadRecordRes.rows.length > 0 ? uploadRecordRes.rows[0].id : uploadRecordRes.lastID;

    // Save Error Logs
    for (const err of validationErrors) {
      await query(
        `INSERT INTO excel_import_errors (upload_id, row_number, loan_account_number, error_message, raw_data)
         VALUES ($1, $2, $3, $4, $5)`,
        [uploadId, err.row_number, err.loan_account_number || 'N/A', `[${err.error_type}] ${err.field}: ${err.error_message}`, String(err.original_value || '')]
      );
    }

    return res.json({
      upload_id: uploadId,
      filename: originalName,
      total_rows: rawRows.length,
      successful_rows: validCount,
      failed_rows: failedCount,
      duplicate_rows: duplicateCount,
      unmapped_columns: unmappedColumns,
      detected_headers: detectedHeaders,
      preview_rows: parsedRows,
      errors: validationErrors,
    });
  } catch (error: any) {
    console.error('uploadExcel error:', error);
    return res.status(500).json({ message: 'Failed to process Excel file.' });
  }
}

export async function importExcel(req: AuthenticatedRequest, res: Response) {
  try {
    const { upload_id, rows } = req.body;
    const userId = req.user!.id;

    if (!rows || !Array.isArray(rows) || rows.length === 0) {
      return res.status(400).json({ message: 'No valid rows provided for import.' });
    }

    let importedCount = 0;
    let updatedCount = 0;

    for (const r of rows) {
      try {
        const rawJsonStr = JSON.stringify(r.raw_excel_data || r);
        const proposalNo = String(r.loan_account_number).trim().toUpperCase();

        // 1. Check if loan with this proposal number already exists
        const loanRes = await query('SELECT l.id, l.customer_id, l.vehicle_id FROM loans l WHERE l.loan_account_number = $1', [proposalNo]);

        let customerId: number;
        let vehicleId: number;
        let loanId: number;

        if (loanRes.rows.length > 0) {
          // --- UPDATE EXISTING RECORD ---
          const existingLoan = loanRes.rows[0];
          loanId = existingLoan.id;
          customerId = existingLoan.customer_id;
          vehicleId = existingLoan.vehicle_id;

          // Update customer record bound to this loan
          await query(
            `UPDATE customers 
             SET full_name = $1, phone = $2, address = $3, city = $4, state = $5, updated_at = CURRENT_TIMESTAMP 
             WHERE id = $6`,
            [r.customer_name, r.phone || 'N/A', r.address, r.city, r.state, customerId]
          );

          // Update vehicle record bound to this loan
          if (vehicleId) {
            await query(
              `UPDATE vehicles 
               SET registration_number = $1, model = $2, engine_number = $3, chassis_number = $4, location = $5, updated_at = CURRENT_TIMESTAMP 
               WHERE id = $6`,
              [r.vehicle_number, r.vehicle_model || 'Commercial Vehicle', r.engine_number || null, r.chassis_number || null, r.city, vehicleId]
            );
          }

          // Update loan record
          await query(
            `UPDATE loans 
             SET outstanding_amount = $1, emi_amount = $2, total_overdue = $3, dpd = $4, imported_excel_data = $5, updated_at = CURRENT_TIMESTAMP 
             WHERE id = $6`,
            [r.outstanding_amount, r.emi_amount, r.total_overdue || r.outstanding_amount, r.dpd, rawJsonStr, loanId]
          );

          // Update recovery case
          const priority = r.dpd > 90 ? 'CRITICAL' : r.dpd > 60 ? 'HIGH' : 'MEDIUM';
          await query(
            `UPDATE recovery_cases 
             SET priority = $1, status = $2, location = $3, updated_at = CURRENT_TIMESTAMP 
             WHERE loan_id = $4`,
            [priority, r.recovery_status, r.city, loanId]
          );

          updatedCount++;
        } else {
          // --- INSERT NEW RECORD ---
          // Insert customer for this specific row
          const custCode = `CUST-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 1000)}`;
          const newCust = await query(
            `INSERT INTO customers (customer_id, full_name, phone, address, city, state)
             VALUES ($1, $2, $3, $4, $5, $6)
             RETURNING id`,
            [custCode, r.customer_name, r.phone || 'N/A', r.address, r.city, r.state]
          );
          customerId = newCust.rows.length > 0 ? newCust.rows[0].id : newCust.lastID!;

          // Insert vehicle for this specific row
          const newVeh = await query(
            `INSERT INTO vehicles (registration_number, model, engine_number, chassis_number, location, status)
             VALUES ($1, $2, $3, $4, $5, $6)
             RETURNING id`,
            [
              r.vehicle_number, 
              r.vehicle_model || 'Commercial Vehicle', 
              r.engine_number || null, 
              r.chassis_number || null, 
              r.city, 
              'UNDER_RECOVERY'
            ]
          );
          vehicleId = newVeh.rows.length > 0 ? newVeh.rows[0].id : newVeh.lastID!;

          // Insert loan record
          const newLoan = await query(
            `INSERT INTO loans (loan_account_number, customer_id, vehicle_id, loan_amount, outstanding_amount, emi_amount, total_overdue, dpd, imported_excel_data, status)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
             RETURNING id`,
            [
              proposalNo,
              customerId,
              vehicleId,
              r.outstanding_amount * 1.2 || 500000,
              r.outstanding_amount,
              r.emi_amount,
              r.total_overdue || r.outstanding_amount,
              r.dpd,
              rawJsonStr,
              'RECOVERY',
            ]
          );
          loanId = newLoan.rows.length > 0 ? newLoan.rows[0].id : newLoan.lastID!;

          // Insert recovery case
          let assignedEmpId: number | null = null;
          if (r.assigned_employee) {
            const empRes = await query('SELECT id FROM users WHERE email = $1 OR name LIKE $2', [r.assigned_employee, `%${r.assigned_employee}%`]);
            if (empRes.rows.length > 0) assignedEmpId = empRes.rows[0].id;
          }

          const priority = r.dpd > 90 ? 'CRITICAL' : r.dpd > 60 ? 'HIGH' : 'MEDIUM';

          await query(
            `INSERT INTO recovery_cases (loan_id, assigned_employee_id, priority, status, location)
             VALUES ($1, $2, $3, $4, $5)`,
            [loanId, assignedEmpId, priority, r.recovery_status, r.city]
          );

          importedCount++;
        }
      } catch (rowErr) {
        console.error('Error importing single row:', r, rowErr);
      }
    }

    if (upload_id) {
      await query(
        `UPDATE excel_uploads 
         SET status = 'IMPORTED', successful_rows = $1, duplicate_rows = $2 
         WHERE id = $3`, 
        [importedCount, updatedCount, upload_id]
      );
    }

    await query(
      'INSERT INTO activity_logs (user_id, action, details) VALUES ($1, $2, $3)',
      [userId, 'IMPORT_EXCEL', `Imported ${importedCount} new cases & updated ${updatedCount} existing cases.`]
    );

    return res.json({
      message: 'Excel data imported successfully. Recovery records are now available in the system.',
      imported_new_records: importedCount,
      updated_existing_records: updatedCount,
    });
  } catch (error: any) {
    console.error('importExcel error:', error);
    return res.status(500).json({ message: 'Failed to import Excel data into database.' });
  }
}

export async function getExcelUploads(req: AuthenticatedRequest, res: Response) {
  try {
    const sql = `
      SELECT eu.*, u.name as uploaded_by_name
      FROM excel_uploads eu
      LEFT JOIN users u ON eu.uploaded_by = u.id
      ORDER BY eu.id DESC
    `;
    const result = await query(sql);

    const uploads = result.rows;
    const total_uploads = uploads.length;

    let total_rows_processed = 0;
    let successful_rows = 0;
    let failed_rows = 0;
    let duplicate_rows = 0;

    uploads.forEach((u: any) => {
      total_rows_processed += (u.total_rows || 0);
      successful_rows += (u.successful_rows || 0);
      failed_rows += (u.failed_rows || 0);
      duplicate_rows += (u.duplicate_rows || 0);
    });

    const last_upload = uploads.length > 0 ? uploads[0] : null;

    return res.json({ 
      summary: {
        total_uploads,
        total_rows_processed,
        successful_rows,
        failed_rows,
        duplicate_rows,
        last_upload
      },
      uploads 
    });
  } catch (error: any) {
    console.error('getExcelUploads error:', error);
    return res.status(500).json({ message: 'Failed to fetch upload logs.' });
  }
}

export async function getUploadDetails(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;

    const uploadRes = await query(
      `SELECT eu.*, u.name as uploaded_by_name 
       FROM excel_uploads eu 
       LEFT JOIN users u ON eu.uploaded_by = u.id 
       WHERE eu.id = $1`,
      [id]
    );

    if (uploadRes.rows.length === 0) {
      return res.status(404).json({ message: 'Upload log record not found.' });
    }

    const errorsRes = await query(
      `SELECT * FROM excel_import_errors WHERE upload_id = $1 ORDER BY id ASC`,
      [id]
    );

    return res.json({
      upload: uploadRes.rows[0],
      errors: errorsRes.rows,
    });
  } catch (error: any) {
    console.error('getUploadDetails error:', error);
    return res.status(500).json({ message: 'Failed to fetch upload details.' });
  }
}

export async function deleteExcelUpload(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;
    const user = req.user!;

    if (user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Only Admin users can delete uploaded Excel files.' });
    }

    const uploadRes = await query('SELECT * FROM excel_uploads WHERE id = $1', [id]);
    if (uploadRes.rows.length === 0) {
      return res.status(404).json({ message: 'Upload log record not found.' });
    }

    const uploadRecord = uploadRes.rows[0];

    // Remove physical file from storage if present
    if (uploadRecord.filename) {
      const uploadDir = path.join(__dirname, '../../uploads');
      const filePath = path.join(uploadDir, uploadRecord.filename);
      const fs = require('fs');
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
        } catch (e) {
          console.error('Failed to remove physical file:', e);
        }
      }
    }

    // Delete error logs & upload record metadata
    await query('DELETE FROM excel_import_errors WHERE upload_id = $1', [id]);
    await query('DELETE FROM excel_uploads WHERE id = $1', [id]);

    await query(
      'INSERT INTO activity_logs (user_id, action, details) VALUES ($1, $2, $3)',
      [user.id, 'DELETE_EXCEL_UPLOAD', `Deleted Excel file metadata #${id} (${uploadRecord.original_name}). Recovery cases preserved.`]
    );

    return res.json({
      message: `Excel upload file "${uploadRecord.original_name}" deleted successfully. Imported recovery cases remain preserved in database.`
    });
  } catch (error: any) {
    console.error('deleteExcelUpload error:', error);
    return res.status(500).json({ message: 'Failed to delete Excel file upload.' });
  }
}

export async function deleteImportedCases(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;
    const user = req.user!;

    if (user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Only Admin users can delete imported recovery cases.' });
    }

    const uploadRes = await query('SELECT * FROM excel_uploads WHERE id = $1', [id]);
    if (uploadRes.rows.length === 0) {
      return res.status(404).json({ message: 'Upload log record not found.' });
    }

    // Optional explicit bulk delete for cases created from this upload
    // Delete recovery_cases where loan imported_excel_data is present
    await query('DELETE FROM recovery_cases WHERE loan_id IN (SELECT id FROM loans WHERE imported_excel_data IS NOT NULL)');

    await query(
      'INSERT INTO activity_logs (user_id, action, details) VALUES ($1, $2, $3)',
      [user.id, 'DELETE_IMPORTED_CASES', `Deleted recovery cases created from upload #${id}.`]
    );

    return res.json({ message: 'Imported recovery cases deleted successfully.' });
  } catch (error: any) {
    console.error('deleteImportedCases error:', error);
    return res.status(500).json({ message: 'Failed to delete imported recovery cases.' });
  }
}
