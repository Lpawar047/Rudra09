import React, { useState } from 'react';
import { RecoveryCase } from '../types';
import {
  X,
  Copy,
  Check,
  Phone,
  Truck,
  User,
  IndianRupee,
  Calendar,
  Clock,
  ShieldCheck,
  MapPin,
  UserCheck,
  PhoneCall,
  CreditCard,
  Layers,
  FileText
} from 'lucide-react';

interface CaseDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  recoveryCase: RecoveryCase | null;
  onAssign?: () => void;
  onUpdateStatus?: () => void;
  onRecordFollowup?: () => void;
  onRecordPayment?: () => void;
}

export const CaseDetailsModal: React.FC<CaseDetailsModalProps> = ({
  isOpen,
  onClose,
  recoveryCase,
  onAssign,
  onUpdateStatus,
  onRecordFollowup,
  onRecordPayment,
}) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen || !recoveryCase) return null;

  const handleCopy = (text: string, key: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1800);
  };

  const formatCurrency = (val: any) => {
    const num = parseFloat(val) || 0;
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(num);
  };

  // 13 EXCEL FIELDS & SYSTEM IDENTIFIERS
  const proposalNo = String(recoveryCase.loan_account_number || recoveryCase.proposal_no || 'N/A').trim();
  const customerName = String(recoveryCase.customer_name || 'N/A').trim();
  const bomBucket = String(
    recoveryCase.bom_bucket ||
    (recoveryCase.dpd !== undefined && recoveryCase.dpd !== null
      ? recoveryCase.dpd <= 30
        ? '1'
        : recoveryCase.dpd <= 60
        ? '2'
        : recoveryCase.dpd <= 90
        ? '3'
        : '4+'
      : '1')
  ).trim();
  const dpdDays = recoveryCase.dpd ?? 0;
  const posAmount = parseFloat(String(recoveryCase.outstanding_amount || 0));
  const emiAmount = parseFloat(String(recoveryCase.emi_amount || 0));
  const totalDue = parseFloat(String(recoveryCase.total_overdue || recoveryCase.outstanding_amount || 0));
  const fullAddress = String(recoveryCase.customer_address || 'Address Not Provided').trim();
  const regNo = String(recoveryCase.registration_number || 'N/A').trim();
  const engineNo = String(recoveryCase.engine_number || 'N/A').trim();
  const chassisNo = String(recoveryCase.chassis_number || 'N/A').trim();
  const assetDesc = String(recoveryCase.asset_desc || recoveryCase.vehicle_model || 'Commercial Vehicle').trim();
  const phoneNo = String(recoveryCase.customer_phone || '').trim();
  
  // Payment Status: Check paid_unpaid or status
  const rawStatus = String(recoveryCase.status || '').toUpperCase();
  const rawPaid = String(recoveryCase.paid_unpaid || '').toUpperCase();
  const isPaid = rawPaid === 'PAID' || rawStatus === 'PAID' || rawStatus === 'RECOVERED';
  const paymentStatus = isPaid ? 'PAID' : 'UNPAID';

  // System IDs
  const recoveryCode = recoveryCase.recovery_code || `RC-${String(recoveryCase.id).padStart(3, '0')}`;
  const priority = String(recoveryCase.priority || 'MEDIUM').toUpperCase();
  const caseStatus = recoveryCase.status || 'PENDING';
  const assignedOfficer = recoveryCase.assigned_employee_name || 'Unassigned';
  const assignedManager = recoveryCase.assigned_manager_name || 'Executive Admin';
  const lastFollowup = recoveryCase.last_followup_date
    ? new Date(recoveryCase.last_followup_date).toLocaleDateString('en-IN')
    : 'No Visits Yet';
  const createdDate = recoveryCase.created_at
    ? new Date(recoveryCase.created_at).toLocaleDateString('en-IN')
    : 'N/A';

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 md:p-6"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="case-dossier-title"
    >
      <div
        className="bg-[#FFFFFF] dark:bg-[#111111] text-[#111111] dark:text-[#FFFFFF] rounded-xl border border-[#D1D1D1] dark:border-[#333333] shadow-2xl w-full max-w-5xl max-h-[92vh] sm:max-h-[90vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ========================================================================= */}
        {/* CASE HEADER (STICKY)                                                      */}
        {/* ========================================================================= */}
        <div className="px-4 sm:px-6 py-4 bg-[#F7F7F7] dark:bg-[#1A1A1A] border-b border-[#E5E5E5] dark:border-[#333333] flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-4">
            <div>
              <span className="text-[11px] font-bold text-[#666666] dark:text-[#999999] uppercase tracking-wider block">
                Recovery Case
              </span>
              <div className="flex items-center gap-2 mt-0.5">
                <h2
                  id="case-dossier-title"
                  className="text-xl sm:text-2xl font-black text-[#000000] dark:text-[#FFFFFF] font-mono tracking-tight"
                >
                  {recoveryCode}
                </h2>
                <span className="text-[#D1D1D1] dark:text-[#444444] hidden sm:inline">|</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold text-[#666666] dark:text-[#999999]">Proposal:</span>
                  <span className="font-mono font-bold text-sm sm:text-base text-[#000000] dark:text-[#FFFFFF]">
                    {proposalNo}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopy(proposalNo, 'hdr-prop')}
                    className="p-1 text-[#666666] hover:text-[#000000] dark:text-[#999999] dark:hover:text-[#FFFFFF] transition-colors cursor-pointer"
                    title="Copy Proposal No"
                    aria-label="Copy Proposal Number"
                  >
                    {copiedKey === 'hdr-prop' ? (
                      <Check className="w-3.5 h-3.5 text-[#000000] dark:text-[#FFFFFF]" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Grayscale Header Badges */}
          <div className="flex items-center gap-2">
            <span
              className={`px-2.5 py-1 rounded text-xs font-bold uppercase tracking-wider ${
                priority === 'CRITICAL' || priority === 'HIGH'
                  ? 'bg-[#000000] text-[#FFFFFF] dark:bg-[#FFFFFF] dark:text-[#000000]'
                  : 'bg-[#E5E5E5] text-[#111111] dark:bg-[#2A2A2A] dark:text-[#E5E5E5] border border-[#D1D1D1] dark:border-[#444444]'
              }`}
            >
              {priority}
            </span>

            <span
              className={`px-2.5 py-1 rounded text-xs font-black uppercase tracking-wider ${
                isPaid
                  ? 'bg-[#E5E5E5] text-[#111111] dark:bg-[#2A2A2A] dark:text-[#FFFFFF] border border-[#D1D1D1] dark:border-[#444444]'
                  : 'bg-[#000000] text-[#FFFFFF] dark:bg-[#FFFFFF] dark:text-[#000000]'
              }`}
            >
              {paymentStatus}
            </span>

            <button
              type="button"
              onClick={onClose}
              className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg text-[#666666] hover:text-[#000000] hover:bg-[#E5E5E5] dark:text-[#999999] dark:hover:text-[#FFFFFF] dark:hover:bg-[#2A2A2A] transition-colors ml-1 cursor-pointer"
              aria-label="Close Case Dossier"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* INTERNAL SCROLLABLE BODY                                                  */}
        {/* ========================================================================= */}
        <div className="p-4 sm:p-6 space-y-6 overflow-y-auto flex-1 text-[#111111] dark:text-[#FFFFFF]">
          {/* ======================================================================= */}
          {/* SECTION 1: CASE OVERVIEW                                                */}
          {/* ======================================================================= */}
          <section className="bg-[#FFFFFF] dark:bg-[#161616] rounded-xl border border-[#E5E5E5] dark:border-[#333333] p-4 sm:p-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#666666] dark:text-[#999999] mb-3 pb-2 border-b border-[#F2F2F2] dark:border-[#262626] flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-[#444444] dark:text-[#999999]" />
              <span>Section 1: Case Overview</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-4">
              {/* Recovery ID */}
              <div>
                <span className="text-xs font-semibold text-[#666666] dark:text-[#999999] uppercase block mb-1">
                  Recovery ID
                </span>
                <span className="font-mono font-bold text-base sm:text-lg text-[#000000] dark:text-[#FFFFFF] block break-all">
                  {recoveryCode}
                </span>
              </div>

              {/* Proposal No */}
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#666666] dark:text-[#999999] uppercase block mb-1">
                    Proposal No
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopy(proposalNo, 'ov-prop')}
                    className="p-0.5 text-[#666666] hover:text-[#000000] dark:text-[#999999] dark:hover:text-[#FFFFFF] cursor-pointer"
                    title="Copy Proposal No"
                  >
                    {copiedKey === 'ov-prop' ? (
                      <Check className="w-3.5 h-3.5 text-[#000000] dark:text-[#FFFFFF]" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
                <span className="font-mono font-bold text-base sm:text-lg text-[#000000] dark:text-[#FFFFFF] block break-all">
                  {proposalNo}
                </span>
              </div>

              {/* Payment Status */}
              <div>
                <span className="text-xs font-semibold text-[#666666] dark:text-[#999999] uppercase block mb-1">
                  Payment Status
                </span>
                <span className="inline-block mt-0.5 px-3 py-1 rounded text-xs font-black uppercase tracking-wider bg-[#E5E5E5] text-[#111111] dark:bg-[#2A2A2A] dark:text-[#FFFFFF] border border-[#D1D1D1] dark:border-[#555555]">
                  {paymentStatus}
                </span>
              </div>

              {/* Priority */}
              <div>
                <span className="text-xs font-semibold text-[#666666] dark:text-[#999999] uppercase block mb-1">
                  Priority
                </span>
                <span className="inline-block mt-0.5 px-3 py-1 rounded text-xs font-bold uppercase tracking-wider bg-[#000000] text-[#FFFFFF] dark:bg-[#FFFFFF] dark:text-[#000000]">
                  {priority}
                </span>
              </div>

              {/* Case Status */}
              <div>
                <span className="text-xs font-semibold text-[#666666] dark:text-[#999999] uppercase block mb-1">
                  Case Status
                </span>
                <span className="font-bold text-sm sm:text-base text-[#000000] dark:text-[#FFFFFF] block mt-1">
                  {caseStatus}
                </span>
              </div>
            </div>
          </section>

          {/* ======================================================================= */}
          {/* SECTION 2: FINANCIAL INFORMATION (WHITE CARDS WITH BLACK TEXT)          */}
          {/* ======================================================================= */}
          <section className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#666666] dark:text-[#999999] flex items-center gap-1.5">
              <IndianRupee className="w-4 h-4 text-[#444444] dark:text-[#999999]" />
              <span>Section 2: Financial Information</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
              {/* POS */}
              <div className="p-4 bg-[#FFFFFF] dark:bg-[#1A1A1A] rounded-xl border border-[#D1D1D1] dark:border-[#333333]">
                <span className="text-xs font-semibold text-[#666666] dark:text-[#999999] uppercase block">
                  POS (Principal Outstanding)
                </span>
                <span className="text-xl sm:text-2xl font-bold font-mono text-[#000000] dark:text-[#FFFFFF] mt-1.5 block">
                  {formatCurrency(posAmount)}
                </span>
                <span className="text-[11px] text-[#666666] dark:text-[#999999] font-medium mt-0.5 block">
                  Principal Balance
                </span>
              </div>

              {/* EMI Amount */}
              <div className="p-4 bg-[#FFFFFF] dark:bg-[#1A1A1A] rounded-xl border border-[#D1D1D1] dark:border-[#333333]">
                <span className="text-xs font-semibold text-[#666666] dark:text-[#999999] uppercase block">
                  EMI Amount
                </span>
                <span className="text-xl sm:text-2xl font-bold font-mono text-[#000000] dark:text-[#FFFFFF] mt-1.5 block">
                  {formatCurrency(emiAmount)}
                </span>
                <span className="text-[11px] text-[#666666] dark:text-[#999999] font-medium mt-0.5 block">
                  Monthly Installment
                </span>
              </div>

              {/* Total Due */}
              <div className="p-4 bg-[#FFFFFF] dark:bg-[#1A1A1A] rounded-xl border-2 border-[#000000] dark:border-[#FFFFFF]">
                <span className="text-xs font-black text-[#000000] dark:text-[#FFFFFF] uppercase block">
                  Total Due / Overdue
                </span>
                <span className="text-xl sm:text-2xl font-black font-mono text-[#000000] dark:text-[#FFFFFF] mt-1.5 block">
                  {formatCurrency(totalDue)}
                </span>
                <span className="text-[11px] text-[#444444] dark:text-[#D1D1D1] font-semibold mt-0.5 block">
                  Immediate Collection Target
                </span>
              </div>

              {/* BOM Bucket / DPD */}
              <div className="p-4 bg-[#FFFFFF] dark:bg-[#1A1A1A] rounded-xl border border-[#D1D1D1] dark:border-[#333333]">
                <span className="text-xs font-semibold text-[#666666] dark:text-[#999999] uppercase block">
                  BOM Bucket / DPD
                </span>
                <div className="flex items-baseline gap-2 mt-1.5">
                  <span className="text-xl sm:text-2xl font-bold font-mono text-[#000000] dark:text-[#FFFFFF]">
                    {bomBucket.startsWith('BOM') ? bomBucket : `BOM ${bomBucket}`}
                  </span>
                  <span className="text-xs font-bold font-mono text-[#444444] dark:text-[#D1D1D1]">
                    ({dpdDays} Days)
                  </span>
                </div>
                <span className="text-[11px] text-[#666666] dark:text-[#999999] font-medium mt-0.5 block">
                  Aging Delinquency
                </span>
              </div>
            </div>
          </section>

          {/* ======================================================================= */}
          {/* 2-COLUMN GRID ON DESKTOP / 1-COLUMN ON MOBILE: SECTIONS 3 & 4           */}
          {/* ======================================================================= */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* ===================================================================== */}
            {/* SECTION 3: CUSTOMER INFORMATION                                       */}
            {/* ===================================================================== */}
            <section className="bg-[#FFFFFF] dark:bg-[#1A1A1A] rounded-xl border border-[#D1D1D1] dark:border-[#333333] p-4 sm:p-5 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#666666] dark:text-[#999999] border-b border-[#E5E5E5] dark:border-[#333333] pb-2.5 flex items-center gap-1.5">
                <User className="w-4 h-4 text-[#444444] dark:text-[#999999]" />
                <span>Section 3: Customer Information</span>
              </h3>

              <div className="space-y-3.5">
                {/* 2-Col subgrid for Name & Phone on desktop / 1-col on mobile */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {/* Customer Name */}
                  <div>
                    <span className="text-xs font-semibold text-[#666666] dark:text-[#999999] uppercase block mb-1">
                      Customer Name
                    </span>
                    <span
                      className="text-base sm:text-[17px] font-bold text-[#000000] dark:text-[#FFFFFF] uppercase block"
                      style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}
                    >
                      {customerName}
                    </span>
                  </div>

                  {/* MO NO */}
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-[#666666] dark:text-[#999999] uppercase block mb-1">
                        MO NO (Mobile Number)
                      </span>
                      {phoneNo && (
                        <button
                          type="button"
                          onClick={() => handleCopy(phoneNo, 'cust-phone')}
                          className="p-0.5 text-[#666666] hover:text-[#000000] dark:text-[#999999] dark:hover:text-[#FFFFFF] cursor-pointer"
                          title="Copy Mobile No"
                        >
                          {copiedKey === 'cust-phone' ? (
                            <Check className="w-3.5 h-3.5 text-[#000000] dark:text-[#FFFFFF]" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      )}
                    </div>
                    {phoneNo ? (
                      <a
                        href={`tel:${phoneNo}`}
                        className="inline-flex items-center gap-1.5 text-base sm:text-[17px] font-mono font-bold text-[#000000] dark:text-[#FFFFFF] hover:underline"
                      >
                        <Phone className="w-3.5 h-3.5 shrink-0 text-[#444444] dark:text-[#999999]" />
                        <span>{phoneNo}</span>
                      </a>
                    ) : (
                      <span className="text-sm font-semibold text-[#666666]">N/A</span>
                    )}
                  </div>
                </div>

                {/* Residence Address (Full multiline wrap, no truncation) */}
                <div className="pt-2 border-t border-[#F2F2F2] dark:border-[#262626]">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-[#666666] dark:text-[#999999] uppercase flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-[#666666] dark:text-[#999999]" />
                      <span>Residence Address</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopy(fullAddress, 'cust-addr')}
                      className="text-xs font-bold text-[#444444] dark:text-[#CCCCCC] hover:text-[#000000] dark:hover:text-[#FFFFFF] flex items-center gap-1 cursor-pointer"
                      title="Copy Full Address"
                    >
                      {copiedKey === 'cust-addr' ? (
                        <>
                          <Check className="w-3 h-3 text-[#000000] dark:text-[#FFFFFF]" />
                          <span className="text-[11px]">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span className="text-[11px]">Copy Address</span>
                        </>
                      )}
                    </button>
                  </div>
                  <div className="p-3 bg-[#F7F7F7] dark:bg-[#111111] rounded-lg border border-[#E5E5E5] dark:border-[#333333]">
                    <p
                      className="text-sm sm:text-[15px] font-medium text-[#111111] dark:text-[#E5E5E5] leading-relaxed whitespace-pre-line"
                      style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}
                    >
                      {fullAddress}
                    </p>
                  </div>
                </div>

                {/* City & Territory */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-[#F2F2F2] dark:border-[#262626]">
                  <div>
                    <span className="text-xs font-semibold text-[#666666] dark:text-[#999999] uppercase block mb-0.5">
                      City & Territory
                    </span>
                    <span className="text-sm sm:text-[15px] font-bold text-[#000000] dark:text-[#FFFFFF] block">
                      {recoveryCase.customer_city || 'Nashik'}
                      {recoveryCase.customer_state ? `, ${recoveryCase.customer_state}` : ''}
                    </span>
                  </div>

                  <div>
                    <span className="text-xs font-semibold text-[#666666] dark:text-[#999999] uppercase block mb-0.5">
                      PAID / UNPAID Field
                    </span>
                    <span className="inline-block px-2.5 py-0.5 rounded text-xs font-black uppercase tracking-wider bg-[#E5E5E5] text-[#111111] dark:bg-[#2A2A2A] dark:text-[#FFFFFF] border border-[#D1D1D1] dark:border-[#555555]">
                      {paymentStatus}
                    </span>
                  </div>
                </div>
              </div>
            </section>

            {/* ===================================================================== */}
            {/* SECTION 4: VEHICLE & ASSET INFORMATION                                */}
            {/* ===================================================================== */}
            <section className="bg-[#FFFFFF] dark:bg-[#1A1A1A] rounded-xl border border-[#D1D1D1] dark:border-[#333333] p-4 sm:p-5 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#666666] dark:text-[#999999] border-b border-[#E5E5E5] dark:border-[#333333] pb-2.5 flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-[#444444] dark:text-[#999999]" />
                <span>Section 4: Vehicle & Asset Information</span>
              </h3>

              <div className="space-y-3.5">
                {/* 2-Col subgrid for Registration & Asset Desc */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {/* Registration Number (Badge) */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold text-[#666666] dark:text-[#999999] uppercase block">
                        Registration Number
                      </span>
                      {regNo !== 'N/A' && (
                        <button
                          type="button"
                          onClick={() => handleCopy(regNo, 'veh-reg')}
                          className="p-0.5 text-[#666666] hover:text-[#000000] dark:text-[#999999] dark:hover:text-[#FFFFFF] cursor-pointer"
                          title="Copy Registration Number"
                        >
                          {copiedKey === 'veh-reg' ? (
                            <Check className="w-3.5 h-3.5 text-[#000000] dark:text-[#FFFFFF]" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      )}
                    </div>
                    <span className="inline-flex items-center px-3 py-1.5 rounded-md font-mono font-black text-sm sm:text-base bg-[#000000] text-[#FFFFFF] dark:bg-[#FFFFFF] dark:text-[#000000] tracking-wider">
                      {regNo}
                    </span>
                  </div>

                  {/* Asset Description */}
                  <div>
                    <span className="text-xs font-semibold text-[#666666] dark:text-[#999999] uppercase block mb-1">
                      Asset Description
                    </span>
                    <span
                      className="text-base sm:text-[17px] font-bold text-[#000000] dark:text-[#FFFFFF] block"
                      style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}
                    >
                      {assetDesc}
                    </span>
                  </div>
                </div>

                {/* Engine No & Chassis No (Full values, no truncation, wrap naturally) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2 border-t border-[#F2F2F2] dark:border-[#262626]">
                  {/* Engine No */}
                  <div className="p-3 bg-[#F7F7F7] dark:bg-[#111111] rounded-lg border border-[#E5E5E5] dark:border-[#333333]">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold text-[#666666] dark:text-[#999999] uppercase block">
                        Engine No
                      </span>
                      {engineNo !== 'N/A' && (
                        <button
                          type="button"
                          onClick={() => handleCopy(engineNo, 'veh-eng')}
                          className="p-0.5 text-[#666666] hover:text-[#000000] dark:text-[#999999] dark:hover:text-[#FFFFFF] cursor-pointer"
                          title="Copy Engine No"
                        >
                          {copiedKey === 'veh-eng' ? (
                            <Check className="w-3.5 h-3.5 text-[#000000] dark:text-[#FFFFFF]" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      )}
                    </div>
                    <span
                      className="font-mono text-sm sm:text-base font-bold text-[#000000] dark:text-[#FFFFFF] block"
                      style={{ wordBreak: 'break-all', overflowWrap: 'anywhere' }}
                    >
                      {engineNo}
                    </span>
                  </div>

                  {/* Chassis No */}
                  <div className="p-3 bg-[#F7F7F7] dark:bg-[#111111] rounded-lg border border-[#E5E5E5] dark:border-[#333333]">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold text-[#666666] dark:text-[#999999] uppercase block">
                        Chassis No
                      </span>
                      {chassisNo !== 'N/A' && (
                        <button
                          type="button"
                          onClick={() => handleCopy(chassisNo, 'veh-chs')}
                          className="p-0.5 text-[#666666] hover:text-[#000000] dark:text-[#999999] dark:hover:text-[#FFFFFF] cursor-pointer"
                          title="Copy Chassis No"
                        >
                          {copiedKey === 'veh-chs' ? (
                            <Check className="w-3.5 h-3.5 text-[#000000] dark:text-[#FFFFFF]" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      )}
                    </div>
                    <span
                      className="font-mono text-sm sm:text-base font-bold text-[#000000] dark:text-[#FFFFFF] block"
                      style={{ wordBreak: 'break-all', overflowWrap: 'anywhere' }}
                    >
                      {chassisNo}
                    </span>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* ======================================================================= */}
          {/* SECTION 5: ADDITIONAL INFORMATION & SYSTEM TIMESTAMPS                   */}
          {/* ======================================================================= */}
          <section className="bg-[#FFFFFF] dark:bg-[#161616] rounded-xl border border-[#E5E5E5] dark:border-[#333333] p-4 sm:p-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#666666] dark:text-[#999999] mb-3 pb-2 border-b border-[#F2F2F2] dark:border-[#262626] flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#444444] dark:text-[#999999]" />
              <span>Section 5: Additional Operational Information</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4 text-xs">
              <div>
                <span className="text-xs font-semibold text-[#666666] dark:text-[#999999] uppercase block mb-1">
                  Assigned Officer
                </span>
                <span className="text-sm sm:text-base font-bold text-[#000000] dark:text-[#FFFFFF] block">
                  {assignedOfficer}
                </span>
              </div>

              <div>
                <span className="text-xs font-semibold text-[#666666] dark:text-[#999999] uppercase block mb-1">
                  Supervising Manager
                </span>
                <span className="text-sm sm:text-base font-bold text-[#000000] dark:text-[#FFFFFF] block">
                  {assignedManager}
                </span>
              </div>

              <div>
                <span className="text-xs font-semibold text-[#666666] dark:text-[#999999] uppercase block mb-1">
                  Last Follow-up Date
                </span>
                <span className="text-sm sm:text-base font-semibold text-[#111111] dark:text-[#E5E5E5] block">
                  {lastFollowup}
                </span>
              </div>

              <div>
                <span className="text-xs font-semibold text-[#666666] dark:text-[#999999] uppercase block mb-1">
                  Created In System
                </span>
                <span className="text-sm sm:text-base font-semibold text-[#111111] dark:text-[#E5E5E5] block">
                  {createdDate}
                </span>
              </div>
            </div>
          </section>
        </div>

        {/* ========================================================================= */}
        {/* CASE OPERATIONS ACTION BAR (STICKY BOTTOM)                                */}
        {/* ========================================================================= */}
        <div className="px-4 sm:px-6 py-3.5 bg-[#F7F7F7] dark:bg-[#1A1A1A] border-t border-[#E5E5E5] dark:border-[#333333] flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex flex-wrap items-center gap-2">
            {onAssign && (
              <button
                type="button"
                onClick={onAssign}
                className="min-h-[44px] px-4 py-2 bg-[#FFFFFF] hover:bg-[#E5E5E5] dark:bg-[#222222] dark:hover:bg-[#333333] text-[#000000] dark:text-[#FFFFFF] border border-[#D1D1D1] dark:border-[#444444] rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <UserCheck className="w-4 h-4 text-[#000000] dark:text-[#FFFFFF]" />
                <span>Assign Staff</span>
              </button>
            )}

            {onUpdateStatus && (
              <button
                type="button"
                onClick={onUpdateStatus}
                className="min-h-[44px] px-4 py-2 bg-[#FFFFFF] hover:bg-[#E5E5E5] dark:bg-[#222222] dark:hover:bg-[#333333] text-[#000000] dark:text-[#FFFFFF] border border-[#D1D1D1] dark:border-[#444444] rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Layers className="w-4 h-4 text-[#000000] dark:text-[#FFFFFF]" />
                <span>Update Status</span>
              </button>
            )}

            {onRecordFollowup && (
              <button
                type="button"
                onClick={onRecordFollowup}
                className="min-h-[44px] px-4 py-2 bg-[#FFFFFF] hover:bg-[#E5E5E5] dark:bg-[#222222] dark:hover:bg-[#333333] text-[#000000] dark:text-[#FFFFFF] border border-[#D1D1D1] dark:border-[#444444] rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <PhoneCall className="w-4 h-4 text-[#000000] dark:text-[#FFFFFF]" />
                <span>Record Follow-up</span>
              </button>
            )}

            {onRecordPayment && (
              <button
                type="button"
                onClick={onRecordPayment}
                className="min-h-[44px] px-4 py-2 bg-[#FFFFFF] hover:bg-[#E5E5E5] dark:bg-[#222222] dark:hover:bg-[#333333] text-[#000000] dark:text-[#FFFFFF] border border-[#D1D1D1] dark:border-[#444444] rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <CreditCard className="w-4 h-4 text-[#000000] dark:text-[#FFFFFF]" />
                <span>Collect Payment</span>
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] px-6 py-2 bg-[#000000] hover:bg-[#222222] dark:bg-[#FFFFFF] dark:hover:bg-[#E5E5E5] text-[#FFFFFF] dark:text-[#000000] rounded-lg font-bold text-xs transition-colors cursor-pointer"
          >
            Close Dossier
          </button>
        </div>
      </div>
    </div>
  );
};
