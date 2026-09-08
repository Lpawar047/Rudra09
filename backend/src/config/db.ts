import { Pool } from 'pg';
import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

dotenv.config();

let pgPool: Pool | null = null;
let sqliteDb: Database | null = null;
let isPg = false;

export async function initDb() {
  const dbUrl = process.env.DATABASE_URL;

  if (dbUrl && dbUrl.trim() !== '') {
    console.log('🔗 Connecting to PostgreSQL / Neon Database...');
    pgPool = new Pool({
      connectionString: dbUrl,
      ssl: dbUrl.includes('neon.tech') || dbUrl.includes('sslmode=require') 
        ? { rejectUnauthorized: false } 
        : false,
    });
    isPg = true;
    await migratePg();
    console.log('✅ PostgreSQL Database connected & schema migrated successfully.');
  } else {
    console.log('⚡ No DATABASE_URL specified. Initializing local SQLite database...');
    const dataDir = path.join(__dirname, '../../data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    const dbPath = path.join(dataDir, 'rudra_services.sqlite');

    sqliteDb = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    isPg = false;
    await migrateSqlite();
    console.log(`✅ SQLite Database connected at ${dbPath} & schema migrated successfully.`);
  }
}

export async function query(sql: string, params: any[] = []): Promise<{ rows: any[]; rowCount: number; lastID?: number }> {
  if (isPg && pgPool) {
    const res = await pgPool.query(sql, params);
    return {
      rows: res.rows,
      rowCount: res.rowCount || res.rows.length,
    };
  } else if (sqliteDb) {
    // Correctly convert PostgreSQL $1, $2 placeholder occurrences to SQLite ? with mapped sqliteParams array
    const sqliteParams: any[] = [];
    const sqliteSql = sql.replace(/\$(\d+)/g, (_, numStr) => {
      const index = parseInt(numStr, 10) - 1;
      sqliteParams.push(params[index]);
      return '?';
    });

    const lowerSql = sql.trim().toLowerCase();

    if (lowerSql.startsWith('select') || lowerSql.startsWith('with')) {
      const rows = await sqliteDb.all(sqliteSql, sqliteParams);
      return {
        rows,
        rowCount: rows.length,
      };
    } else {
      // Remove PostgreSQL RETURNING clause for SQLite compatibility
      const cleanSqliteSql = sqliteSql.replace(/\s+returning\s+.*$/i, '');
      const result = await sqliteDb.run(cleanSqliteSql, sqliteParams);
      
      let rows: any[] = [];
      if (result.lastID) {
        rows = [{ id: result.lastID }];
      }
      return {
        rows,
        rowCount: result.changes || 0,
        lastID: result.lastID,
      };
    }
  } else {
    throw new Error('Database not initialized. Call initDb() first.');
  }
}

async function migratePg() {
  if (!pgPool) return;

  const schema = `
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

    CREATE OR REPLACE FUNCTION set_updated_at_timestamp()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = CURRENT_TIMESTAMP;
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;

    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      role VARCHAR(50) NOT NULL DEFAULT 'EMPLOYEE',
      phone VARCHAR(50),
      department VARCHAR(100),
      status VARCHAR(50) DEFAULT 'ACTIVE',
      rejected_by INT REFERENCES users(id) ON DELETE SET NULL,
      rejected_at TIMESTAMP,
      rejection_reason TEXT,
      metadata JSONB DEFAULT '{}'::jsonb,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS customers (
      id SERIAL PRIMARY KEY,
      customer_id VARCHAR(100),
      full_name VARCHAR(255) NOT NULL,
      phone VARCHAR(50) NOT NULL,
      alt_phone VARCHAR(50),
      email VARCHAR(255),
      address TEXT NOT NULL,
      city VARCHAR(100) NOT NULL,
      state VARCHAR(100) NOT NULL,
      pincode VARCHAR(20),
      employment_info TEXT,
      metadata JSONB DEFAULT '{}'::jsonb,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS vehicles (
      id SERIAL PRIMARY KEY,
      registration_number VARCHAR(100) UNIQUE NOT NULL,
      vehicle_type VARCHAR(100),
      manufacturer VARCHAR(100),
      model VARCHAR(100) NOT NULL,
      variant VARCHAR(100),
      chassis_number VARCHAR(100),
      engine_number VARCHAR(100),
      location TEXT,
      status VARCHAR(50) DEFAULT 'ACTIVE',
      metadata JSONB DEFAULT '{}'::jsonb,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS loans (
      id SERIAL PRIMARY KEY,
      loan_account_number VARCHAR(100) UNIQUE NOT NULL,
      customer_id INT NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
      vehicle_id INT REFERENCES vehicles(id) ON DELETE SET NULL,
      loan_amount NUMERIC(15, 2) NOT NULL DEFAULT 0,
      outstanding_amount NUMERIC(15, 2) NOT NULL DEFAULT 0,
      emi_amount NUMERIC(15, 2) NOT NULL DEFAULT 0,
      emi_due_date DATE,
      total_overdue NUMERIC(15, 2) NOT NULL DEFAULT 0,
      dpd INT DEFAULT 0,
      start_date DATE,
      status VARCHAR(50) DEFAULT 'ACTIVE',
      imported_excel_data JSONB,
      metadata JSONB DEFAULT '{}'::jsonb,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS recovery_cases (
      id SERIAL PRIMARY KEY,
      loan_id INT NOT NULL REFERENCES loans(id) ON DELETE CASCADE,
      assigned_employee_id INT REFERENCES users(id) ON DELETE SET NULL,
      assigned_manager_id INT REFERENCES users(id) ON DELETE SET NULL,
      priority VARCHAR(50) DEFAULT 'MEDIUM',
      status VARCHAR(50) DEFAULT 'PENDING',
      due_date DATE,
      last_followup_date TIMESTAMP,
      next_followup_date TIMESTAMP,
      location TEXT,
      remarks TEXT,
      metadata JSONB DEFAULT '{}'::jsonb,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS case_assignments (
      id SERIAL PRIMARY KEY,
      case_id INT NOT NULL REFERENCES recovery_cases(id) ON DELETE CASCADE,
      employee_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      assigned_by INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      previous_employee_id INT REFERENCES users(id) ON DELETE SET NULL,
      remarks TEXT
    );

    CREATE TABLE IF NOT EXISTS followups (
      id SERIAL PRIMARY KEY,
      case_id INT NOT NULL REFERENCES recovery_cases(id) ON DELETE CASCADE,
      followup_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      followup_type VARCHAR(50) NOT NULL DEFAULT 'PHONE_CALL',
      contact_result VARCHAR(50) NOT NULL DEFAULT 'CONTACTED',
      customer_response TEXT,
      remarks TEXT,
      next_followup_date TIMESTAMP,
      created_by INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS payments (
      id SERIAL PRIMARY KEY,
      case_id INT NOT NULL REFERENCES recovery_cases(id) ON DELETE CASCADE,
      customer_id INT NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
      amount NUMERIC(15, 2) NOT NULL,
      payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      payment_mode VARCHAR(50) NOT NULL DEFAULT 'CASH',
      transaction_ref VARCHAR(100),
      collected_by INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      remarks TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS excel_uploads (
      id SERIAL PRIMARY KEY,
      filename VARCHAR(255) NOT NULL,
      original_name VARCHAR(255) NOT NULL,
      uploaded_by INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      total_rows INT DEFAULT 0,
      successful_rows INT DEFAULT 0,
      failed_rows INT DEFAULT 0,
      duplicate_rows INT DEFAULT 0,
      status VARCHAR(50) DEFAULT 'PENDING',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS excel_import_errors (
      id SERIAL PRIMARY KEY,
      upload_id INT NOT NULL REFERENCES excel_uploads(id) ON DELETE CASCADE,
      row_number INT NOT NULL,
      loan_account_number VARCHAR(100),
      error_message TEXT NOT NULL,
      raw_data TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS activity_logs (
      id SERIAL PRIMARY KEY,
      user_id INT REFERENCES users(id) ON DELETE SET NULL,
      action VARCHAR(255) NOT NULL,
      entity_type VARCHAR(100),
      entity_id INT,
      details TEXT,
      ip_address VARCHAR(100),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- Remove restrictive check constraints for maximum dynamic capability
    ALTER TABLE recovery_cases DROP CONSTRAINT IF EXISTS recovery_cases_status_check;
    ALTER TABLE recovery_cases DROP CONSTRAINT IF EXISTS recovery_cases_priority_check;
    ALTER TABLE users DROP CONSTRAINT IF EXISTS users_status_check;
    ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
    ALTER TABLE loans DROP CONSTRAINT IF EXISTS loans_status_check;
    ALTER TABLE vehicles DROP CONSTRAINT IF EXISTS vehicles_status_check;
    ALTER TABLE followups DROP CONSTRAINT IF EXISTS followups_followup_type_check;
    ALTER TABLE followups DROP CONSTRAINT IF EXISTS followups_contact_result_check;
    ALTER TABLE payments DROP CONSTRAINT IF EXISTS payments_payment_mode_check;

    -- Dynamic Indexes
    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
    CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);

    CREATE INDEX IF NOT EXISTS idx_cust_phone ON customers(phone);
    CREATE INDEX IF NOT EXISTS idx_cust_name ON customers(full_name);
    CREATE INDEX IF NOT EXISTS idx_cust_city ON customers(city);
    CREATE INDEX IF NOT EXISTS idx_cust_meta ON customers USING GIN(metadata);

    CREATE INDEX IF NOT EXISTS idx_vehicles_reg ON vehicles(registration_number);
    CREATE INDEX IF NOT EXISTS idx_vehicles_eng ON vehicles(engine_number);
    CREATE INDEX IF NOT EXISTS idx_vehicles_chas ON vehicles(chassis_number);
    CREATE INDEX IF NOT EXISTS idx_vehicles_status ON vehicles(status);

    CREATE INDEX IF NOT EXISTS idx_loans_acc ON loans(loan_account_number);
    CREATE INDEX IF NOT EXISTS idx_loans_cust ON loans(customer_id);
    CREATE INDEX IF NOT EXISTS idx_loans_veh ON loans(vehicle_id);
    CREATE INDEX IF NOT EXISTS idx_loans_status ON loans(status);
    CREATE INDEX IF NOT EXISTS idx_loans_excel_gin ON loans USING GIN(imported_excel_data);
    CREATE INDEX IF NOT EXISTS idx_loans_meta ON loans USING GIN(metadata);

    CREATE INDEX IF NOT EXISTS idx_cases_loan ON recovery_cases(loan_id);
    CREATE INDEX IF NOT EXISTS idx_cases_emp ON recovery_cases(assigned_employee_id);
    CREATE INDEX IF NOT EXISTS idx_cases_mgr ON recovery_cases(assigned_manager_id);
    CREATE INDEX IF NOT EXISTS idx_cases_status ON recovery_cases(status);
    CREATE INDEX IF NOT EXISTS idx_cases_priority ON recovery_cases(priority);
    CREATE INDEX IF NOT EXISTS idx_cases_meta ON recovery_cases USING GIN(metadata);

    CREATE INDEX IF NOT EXISTS idx_assign_case ON case_assignments(case_id);
    CREATE INDEX IF NOT EXISTS idx_assign_emp ON case_assignments(employee_id);

    CREATE INDEX IF NOT EXISTS idx_followup_case ON followups(case_id);
    CREATE INDEX IF NOT EXISTS idx_followup_date ON followups(followup_date);

    CREATE INDEX IF NOT EXISTS idx_payment_case ON payments(case_id);
    CREATE INDEX IF NOT EXISTS idx_payment_cust ON payments(customer_id);

    CREATE INDEX IF NOT EXISTS idx_excel_up_status ON excel_uploads(status);
    CREATE INDEX IF NOT EXISTS idx_excel_err_upload ON excel_import_errors(upload_id);
    CREATE INDEX IF NOT EXISTS idx_activity_user ON activity_logs(user_id);
    CREATE INDEX IF NOT EXISTS idx_activity_action ON activity_logs(action);

    -- Automatic timestamp updates
    DROP TRIGGER IF EXISTS trg_users_updated_at ON users;
    CREATE TRIGGER trg_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION set_updated_at_timestamp();

    DROP TRIGGER IF EXISTS trg_customers_updated_at ON customers;
    CREATE TRIGGER trg_customers_updated_at BEFORE UPDATE ON customers FOR EACH ROW EXECUTE FUNCTION set_updated_at_timestamp();

    DROP TRIGGER IF EXISTS trg_vehicles_updated_at ON vehicles;
    CREATE TRIGGER trg_vehicles_updated_at BEFORE UPDATE ON vehicles FOR EACH ROW EXECUTE FUNCTION set_updated_at_timestamp();

    DROP TRIGGER IF EXISTS trg_loans_updated_at ON loans;
    CREATE TRIGGER trg_loans_updated_at BEFORE UPDATE ON loans FOR EACH ROW EXECUTE FUNCTION set_updated_at_timestamp();

    DROP TRIGGER IF EXISTS trg_recovery_cases_updated_at ON recovery_cases;
    CREATE TRIGGER trg_recovery_cases_updated_at BEFORE UPDATE ON recovery_cases FOR EACH ROW EXECUTE FUNCTION set_updated_at_timestamp();
  `;
  await pgPool.query(schema);

  try {
    await pgPool.query('ALTER TABLE loans ADD COLUMN IF NOT EXISTS imported_excel_data JSONB');
    await pgPool.query('ALTER TABLE loans ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT \'{}\'::jsonb');
    await pgPool.query('ALTER TABLE customers ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT \'{}\'::jsonb');
    await pgPool.query('ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT \'{}\'::jsonb');
    await pgPool.query('ALTER TABLE recovery_cases ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT \'{}\'::jsonb');
    await pgPool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT \'{}\'::jsonb');
    await pgPool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS rejected_by INT');
    await pgPool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS rejected_at TIMESTAMP');
    await pgPool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS rejection_reason TEXT');
  } catch (e) {}
}

