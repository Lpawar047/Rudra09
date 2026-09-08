export type Role = 'ADMIN' | 'MANAGER' | 'EMPLOYEE';

export type UserStatus = 'PENDING' | 'ACTIVE' | 'DISABLED' | 'REJECTED' | 'INACTIVE' | 'ON_LEAVE';

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
  role: Role;
  phone?: string;
  department?: string;
  status: UserStatus;
  rejected_by?: number;
  rejected_at?: string;
  rejection_reason?: string;
  rejected_by_name?: string;
  created_at?: string;
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

  imported_excel_data?: any;
  proposal_no?: string;
  loan_account_number?: string;
  outstanding_amount?: number;
  total_overdue?: number;
  emi_amount?: number;
  dpd?: number;
  bom_bucket?: string;
  registration_number?: string;
  engine_number?: string;
  chassis_number?: string;
  vehicle_model?: string;
  asset_desc?: string;
  case_id?: number;
  case_status?: CaseStatus;
  priority?: Priority;
  assigned_employee_name?: string;
  assigned_manager_name?: string;
  last_followup_date?: string;
  next_followup_date?: string;
  loans?: Loan[];
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
  status: LoanStatus;
  customer_name?: string;
  customer_phone?: string;
  registration_number?: string;
  vehicle_model?: string;
  engine_number?: string;
  chassis_number?: string;
  asset_desc?: string;
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
  remarks?: string;
  created_at?: string;

  recovery_code?: string;
  loan_account_number?: string;
  proposal_no?: string;
  outstanding_amount?: number;
  total_overdue?: number;
  dpd?: number;
  bom_bucket?: string;
  emi_amount?: number;
  emi_due_date?: string;
  customer_id?: number;
  cust_code?: string;
  customer_name?: string;
  customer_phone?: string;
  alt_phone?: string;
  customer_email?: string;
  customer_address?: string;
  customer_city?: string;
  customer_state?: string;
  employment_info?: string;
  vehicle_id?: number;
  registration_number?: string;
  vehicle_type?: string;
  manufacturer?: string;
  vehicle_model?: string;
  asset_desc?: string;
  variant?: string;
  chassis_number?: string;
  engine_number?: string;
  vehicle_location?: string;
  vehicle_status?: string;
  assigned_employee_name?: string;
  assigned_manager_name?: string;
  paid_unpaid?: string;
}

export interface CaseAssignment {
  id: number;
  case_id: number;
  employee_id: number;
  assigned_by: number;
  assigned_at: string;
  previous_employee_id?: number;
  remarks?: string;
  loan_account_number?: string;
  customer_name?: string;
  registration_number?: string;
  employee_name?: string;
  assigned_by_name?: string;
  previous_employee_name?: string;
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
  created_by_name?: string;
  loan_account_number?: string;
  customer_name?: string;
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
  collected_by_name?: string;
  customer_name?: string;
  customer_phone?: string;
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
  status: string;
  created_at?: string;
  uploaded_by_name?: string;
}

export interface ValidationErrorDetail {
  row_number: number;
  field: string;
  original_value: string;
  error_type: string;
  error_message: string;
}

export interface DashboardMetrics {
  total_cases: number;
  pending_cases: number;
  assigned_cases: number;
  in_progress: number;
  contacted: number;
  promise_to_pay: number;
  recovered: number;
  closed: number;
  unable_to_contact: number;
  legal_action: number;
  recovery_percentage: number;
  total_outstanding_amount: number;
  total_collected_amount: number;
}
