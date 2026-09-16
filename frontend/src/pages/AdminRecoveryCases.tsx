import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { RecoveryCase, User, Priority, CaseStatus, FollowupType, ContactResult, PaymentMode } from '../types';
import { DataTable, Column } from '../components/DataTable';
import { StatusBadge } from '../components/StatusBadge';
import { PriorityBadge } from '../components/PriorityBadge';
import { Modal } from '../components/Modal';
import { CaseDetailsModal } from '../components/CaseDetailsModal';
import {
  Search,
  UserCheck,
  PhoneCall,
  CreditCard,
  Edit,
  Eye,
  FileSpreadsheet,
  RotateCcw,
  Copy,
  Check,
  MapPin,
  Truck,
  Phone,
  Calendar,
  IndianRupee,
  Layers,
  FileText,
  Clock,
  ShieldCheck,
  AlertCircle,
  SlidersHorizontal,
  Filter
} from 'lucide-react';

export const AdminRecoveryCases: React.FC = () => {
  const [cases, setCases] = useState<RecoveryCase[]>([]);
  const [employees, setEmployees] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Pagination & Filtering state
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [employeeFilter, setEmployeeFilter] = useState('');
  const [bucketFilter, setBucketFilter] = useState('');
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [total, setTotal] = useState(0);

  // Modals state
  const [selectedCase, setSelectedCase] = useState<RecoveryCase | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showFollowupModal, setShowFollowupModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  // Clipboard copy state
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Form states
  const [assignEmpId, setAssignEmpId] = useState('');
  const [assignRemarks, setAssignRemarks] = useState('');

  const [editStatus, setEditStatus] = useState<CaseStatus>('PENDING');
  const [editPriority, setEditPriority] = useState<Priority>('MEDIUM');

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
    fetchCases();
  }, [search, statusFilter, priorityFilter, employeeFilter, page, limit]);

  useEffect(() => {
    fetchEmployees();
  }, []);

  // Automatically refresh cases when user switches back to tab
  useEffect(() => {
    const handleFocus = () => {
      fetchCases();
    };
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [search, statusFilter, priorityFilter, employeeFilter, page, limit, bucketFilter]);

  const fetchCases = async () => {
    setIsLoading(true);
    try {
      const params: any = {
        page,
        limit,
      };
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      if (priorityFilter) params.priority = priorityFilter;
      if (employeeFilter) params.employee_id = employeeFilter;

      const res = await api.get('/recovery-cases', { params });
      let fetchedCases: RecoveryCase[] = res.data.cases || [];

      // Optional client-side filter for BOM Bucket if selected
      if (bucketFilter) {
        fetchedCases = fetchedCases.filter((c) => {
          const calculatedBucket = c.bom_bucket || (c.dpd ? (c.dpd <= 30 ? 'BOM 1' : c.dpd <= 60 ? 'BOM 2' : c.dpd <= 90 ? 'BOM 3' : 'BOM 4+') : 'BOM 1');
          return calculatedBucket.toLowerCase().includes(bucketFilter.toLowerCase());
        });
      }

      setCases(fetchedCases);
      if (res.data.pagination) {
        setTotal(res.data.pagination.total);
      } else {
        setTotal(res.data.cases ? res.data.cases.length : 0);
      }
    } catch (err) {
      console.error('Failed to fetch cases', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const res = await api.get('/users?role=EMPLOYEE');
      setEmployees(res.data.users || []);
    } catch (err) {
      console.error('Failed to fetch employees', err);
    }
  };

  const handleCopy = (text: string, key: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1800);
  };

  const handleAssignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCase || !assignEmpId) return;
    setIsSubmitting(true);
    try {
      await api.post('/assignments', {
        case_id: selectedCase.id,
        employee_id: parseInt(assignEmpId, 10),
        remarks: assignRemarks,
      });
      setShowAssignModal(false);
      fetchCases();
    } catch (err) {
      alert('Failed to assign case.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCase) return;
    setIsSubmitting(true);
    try {
      await api.put(`/recovery-cases/${selectedCase.id}`, {
        status: editStatus,
        priority: editPriority,
      });
      setShowStatusModal(false);
      fetchCases();
    } catch (err) {
      alert('Failed to update case.');
    } finally {
      setIsSubmitting(false);
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
      fetchCases();
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
      fetchCases();
    } catch (err) {
      alert('Failed to record payment.');
    } finally {
      setIsSubmitting(false);
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

  const clearFilters = () => {
    setSearch('');
    setStatusFilter('');
    setPriorityFilter('');
    setEmployeeFilter('');
    setBucketFilter('');
    setPage(1);
  };

  const hasActiveFilters = Boolean(search || statusFilter || priorityFilter || employeeFilter || bucketFilter);

  // Helper for BOM Bucket calculation
  const getBomBucket = (row: RecoveryCase) => {
    if (row.bom_bucket) return row.bom_bucket;
    const dpd = row.dpd || 0;
    if (dpd <= 30) return 'BOM 1';
    if (dpd <= 60) return 'BOM 2';
    if (dpd <= 90) return 'BOM 3';
    return 'BOM 4+';
  };

  // ALL 13 EXCEL COLUMNS + SYSTEM COLUMNS DEFINITION
  const columns: Column<RecoveryCase>[] = [
    // 0. SYSTEM: Recovery ID (Sticky Left on Desktop)
    {
      header: 'Recovery ID',
      minWidth: '110px',
      stickyLeft: '0px',
      accessor: (row) => {
        const code = row.recovery_code || `RC-${String(row.id).padStart(3, '0')}`;
        return (
          <span className="font-bold font-mono text-[#111111] text-[13px] sm:text-[14px] tabular-nums">
            {code}
          </span>
        );
      },
    },

    // 1. EXCEL: Proposal No (Sticky Left on Desktop)
    {
      header: 'Proposal No',
      minWidth: '170px',
      stickyLeft: '110px',
      sortable: true,
      accessor: (row) => {
        const proposal = row.loan_account_number || row.proposal_no || 'N/A';
        return (
          <div className="group/prop relative">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#FACC15] shrink-0" />
              <span className="font-semibold text-[#111111] font-mono text-[13px] sm:text-[14px] tabular-nums">
                {proposal}
              </span>
              <button
                type="button"
                onClick={() => handleCopy(proposal, `prop-${row.id}`)}
                className="opacity-0 group-hover/prop:opacity-100 p-0.5 text-[#666666] hover:text-[#000000] transition-opacity cursor-pointer"
                title="Copy Proposal No"
              >
                {copiedKey === `prop-${row.id}` ? (
                  <Check className="w-3.5 h-3.5 text-[#111111]" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
            <p className="text-[12px] font-medium text-[#666666] pl-3 tabular-nums">
              DPD: {row.dpd || 0} Days
            </p>
          </div>
        );
      },
    },

    // 2. EXCEL: Customer Name (Sticky Left on Desktop with Shadow Edge)
    {
      header: 'Customer Name',
      minWidth: '220px',
      stickyLeft: '280px',
      stickyShadow: true,
      accessor: (row) => (
        <div>
          <p className="font-semibold text-[14px] sm:text-[15px] text-[#111111] leading-snug">
            {row.customer_name || 'N/A'}
          </p>
          <div className="flex items-center gap-1 mt-0.5 text-[13px] text-[#666666]">
            <Phone className="w-3 h-3 shrink-0" />
            <a
              href={`tel:${row.customer_phone}`}
              className="hover:text-[#000000] transition-colors font-mono font-medium tabular-nums"
            >
              {row.customer_phone || 'N/A'}
            </a>
          </div>
        </div>
      ),
    },

    // 3. EXCEL: BOM Bucket
    {
      header: 'BOM Bucket',
      minWidth: '120px',
      align: 'center',
      accessor: (row) => {
        const bucket = getBomBucket(row);
        return (
          <div className="inline-flex flex-col items-center">
            <span className="px-2.5 py-1 rounded-md text-[12px] font-semibold bg-[#F2F2F2] text-[#111111] border border-[#D6D6D6] font-mono tabular-nums">
              {bucket}
            </span>
            <span className="text-[11px] text-[#666666] font-medium mt-0.5 tabular-nums">
              ({row.dpd || 0}d DPD)
            </span>
          </div>
        );
      },
    },

    // 4. EXCEL: POS (Principal Outstanding)
    {
      header: 'POS Balance',
      minWidth: '130px',
      align: 'right',
      accessor: (row) => (
        <span className="font-mono font-semibold text-[14px] sm:text-[15px] text-[#111111] tabular-nums">
          {formatCurrency(row.outstanding_amount)}
        </span>
      ),
    },

    // 5. EXCEL: EMI Amount
    {
      header: 'EMI Amount',
      minWidth: '130px',
      align: 'right',
      accessor: (row) => (
        <span className="font-mono text-[13px] sm:text-[14px] font-medium text-[#666666] tabular-nums">
          {formatCurrency(row.emi_amount)}
        </span>
      ),
    },

    // 6. EXCEL: Total Due
    {
      header: 'Total Due',
      minWidth: '140px',
      align: 'right',
      sortable: true,
      accessor: (row) => {
        const due = parseFloat(String(row.total_overdue || row.outstanding_amount || 0));
        return (
          <div className="border-l-2 border-[#FACC15] pl-2 py-0.5 inline-block text-right">
            <span className="font-mono font-bold text-[14px] sm:text-[15px] text-[#000000] tabular-nums">
              {formatCurrency(due)}
            </span>
          </div>
        );
      },
    },

    // 7. EXCEL: Residence Address
    {
      header: 'Residence Address',
      minWidth: '280px',
      accessor: (row) => {
        const addr = row.customer_address || 'Address Not Provided';
        return (
          <div className="group/addr relative max-w-[270px]">
            <div className="flex items-start justify-between gap-1">
              <p className="text-[13px] sm:text-[14px] text-[#333333] line-clamp-2 leading-relaxed" title={addr}>
                {addr}
              </p>
              {row.customer_address && (
                <button
                  type="button"
                  onClick={() => handleCopy(addr, `addr-${row.id}`)}
                  className="opacity-0 group-hover/addr:opacity-100 p-0.5 text-[#666666] hover:text-[#000000] transition-opacity shrink-0 cursor-pointer"
                  title="Copy Full Address"
                >
                  {copiedKey === `addr-${row.id}` ? (
                    <Check className="w-3.5 h-3.5 text-[#111111]" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              )}
            </div>
            {row.customer_city && (
              <span className="inline-block mt-0.5 text-[11px] font-semibold text-[#666666] uppercase">
                {row.customer_city}
              </span>
            )}
          </div>
        );
      },
    },

    // 8. EXCEL: Registration Number
    {
      header: 'Registration Number',
      minWidth: '190px',
      accessor: (row) => (
        <div>
          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[13px] font-bold font-mono bg-[#111111] text-[#FFFFFF] border border-[#000000] tracking-wider shadow-xs">
            {row.registration_number || 'N/A'}
          </span>
          <p className="text-[12px] text-[#666666] font-normal mt-0.5 truncate max-w-[170px]" title={row.vehicle_model || row.asset_desc || 'Commercial Vehicle'}>
            {row.vehicle_model || row.asset_desc || 'Commercial Vehicle'}
          </p>
        </div>
      ),
    },

    // 9. EXCEL: Engine No
    {
      header: 'Engine No',
      minWidth: '180px',
      accessor: (row) => {
        const eng = row.engine_number || 'N/A';
        return (
          <div className="flex items-center gap-1 font-mono text-[13px] text-[#333333] group/eng">
            <span className="font-semibold" title={eng}>{eng}</span>
            {eng !== 'N/A' && (
              <button
                type="button"
                onClick={() => handleCopy(eng, `eng-${row.id}`)}
                className="opacity-0 group-hover/eng:opacity-100 text-[#666666] hover:text-[#000000] transition-opacity cursor-pointer p-0.5"
                title="Copy Engine No"
              >
                {copiedKey === `eng-${row.id}` ? (
                  <Check className="w-3.5 h-3.5 text-[#111111]" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            )}
          </div>
        );
      },
    },

    // 10. EXCEL: Chassis No
    {
      header: 'Chassis No',
      minWidth: '190px',
      accessor: (row) => {
        const chs = row.chassis_number || 'N/A';
        return (
          <div className="flex items-center gap-1 font-mono text-[13px] text-[#333333] group/chs">
            <span className="font-semibold" title={chs}>{chs}</span>
            {chs !== 'N/A' && (
              <button
                type="button"
                onClick={() => handleCopy(chs, `chs-${row.id}`)}
                className="opacity-0 group-hover/chs:opacity-100 text-[#666666] hover:text-[#000000] transition-opacity cursor-pointer p-0.5"
                title="Copy Chassis No"
              >
                {copiedKey === `chs-${row.id}` ? (
                  <Check className="w-3.5 h-3.5 text-[#111111]" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            )}
          </div>
        );
      },
    },

    // 11. EXCEL: Asset Desc
    {
      header: 'Asset Desc',
      minWidth: '200px',
      accessor: (row) => {
        const desc = row.asset_desc || row.vehicle_model || 'Vehicle';
        return (
          <span
            className="text-[13px] sm:text-[14px] font-medium text-[#111111] truncate block max-w-[190px]"
            title={desc}
          >
            {desc}
          </span>
        );
      },
    },

    // 12. EXCEL: MO NO
    {
      header: 'MO NO',
      minWidth: '150px',
      accessor: (row) => (
        <a
          href={`tel:${row.customer_phone}`}
          className="font-mono text-[13px] sm:text-[14px] font-semibold text-[#111111] hover:text-[#000000] underline decoration-dotted transition-colors tabular-nums"
        >
          {row.customer_phone || 'N/A'}
        </a>
      ),
    },

    // 13. EXCEL: PAID/UNPAID (Payment Status)
    {
      header: 'PAID/UNPAID',
      minWidth: '160px',
      accessor: (row) => <StatusBadge status={row.status} />,
    },

    // 14. SYSTEM: Priority
    {
      header: 'Priority',
      minWidth: '120px',
      accessor: (row) => <PriorityBadge priority={row.priority} />,
    },

    // 15. SYSTEM: Assigned Employee
    {
      header: 'Assigned Officer',
      minWidth: '170px',
      accessor: (row) => (
        <span
          className={`inline-block text-[12px] font-semibold px-2.5 py-1 rounded-md border ${
            row.assigned_employee_name
              ? 'bg-[#F2F2F2] text-[#111111] border-[#D6D6D6]'
              : 'bg-[#FEF9C3] text-[#111111] border-[#EAB308]'
          }`}
        >
          {row.assigned_employee_name || 'Unassigned'}
        </span>
      ),
    },

    // 16. SYSTEM: Actions
    {
      header: 'Actions',
      minWidth: '180px',
      accessor: (row) => (
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => {
              setSelectedCase(row);
              setShowDetailModal(true);
            }}
            title="View Full Case Dossier (13 Fields)"
            className="min-h-[34px] min-w-[34px] flex items-center justify-center rounded-lg bg-[#111111] hover:bg-[#FACC15] text-[#FFFFFF] hover:text-[#000000] border border-[#111111] hover:border-[#EAB308] transition-colors cursor-pointer"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => {
              setSelectedCase(row);
              setAssignEmpId(row.assigned_employee_id ? String(row.assigned_employee_id) : '');
              setShowAssignModal(true);
            }}
            title="Assign Staff"
            className="min-h-[34px] min-w-[34px] flex items-center justify-center rounded-lg bg-[#FFFFFF] hover:bg-[#F2F2F2] text-[#111111] border border-[#D6D6D6] transition-colors cursor-pointer"
          >
            <UserCheck className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => {
              setSelectedCase(row);
              setEditStatus(row.status);
              setEditPriority(row.priority);
              setShowStatusModal(true);
            }}
            title="Update Status / Priority"
            className="min-h-[34px] min-w-[34px] flex items-center justify-center rounded-lg bg-[#FFFFFF] hover:bg-[#F2F2F2] text-[#111111] border border-[#D6D6D6] transition-colors cursor-pointer"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => {
              setSelectedCase(row);
              setShowFollowupModal(true);
            }}
            title="Record Ground Follow-up"
            className="min-h-[34px] min-w-[34px] flex items-center justify-center rounded-lg bg-[#FFFFFF] hover:bg-[#F2F2F2] text-[#111111] border border-[#D6D6D6] transition-colors cursor-pointer"
          >
            <PhoneCall className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => {
              setSelectedCase(row);
              setShowPaymentModal(true);
            }}
            title="Record Payment Collection"
            className="min-h-[34px] min-w-[34px] flex items-center justify-center rounded-lg bg-[#FEF9C3] hover:bg-[#FACC15] text-[#111111] border border-[#EAB308] transition-colors cursor-pointer"
          >
            <CreditCard className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* 1. PAGE TITLE & HEADER BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-heading text-[#111111] tracking-tight">
            Recovery Cases
          </h1>
          <p className="text-sm text-[#666666] font-normal mt-1">
            Manage and track vehicle recovery operations, assignments and payment status.
          </p>
        </div>

        {/* Existing System Actions */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={fetchCases}
            disabled={isLoading}
            className="min-h-[42px] px-4 py-2 rounded-xl border border-[#D6D6D6] bg-[#FFFFFF] text-[#111111] hover:bg-[#F2F2F2] text-[13px] sm:text-[14px] font-semibold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            title="Refresh recovery cases"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          <Link
            to="/admin/excel-upload"
            className="min-h-[42px] px-4 py-2 bg-gradient-to-r from-[#FACC15] to-[#EAB308] hover:opacity-95 text-[#000000] border border-[#EAB308] rounded-xl text-[13px] sm:text-[14px] font-bold shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Bulk Excel Import</span>
          </Link>
        </div>
      </div>

      {/* 2. CLEAN SEARCH & RESPONSIVE FILTER TOOLBAR */}
      <div className="bg-[#FFFFFF] p-4 rounded-2xl border border-[#D6D6D6] shadow-xs space-y-3">
        {/* Mobile Search Bar & Filter Drawer Toggle */}
        <div className="flex sm:hidden items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-[#666666] pointer-events-none" />
            <input
              type="text"
              placeholder="Search Proposal, Customer, Vehicle..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="min-h-[44px] w-full pl-10 pr-3.5 py-2.5 text-[14px] bg-[#FFFFFF] border border-[#D6D6D6] rounded-xl text-[#111111] placeholder:text-[#666666] font-normal focus:outline-none focus:ring-2 focus:ring-[#FACC15]"
            />
          </div>
          <button
            type="button"
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className={`min-h-[44px] px-3.5 rounded-xl border text-[13px] font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              showMobileFilters || (statusFilter || priorityFilter || employeeFilter || bucketFilter)
                ? 'bg-[#FACC15] text-[#000000] border-[#EAB308] shadow-xs'
                : 'bg-[#FFFFFF] text-[#111111] border-[#D6D6D6]'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Filters</span>
            {(statusFilter || priorityFilter || employeeFilter || bucketFilter) && (
              <span className="w-5 h-5 rounded-full bg-[#111111] text-[#FFFFFF] text-[10px] font-bold flex items-center justify-center">
                {[statusFilter, priorityFilter, employeeFilter, bucketFilter].filter(Boolean).length}
              </span>
            )}
          </button>
        </div>

        {/* Collapsible Mobile Filters Drawer/Panel */}
        {showMobileFilters && (
          <div className="sm:hidden p-4 bg-[#F8F8F8] rounded-xl border border-[#D6D6D6] space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#D6D6D6]">
              <span className="font-bold text-xs uppercase tracking-wider text-[#111111] flex items-center gap-1.5 font-heading">
                <Filter className="w-3.5 h-3.5 text-[#111111]" />
                <span>Filter Cases</span>
              </span>
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="text-xs font-semibold text-[#111111] hover:underline"
                >
                  Reset All
                </button>
              )}
            </div>

            <div className="space-y-2.5">
              <div>
                <label className="text-[12px] font-medium text-[#666666] block mb-1">
                  Payment / Recovery Status
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setPage(1);
                  }}
                  className="min-h-[44px] w-full px-3 py-2 text-[13px] bg-[#FFFFFF] border border-[#D6D6D6] rounded-xl text-[#111111] font-medium"
                >
                  <option value="">All Recovery Statuses</option>
                  <option value="Paid">Paid</option>
                  <option value="Unpaid">Unpaid</option>
                  <option value="PENDING">PENDING</option>
                  <option value="ASSIGNED">ASSIGNED</option>
                  <option value="IN_PROGRESS">IN_PROGRESS</option>
                  <option value="CONTACTED">CONTACTED</option>
                  <option value="PROMISE_TO_PAY">PROMISE_TO_PAY</option>
                  <option value="RECOVERED">RECOVERED</option>
                  <option value="CLOSED">CLOSED</option>
                  <option value="UNABLE_TO_CONTACT">UNABLE_TO_CONTACT</option>
                  <option value="LEGAL_ACTION">LEGAL_ACTION</option>
                </select>
              </div>

              <div>
                <label className="text-[12px] font-medium text-[#666666] block mb-1">
                  BOM Bucket
                </label>
                <select
                  value={bucketFilter}
                  onChange={(e) => {
                    setBucketFilter(e.target.value);
                    setPage(1);
                  }}
                  className="min-h-[44px] w-full px-3 py-2 text-[13px] bg-[#FFFFFF] border border-[#D6D6D6] rounded-xl text-[#111111] font-medium"
                >
                  <option value="">All BOM Buckets</option>
                  <option value="BOM 1">BOM 1 (0-30 Days)</option>
                  <option value="BOM 2">BOM 2 (31-60 Days)</option>
                  <option value="BOM 3">BOM 3 (61-90 Days)</option>
                  <option value="BOM 4+">BOM 4+ (&gt;90 Days)</option>
                </select>
              </div>

              <div>
                <label className="text-[12px] font-medium text-[#666666] block mb-1">
                  Case Priority
                </label>
                <select
                  value={priorityFilter}
                  onChange={(e) => {
                    setPriorityFilter(e.target.value);
                    setPage(1);
                  }}
                  className="min-h-[44px] w-full px-3 py-2 text-[13px] bg-[#FFFFFF] border border-[#D6D6D6] rounded-xl text-[#111111] font-medium"
                >
                  <option value="">All Priorities</option>
                  <option value="LOW">LOW</option>
                  <option value="MEDIUM">MEDIUM</option>
                  <option value="HIGH">HIGH</option>
                  <option value="CRITICAL">CRITICAL</option>
                </select>
              </div>

              <div>
                <label className="text-[12px] font-medium text-[#666666] block mb-1">
                  Field Officer
                </label>
                <select
                  value={employeeFilter}
                  onChange={(e) => {
                    setEmployeeFilter(e.target.value);
                    setPage(1);
                  }}
                  className="min-h-[44px] w-full px-3 py-2 text-[13px] bg-[#FFFFFF] border border-[#D6D6D6] rounded-xl text-[#111111] font-medium"
                >
                  <option value="">All Field Officers</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setShowMobileFilters(false)}
                  className="w-full min-h-[44px] bg-[#111111] hover:bg-[#333333] text-[#FFFFFF] rounded-xl font-bold text-[13px] transition-colors cursor-pointer"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Desktop & Tablet Filters (5 Columns) */}
        <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Main Search Input */}
          <div className="relative lg:col-span-1">
            <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-[#666666] pointer-events-none" />
            <input
              type="text"
              placeholder="Search Cases..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="min-h-[44px] w-full pl-10 pr-3.5 py-2.5 text-[14px] bg-[#FFFFFF] border border-[#D6D6D6] rounded-xl text-[#111111] placeholder:text-[#666666] font-normal focus:outline-none focus:ring-2 focus:ring-[#FACC15] transition-all"
            />
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="min-h-[44px] w-full px-3.5 py-2.5 text-[13px] sm:text-[14px] bg-[#FFFFFF] border border-[#D6D6D6] rounded-xl text-[#111111] font-medium focus:outline-none focus:ring-2 focus:ring-[#FACC15]"
            >
              <option value="">All Statuses</option>
              <option value="Paid">Paid</option>
              <option value="Unpaid">Unpaid</option>
              <option value="PENDING">PENDING</option>
              <option value="ASSIGNED">ASSIGNED</option>
              <option value="IN_PROGRESS">IN_PROGRESS</option>
              <option value="CONTACTED">CONTACTED</option>
              <option value="PROMISE_TO_PAY">PROMISE_TO_PAY</option>
              <option value="RECOVERED">RECOVERED</option>
              <option value="CLOSED">CLOSED</option>
              <option value="UNABLE_TO_CONTACT">UNABLE_TO_CONTACT</option>
              <option value="LEGAL_ACTION">LEGAL_ACTION</option>
            </select>
          </div>

          {/* BOM Bucket Filter */}
          <div>
            <select
              value={bucketFilter}
              onChange={(e) => {
                setBucketFilter(e.target.value);
                setPage(1);
              }}
              className="min-h-[44px] w-full px-3.5 py-2.5 text-[13px] sm:text-[14px] bg-[#FFFFFF] border border-[#D6D6D6] rounded-xl text-[#111111] font-medium focus:outline-none focus:ring-2 focus:ring-[#FACC15]"
            >
              <option value="">All BOM Buckets</option>
              <option value="BOM 1">BOM 1 (0-30 Days)</option>
              <option value="BOM 2">BOM 2 (31-60 Days)</option>
              <option value="BOM 3">BOM 3 (61-90 Days)</option>
              <option value="BOM 4+">BOM 4+ (&gt;90 Days)</option>
            </select>
          </div>

          {/* Priority Filter */}
          <div>
            <select
              value={priorityFilter}
              onChange={(e) => {
                setPriorityFilter(e.target.value);
                setPage(1);
              }}
              className="min-h-[44px] w-full px-3.5 py-2.5 text-[13px] sm:text-[14px] bg-[#FFFFFF] border border-[#D6D6D6] rounded-xl text-[#111111] font-medium focus:outline-none focus:ring-2 focus:ring-[#FACC15]"
            >
              <option value="">All Priorities</option>
              <option value="LOW">LOW</option>
              <option value="MEDIUM">MEDIUM</option>
              <option value="HIGH">HIGH</option>
              <option value="CRITICAL">CRITICAL</option>
            </select>
          </div>

          {/* Field Officer Filter */}
          <div>
            <select
              value={employeeFilter}
              onChange={(e) => {
                setEmployeeFilter(e.target.value);
                setPage(1);
              }}
              className="min-h-[44px] w-full px-3.5 py-2.5 text-[13px] sm:text-[14px] bg-[#FFFFFF] border border-[#D6D6D6] rounded-xl text-[#111111] font-medium focus:outline-none focus:ring-2 focus:ring-[#FACC15]"
            >
              <option value="">All Field Officers</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Filter Summary & Horizontal Scroll Cue */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#D6D6D6]/60 text-xs">
          <div className="flex items-center flex-wrap gap-2 text-[#666666] font-semibold">
            <span>
              Showing <strong className="text-[#111111]">{cases.length}</strong> loaded of{' '}
              <strong className="text-[#111111]">{total}</strong> total cases
            </span>
            <span className="hidden md:inline-flex items-center gap-1 text-[#111111] font-bold ml-2">
              ← Scroll table horizontally for all 13 Excel columns →
            </span>
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="text-xs font-bold text-[#111111] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Clear all filters</span>
              <RotateCcw className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* 3. MAIN TABLE WITH HORIZONTAL SCROLL & 13 EXCEL COLUMNS */}
      <DataTable
        columns={columns}
        data={cases}
        keyExtractor={(item) => item.id}
        isLoading={isLoading}
        emptyMessage="No recovery cases matched your search or filter criteria."
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
            <div className="bg-[#FFFFFF] rounded-2xl border border-[#D6D6D6] p-4 space-y-3 shadow-xs transition-shadow hover:shadow-md">
              {/* Row 1: Recovery Code on left, Status Pill on right */}
              <div className="flex items-center justify-between border-b border-[#D6D6D6]/60 pb-2.5">
                <span className="font-bold font-mono text-[#111111] text-[13px] sm:text-[14px] tracking-wide tabular-nums">
                  {item.recovery_code || `RC-${String(item.id).padStart(3, '0')}`}
                </span>
                <div className="flex items-center gap-1.5">
                  <PriorityBadge priority={item.priority} />
                  <StatusBadge status={item.status} />
                </div>
              </div>

              {/* Row 2: Customer Name (bold uppercase) */}
              <div>
                <h3 className="font-bold font-heading text-[#111111] text-base leading-tight tracking-tight uppercase">
                  {item.customer_name || 'N/A'}
                </h3>
              </div>

              {/* Rows 3-5: Metadata Key-Values */}
              <div className="space-y-1.5 text-[13px] sm:text-[14px]">
                {/* Proposal */}
                <div className="flex items-center justify-between">
                  <span className="text-[#666666] font-medium">Proposal:</span>
                  <div className="flex items-center gap-1.5 font-mono font-semibold text-[#111111] tabular-nums">
                    <span>{proposal}</span>
                    <button
                      type="button"
                      onClick={() => handleCopy(proposal, `mob-prop-${item.id}`)}
                      className="p-1 text-[#666666] hover:text-[#000000] transition-colors cursor-pointer"
                      title="Copy Proposal No"
                    >
                      {copiedKey === `mob-prop-${item.id}` ? (
                        <Check className="w-3.5 h-3.5 text-[#111111]" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Vehicle */}
                <div className="flex items-start justify-between gap-2">
                  <span className="text-[#666666] font-medium shrink-0">Vehicle:</span>
                  <span className="font-normal text-[#111111] text-right truncate">
                    {vehicleDesc}
                  </span>
                </div>

                {/* Total Due */}
                <div className="flex items-center justify-between pt-1 border-t border-[#D6D6D6]/60">
                  <span className="text-[#666666] font-semibold">Total Due:</span>
                  <span className="border-l-2 border-[#FACC15] pl-2 text-base font-bold font-heading tabular-nums text-[#000000]">
                    {formatCurrency(totalDue)}
                  </span>
                </div>
              </div>

              {/* Primary Action: View Full Details (13 Fields) */}
              <button
                type="button"
                onClick={() => {
                  setSelectedCase(item);
                  setShowDetailModal(true);
                }}
                className="w-full min-h-[44px] px-4 py-2.5 bg-[#FACC15] hover:bg-[#EAB308] text-[#000000] font-bold text-[13px] uppercase tracking-wider rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Eye className="w-4 h-4" />
                <span>View Full Details</span>
              </button>

              {/* Quick Actions Grid (Touch Targets >= 44px) */}
              <div className="grid grid-cols-4 gap-1.5 pt-2 border-t border-[#D6D6D6]/60">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCase(item);
                    setAssignEmpId(item.assigned_employee_id ? String(item.assigned_employee_id) : '');
                    setShowAssignModal(true);
                  }}
                  className="min-h-[44px] flex flex-col items-center justify-center rounded-xl bg-[#F2F2F2] hover:bg-[#E5E5E5] text-[#111111] border border-[#D6D6D6] text-[11px] font-semibold transition-colors cursor-pointer"
                  title="Assign Staff"
                >
                  <UserCheck className="w-4 h-4 mb-0.5" />
                  <span>Assign</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCase(item);
                    setEditStatus(item.status);
                    setEditPriority(item.priority);
                    setShowStatusModal(true);
                  }}
                  className="min-h-[44px] flex flex-col items-center justify-center rounded-xl bg-[#F2F2F2] hover:bg-[#E5E5E5] text-[#111111] border border-[#D6D6D6] text-[11px] font-semibold transition-colors cursor-pointer"
                  title="Update Status"
                >
                  <Edit className="w-4 h-4 mb-0.5" />
                  <span>Status</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCase(item);
                    setShowFollowupModal(true);
                  }}
                  className="min-h-[44px] flex flex-col items-center justify-center rounded-xl bg-[#F2F2F2] hover:bg-[#E5E5E5] text-[#111111] border border-[#D6D6D6] text-[11px] font-semibold transition-colors cursor-pointer"
                  title="Follow-up"
                >
                  <PhoneCall className="w-4 h-4 mb-0.5" />
                  <span>Follow-up</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCase(item);
                    setShowPaymentModal(true);
                  }}
                  className="min-h-[44px] flex flex-col items-center justify-center rounded-xl bg-[#FEF9C3] hover:bg-[#FACC15] text-[#111111] border border-[#EAB308] text-[11px] font-semibold transition-colors cursor-pointer"
                  title="Payment"
                >
                  <CreditCard className="w-4 h-4 mb-0.5" />
                  <span>Payment</span>
                </button>
              </div>
            </div>
          );
        }}
      />

      {/* ========================================================================= */}
      {/* 4. COMPREHENSIVE CASE DOSSIER MODAL (SHOWS ALL 13 EXCEL FIELDS + SYSTEM)   */}
      {/* ========================================================================= */}
      <CaseDetailsModal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        recoveryCase={selectedCase}
        onAssign={() => {
          setShowDetailModal(false);
          setAssignEmpId(selectedCase?.assigned_employee_id ? String(selectedCase.assigned_employee_id) : '');
          setShowAssignModal(true);
        }}
        onUpdateStatus={() => {
          setShowDetailModal(false);
          if (selectedCase) {
            setEditStatus(selectedCase.status);
            setEditPriority(selectedCase.priority);
          }
          setShowStatusModal(true);
        }}
        onRecordFollowup={() => {
          setShowDetailModal(false);
          setShowFollowupModal(true);
        }}
        onRecordPayment={() => {
          setShowDetailModal(false);
          setShowPaymentModal(true);
        }}
      />

      {/* ========================================================================= */}
      {/* 5. ASSIGN STAFF MODAL                                                     */}
      {/* ========================================================================= */}
      <Modal
        isOpen={showAssignModal}
        onClose={() => setShowAssignModal(false)}
        title="Assign Recovery Officer"
      >
        <form onSubmit={handleAssignSubmit} className="space-y-4 text-xs text-[#111111]">
          <div>
            <label className="block font-bold text-[#111111] mb-1.5">
              Select Field Officer
            </label>
            <select
              required
              value={assignEmpId}
              onChange={(e) => setAssignEmpId(e.target.value)}
              className="min-h-[44px] w-full px-3.5 py-2.5 bg-[#FFFFFF] border border-[#D6D6D6] rounded-xl text-[#111111] font-bold focus:ring-2 focus:ring-[#FACC15]"
            >
              <option value="">Select Employee...</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.name} ({emp.department || 'Field Officer'})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block font-bold text-[#111111] mb-1.5">
              Assignment Remarks
            </label>
            <textarea
              rows={3}
              value={assignRemarks}
              onChange={(e) => setAssignRemarks(e.target.value)}
              className="w-full p-3 bg-[#FFFFFF] border border-[#D6D6D6] rounded-xl text-[#111111] font-medium placeholder:text-[#666666] focus:ring-2 focus:ring-[#FACC15]"
              placeholder="Add instructions for field officer regarding this case..."
            />
          </div>
          <div className="flex justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={() => setShowAssignModal(false)}
              className="min-h-[42px] px-4 py-2.5 bg-[#F2F2F2] hover:bg-[#E5E5E5] text-[#111111] font-bold rounded-xl border border-[#D6D6D6] transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="min-h-[42px] px-5 py-2.5 bg-[#111111] hover:bg-[#333333] text-[#FFFFFF] font-extrabold rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              {isSubmitting ? 'Saving...' : 'Confirm Assignment'}
            </button>
          </div>
        </form>
      </Modal>

      {/* ========================================================================= */}
      {/* 6. STATUS & PRIORITY UPDATE MODAL                                         */}
      {/* ========================================================================= */}
      <Modal
        isOpen={showStatusModal}
        onClose={() => setShowStatusModal(false)}
        title="Update Case Status & Priority"
      >
        <form onSubmit={handleStatusSubmit} className="space-y-4 text-xs text-[#111111]">
          <div>
            <label className="block font-bold text-[#111111] mb-1.5">
              Recovery Status
            </label>
            <select
              value={editStatus}
              onChange={(e) => setEditStatus(e.target.value as CaseStatus)}
              className="min-h-[44px] w-full px-3.5 py-2.5 bg-[#FFFFFF] border border-[#D6D6D6] rounded-xl text-[#111111] font-bold focus:ring-2 focus:ring-[#FACC15]"
            >
              <option value="Paid">Paid</option>
              <option value="Unpaid">Unpaid</option>
              <option value="PENDING">PENDING</option>
              <option value="ASSIGNED">ASSIGNED</option>
              <option value="IN_PROGRESS">IN_PROGRESS</option>
              <option value="CONTACTED">CONTACTED</option>
              <option value="PROMISE_TO_PAY">PROMISE_TO_PAY</option>
              <option value="RECOVERED">RECOVERED</option>
              <option value="CLOSED">CLOSED</option>
              <option value="UNABLE_TO_CONTACT">UNABLE_TO_CONTACT</option>
              <option value="LEGAL_ACTION">LEGAL_ACTION</option>
            </select>
          </div>
          <div>
            <label className="block font-bold text-[#111111] mb-1.5">
              Priority Level
            </label>
            <select
              value={editPriority}
              onChange={(e) => setEditPriority(e.target.value as Priority)}
              className="min-h-[44px] w-full px-3.5 py-2.5 bg-[#FFFFFF] border border-[#D6D6D6] rounded-xl text-[#111111] font-bold focus:ring-2 focus:ring-[#FACC15]"
            >
              <option value="LOW">LOW</option>
              <option value="MEDIUM">MEDIUM</option>
              <option value="HIGH">HIGH</option>
              <option value="CRITICAL">CRITICAL</option>
            </select>
          </div>
          <div className="flex justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={() => setShowStatusModal(false)}
              className="min-h-[42px] px-4 py-2.5 bg-[#F2F2F2] hover:bg-[#E5E5E5] text-[#111111] font-bold rounded-xl border border-[#D6D6D6] transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="min-h-[42px] px-5 py-2.5 bg-[#111111] hover:bg-[#333333] text-[#FFFFFF] font-extrabold rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              {isSubmitting ? 'Updating...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </Modal>

      {/* ========================================================================= */}
      {/* 7. RECORD FIELD FOLLOW-UP MODAL                                           */}
      {/* ========================================================================= */}
      <Modal
        isOpen={showFollowupModal}
        onClose={() => setShowFollowupModal(false)}
        title="Record Ground Follow-up"
      >
        <form onSubmit={handleFollowupSubmit} className="space-y-4 text-xs text-[#111111]">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-[#111111] mb-1.5">
                Interaction Mode
              </label>
              <select
                value={followupType}
                onChange={(e) => setFollowupType(e.target.value as FollowupType)}
                className="min-h-[44px] w-full px-3.5 py-2.5 bg-[#FFFFFF] border border-[#D6D6D6] rounded-xl text-[#111111] font-bold focus:ring-2 focus:ring-[#FACC15]"
              >
                <option value="PHONE_CALL">PHONE_CALL</option>
                <option value="VISIT">FIELD VISIT</option>
                <option value="SMS">SMS</option>
                <option value="EMAIL">EMAIL</option>
                <option value="OTHER">OTHER</option>
              </select>
            </div>
            <div>
              <label className="block font-bold text-[#111111] mb-1.5">
                Contact Outcome
              </label>
              <select
                value={contactResult}
                onChange={(e) => setContactResult(e.target.value as ContactResult)}
                className="min-h-[44px] w-full px-3.5 py-2.5 bg-[#FFFFFF] border border-[#D6D6D6] rounded-xl text-[#111111] font-bold focus:ring-2 focus:ring-[#FACC15]"
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
            <label className="block font-bold text-[#111111] mb-1.5">
              Customer Statement / Response
            </label>
            <textarea
              rows={2}
              value={followupResponse}
              onChange={(e) => setFollowupResponse(e.target.value)}
              className="w-full p-3 bg-[#FFFFFF] border border-[#D6D6D6] rounded-xl text-[#111111] font-medium placeholder:text-[#666666] focus:ring-2 focus:ring-[#FACC15]"
              placeholder="What did the borrower say regarding payment?"
            />
          </div>
          <div>
            <label className="block font-bold text-[#111111] mb-1.5">
              Officer Observations / Vehicle Status
            </label>
            <textarea
              rows={2}
              value={followupRemarks}
              onChange={(e) => setFollowupRemarks(e.target.value)}
              className="w-full p-3 bg-[#FFFFFF] border border-[#D6D6D6] rounded-xl text-[#111111] font-medium placeholder:text-[#666666] focus:ring-2 focus:ring-[#FACC15]"
              placeholder="Ground telemetry notes, vehicle parked location..."
            />
          </div>
          <div>
            <label className="block font-bold text-[#111111] mb-1.5">
              Next Scheduled Follow-up / PTP Date
            </label>
            <input
              type="date"
              value={nextDate}
              onChange={(e) => setNextDate(e.target.value)}
              className="min-h-[44px] w-full px-3.5 py-2.5 bg-[#FFFFFF] border border-[#D6D6D6] rounded-xl text-[#111111] font-medium focus:ring-2 focus:ring-[#FACC15]"
            />
          </div>
          <div className="flex justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={() => setShowFollowupModal(false)}
              className="min-h-[42px] px-4 py-2.5 bg-[#F2F2F2] hover:bg-[#E5E5E5] text-[#111111] font-bold rounded-xl border border-[#D6D6D6] transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="min-h-[42px] px-5 py-2.5 bg-[#111111] hover:bg-[#333333] text-[#FFFFFF] font-extrabold rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              {isSubmitting ? 'Recording...' : 'Record Follow-up'}
            </button>
          </div>
        </form>
      </Modal>

      {/* ========================================================================= */}
      {/* 8. RECORD PAYMENT COLLECTION MODAL                                        */}
      {/* ========================================================================= */}
      <Modal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        title="Record Payment Collection"
      >
        <form onSubmit={handlePaymentSubmit} className="space-y-4 text-xs text-[#111111]">
          <div>
            <label className="block font-bold text-[#111111] mb-1.5">
              Collection Amount (₹)
            </label>
            <input
              type="number"
              required
              min="1"
              value={paymentAmount}
              onChange={(e) => setPaymentAmount(e.target.value)}
              className="min-h-[44px] w-full px-3.5 py-2.5 bg-[#FFFFFF] border border-[#D6D6D6] rounded-xl font-bold text-sm text-[#111111] focus:ring-2 focus:ring-[#FACC15]"
              placeholder="e.g. 25000"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-[#111111] mb-1.5">
                Payment Mode
              </label>
              <select
                value={paymentMode}
                onChange={(e) => setPaymentMode(e.target.value as PaymentMode)}
                className="min-h-[44px] w-full px-3.5 py-2.5 bg-[#FFFFFF] border border-[#D6D6D6] rounded-xl text-[#111111] font-bold focus:ring-2 focus:ring-[#FACC15]"
              >
                <option value="CASH">CASH</option>
                <option value="UPI">UPI</option>
                <option value="BANK_TRANSFER">BANK_TRANSFER / NEFT</option>
                <option value="CHEQUE">CHEQUE</option>
                <option value="OTHER">OTHER</option>
              </select>
            </div>
            <div>
              <label className="block font-bold text-[#111111] mb-1.5">
                Transaction Ref / Cheque No
              </label>
              <input
                type="text"
                value={paymentRef}
                onChange={(e) => setPaymentRef(e.target.value)}
                className="min-h-[44px] w-full px-3.5 py-2.5 bg-[#FFFFFF] border border-[#D6D6D6] rounded-xl text-[#111111] font-medium focus:ring-2 focus:ring-[#FACC15]"
                placeholder="UPI ref / UTR / Cheque #"
              />
            </div>
          </div>
          <div>
            <label className="block font-bold text-[#111111] mb-1.5">
              Collection Remarks
            </label>
            <textarea
              rows={2}
              value={paymentRemarks}
              onChange={(e) => setPaymentRemarks(e.target.value)}
              className="w-full p-3 bg-[#FFFFFF] border border-[#D6D6D6] rounded-xl text-[#111111] font-medium placeholder:text-[#666666] focus:ring-2 focus:ring-[#FACC15]"
              placeholder="Deposit bank, collection receipt notes..."
            />
          </div>
          <div className="flex justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={() => setShowPaymentModal(false)}
              className="min-h-[42px] px-4 py-2.5 bg-[#F2F2F2] hover:bg-[#E5E5E5] text-[#111111] font-bold rounded-xl border border-[#D6D6D6] transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="min-h-[42px] px-5 py-2.5 bg-gradient-to-r from-[#FACC15] to-[#EAB308] hover:opacity-95 text-[#000000] font-black rounded-xl border border-[#EAB308] shadow-xs transition-colors cursor-pointer"
            >
              {isSubmitting ? 'Recording...' : 'Submit Payment Receipt'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
export default AdminRecoveryCases;
