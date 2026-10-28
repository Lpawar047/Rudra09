import React, { useState } from 'react';
import { Modal } from './Modal';
import { 
  CheckCircle2, 
  Copy, 
  Check, 
  UserCheck, 
  User, 
  FileText, 
  Car, 
  MapPin, 
  IndianRupee, 
  Phone, 
  Mail, 
  Info,
  ArrowRight
} from 'lucide-react';

export interface AssignmentData {
  case_id: number;
  recovery_code?: string;
  loan_account_number: string;
  customer_name: string;
  customer_phone?: string;
  customer_address?: string;
  vehicle_reg_no?: string;
  vehicle_model?: string;
  vehicle_make?: string;
  taluka?: string | null;
  total_overdue?: number;
  dpd?: number;
  status?: string;
  employee_id: number;
  employee_name: string;
  employee_email: string;
  employee_phone?: string;
  employee_dept?: string;
  assigned_by_name?: string;
  assigned_at?: string;
  remarks?: string;
}

interface AssignmentSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  assignment: AssignmentData | null;
}

export const AssignmentSuccessModal: React.FC<AssignmentSuccessModalProps> = ({
  isOpen,
  onClose,
  assignment,
}) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!assignment) return null;

  const handleCopy = (text: string, key: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const formatCurrency = (val?: number) => {
    const num = parseFloat(String(val || 0));
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(num);
  };

  const recoveryCode = assignment.recovery_code || `RC-${String(assignment.case_id).padStart(3, '0')}`;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="max-w-2xl"
      hideHeader
    >
      <div className="space-y-5">
        {/* Header with Success Banner */}
        <div className="text-center pt-2 pb-1 border-b border-[#E8E8E8]">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-[#DCFCE7] border-2 border-[#22C55E] flex items-center justify-center mb-3 shadow-sm">
            <CheckCircle2 className="w-8 h-8 text-[#16A34A]" />
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-[#111111] tracking-tight">
            Case Assigned Successfully!
          </h2>
          <p className="text-xs sm:text-sm text-[#4B5563] font-medium mt-1">
            Case <span className="font-mono font-bold text-[#111111]">#{recoveryCode}</span> has been assigned to{' '}
            <span className="font-bold text-[#000000] bg-[#FEF9C3] px-1.5 py-0.5 rounded border border-[#EAB308]">
              {assignment.employee_name}
            </span>
          </p>
        </div>

        {/* Core Case Dossier Card */}
        <div className="bg-[#F9FAFB] border border-[#E5E7EB] rounded-2xl p-4 sm:p-5 space-y-4 shadow-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Loan Account No */}
            <div className="bg-[#FFFFFF] p-3 rounded-xl border border-[#E5E7EB] shadow-2xs flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-[#6B7280] uppercase tracking-wider flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5 text-[#EAB308]" />
                  Proposal / Loan No
                </span>
                <p className="font-mono font-black text-sm text-[#111111] mt-0.5">
                  {assignment.loan_account_number}
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleCopy(assignment.loan_account_number, 'loan_acc')}
                className="min-h-[36px] min-w-[36px] flex items-center justify-center rounded-lg bg-[#F3F4F6] hover:bg-[#E5E7EB] text-[#374151] transition-colors cursor-pointer"
                title="Copy Loan Account Number"
              >
                {copiedKey === 'loan_acc' ? (
                  <Check className="w-4 h-4 text-[#16A34A]" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>

            {/* Recovery Code */}
            <div className="bg-[#FFFFFF] p-3 rounded-xl border border-[#E5E7EB] shadow-2xs flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-[#6B7280] uppercase tracking-wider flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5 text-[#3B82F6]" />
                  Recovery Case ID
                </span>
                <p className="font-mono font-black text-sm text-[#111111] mt-0.5">
                  {recoveryCode} (DB #{assignment.case_id})
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleCopy(recoveryCode, 'case_code')}
                className="min-h-[36px] min-w-[36px] flex items-center justify-center rounded-lg bg-[#F3F4F6] hover:bg-[#E5E7EB] text-[#374151] transition-colors cursor-pointer"
                title="Copy Case Code"
              >
                {copiedKey === 'case_code' ? (
                  <Check className="w-4 h-4 text-[#16A34A]" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>

            {/* Borrower Info */}
            <div className="bg-[#FFFFFF] p-3 rounded-xl border border-[#E5E7EB] shadow-2xs">
              <span className="text-[11px] font-bold text-[#6B7280] uppercase tracking-wider flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-[#111111]" />
                Borrower / Customer
              </span>
              <p className="font-bold text-sm text-[#111111] mt-0.5 truncate">
                {assignment.customer_name}
              </p>
              {assignment.customer_phone && (
                <p className="text-xs text-[#6B7280] flex items-center gap-1 mt-0.5 font-mono">
                  <Phone className="w-3 h-3 text-[#9CA3AF]" />
                  {assignment.customer_phone}
                </p>
              )}
            </div>

            {/* Territory / Taluka */}
            <div className="bg-[#FFFFFF] p-3 rounded-xl border border-[#E5E7EB] shadow-2xs">
              <span className="text-[11px] font-bold text-[#6B7280] uppercase tracking-wider flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-[#EF4444]" />
                Taluka / Territory
              </span>
              <div className="mt-1">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-black bg-[#FEF9C3] text-[#111111] border border-[#EAB308]">
                  {assignment.taluka || 'All Talukas'}
                </span>
              </div>
            </div>

            {/* Vehicle Details */}
            <div className="bg-[#FFFFFF] p-3 rounded-xl border border-[#E5E7EB] shadow-2xs">
              <span className="text-[11px] font-bold text-[#6B7280] uppercase tracking-wider flex items-center gap-1">
                <Car className="w-3.5 h-3.5 text-[#111111]" />
                Vehicle Details
              </span>
              <p className="font-mono font-bold text-xs text-[#111111] mt-0.5">
                {assignment.vehicle_reg_no || 'N/A'}
              </p>
              <p className="text-xs text-[#6B7280] mt-0.5 truncate">
                {assignment.vehicle_model || 'Standard Asset'}
              </p>
            </div>

            {/* Total Overdue */}
            <div className="bg-[#FFFFFF] p-3 rounded-xl border border-[#E5E7EB] shadow-2xs">
              <span className="text-[11px] font-bold text-[#6B7280] uppercase tracking-wider flex items-center gap-1">
                <IndianRupee className="w-3.5 h-3.5 text-[#16A34A]" />
                Total Overdue Due
              </span>
              <p className="font-black text-sm text-[#EF4444] mt-0.5">
                {formatCurrency(assignment.total_overdue)}
              </p>
              <p className="text-[11px] font-semibold text-[#6B7280] mt-0.5">
                DPD: {assignment.dpd || 0} Days • Status: {assignment.status || 'ASSIGNED'}
              </p>
            </div>
          </div>

          {/* Assigned Officer Details Box */}
          <div className="bg-[#FFFFFF] p-3.5 rounded-xl border-2 border-[#EAB308]/40 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#FEF9C3] border border-[#EAB308] flex items-center justify-center shrink-0">
                  <UserCheck className="w-5 h-5 text-[#854D0E]" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#854D0E] bg-[#FEF9C3] px-1.5 py-0.2 rounded">
                      Assigned Field Officer
                    </span>
                  </div>
                  <p className="font-black text-sm text-[#111111] leading-tight">
                    {assignment.employee_name}
                  </p>
                </div>
              </div>
              <div className="text-left sm:text-right text-xs space-y-0.5">
                <p className="text-[#374151] flex items-center sm:justify-end gap-1">
                  <Mail className="w-3.5 h-3.5 text-[#9CA3AF]" />
                  <span className="font-mono">{assignment.employee_email}</span>
                </p>
                {assignment.employee_phone && (
                  <p className="text-[#6B7280] flex items-center sm:justify-end gap-1">
                    <Phone className="w-3.5 h-3.5 text-[#9CA3AF]" />
                    <span>{assignment.employee_phone}</span>
                  </p>
                )}
              </div>
            </div>
            {assignment.remarks && (
              <div className="mt-2.5 pt-2.5 border-t border-[#F3F4F6] text-xs">
                <span className="font-bold text-[#6B7280]">Remarks: </span>
                <span className="italic text-[#111111]">"{assignment.remarks}"</span>
              </div>
            )}
          </div>
        </div>

        {/* How to Find on Employee Page Banner */}
        <div className="bg-[#EFF6FF] border border-[#BFDBFE] rounded-2xl p-4 text-xs text-[#1E3A8A]">
          <div className="flex items-start gap-2.5">
            <Info className="w-5 h-5 text-[#2563EB] shrink-0 mt-0.5" />
            <div className="space-y-1.5">
              <p className="font-black text-sm text-[#1E40AF]">
                How to Locate This Case in the Field Officer Portal:
              </p>
              <ul className="space-y-1 text-[#1E3A8A] font-medium">
                <li className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#2563EB] shrink-0" />
                  <span>
                    Log in with employee account:{' '}
                    <strong className="text-[#111111] font-mono">{assignment.employee_email}</strong>
                  </span>
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#2563EB] shrink-0" />
                  <span>
                    Navigate to <strong className="text-[#111111]">Employee Portal &gt; My Cases</strong> (/employee/cases).
                  </span>
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#2563EB] shrink-0" />
                  <span>
                    Under the <strong className="text-[#111111]">"Assigned To Me"</strong> tab, search for proposal{' '}
                    <strong className="text-[#111111] font-mono">{assignment.loan_account_number}</strong> or filter by Taluka{' '}
                    <strong className="text-[#111111]">{assignment.taluka || 'All Talukas'}</strong>.
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <button
            type="button"
            onClick={() => handleCopy(assignment.loan_account_number, 'footer_copy')}
            className="w-full sm:w-auto min-h-[44px] px-4 py-2 bg-[#FFFFFF] hover:bg-[#F9FAFB] text-[#111111] border border-[#D1D5DB] font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            {copiedKey === 'footer_copy' ? (
              <>
                <Check className="w-4 h-4 text-[#16A34A]" />
                <span className="text-[#16A34A]">Proposal Number Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-[#6B7280]" />
                <span>Copy Proposal No ({assignment.loan_account_number})</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto min-h-[44px] px-6 py-2.5 bg-[#FACC15] hover:bg-[#EAB308] text-[#000000] font-black rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm transition-colors cursor-pointer"
          >
            <span>Done / Return to Cases</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </Modal>
  );
};
