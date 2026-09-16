import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { RecoveryCase, FollowupType, ContactResult, PaymentMode } from '../types';
import { DataTable, Column } from '../components/DataTable';
import { StatusBadge } from '../components/StatusBadge';
import { PriorityBadge } from '../components/PriorityBadge';
import { Modal } from '../components/Modal';
import { CaseDetailsModal } from '../components/CaseDetailsModal';
import { Search, Eye, PhoneCall, CreditCard } from 'lucide-react';

export const EmployeeCases: React.FC = () => {
  const [cases, setCases] = useState<RecoveryCase[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [total, setTotal] = useState(0);

  const [selectedCase, setSelectedCase] = useState<RecoveryCase | null>(null);
  const [showFollowupModal, setShowFollowupModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const [followupType, setFollowupType] = useState<FollowupType>('PHONE_CALL');
  const [contactResult, setContactResult] = useState<ContactResult>('CONTACTED');
  const [followupResponse, setFollowupResponse] = useState('');
  const [followupRemarks, setFollowupRemarks] = useState('');
  const [nextDate, setNextDate] = useState('');

  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMode, setPaymentMode] = useState<PaymentMode>('UPI');
  const [paymentRef, setPaymentRef] = useState('');
  const [paymentRemarks, setPaymentRemarks] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchMyCases();
  }, [search, page, limit]);

  const fetchMyCases = async () => {
    setIsLoading(true);
    try {
      const params: any = { page, limit };
      if (search) params.search = search;
      const res = await api.get('/recovery-cases', { params });
      setCases(res.data.cases || []);
      if (res.data.pagination) {
        setTotal(res.data.pagination.total);
      } else {
        setTotal(res.data.cases ? res.data.cases.length : 0);
      }
    } catch (err) {
      console.error('Failed to fetch employee cases', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFollowupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCase) return;
    setIsSubmitting(true);
    try {
      await api.post('/followups', {
        case_id: selectedCase.id,
        followup_type: followupType,
        contact_result: contactResult,
        customer_response: followupResponse,
        remarks: followupRemarks,
        next_followup_date: nextDate || null,
      });
      setShowFollowupModal(false);
      fetchMyCases();
    } catch (err) {
      alert('Failed to record follow-up.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCase || !paymentAmount) return;
    setIsSubmitting(true);
    try {
      await api.post('/payments', {
        case_id: selectedCase.id,
        customer_id: selectedCase.customer_id,
        amount: parseFloat(paymentAmount),
        payment_mode: paymentMode,
        transaction_ref: paymentRef,
        remarks: paymentRemarks,
      });
      setShowPaymentModal(false);
      fetchMyCases();
    } catch (err) {
      alert('Failed to record payment.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  const columns: Column<RecoveryCase>[] = [
    {
      header: 'Recovery ID',
      accessor: (row) => (
        <span className="font-bold font-mono text-[#111111]">
          {row.recovery_code || `RC-${String(row.id).padStart(3, '0')}`}
        </span>
      ),
    },
    {
      header: 'Proposal No',
      accessor: (row) => (
        <div>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#FACC15] shrink-0" />
            <p className="font-bold font-mono text-[#111111] text-xs">{row.loan_account_number || row.proposal_no}</p>
          </div>
          <p className="text-[11px] text-[#666666] font-semibold pl-3">DPD: {row.dpd || 0} Days</p>
        </div>
      ),
    },
    {
      header: 'Borrower',
      accessor: (row) => (
        <div>
          <p className="font-bold text-[#111111] leading-snug">{row.customer_name}</p>
          <p className="text-[11px] font-medium text-[#666666]">{row.customer_phone}</p>
        </div>
      ),
    },
    {
      header: 'Vehicle Reg',
      accessor: (row) => (
        <span className="font-mono text-xs bg-[#111111] text-[#FFFFFF] px-2.5 py-1 rounded-md font-bold border border-[#000000] tracking-wider shadow-xs">
          {row.registration_number || 'N/A'}
        </span>
      ),
    },
    {
      header: 'Total Due',
      accessor: (row) => (
        <div className="border-l-2 border-[#FACC15] pl-2 py-0.5 inline-block">
          <span className="font-mono font-black text-sm text-[#000000]">
            {formatCurrency(row.total_overdue || row.outstanding_amount || 0)}
          </span>
        </div>
      ),
    },
    {
      header: 'Priority',
      accessor: (row) => <PriorityBadge priority={row.priority} />,
    },
    {
      header: 'Status',
      accessor: (row) => <StatusBadge status={row.status} />,
    },
    {
      header: 'Actions',
      accessor: (row) => (
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => { setSelectedCase(row); setShowDetailModal(true); }}
            title="View Details"
            className="min-h-[38px] min-w-[38px] sm:min-h-[32px] sm:min-w-[32px] flex items-center justify-center rounded-lg bg-[#111111] hover:bg-[#FACC15] text-[#FFFFFF] hover:text-[#000000] border border-[#111111] hover:border-[#EAB308] transition-colors cursor-pointer"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => { setSelectedCase(row); setShowFollowupModal(true); }}
            title="Add Follow-up"
            className="min-h-[38px] min-w-[38px] sm:min-h-[32px] sm:min-w-[32px] flex items-center justify-center rounded-lg bg-[#FFFFFF] hover:bg-[#F2F2F2] text-[#111111] border border-[#D1D1D1] transition-colors cursor-pointer"
          >
            <PhoneCall className="w-4 h-4" />
          </button>
          <button
            onClick={() => { setSelectedCase(row); setShowPaymentModal(true); }}
            title="Record Collection Payment"
            className="min-h-[38px] min-w-[38px] sm:min-h-[32px] sm:min-w-[32px] flex items-center justify-center rounded-lg bg-[#FEF9C3] hover:bg-[#FACC15] text-[#000000] border border-[#EAB308] transition-colors cursor-pointer"
          >
            <CreditCard className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#111111] tracking-tight">My Assigned Recovery Cases</h1>
          <p className="text-xs text-[#666666] font-medium mt-1">Field officer workspace for customer follow-ups & collections.</p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-[#666666]" />
          <input
            type="text"
            placeholder="Search Proposal No, Borrower, Reg..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="min-h-[44px] w-full pl-10 pr-3.5 py-2.5 text-xs bg-[#FFFFFF] border border-[#D1D1D1] rounded-xl text-[#111111] placeholder:text-[#666666] focus:ring-2 focus:ring-[#FACC15]"
          />
        </div>
      </div>

      <DataTable
        columns={columns}
        data={cases}
        keyExtractor={(item) => item.id}
        isLoading={isLoading}
        emptyMessage="No recovery cases currently assigned to you."
        serverPagination={{
          total,
          page,
          limit,
          onPageChange: (newPage) => setPage(newPage),
          onLimitChange: (newLimit) => {
            setLimit(newLimit);
            setPage(1);
          },
        }}
        renderMobileCard={(item) => {
          const proposal = item.loan_account_number || item.proposal_no || 'N/A';
          const totalDue = parseFloat(String(item.total_overdue || item.outstanding_amount || 0));
          const vehicleDesc = [item.registration_number, item.vehicle_model || item.asset_desc]
            .filter(Boolean)
            .join(' / ') || 'Commercial Vehicle';

          return (
            <div className="bg-[#FFFFFF] rounded-2xl border border-[#D1D1D1] p-4 space-y-3 shadow-xs transition-shadow hover:shadow-md">
              {/* Row 1: Recovery Code + Status */}
              <div className="flex items-center justify-between border-b border-[#E8E8E8] pb-2.5">
                <span className="font-black font-mono text-[#111111] text-xs sm:text-sm tracking-wide">
                  {item.recovery_code || `RC-${String(item.id).padStart(3, '0')}`}
                </span>
                <div className="flex items-center gap-1.5">
                  <PriorityBadge priority={item.priority} />
                  <StatusBadge status={item.status} />
                </div>
              </div>

              {/* Row 2: Customer Name */}
              <div>
                <h3 className="font-black text-[#111111] text-base leading-tight tracking-tight uppercase">
                  {item.customer_name || 'N/A'}
                </h3>
              </div>

              {/* Rows 3-5: Metadata */}
              <div className="space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[#666666] font-medium">Proposal:</span>
                  <span className="font-mono font-bold text-[#111111]">{proposal}</span>
                </div>
                <div className="flex items-start justify-between gap-2">
                  <span className="text-[#666666] font-medium shrink-0">Vehicle:</span>
                  <span className="font-semibold text-[#111111] text-right truncate">
                    {vehicleDesc}
                  </span>
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-[#E8E8E8] font-mono">
                  <span className="text-[#666666] font-bold">Total Due:</span>
                  <span className="border-l-2 border-[#FACC15] pl-2 text-base font-black text-[#000000]">
                    {formatCurrency(totalDue)}
                  </span>
                </div>
              </div>

              {/* Primary Action Button */}
              <button
                type="button"
                onClick={() => {
                  setSelectedCase(item);
                  setShowDetailModal(true);
                }}
                className="w-full min-h-[44px] px-4 py-2.5 bg-[#FACC15] hover:bg-[#FFD600] text-[#000000] font-black text-xs uppercase tracking-wider rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer border border-[#EAB308]"
              >
                <Eye className="w-4 h-4" />
                <span>View Full Details</span>
              </button>

              {/* Quick Actions Grid */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#E8E8E8]">
                <button
                  type="button"
                  onClick={() => { setSelectedCase(item); setShowFollowupModal(true); }}
                  className="min-h-[44px] flex items-center justify-center gap-1.5 rounded-xl bg-[#F2F2F2] hover:bg-[#E5E5E5] text-[#111111] border border-[#D1D1D1] text-xs font-bold transition-colors cursor-pointer"
                  title="Add Follow-up"
                >
                  <PhoneCall className="w-4 h-4" />
                  <span>Follow-up</span>
                </button>
                <button
                  type="button"
                  onClick={() => { setSelectedCase(item); setShowPaymentModal(true); }}
                  className="min-h-[44px] flex items-center justify-center gap-1.5 rounded-xl bg-[#FEF9C3] hover:bg-[#FACC15] text-[#000000] border border-[#EAB308] text-xs font-bold transition-colors cursor-pointer"
                  title="Record Payment"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Collect Payment</span>
                </button>
              </div>
            </div>
          );
        }}
      />


      {/* Case Detail Modal */}
      <CaseDetailsModal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        recoveryCase={selectedCase}
        onRecordFollowup={() => {
          setShowDetailModal(false);
          setShowFollowupModal(true);
        }}
        onRecordPayment={() => {
          setShowDetailModal(false);
          setShowPaymentModal(true);
        }}
      />

      {/* Record Follow-up Modal */}
      <Modal
        isOpen={showFollowupModal}
        onClose={() => setShowFollowupModal(false)}
        title="Record Field Follow-up"
      >
        <form onSubmit={handleFollowupSubmit} className="space-y-4 text-xs text-[#111111]">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-[#333333] mb-1.5">Interaction Mode</label>
              <select
                value={followupType}
                onChange={(e) => setFollowupType(e.target.value as FollowupType)}
                className="min-h-[44px] w-full px-3.5 py-2.5 bg-[#FFFFFF] border border-[#D1D1D1] rounded-xl text-[#111111] font-bold focus:ring-2 focus:ring-[#FACC15]"
              >
                <option value="PHONE_CALL">PHONE_CALL</option>
                <option value="VISIT">FIELD VISIT</option>
                <option value="SMS">SMS</option>
                <option value="EMAIL">EMAIL</option>
                <option value="OTHER">OTHER</option>
              </select>
            </div>
            <div>
              <label className="block font-bold text-[#333333] mb-1.5">Contact Outcome</label>
              <select
                value={contactResult}
                onChange={(e) => setContactResult(e.target.value as ContactResult)}
                className="min-h-[44px] w-full px-3.5 py-2.5 bg-[#FFFFFF] border border-[#D1D1D1] rounded-xl text-[#111111] font-bold focus:ring-2 focus:ring-[#FACC15]"
              >
                <option value="CONTACTED">CONTACTED</option>
                <option value="NOT_CONTACTED">NOT_CONTACTED</option>
                <option value="PROMISE_TO_PAY">PROMISE_TO_PAY</option>
                <option value="REFUSED">REFUSED</option>
                <option value="WRONG_NUMBER">WRONG_NUMBER</option>
                <option value="CUSTOMER_UNAVAILABLE">CUSTOMER_UNAVAILABLE</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block font-bold text-[#333333] mb-1.5">Customer Statement</label>
            <textarea
              rows={2}
              value={followupResponse}
              onChange={(e) => setFollowupResponse(e.target.value)}
              className="w-full p-3 bg-[#FFFFFF] border border-[#D1D1D1] rounded-xl text-[#111111] font-medium placeholder:text-[#666666] focus:ring-2 focus:ring-[#FACC15]"
            />
          </div>
          <div>
            <label className="block font-bold text-[#333333] mb-1.5">Officer Remarks</label>
            <textarea
              rows={2}
              value={followupRemarks}
              onChange={(e) => setFollowupRemarks(e.target.value)}
              className="w-full p-3 bg-[#FFFFFF] border border-[#D1D1D1] rounded-xl text-[#111111] font-medium placeholder:text-[#666666] focus:ring-2 focus:ring-[#FACC15]"
            />
          </div>
          <div>
            <label className="block font-bold text-[#333333] mb-1.5">Next Follow-up Date</label>
            <input
              type="date"
              value={nextDate}
              onChange={(e) => setNextDate(e.target.value)}
              className="min-h-[44px] w-full px-3.5 py-2.5 bg-[#FFFFFF] border border-[#D1D1D1] rounded-xl text-[#111111] font-medium focus:ring-2 focus:ring-[#FACC15]"
            />
          </div>
          <div className="flex justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={() => setShowFollowupModal(false)}
              className="min-h-[44px] px-4 py-2.5 bg-[#F2F2F2] hover:bg-[#E5E5E5] text-[#111111] font-bold rounded-xl border border-[#D1D1D1] transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="min-h-[44px] px-5 py-2.5 bg-[#111111] hover:bg-[#000000] text-[#FFFFFF] font-extrabold rounded-xl shadow-xs transition-colors cursor-pointer border border-[#333333]"
            >
              {isSubmitting ? 'Recording...' : 'Record Follow-up'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Record Payment Modal */}
      <Modal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        title="Record Payment Collection"
      >
        <form onSubmit={handlePaymentSubmit} className="space-y-4 text-xs text-[#111111]">
          <div>
            <label className="block font-bold text-[#333333] mb-1.5">Collection Amount (₹)</label>
            <input
              type="number"
              required
              min="1"
              value={paymentAmount}
              onChange={(e) => setPaymentAmount(e.target.value)}
              className="min-h-[44px] w-full px-3.5 py-2.5 bg-[#FFFFFF] border border-[#D1D1D1] rounded-xl font-bold text-sm text-[#111111] focus:ring-2 focus:ring-[#FACC15]"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-[#333333] mb-1.5">Payment Mode</label>
              <select
                value={paymentMode}
                onChange={(e) => setPaymentMode(e.target.value as PaymentMode)}
                className="min-h-[44px] w-full px-3.5 py-2.5 bg-[#FFFFFF] border border-[#D1D1D1] rounded-xl text-[#111111] font-bold focus:ring-2 focus:ring-[#FACC15]"
              >
                <option value="CASH">CASH</option>
                <option value="UPI">UPI</option>
                <option value="BANK_TRANSFER">BANK_TRANSFER</option>
                <option value="CHEQUE">CHEQUE</option>
                <option value="OTHER">OTHER</option>
              </select>
            </div>
            <div>
              <label className="block font-bold text-[#333333] mb-1.5">Transaction Ref</label>
              <input
                type="text"
                value={paymentRef}
                onChange={(e) => setPaymentRef(e.target.value)}
                className="min-h-[44px] w-full px-3.5 py-2.5 bg-[#FFFFFF] border border-[#D1D1D1] rounded-xl text-[#111111] font-medium focus:ring-2 focus:ring-[#FACC15]"
              />
            </div>
          </div>
          <div>
            <label className="block font-bold text-[#333333] mb-1.5">Remarks</label>
            <textarea
              rows={2}
              value={paymentRemarks}
              onChange={(e) => setPaymentRemarks(e.target.value)}
              className="w-full p-3 bg-[#FFFFFF] border border-[#D1D1D1] rounded-xl text-[#111111] font-medium placeholder:text-[#666666] focus:ring-2 focus:ring-[#FACC15]"
            />
          </div>
          <div className="flex justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={() => setShowPaymentModal(false)}
              className="min-h-[44px] px-4 py-2.5 bg-[#F2F2F2] hover:bg-[#E5E5E5] text-[#111111] font-bold rounded-xl border border-[#D1D1D1] transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="min-h-[44px] px-5 py-2.5 bg-gradient-to-r from-[#FFD600] to-[#EAB308] hover:opacity-95 text-[#000000] font-black rounded-xl border border-[#EAB308] shadow-xs transition-colors cursor-pointer"
            >
              {isSubmitting ? 'Recording...' : 'Submit Payment'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
