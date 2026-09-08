import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { RecoveryCase, Followup, Payment } from '../types';
import {
  ArrowLeft,
  PhoneCall,
  CreditCard,
  User,
  Truck,
  IndianRupee,
  Copy,
  Check,
  Phone,
  MapPin,
  Calendar,
  Clock,
  ShieldCheck,
  FileText
} from 'lucide-react';

export const CaseDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [caseData, setCaseData] = useState<RecoveryCase | null>(null);
  const [followups, setFollowups] = useState<Followup[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  useEffect(() => {
    if (id) fetchCaseDetails();
  }, [id]);

  const fetchCaseDetails = async () => {
    setIsLoading(true);
    try {
      const res = await api.get(`/recovery-cases/${id}`);
      setCaseData(res.data.case);
      setFollowups(res.data.followups || []);
      setPayments(res.data.payments || []);
    } catch (err) {
      console.error('Failed to fetch case details', err);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (val: any) => {
    const num = parseFloat(val) || 0;
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(num);
  };

  const handleCopy = (text: string, key: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1800);
  };

  if (isLoading || !caseData) {
    return (
      <div className="py-16 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-[#000000] border-t-transparent dark:border-[#FFFFFF] dark:border-t-transparent"></div>
        <p className="mt-3 text-sm text-[#666666] dark:text-[#999999] font-medium">Loading Recovery Case File...</p>
      </div>
    );
  }

  // 13 EXCEL FIELDS & SYSTEM IDENTIFIERS
  const proposalNo = String(caseData.loan_account_number || caseData.proposal_no || 'N/A').trim();
  const customerName = String(caseData.customer_name || 'N/A').trim();
  const bomBucket = String(
    caseData.bom_bucket ||
    (caseData.dpd !== undefined && caseData.dpd !== null
      ? caseData.dpd <= 30
        ? '1'
        : caseData.dpd <= 60
        ? '2'
        : caseData.dpd <= 90
        ? '3'
        : '4+'
      : '1')
  ).trim();
  const dpdDays = caseData.dpd ?? 0;
  const posAmount = parseFloat(String(caseData.outstanding_amount || 0));
  const emiAmount = parseFloat(String(caseData.emi_amount || 0));
  const totalDue = parseFloat(String(caseData.total_overdue || caseData.outstanding_amount || 0));
  const fullAddress = String(caseData.customer_address || 'Address Not Provided').trim();
  const regNo = String(caseData.registration_number || 'N/A').trim();
  const engineNo = String(caseData.engine_number || 'N/A').trim();
  const chassisNo = String(caseData.chassis_number || 'N/A').trim();
  const assetDesc = String(caseData.asset_desc || caseData.vehicle_model || 'Commercial Vehicle').trim();
  const phoneNo = String(caseData.customer_phone || '').trim();

  // Payment Status
  const rawStatus = String(caseData.status || '').toUpperCase();
  const rawPaid = String(caseData.paid_unpaid || '').toUpperCase();
  const isPaid = rawPaid === 'PAID' || rawStatus === 'PAID' || rawStatus === 'RECOVERED';
  const paymentStatus = isPaid ? 'PAID' : 'UNPAID';

  // System Details
  const recoveryCode = caseData.recovery_code || `RC-${String(caseData.id).padStart(3, '0')}`;
  const priority = String(caseData.priority || 'MEDIUM').toUpperCase();
  const caseStatus = caseData.status || 'PENDING';
  const assignedOfficer = caseData.assigned_employee_name || 'Unassigned';
  const assignedManager = caseData.assigned_manager_name || 'Executive Admin';
  const lastFollowup = caseData.last_followup_date
    ? new Date(caseData.last_followup_date).toLocaleDateString('en-IN')
    : 'No Visits Yet';
  const createdDate = caseData.created_at
    ? new Date(caseData.created_at).toLocaleDateString('en-IN')
    : 'N/A';

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12 text-[#111111] dark:text-[#FFFFFF]">
      {/* Top Header Navigation */}
      <div className="bg-[#FFFFFF] dark:bg-[#1A1A1A] rounded-xl border border-[#D1D1D1] dark:border-[#333333] p-5 sm:p-6 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link
            to="/cases"
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg bg-[#F7F7F7] dark:bg-[#222222] border border-[#D1D1D1] dark:border-[#444444] text-[#111111] dark:text-[#FFFFFF] hover:bg-[#E5E5E5] dark:hover:bg-[#333333] transition-colors cursor-pointer"
            title="Back to Cases"
            aria-label="Back to Cases"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <span className="text-[11px] font-bold text-[#666666] dark:text-[#999999] uppercase tracking-wider block">
              Recovery Case File
            </span>
            <div className="flex items-center gap-2 mt-0.5">
              <h1 className="text-xl sm:text-2xl font-black text-[#000000] dark:text-[#FFFFFF] font-mono tracking-tight">
                {recoveryCode}
              </h1>
              <span className="text-[#D1D1D1] dark:text-[#444444]">|</span>
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

        <div className="flex items-center gap-2.5">
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
        </div>
      </div>

      {/* ======================================================================= */}
      {/* SECTION 1: CASE OVERVIEW                                                */}
      {/* ======================================================================= */}
      <section className="bg-[#FFFFFF] dark:bg-[#1A1A1A] rounded-xl border border-[#D1D1D1] dark:border-[#333333] p-5 shadow-xs">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#666666] dark:text-[#999999] mb-3 pb-2 border-b border-[#F2F2F2] dark:border-[#262626] flex items-center gap-1.5">
          <FileText className="w-4 h-4 text-[#444444] dark:text-[#999999]" />
          <span>Section 1: Case Overview</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <span className="text-xs font-semibold text-[#666666] dark:text-[#999999] uppercase block mb-1">
              Recovery ID
            </span>
            <span className="font-mono font-bold text-base sm:text-lg text-[#000000] dark:text-[#FFFFFF] block break-all">
              {recoveryCode}
            </span>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#666666] dark:text-[#999999] uppercase block mb-1">
                Proposal No
              </span>
              <button
                type="button"
                onClick={() => handleCopy(proposalNo, 'ov-prop-page')}
                className="p-0.5 text-[#666666] hover:text-[#000000] dark:text-[#999999] dark:hover:text-[#FFFFFF] cursor-pointer"
                title="Copy Proposal No"
              >
                {copiedKey === 'ov-prop-page' ? (
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

          <div>
            <span className="text-xs font-semibold text-[#666666] dark:text-[#999999] uppercase block mb-1">
              Payment Status
            </span>
            <span className="inline-block mt-0.5 px-3 py-1 rounded text-xs font-black uppercase tracking-wider bg-[#E5E5E5] text-[#111111] dark:bg-[#2A2A2A] dark:text-[#FFFFFF] border border-[#D1D1D1] dark:border-[#555555]">
              {paymentStatus}
            </span>
          </div>

          <div>
            <span className="text-xs font-semibold text-[#666666] dark:text-[#999999] uppercase block mb-1">
              Priority
            </span>
            <span className="inline-block mt-0.5 px-3 py-1 rounded text-xs font-bold uppercase tracking-wider bg-[#000000] text-[#FFFFFF] dark:bg-[#FFFFFF] dark:text-[#000000]">
              {priority}
            </span>
          </div>

          <div>
            <span className="text-xs font-semibold text-[#666666] dark:text-[#999999] uppercase block mb-1">
              Case Status
            </span>
            <span className="font-bold text-base text-[#000000] dark:text-[#FFFFFF] block mt-1">
              {caseStatus}
            </span>
          </div>
        </div>
      </section>

      {/* ======================================================================= */}
      {/* SECTION 2: FINANCIAL INFORMATION (4 WHITE CARDS WITH BLACK VALUES)      */}
      {/* ======================================================================= */}
      <section className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#666666] dark:text-[#999999] flex items-center gap-1.5">
          <IndianRupee className="w-4 h-4 text-[#444444] dark:text-[#999999]" />
          <span>Section 2: Financial Information</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: POS */}
          <div className="bg-[#FFFFFF] dark:bg-[#1A1A1A] rounded-xl p-4 border border-[#D1D1D1] dark:border-[#333333]">
            <span className="text-xs font-semibold text-[#666666] dark:text-[#999999] uppercase block">
              POS (Principal Outstanding)
            </span>
            <span className="text-2xl sm:text-3xl font-bold font-mono text-[#000000] dark:text-[#FFFFFF] mt-2 block">
              {formatCurrency(posAmount)}
            </span>
            <span className="text-[11px] text-[#666666] dark:text-[#999999] font-medium mt-1 block">
              Principal Balance
            </span>
          </div>

          {/* Card 2: EMI Amount */}
          <div className="bg-[#FFFFFF] dark:bg-[#1A1A1A] rounded-xl p-4 border border-[#D1D1D1] dark:border-[#333333]">
            <span className="text-xs font-semibold text-[#666666] dark:text-[#999999] uppercase block">
              EMI Amount
            </span>
            <span className="text-2xl sm:text-3xl font-bold font-mono text-[#000000] dark:text-[#FFFFFF] mt-2 block">
              {formatCurrency(emiAmount)}
            </span>
            <span className="text-[11px] text-[#666666] dark:text-[#999999] font-medium mt-1 block">
              Monthly Installment
            </span>
          </div>

          {/* Card 3: Total Due */}
          <div className="bg-[#FFFFFF] dark:bg-[#1A1A1A] rounded-xl p-4 border-2 border-[#000000] dark:border-[#FFFFFF]">
            <span className="text-xs font-black text-[#000000] dark:text-[#FFFFFF] uppercase block">
              Total Due / Overdue
            </span>
            <span className="text-2xl sm:text-3xl font-black font-mono text-[#000000] dark:text-[#FFFFFF] mt-2 block">
              {formatCurrency(totalDue)}
            </span>
            <span className="text-[11px] text-[#444444] dark:text-[#D1D1D1] font-semibold mt-1 block">
              Immediate Collection Target
            </span>
          </div>

          {/* Card 4: BOM Bucket / DPD */}
          <div className="bg-[#FFFFFF] dark:bg-[#1A1A1A] rounded-xl p-4 border border-[#D1D1D1] dark:border-[#333333]">
            <span className="text-xs font-semibold text-[#666666] dark:text-[#999999] uppercase block">
              BOM Bucket / DPD
            </span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-2xl sm:text-3xl font-bold font-mono text-[#000000] dark:text-[#FFFFFF]">
                {bomBucket.startsWith('BOM') ? bomBucket : `BOM ${bomBucket}`}
              </span>
              <span className="text-sm font-bold font-mono text-[#444444] dark:text-[#D1D1D1]">
                ({dpdDays} Days)
              </span>
            </div>
            <span className="text-[11px] text-[#666666] dark:text-[#999999] font-medium mt-1 block">
              Aging Delinquency
            </span>
          </div>
        </div>
      </section>

      {/* ======================================================================= */}
      {/* 2-COLUMN GRID ON DESKTOP / 1-COLUMN ON MOBILE: SECTIONS 3 & 4           */}
      {/* ======================================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* ===================================================================== */}
        {/* SECTION 3: CUSTOMER INFORMATION                                       */}
        {/* ===================================================================== */}
        <section className="bg-[#FFFFFF] dark:bg-[#1A1A1A] rounded-xl border border-[#D1D1D1] dark:border-[#333333] p-5 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#666666] dark:text-[#999999] border-b border-[#E5E5E5] dark:border-[#333333] pb-2.5 flex items-center gap-1.5">
            <User className="w-4 h-4 text-[#444444] dark:text-[#999999]" />
            <span>Section 3: Customer Information</span>
          </h3>

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Customer Name */}
              <div>
                <span className="text-xs font-semibold text-[#666666] dark:text-[#999999] uppercase block mb-1">
                  Customer Name
                </span>
                <span
                  className="text-base sm:text-lg font-bold text-[#000000] dark:text-[#FFFFFF] uppercase block"
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
                      onClick={() => handleCopy(phoneNo, 'page-phone')}
                      className="p-0.5 text-[#666666] hover:text-[#000000] dark:text-[#999999] dark:hover:text-[#FFFFFF] cursor-pointer"
                      title="Copy Phone"
                    >
                      {copiedKey === 'page-phone' ? (
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
                    className="inline-flex items-center gap-1.5 text-base sm:text-lg font-mono font-bold text-[#000000] dark:text-[#FFFFFF] hover:underline"
                  >
                    <Phone className="w-4 h-4 shrink-0 text-[#444444] dark:text-[#999999]" />
                    <span>{phoneNo}</span>
                  </a>
                ) : (
                  <span className="text-sm font-semibold text-[#666666]">N/A</span>
                )}
              </div>
            </div>

            {/* Residence Address (Full Multi-line Wrap) */}
            <div className="pt-2 border-t border-[#F2F2F2] dark:border-[#262626]">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-[#666666] dark:text-[#999999] uppercase flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#666666] dark:text-[#999999]" />
                  <span>Residence Address</span>
                </span>
                <button
                  type="button"
                  onClick={() => handleCopy(fullAddress, 'page-addr')}
                  className="text-xs font-bold text-[#444444] dark:text-[#CCCCCC] hover:text-[#000000] dark:hover:text-[#FFFFFF] flex items-center gap-1 cursor-pointer"
                >
                  {copiedKey === 'page-addr' ? (
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
              <div className="p-3.5 bg-[#F7F7F7] dark:bg-[#111111] rounded-lg border border-[#E5E5E5] dark:border-[#333333]">
                <p
                  className="text-sm sm:text-base font-medium text-[#111111] dark:text-[#E5E5E5] leading-relaxed whitespace-pre-line"
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
                <span className="text-sm sm:text-base font-bold text-[#000000] dark:text-[#FFFFFF] block">
                  {caseData.customer_city || 'Nashik'}
                  {caseData.customer_state ? `, ${caseData.customer_state}` : ''}
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
        <section className="bg-[#FFFFFF] dark:bg-[#1A1A1A] rounded-xl border border-[#D1D1D1] dark:border-[#333333] p-5 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#666666] dark:text-[#999999] border-b border-[#E5E5E5] dark:border-[#333333] pb-2.5 flex items-center gap-1.5">
            <Truck className="w-4 h-4 text-[#444444] dark:text-[#999999]" />
            <span>Section 4: Vehicle & Asset Information</span>
          </h3>

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Registration Number */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-[#666666] dark:text-[#999999] uppercase block">
                    Registration Number
                  </span>
                  {regNo !== 'N/A' && (
                    <button
                      type="button"
                      onClick={() => handleCopy(regNo, 'page-reg')}
                      className="p-0.5 text-[#666666] hover:text-[#000000] dark:text-[#999999] dark:hover:text-[#FFFFFF] cursor-pointer"
                      title="Copy Registration No"
                    >
                      {copiedKey === 'page-reg' ? (
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
                  className="text-base sm:text-lg font-bold text-[#000000] dark:text-[#FFFFFF] block"
                  style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}
                >
                  {assetDesc}
                </span>
              </div>
            </div>

            {/* Engine No & Chassis No */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-[#F2F2F2] dark:border-[#262626]">
              {/* Engine No */}
              <div className="p-3.5 bg-[#F7F7F7] dark:bg-[#111111] rounded-lg border border-[#E5E5E5] dark:border-[#333333]">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-[#666666] dark:text-[#999999] uppercase block">
                    Engine No
                  </span>
                  {engineNo !== 'N/A' && (
                    <button
                      type="button"
                      onClick={() => handleCopy(engineNo, 'page-eng')}
                      className="p-0.5 text-[#666666] hover:text-[#000000] dark:text-[#999999] dark:hover:text-[#FFFFFF] cursor-pointer"
                      title="Copy Engine No"
                    >
                      {copiedKey === 'page-eng' ? (
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
              <div className="p-3.5 bg-[#F7F7F7] dark:bg-[#111111] rounded-lg border border-[#E5E5E5] dark:border-[#333333]">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-[#666666] dark:text-[#999999] uppercase block">
                    Chassis No
                  </span>
                  {chassisNo !== 'N/A' && (
                    <button
                      type="button"
                      onClick={() => handleCopy(chassisNo, 'page-chs')}
                      className="p-0.5 text-[#666666] hover:text-[#000000] dark:text-[#999999] dark:hover:text-[#FFFFFF] cursor-pointer"
                      title="Copy Chassis No"
                    >
                      {copiedKey === 'page-chs' ? (
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
      <section className="bg-[#FFFFFF] dark:bg-[#1A1A1A] rounded-xl border border-[#D1D1D1] dark:border-[#333333] p-5 shadow-xs">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#666666] dark:text-[#999999] mb-3 pb-2 border-b border-[#F2F2F2] dark:border-[#262626] flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-[#444444] dark:text-[#999999]" />
          <span>Section 5: Additional Operational Information</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
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

      {/* ======================================================================= */}
      {/* SECTION 6: INTERACTION TIMELINE & PAYMENT HISTORY                       */}
      {/* ======================================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Interaction Timeline */}
        <section className="bg-[#FFFFFF] dark:bg-[#1A1A1A] rounded-xl border border-[#D1D1D1] dark:border-[#333333] p-5 shadow-xs">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#666666] dark:text-[#999999] mb-4 pb-2 border-b border-[#F2F2F2] dark:border-[#262626] flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <PhoneCall className="w-4 h-4 text-[#444444] dark:text-[#999999]" />
              <span>Field Interaction Timeline</span>
            </span>
            <span className="font-mono text-xs font-bold text-[#666666]">({followups.length})</span>
          </h3>

          <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
            {followups.length === 0 ? (
              <p className="text-xs text-[#666666] dark:text-[#999999] text-center py-8">
                No follow-ups recorded yet.
              </p>
            ) : (
              followups.map((f) => (
                <div
                  key={f.id}
                  className="p-3.5 bg-[#F7F7F7] dark:bg-[#111111] rounded-lg border border-[#E5E5E5] dark:border-[#333333] text-xs"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-[#000000] dark:text-[#FFFFFF]">{f.followup_type}</span>
                    <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-[#E5E5E5] dark:bg-[#2A2A2A] text-[#111111] dark:text-[#FFFFFF] border border-[#D1D1D1] dark:border-[#444444]">
                      {f.contact_result}
                    </span>
                  </div>
                  <p className="text-[#222222] dark:text-[#E5E5E5] italic mt-1 font-medium">
                    "{f.remarks || f.customer_response || 'Field interaction'}"
                  </p>
                  <p className="text-[10px] text-[#666666] dark:text-[#999999] mt-2 font-medium">
                    Logged by {f.created_by_name} • {new Date(f.followup_date).toLocaleString('en-IN')}
                  </p>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Payment History */}
        <section className="bg-[#FFFFFF] dark:bg-[#1A1A1A] rounded-xl border border-[#D1D1D1] dark:border-[#333333] p-5 shadow-xs">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#666666] dark:text-[#999999] mb-4 pb-2 border-b border-[#F2F2F2] dark:border-[#262626] flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <CreditCard className="w-4 h-4 text-[#444444] dark:text-[#999999]" />
              <span>Payment Collection History</span>
            </span>
            <span className="font-mono text-xs font-bold text-[#666666]">({payments.length})</span>
          </h3>

          <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
            {payments.length === 0 ? (
              <p className="text-xs text-[#666666] dark:text-[#999999] text-center py-8">
                No payment collections logged.
              </p>
            ) : (
              payments.map((p) => (
                <div
                  key={p.id}
                  className="p-3.5 bg-[#F7F7F7] dark:bg-[#111111] rounded-lg border border-[#E5E5E5] dark:border-[#333333] text-xs flex items-center justify-between"
                >
                  <div>
                    <p className="font-bold text-[#000000] dark:text-[#FFFFFF]">
                      {p.payment_mode} {p.transaction_ref ? `(${p.transaction_ref})` : ''}
                    </p>
                    <p className="text-[10px] text-[#666666] dark:text-[#999999] mt-0.5">
                      Collected by: {p.collected_by_name}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-[#000000] dark:text-[#FFFFFF] text-sm font-mono">
                      {formatCurrency(p.amount)}
                    </p>
                    <p className="text-[10px] text-[#666666] dark:text-[#999999]">
                      {new Date(p.payment_date).toLocaleDateString('en-IN')}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
};