async function migrateSqlite() {
  if (!sqliteDb) return;

  const schema = [
    `CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL,
      phone TEXT,
      department TEXT,
      status TEXT DEFAULT 'ACTIVE',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );`,
    `CREATE TABLE IF NOT EXISTS customers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      customer_id TEXT,
      full_name TEXT NOT NULL,
      phone TEXT NOT NULL,
      alt_phone TEXT,
      email TEXT,
      address TEXT NOT NULL,
      city TEXT NOT NULL,
      state TEXT NOT NULL,
      pincode TEXT,
      employment_info TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );`,
    `CREATE TABLE IF NOT EXISTS vehicles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      registration_number TEXT UNIQUE NOT NULL,
      vehicle_type TEXT,
      manufacturer TEXT,
      model TEXT NOT NULL,
      variant TEXT,
      chassis_number TEXT,
      engine_number TEXT,
      location TEXT,
      status TEXT DEFAULT 'ACTIVE',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );`,
    `CREATE TABLE IF NOT EXISTS loans (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      loan_account_number TEXT UNIQUE NOT NULL,
      customer_id INTEGER NOT NULL,
      vehicle_id INTEGER,
      loan_amount REAL NOT NULL DEFAULT 0,
      outstanding_amount REAL NOT NULL DEFAULT 0,
      emi_amount REAL NOT NULL DEFAULT 0,
      emi_due_date TEXT,
      total_overdue REAL NOT NULL DEFAULT 0,
      dpd INTEGER DEFAULT 0,
      start_date TEXT,
      status TEXT DEFAULT 'ACTIVE',
      imported_excel_data TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(customer_id) REFERENCES customers(id) ON DELETE CASCADE,
      FOREIGN KEY(vehicle_id) REFERENCES vehicles(id) ON DELETE SET NULL
    );`,
    `CREATE TABLE IF NOT EXISTS recovery_cases (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      loan_id INTEGER NOT NULL,
      assigned_employee_id INTEGER,
      assigned_manager_id INTEGER,
      priority TEXT DEFAULT 'MEDIUM',
      status TEXT DEFAULT 'PENDING',
      due_date TEXT,
      last_followup_date DATETIME,
      next_followup_date DATETIME,
      location TEXT,
      remarks TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(loan_id) REFERENCES loans(id) ON DELETE CASCADE,
      FOREIGN KEY(assigned_employee_id) REFERENCES users(id) ON DELETE SET NULL,
      FOREIGN KEY(assigned_manager_id) REFERENCES users(id) ON DELETE SET NULL
    );`,
    `CREATE TABLE IF NOT EXISTS case_assignments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      case_id INTEGER NOT NULL,
      employee_id INTEGER NOT NULL,
      assigned_by INTEGER NOT NULL,
      assigned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      previous_employee_id INTEGER,
      remarks TEXT,
      FOREIGN KEY(case_id) REFERENCES recovery_cases(id) ON DELETE CASCADE,
      FOREIGN KEY(employee_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY(assigned_by) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY(previous_employee_id) REFERENCES users(id) ON DELETE SET NULL
    );`,
    `CREATE TABLE IF NOT EXISTS followups (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      case_id INTEGER NOT NULL,
      followup_date DATETIME DEFAULT CURRENT_TIMESTAMP,
      followup_type TEXT NOT NULL,
      contact_result TEXT NOT NULL,
      customer_response TEXT,
      remarks TEXT,
      next_followup_date DATETIME,
      created_by INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(case_id) REFERENCES recovery_cases(id) ON DELETE CASCADE,
      FOREIGN KEY(created_by) REFERENCES users(id) ON DELETE CASCADE
    );`,
    `CREATE TABLE IF NOT EXISTS payments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      case_id INTEGER NOT NULL,
      customer_id INTEGER NOT NULL,
      amount REAL NOT NULL,
      payment_date DATETIME DEFAULT CURRENT_TIMESTAMP,
      payment_mode TEXT NOT NULL,
      transaction_ref TEXT,
      collected_by INTEGER NOT NULL,
      remarks TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(case_id) REFERENCES recovery_cases(id) ON DELETE CASCADE,
      FOREIGN KEY(customer_id) REFERENCES customers(id) ON DELETE CASCADE,
      FOREIGN KEY(collected_by) REFERENCES users(id) ON DELETE CASCADE
    );`,
    `CREATE TABLE IF NOT EXISTS excel_uploads (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      filename TEXT NOT NULL,
      original_name TEXT NOT NULL,
      uploaded_by INTEGER NOT NULL,
      total_rows INTEGER DEFAULT 0,
      successful_rows INTEGER DEFAULT 0,
      failed_rows INTEGER DEFAULT 0,
      duplicate_rows INTEGER DEFAULT 0,
      status TEXT DEFAULT 'PENDING',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(uploaded_by) REFERENCES users(id) ON DELETE CASCADE
    );`,
    `CREATE TABLE IF NOT EXISTS excel_import_errors (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      upload_id INTEGER NOT NULL,
      row_number INTEGER NOT NULL,
      loan_account_number TEXT,
      error_message TEXT NOT NULL,
      raw_data TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(upload_id) REFERENCES excel_uploads(id) ON DELETE CASCADE
    );`,
    `CREATE TABLE IF NOT EXISTS activity_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      action TEXT NOT NULL,
      entity_type TEXT,
      entity_id INTEGER,
      details TEXT,
      ip_address TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE SET NULL
    );`,
    `CREATE INDEX IF NOT EXISTS idx_loans_acc ON loans(loan_account_number);`,
    `CREATE INDEX IF NOT EXISTS idx_vehicles_reg ON vehicles(registration_number);`,
    `CREATE INDEX IF NOT EXISTS idx_vehicles_eng ON vehicles(engine_number);`,
    `CREATE INDEX IF NOT EXISTS idx_vehicles_chas ON vehicles(chassis_number);`,
    `CREATE INDEX IF NOT EXISTS idx_cust_phone ON customers(phone);`,
    `CREATE INDEX IF NOT EXISTS idx_cust_name ON customers(full_name);`
  ];

  for (const statement of schema) {
    await sqliteDb.exec(statement);
  }

  try {
    await sqliteDb.exec('ALTER TABLE loans ADD COLUMN imported_excel_data TEXT;');
  } catch (e) {}
  try {
    await sqliteDb.exec('ALTER TABLE users ADD COLUMN rejected_by INTEGER;');
  } catch (e) {}
  try {
    await sqliteDb.exec('ALTER TABLE users ADD COLUMN rejected_at DATETIME;');
  } catch (e) {}
  try {
    await sqliteDb.exec('ALTER TABLE users ADD COLUMN rejection_reason TEXT;');
  } catch (e) {}
}
