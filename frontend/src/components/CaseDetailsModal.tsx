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

  // Payment Status
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
        className="bg-[#FFFFFF] text-[#111111] rounded-xl border border-[#D6D6D6] shadow-2xl w-full max-w-5xl max-h-[92vh] sm:max-h-[90vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ========================================================================= */}
        {/* CASE HEADER WITH YELLOW ACCENT LINE (STICKY)                              */}
        {/* ========================================================================= */}
        <div className="relative px-4 sm:px-6 py-4 bg-[#FFFFFF] border-b border-[#E5E5E5] flex flex-wrap items-center justify-between gap-3 shrink-0">
          {/* Subtle Top Yellow Accent Line */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#FFD600] via-[#FACC15] to-[#EAB308]"></div>

          <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-4 mt-1">
            <div>
              <span className="text-[11px] font-semibold text-[#666666] uppercase tracking-wider block">
                Recovery Case
              </span>
              <div className="flex items-center gap-2 mt-0.5">
                <h2
                  id="case-dossier-title"
                  className="text-xl sm:text-2xl font-bold text-[#000000] font-heading tracking-tight"
                >
                  {recoveryCode}
                </h2>
                <span className="text-[#D6D6D6] hidden sm:inline">|</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-[12px] font-medium text-[#666666]">Proposal:</span>
                  <span className="font-mono font-semibold text-sm sm:text-base text-[#000000] tabular-nums">
                    {proposalNo}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopy(proposalNo, 'hdr-prop')}
                    className="p-1 text-[#666666] hover:text-[#000000] transition-colors cursor-pointer"
                    title="Copy Proposal No"
                    aria-label="Copy Proposal Number"
                  >
                    {copiedKey === 'hdr-prop' ? (
                      <Check className="w-3.5 h-3.5 text-[#000000]" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Badges: Priority + Paid with Black/White/Yellow */}
          <div className="flex items-center gap-2">
            <span
              className={`px-2.5 py-1 rounded text-xs font-bold uppercase tracking-wider ${
                priority === 'CRITICAL' || priority === 'HIGH'
                  ? 'bg-[#000000] text-[#FFFFFF]'
                  : 'bg-[#FEF9C3] text-[#111111] border border-[#EAB308]'
              }`}
            >
              {priority}
            </span>

            <span
              className={`px-2.5 py-1 rounded text-xs font-black uppercase tracking-wider ${
                isPaid
                  ? 'bg-[#FACC15] text-[#000000] border border-[#EAB308]'
                  : 'bg-[#FEF9C3] text-[#111111] border border-[#EAB308]'
              }`}
            >
              {paymentStatus}
            </span>

            <button
              type="button"
              onClick={onClose}
              className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg text-[#666666] hover:text-[#000000] hover:bg-[#F2F2F2] transition-colors ml-1 cursor-pointer"
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
        <div className="p-4 sm:p-6 space-y-6 overflow-y-auto flex-1 text-[#111111] bg-[#FAFAFA]">
          {/* ======================================================================= */}
          {/* SECTION 1: CASE OVERVIEW                                                */}
          {/* ======================================================================= */}
          <section className="bg-[#FFFFFF] rounded-xl border border-[#D6D6D6] p-4 sm:p-5 shadow-xs">
            <h3 className="text-[13px] sm:text-[14px] font-bold uppercase tracking-wider text-[#111111] mb-3 pb-2 border-b border-[#E5E5E5] flex items-center gap-1.5 font-heading">
              <FileText className="w-4 h-4 text-[#111111]" />
              <span>Case Overview</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-4">
              {/* Recovery ID */}
              <div>
                <span className="text-[12px] font-medium text-[#666666] uppercase block mb-1">
                  Recovery ID
                </span>
                <span className="font-mono font-bold text-base sm:text-lg text-[#000000] block break-all">
                  {recoveryCode}
                </span>
              </div>

              {/* Proposal No */}
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[12px] font-medium text-[#666666] uppercase block mb-1">
                    Proposal No
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopy(proposalNo, 'ov-prop')}
                    className="p-0.5 text-[#666666] hover:text-[#000000] cursor-pointer"
                    title="Copy Proposal No"
                  >
                    {copiedKey === 'ov-prop' ? (
                      <Check className="w-3.5 h-3.5 text-[#000000]" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
                <span className="font-mono font-semibold text-base sm:text-[17px] text-[#000000] block break-all tabular-nums">
                  {proposalNo}
                </span>
              </div>

              {/* Payment Status */}
              <div>
                <span className="text-[12px] font-medium text-[#666666] uppercase block mb-1">
                  Payment Status
                </span>
                <span
                  className={`inline-block mt-0.5 px-3 py-1 rounded text-xs font-black uppercase tracking-wider ${
                    isPaid
                      ? 'bg-[#FACC15] text-[#000000] border border-[#EAB308]'
                      : 'bg-[#FEF9C3] text-[#111111] border border-[#EAB308]'
                  }`}
                >
                  {paymentStatus}
                </span>
              </div>

              {/* Priority */}
              <div>
                <span className="text-[12px] font-medium text-[#666666] uppercase block mb-1">
                  Priority
                </span>
                <span
                  className={`inline-block mt-0.5 px-3 py-1 rounded text-xs font-bold uppercase tracking-wider ${
                    priority === 'CRITICAL' || priority === 'HIGH'
                      ? 'bg-[#000000] text-[#FFFFFF]'
                      : 'bg-[#FEF9C3] text-[#111111] border border-[#EAB308]'
                  }`}
                >
                  {priority}
                </span>
              </div>

              {/* Case Status */}
              <div>
                <span className="text-[12px] font-medium text-[#666666] uppercase block mb-1">
                  Case Status
                </span>
                <span className="font-semibold text-sm sm:text-base text-[#000000] block mt-1">
                  {caseStatus}
                </span>
              </div>
            </div>
          </section>

          {/* ======================================================================= */}
          {/* SECTION 2: FINANCIAL SUMMARY (WHITE CARDS WITH YELLOW ACCENT BORDER)    */}
          {/* ======================================================================= */}
          <section className="space-y-3">
            <h3 className="text-[13px] sm:text-[14px] font-bold uppercase tracking-wider text-[#111111] flex items-center gap-1.5 font-heading">
              <IndianRupee className="w-4 h-4 text-[#111111]" />
              <span>Financial Information</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
              {/* POS */}
              <div className="p-4 bg-[#FFFFFF] rounded-xl border border-[#D6D6D6] border-l-4 border-l-[#FACC15] shadow-xs">
                <span className="text-[12px] font-semibold text-[#666666] uppercase tracking-wider block">
                  POS (Principal Outstanding)
                </span>
                <span className="text-xl sm:text-2xl font-bold font-heading tabular-nums text-[#000000] mt-1.5 block">
                  {formatCurrency(posAmount)}
                </span>
                <div className="w-8 h-0.5 bg-[#FACC15] mt-2 rounded"></div>
              </div>

              {/* EMI Amount */}
              <div className="p-4 bg-[#FFFFFF] rounded-xl border border-[#D6D6D6] border-l-4 border-l-[#FACC15] shadow-xs">
                <span className="text-[12px] font-semibold text-[#666666] uppercase tracking-wider block">
                  EMI Amount
                </span>
                <span className="text-xl sm:text-2xl font-bold font-heading tabular-nums text-[#000000] mt-1.5 block">
                  {formatCurrency(emiAmount)}
                </span>
                <div className="w-8 h-0.5 bg-[#FACC15] mt-2 rounded"></div>
              </div>

              {/* Total Due */}
              <div className="p-4 bg-[#FFFFFF] rounded-xl border-2 border-[#000000] border-l-4 border-l-[#FACC15] shadow-sm">
                <span className="text-[12px] font-bold text-[#000000] uppercase tracking-wider block">
                  Total Due / Overdue
                </span>
                <span className="text-xl sm:text-2xl font-extrabold font-heading tabular-nums text-[#000000] mt-1.5 block">
                  {formatCurrency(totalDue)}
                </span>
                <div className="w-12 h-1 bg-[#FACC15] mt-2 rounded"></div>
              </div>

              {/* BOM Bucket / DPD */}
              <div className="p-4 bg-[#FFFFFF] rounded-xl border border-[#D6D6D6] border-l-4 border-l-[#FACC15] shadow-xs">
                <span className="text-[12px] font-semibold text-[#666666] uppercase tracking-wider block">
                  BOM Bucket / DPD
                </span>
                <div className="flex items-baseline gap-2 mt-1.5">
                  <span className="text-xl sm:text-2xl font-bold font-heading tabular-nums text-[#000000]">
                    {bomBucket.startsWith('BOM') ? bomBucket : `BOM ${bomBucket}`}
                  </span>
                  <span className="text-xs font-semibold tabular-nums text-[#333333]">
                    ({dpdDays} Days)
                  </span>
                </div>
                <div className="w-8 h-0.5 bg-[#FACC15] mt-2 rounded"></div>
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
            <section className="bg-[#FFFFFF] rounded-xl border border-[#D6D6D6] p-4 sm:p-5 space-y-4 shadow-xs">
              <h3 className="text-[13px] sm:text-[14px] font-bold uppercase tracking-wider text-[#111111] border-b border-[#E5E5E5] pb-2.5 flex items-center gap-1.5 font-heading">
                <User className="w-4 h-4 text-[#111111]" />
                <span>Customer Information</span>
              </h3>

              <div className="space-y-3.5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {/* Customer Name */}
                  <div>
                    <span className="text-[12px] font-medium text-[#666666] uppercase tracking-wider block mb-1">
                      Customer Name
                    </span>
                    <span
                      className="text-base sm:text-[17px] font-semibold text-[#111111] uppercase block"
                      style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}
                    >
                      {customerName}
                    </span>
                  </div>

                  {/* MO NO */}
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-[12px] font-medium text-[#666666] uppercase tracking-wider block mb-1">
                        MO NO (Mobile Number)
                      </span>
                      {phoneNo && (
                        <button
                          type="button"
                          onClick={() => handleCopy(phoneNo, 'cust-phone')}
                          className="p-0.5 text-[#666666] hover:text-[#000000] cursor-pointer"
                          title="Copy Mobile No"
                        >
                          {copiedKey === 'cust-phone' ? (
                            <Check className="w-3.5 h-3.5 text-[#000000]" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      )}
                    </div>
                    {phoneNo ? (
                      <a
                        href={`tel:${phoneNo}`}
                        className="inline-flex items-center gap-1.5 text-base sm:text-[17px] font-mono font-semibold text-[#111111] hover:underline tabular-nums"
                      >
                        <Phone className="w-3.5 h-3.5 shrink-0 text-[#111111]" />
                        <span>{phoneNo}</span>
                      </a>
                    ) : (
                      <span className="text-sm font-medium text-[#666666]">N/A</span>
                    )}
                  </div>
                </div>

                {/* Residence Address */}
                <div className="pt-2 border-t border-[#F2F2F2]">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[12px] font-medium text-[#666666] uppercase tracking-wider flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-[#666666]" />
                      <span>Residence Address</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopy(fullAddress, 'cust-addr')}
                      className="text-xs font-semibold text-[#444444] hover:text-[#000000] flex items-center gap-1 cursor-pointer"
                      title="Copy Full Address"
                    >
                      {copiedKey === 'cust-addr' ? (
                        <>
                          <Check className="w-3 h-3 text-[#000000]" />
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
                  <div className="p-3 bg-[#FAFAFA] rounded-lg border border-[#E5E5E5]">
                    <p
                      className="text-sm sm:text-[15px] font-normal text-[#111111] leading-relaxed whitespace-pre-line"
                      style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}
                    >
                      {fullAddress}
                    </p>
                  </div>
                </div>

                {/* Taluka, City & Territory */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-[#F2F2F2]">
                  <div>
                    <span className="text-[12px] font-medium text-[#666666] uppercase tracking-wider block mb-0.5">
                      Taluka
                    </span>
                    <span className="text-sm sm:text-[15px] font-semibold text-[#111111] block">
                      {recoveryCase.taluka ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-[#FEF9C3] text-[#111111] border border-[#EAB308]">
                          {recoveryCase.taluka}
                        </span>
                      ) : (
                        <span className="text-xs text-[#666666] font-normal">Not Specified</span>
                      )}
                    </span>
                  </div>

                  <div>
                    <span className="text-[12px] font-medium text-[#666666] uppercase tracking-wider block mb-0.5">
                      City & Territory
                    </span>
                    <span className="text-sm sm:text-[15px] font-semibold text-[#111111] block">
                      {recoveryCase.customer_city || 'Nashik'}
                      {recoveryCase.customer_state ? `, ${recoveryCase.customer_state}` : ''}
                    </span>
                  </div>

                  <div>
                    <span className="text-[12px] font-medium text-[#666666] uppercase tracking-wider block mb-0.5">
                      PAID / UNPAID Field
                    </span>
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded text-xs font-black uppercase tracking-wider ${
                        isPaid
                          ? 'bg-[#FACC15] text-[#000000] border border-[#EAB308]'
                          : 'bg-[#FEF9C3] text-[#111111] border border-[#EAB308]'
                      }`}
                    >
                      {paymentStatus}
                    </span>
                  </div>
                </div>
              </div>
            </section>

            {/* ===================================================================== */}
            {/* SECTION 4: VEHICLE & ASSET INFORMATION                                */}
            {/* ===================================================================== */}
            <section className="bg-[#FFFFFF] rounded-xl border border-[#D6D6D6] p-4 sm:p-5 space-y-4 shadow-xs">
              <h3 className="text-[13px] sm:text-[14px] font-bold uppercase tracking-wider text-[#111111] border-b border-[#E5E5E5] pb-2.5 flex items-center gap-1.5 font-heading">
                <Truck className="w-4 h-4 text-[#111111]" />
                <span>Vehicle & Asset Information</span>
              </h3>

              <div className="space-y-3.5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {/* Registration Number (Black Badge) */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[12px] font-medium text-[#666666] uppercase tracking-wider block">
                        Registration Number
                      </span>
                      {regNo !== 'N/A' && (
                        <button
                          type="button"
                          onClick={() => handleCopy(regNo, 'veh-reg')}
                          className="p-0.5 text-[#666666] hover:text-[#000000] cursor-pointer"
                          title="Copy Registration Number"
                        >
                          {copiedKey === 'veh-reg' ? (
                            <Check className="w-3.5 h-3.5 text-[#000000]" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      )}
                    </div>
                    <span className="inline-flex items-center px-3 py-1.5 rounded-md font-mono font-bold text-sm sm:text-base bg-[#111111] text-[#FFFFFF] tracking-wider">
                      {regNo}
                    </span>
                  </div>

                  {/* Asset Description */}
                  <div>
                    <span className="text-[12px] font-medium text-[#666666] uppercase tracking-wider block mb-1">
                      Asset Description
                    </span>
                    <span
                      className="text-base sm:text-[17px] font-semibold text-[#111111] block"
                      style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}
                    >
                      {assetDesc}
                    </span>
                  </div>
                </div>

                {/* Engine No & Chassis No */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2 border-t border-[#F2F2F2]">
                  {/* Engine No */}
                  <div className="p-3 bg-[#FAFAFA] rounded-lg border border-[#E5E5E5]">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[12px] font-medium text-[#666666] uppercase tracking-wider block">
                        Engine No
                      </span>
                      {engineNo !== 'N/A' && (
                        <button
                          type="button"
                          onClick={() => handleCopy(engineNo, 'veh-eng')}
                          className="p-0.5 text-[#666666] hover:text-[#000000] cursor-pointer"
                          title="Copy Engine No"
                        >
                          {copiedKey === 'veh-eng' ? (
                            <Check className="w-3.5 h-3.5 text-[#000000]" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      )}
                    </div>
                    <span
                      className="font-mono text-sm sm:text-[15px] font-semibold text-[#111111] block"
                      style={{ wordBreak: 'break-all', overflowWrap: 'anywhere' }}
                    >
                      {engineNo}
                    </span>
                  </div>

                  {/* Chassis No */}
                  <div className="p-3 bg-[#FAFAFA] rounded-lg border border-[#E5E5E5]">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[12px] font-medium text-[#666666] uppercase tracking-wider block">
                        Chassis No
                      </span>
                      {chassisNo !== 'N/A' && (
                        <button
                          type="button"
                          onClick={() => handleCopy(chassisNo, 'veh-chs')}
                          className="p-0.5 text-[#666666] hover:text-[#000000] cursor-pointer"
                          title="Copy Chassis No"
                        >
                          {copiedKey === 'veh-chs' ? (
                            <Check className="w-3.5 h-3.5 text-[#000000]" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      )}
                    </div>
                    <span
                      className="font-mono text-sm sm:text-[15px] font-semibold text-[#111111] block"
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
          {/* SECTION 5: ADDITIONAL OPERATIONAL INFORMATION                           */}
          {/* ======================================================================= */}
          <section className="bg-[#FFFFFF] rounded-xl border border-[#D6D6D6] p-4 sm:p-5 shadow-xs">
            <h3 className="text-[13px] sm:text-[14px] font-bold uppercase tracking-wider text-[#111111] mb-3 pb-2 border-b border-[#E5E5E5] flex items-center gap-1.5 font-heading">
              <ShieldCheck className="w-4 h-4 text-[#111111]" />
              <span>Additional Information</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4 text-xs">
              <div>
                <span className="text-[12px] font-medium text-[#666666] uppercase tracking-wider block mb-1">
                  Assigned Officer
                </span>
                <span className="text-sm sm:text-base font-semibold text-[#111111] block">
                  {assignedOfficer}
                </span>
              </div>

              <div>
                <span className="text-[12px] font-medium text-[#666666] uppercase tracking-wider block mb-1">
                  Supervising Manager
                </span>
                <span className="text-sm sm:text-base font-semibold text-[#111111] block">
                  {assignedManager}
                </span>
              </div>

              <div>
                <span className="text-[12px] font-medium text-[#666666] uppercase tracking-wider block mb-1">
                  Last Follow-up Date
                </span>
                <span className="text-sm sm:text-base font-semibold text-[#111111] block tabular-nums">
                  {lastFollowup}
                </span>
              </div>

              <div>
                <span className="text-[12px] font-medium text-[#666666] uppercase tracking-wider block mb-1">
                  Created In System
                </span>
                <span className="text-sm sm:text-base font-semibold text-[#111111] block tabular-nums">
                  {createdDate}
                </span>
              </div>
            </div>
          </section>
        </div>

        {/* ========================================================================= */}
        {/* CASE OPERATIONS ACTION BAR (STICKY BOTTOM)                                */}
        {/* ========================================================================= */}
        <div className="px-4 sm:px-6 py-3.5 bg-[#FFFFFF] border-t border-[#D6D6D6] flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex flex-wrap items-center gap-2">
            {onAssign && (
              <button
                type="button"
                onClick={onAssign}
                className="min-h-[44px] px-4 py-2 bg-[#FFFFFF] hover:bg-[#F2F2F2] text-[#111111] border border-[#D6D6D6] rounded-lg text-[13px] sm:text-[14px] font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <UserCheck className="w-4 h-4 text-[#111111]" />
                <span>Assign Staff</span>
              </button>
            )}

            {onUpdateStatus && (
              <button
                type="button"
                onClick={onUpdateStatus}
                className="min-h-[44px] px-4 py-2 bg-[#FFFFFF] hover:bg-[#F2F2F2] text-[#111111] border border-[#D6D6D6] rounded-lg text-[13px] sm:text-[14px] font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Layers className="w-4 h-4 text-[#111111]" />
                <span>Update Status</span>
              </button>
            )}

            {onRecordFollowup && (
              <button
                type="button"
                onClick={onRecordFollowup}
                className="min-h-[44px] px-4 py-2 bg-[#FFFFFF] hover:bg-[#F2F2F2] text-[#111111] border border-[#D6D6D6] rounded-lg text-[13px] sm:text-[14px] font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <PhoneCall className="w-4 h-4 text-[#111111]" />
                <span>Record Follow-up</span>
              </button>
            )}

            {onRecordPayment && (
              <button
                type="button"
                onClick={onRecordPayment}
                className="min-h-[44px] px-4 py-2 bg-[#FACC15] hover:bg-[#EAB308] text-[#000000] border border-[#EAB308] rounded-lg text-[13px] sm:text-[14px] font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <CreditCard className="w-4 h-4 text-[#000000]" />
                <span>Collect Payment</span>
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] px-6 py-2 bg-[#000000] hover:bg-[#222222] text-[#FFFFFF] rounded-lg font-semibold text-[13px] sm:text-[14px] transition-colors cursor-pointer"
          >
            Close Dossier
          </button>
        </div>
      </div>
    </div>
  );
};
