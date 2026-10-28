export type Role = 'ADMIN' | 'MANAGER' | 'EMPLOYEE';

export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'ON_LEAVE';

export type CaseStatus = 
  | 'PENDING'
  | 'ASSIGNED'
  | 'IN_PROGRESS'
  | 'CONTACTED'
  | 'PROMISE_TO_PAY'
  | 'RECOVERED'
  | 'CLOSED'
  | 'UNABLE_TO_CONTACT'
  | 'LEGAL_ACTION';

export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type VehicleStatus = 'ACTIVE' | 'UNDER_RECOVERY' | 'RECOVERED' | 'SOLD' | 'CLOSED';

export type LoanStatus = 'ACTIVE' | 'OVERDUE' | 'RECOVERY' | 'RECOVERED' | 'CLOSED';

export type FollowupType = 'PHONE_CALL' | 'VISIT' | 'SMS' | 'EMAIL' | 'OTHER';

export type ContactResult = 
  | 'CONTACTED'
  | 'NOT_CONTACTED'
  | 'PROMISE_TO_PAY'
  | 'REFUSED'
  | 'WRONG_NUMBER'
  | 'CUSTOMER_UNAVAILABLE';

export type PaymentMode = 'CASH' | 'UPI' | 'BANK_TRANSFER' | 'CHEQUE' | 'OTHER';

export interface User {
  id: number;
  name: string;
  email: string;
  password_hash: string;
  role: Role;
  phone?: string;
  department?: string;
  status: UserStatus;
  created_at?: string;
  updated_at?: string;
}

export interface Customer {
  id: number;
  customer_id?: string;
  full_name: string;
  phone: string;
  alt_phone?: string;
  email?: string;
  address: string;
  city: string;
  state: string;
  pincode?: string;
  employment_info?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Vehicle {
  id: number;
  registration_number: string;
  vehicle_type?: string;
  manufacturer?: string;
  model: string;
  variant?: string;
  chassis_number?: string;
  engine_number?: string;
  location?: string;
  status: VehicleStatus;
  created_at?: string;
  updated_at?: string;
}

export interface Loan {
  id: number;
  loan_account_number: string;
  customer_id: number;
  vehicle_id?: number;
  loan_amount: number;
  outstanding_amount: number;
  emi_amount: number;
  emi_due_date?: string;
  total_overdue: number;
  dpd: number;
  start_date?: string;
  status: LoanStatus;
  created_at?: string;
  updated_at?: string;
}

export interface RecoveryCase {
  id: number;
  loan_id: number;
  assigned_employee_id?: number;
  assigned_manager_id?: number;
  priority: Priority;
  status: CaseStatus;
  due_date?: string;
  last_followup_date?: string;
  next_followup_date?: string;
  location?: string;
  taluka?: string | null;
  remarks?: string;
  created_at?: string;
  updated_at?: string;
  // Joined fields for view
  loan_account_number?: string;
  registration_number?: string;
  customer_name?: string;
  customer_phone?: string;
  outstanding_amount?: number;
  assigned_employee_name?: string;
  assigned_manager_name?: string;
}

export interface CaseAssignment {
  id: number;
  case_id: number;
  employee_id: number;
  assigned_by: number;
  assigned_at: string;
  previous_employee_id?: number;
  remarks?: string;
}

export interface Followup {
  id: number;
  case_id: number;
  followup_date: string;
  followup_type: FollowupType;
  contact_result: ContactResult;
  customer_response?: string;
  remarks?: string;
  next_followup_date?: string;
  created_by: number;
  created_at?: string;
  created_by_name?: string;
}

export interface Payment {
  id: number;
  case_id: number;
  customer_id: number;
  amount: number;
  payment_date: string;
  payment_mode: PaymentMode;
  transaction_ref?: string;
  collected_by: number;
  remarks?: string;
  created_at?: string;
  collected_by_name?: string;
  customer_name?: string;
  loan_account_number?: string;
}

export interface ExcelUpload {
  id: number;
  filename: string;
  original_name: string;
  uploaded_by: number;
  total_rows: number;
  successful_rows: number;
  failed_rows: number;
  duplicate_rows: number;
  status: 'PENDING' | 'VALIDATED' | 'IMPORTED' | 'FAILED';
  created_at?: string;
  uploaded_by_name?: string;
}

export interface ExcelImportError {
  id: number;
  upload_id: number;
  row_number: number;
  loan_account_number?: string;
  error_message: string;
  raw_data?: string;
  created_at?: string;
}

export interface ActivityLog {
  id: number;
  user_id?: number;
  action: string;
  entity_type?: string;
  entity_id?: number;
  details?: string;
  ip_address?: string;
  created_at?: string;
  user_name?: string;
}

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: Role;
  status: UserStatus;
}
