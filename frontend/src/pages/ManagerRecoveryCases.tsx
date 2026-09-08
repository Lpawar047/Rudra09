import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { RecoveryCase, User, Priority } from '../types';
import { DataTable, Column } from '../components/DataTable';
import { StatusBadge } from '../components/StatusBadge';
import { PriorityBadge } from '../components/PriorityBadge';
import { Modal } from '../components/Modal';
import { CaseDetailsModal } from '../components/CaseDetailsModal';
import {
  Search,
  UserCheck,
  Eye,
  Phone,
  Truck,
  IndianRupee,
  Copy,
  Check,
  RotateCcw,
  SlidersHorizontal,
  Filter
} from 'lucide-react';

export const ManagerRecoveryCases: React.FC = () => {
  const [cases, setCases] = useState<RecoveryCase[]>([]);
  const [employees, setEmployees] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [employeeFilter, setEmployeeFilter] = useState('');
  const [bucketFilter, setBucketFilter] = useState('');
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [total, setTotal] = useState(0);

  const [selectedCase, setSelectedCase] = useState<RecoveryCase | null>(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [assignEmpId, setAssignEmpId] = useState('');
  const [assignRemarks, setAssignRemarks] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  useEffect(() => {
    fetchCases();
  }, [search, statusFilter, priorityFilter, employeeFilter, bucketFilter, page, limit]);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchCases = async () => {
    setIsLoading(true);
    try {
      const params: any = { page, limit };
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      if (priorityFilter) params.priority = priorityFilter;
      if (employeeFilter) params.employee_id = employeeFilter;

      const res = await api.get('/recovery-cases', { params });
      let fetchedCases: RecoveryCase[] = res.data.cases || [];

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

  const clearFilters = () => {
    setSearch('');
    setStatusFilter('');
    setPriorityFilter('');
    setEmployeeFilter('');
    setBucketFilter('');
    setPage(1);
  };

  const hasActiveFilters = Boolean(search || statusFilter || priorityFilter || employeeFilter || bucketFilter);

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

  const formatCurrency = (val: any) => {
    const num = parseFloat(val) || 0;
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(num);
  };

  const getBomBucket = (row: RecoveryCase) => {
    if (row.bom_bucket) return row.bom_bucket;
    const dpd = row.dpd || 0;
    if (dpd <= 30) return 'BOM 1';
    if (dpd <= 60) return 'BOM 2';
    if (dpd <= 90) return 'BOM 3';
    return 'BOM 4+';
  };

  const columns: Column<RecoveryCase>[] = [
    {
      header: 'Recovery ID',
      minWidth: '110px',
      stickyLeft: '0px',
      accessor: (row) => (
        <span className="font-extrabold font-mono text-[#4F46E5] dark:text-indigo-400 text-xs">
          {row.recovery_code || `RC-${String(row.id).padStart(3, '0')}`}
        </span>
      ),
    },
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
              <span className="font-bold text-[#334155] dark:text-slate-200 font-mono text-xs">
                {proposal}
              </span>
              <button
                type="button"
                onClick={() => handleCopy(proposal, `mgr-prop-${row.id}`)}
                className="opacity-0 group-hover/prop:opacity-100 text-slate-400 hover:text-indigo-600 transition-opacity p-0.5 cursor-pointer"
                title="Copy Proposal No"
              >
                {copiedKey === `mgr-prop-${row.id}` ? (
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
            <p className="text-[11px] font-semibold text-[#64748B] dark:text-slate-400">
              DPD: {row.dpd || 0} Days
            </p>
          </div>
        );
      },
    },
    {
      header: 'Customer Name',
      minWidth: '220px',
      stickyLeft: '280px',
      stickyShadow: true,
      accessor: (row) => (
        <div>
          <p className="font-semibold text-sm text-[#0F172A] dark:text-white leading-snug">
            {row.customer_name || 'N/A'}
          </p>
          <div className="flex items-center gap-1 mt-0.5 text-xs text-[#64748B] dark:text-slate-400">
            <Phone className="w-3 h-3 shrink-0" />
            <a
              href={`tel:${row.customer_phone}`}
              className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors font-mono font-medium"
            >
              {row.customer_phone || 'N/A'}
            </a>
          </div>
        </div>
      ),
    },
    {
      header: 'BOM Bucket',
      minWidth: '120px',
      align: 'center',
      accessor: (row) => (
        <div className="inline-flex flex-col items-center">
          <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 font-mono">
            {getBomBucket(row)}
          </span>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold mt-0.5">
            ({row.dpd || 0}d DPD)
          </span>
        </div>
      ),
    },
    {
      header: 'POS Balance',
      minWidth: '130px',
      align: 'right',
      accessor: (row) => (
        <span className="font-mono font-bold text-sm text-[#0F172A] dark:text-slate-100">
          {formatCurrency(row.outstanding_amount)}
        </span>
      ),
    },
    {
      header: 'EMI Amount',
      minWidth: '130px',
      align: 'right',
      accessor: (row) => (
        <span className="font-mono text-xs font-medium text-[#475569] dark:text-slate-300">
          {formatCurrency(row.emi_amount)}
        </span>
      ),
    },
    {
      header: 'Total Due',
      minWidth: '140px',
      align: 'right',
      sortable: true,
      accessor: (row) => {
        const due = parseFloat(String(row.total_overdue || row.outstanding_amount || 0));
        return (
          <span
            className={`font-mono font-bold text-sm ${
              due > 0 ? 'text-[#DC2626] dark:text-rose-400' : 'text-[#16A34A] dark:text-emerald-400'
            }`}
          >
            {formatCurrency(due)}
          </span>
        );
      },
    },
    {
      header: 'Residence Address',
      minWidth: '280px',
      accessor: (row) => {
        const addr = row.customer_address || 'Address Not Provided';
        return (
          <div className="group/addr relative max-w-[270px]">
            <div className="flex items-start justify-between gap-1">
              <p className="text-xs text-[#334155] dark:text-slate-300 line-clamp-2 leading-relaxed" title={addr}>
                {addr}
              </p>
              {row.customer_address && (
                <button
                  type="button"
                  onClick={() => handleCopy(addr, `mgr-addr-${row.id}`)}
                  className="opacity-0 group-hover/addr:opacity-100 p-0.5 text-slate-400 hover:text-indigo-600 transition-opacity shrink-0 cursor-pointer"
                  title="Copy Address"
                >
                  {copiedKey === `mgr-addr-${row.id}` ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              )}
            </div>
            {row.customer_city && (
              <span className="inline-block mt-0.5 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">
                {row.customer_city}
              </span>
            )}
          </div>
        );
      },
    },
    {
      header: 'Registration Number',
      minWidth: '190px',
      accessor: (row) => (
        <div>
          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold font-mono bg-[#EFF6FF] text-[#1D4ED8] border border-[#BFDBFE] dark:bg-blue-950/80 dark:text-blue-300 dark:border-blue-800 tracking-wide">
            {row.registration_number || 'N/A'}
          </span>
          <p className="text-[11px] text-[#64748B] dark:text-slate-400 font-medium mt-0.5 truncate max-w-[170px]" title={row.vehicle_model || row.asset_desc || 'Commercial Vehicle'}>
            {row.vehicle_model || row.asset_desc || 'Commercial Vehicle'}
          </p>
        </div>
      ),
    },
    {
      header: 'Engine No',
      minWidth: '180px',
      accessor: (row) => {
        const eng = row.engine_number || 'N/A';
        return (
          <div className="flex items-center gap-1 font-mono text-xs text-[#334155] dark:text-slate-300 group/eng">
            <span className="font-semibold" title={eng}>{eng}</span>
            {eng !== 'N/A' && (
              <button
                type="button"
                onClick={() => handleCopy(eng, `mgr-eng-${row.id}`)}
                className="opacity-0 group-hover/eng:opacity-100 text-slate-400 hover:text-indigo-600 transition-opacity cursor-pointer p-0.5"
                title="Copy Engine No"
              >
                {copiedKey === `mgr-eng-${row.id}` ? (
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            )}
          </div>
        );
      },
    },
    {
      header: 'Chassis No',
      minWidth: '190px',
      accessor: (row) => {
        const chs = row.chassis_number || 'N/A';
        return (
          <div className="flex items-center gap-1 font-mono text-xs text-[#334155] dark:text-slate-300 group/chs">
            <span className="font-semibold" title={chs}>{chs}</span>
            {chs !== 'N/A' && (
              <button
                type="button"
                onClick={() => handleCopy(chs, `mgr-chs-${row.id}`)}
                className="opacity-0 group-hover/chs:opacity-100 text-slate-400 hover:text-indigo-600 transition-opacity cursor-pointer p-0.5"
                title="Copy Chassis No"
              >
                {copiedKey === `mgr-chs-${row.id}` ? (
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            )}
          </div>
        );
      },
    },
    {
      header: 'Asset Desc',
      minWidth: '200px',
      accessor: (row) => {
        const desc = row.asset_desc || row.vehicle_model || 'Vehicle';
        return (
          <span
            className="text-xs font-semibold text-[#0F172A] dark:text-slate-200 truncate block max-w-[190px]"
            title={desc}
          >
            {desc}
          </span>
        );
      },
    },
    {
      header: 'MO NO',
      minWidth: '150px',
      accessor: (row) => (
        <a
          href={`tel:${row.customer_phone}`}
          className="font-mono text-xs font-bold text-[#0F172A] dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
        >
          {row.customer_phone || 'N/A'}
        </a>
      ),
    },
    {
      header: 'PAID/UNPAID',
      minWidth: '160px',
      accessor: (row) => <StatusBadge status={row.status} />,
    },
    {
      header: 'Priority',
      minWidth: '120px',
      accessor: (row) => <PriorityBadge priority={row.priority} />,
    },
    {
      header: 'Assigned Officer',
      minWidth: '170px',
      accessor: (row) => (
        <span
          className={`inline-block text-xs font-bold px-2.5 py-1 rounded-md border ${
            row.assigned_employee_name
              ? 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700'
              : 'bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800'
          }`}
        >
          {row.assigned_employee_name || 'Unassigned'}
        </span>
      ),
    },
    {
      header: 'Actions',
      minWidth: '120px',
      accessor: (row) => (
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => {
              setSelectedCase(row);
              setShowDetailModal(true);
            }}
            title="View Full Case Dossier"
            className="min-h-[34px] min-w-[34px] flex items-center justify-center rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
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
            title="Assign Field Officer"
            className="min-h-[34px] min-w-[34px] flex items-center justify-center rounded-lg bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 transition-colors cursor-pointer"
          >
            <UserCheck className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#0F172A] dark:text-white tracking-tight">
            Manager Case Supervision
          </h1>
          <p className="text-sm text-[#64748B] dark:text-slate-400 font-medium mt-1">
            Supervise team recovery operations, allocate officers, and monitor dues.
          </p>
        </div>
        <button
          type="button"
          onClick={fetchCases}
          disabled={isLoading}
          className="min-h-[42px] px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
        >
          <RotateCcw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-[#E2E8F0] dark:border-slate-800 shadow-sm space-y-3">
        {/* Mobile Search & Filter Button */}
        <div className="flex sm:hidden items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-[#64748B] pointer-events-none" />
            <input
              type="text"
              placeholder="Search Proposal, Customer, Reg..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="min-h-[44px] w-full pl-10 pr-3.5 py-2.5 text-xs bg-white dark:bg-slate-800 border border-[#CBD5E1] dark:border-slate-700 rounded-xl text-[#0F172A] dark:text-white placeholder:text-[#64748B] font-medium focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
            />
          </div>
          <button
            type="button"
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className={`min-h-[44px] px-3.5 rounded-xl border text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer ${
              showMobileFilters || hasActiveFilters
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-700'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Filters</span>
            {hasActiveFilters && (
              <span className="w-5 h-5 rounded-full bg-white text-indigo-700 text-[10px] font-black flex items-center justify-center">
                {[statusFilter, priorityFilter, employeeFilter, bucketFilter].filter(Boolean).length}
              </span>
            )}
          </button>
        </div>

        {/* Mobile Filters Panel */}
        {showMobileFilters && (
          <div className="sm:hidden p-4 bg-slate-50 dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-700">
              <span className="font-extrabold text-xs uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                <span>Supervision Filters</span>
              </span>
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="text-xs font-bold text-rose-600 dark:text-rose-400 hover:underline"
                >
                  Reset All
                </button>
              )}
            </div>

            <div className="space-y-2.5">
              <div>
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">
                  Recovery Status
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setPage(1);
                  }}
                  className="min-h-[44px] w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-bold"
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
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">
                  BOM Bucket
                </label>
                <select
                  value={bucketFilter}
                  onChange={(e) => {
                    setBucketFilter(e.target.value);
                    setPage(1);
                  }}
                  className="min-h-[44px] w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-bold"
                >
                  <option value="">All BOM Buckets</option>
                  <option value="BOM 1">BOM 1 (0-30 Days)</option>
                  <option value="BOM 2">BOM 2 (31-60 Days)</option>
                  <option value="BOM 3">BOM 3 (61-90 Days)</option>
                  <option value="BOM 4+">BOM 4+ (&gt;90 Days)</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">
                  Priority
                </label>
                <select
                  value={priorityFilter}
                  onChange={(e) => {
                    setPriorityFilter(e.target.value);
                    setPage(1);
                  }}
                  className="min-h-[44px] w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-bold"
                >
                  <option value="">All Priorities</option>
                  <option value="LOW">LOW</option>
                  <option value="MEDIUM">MEDIUM</option>
                  <option value="HIGH">HIGH</option>
                  <option value="CRITICAL">CRITICAL</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">
                  Field Officer
                </label>
                <select
                  value={employeeFilter}
                  onChange={(e) => {
                    setEmployeeFilter(e.target.value);
                    setPage(1);
                  }}
                  className="min-h-[44px] w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-bold"
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
                  className="w-full min-h-[44px] bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-extrabold text-xs transition-colors"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Desktop & Tablet Filters (5 Columns) */}
        <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <div className="relative lg:col-span-1">
            <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-[#64748B] pointer-events-none" />
            <input
              type="text"
              placeholder="Search Cases..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="min-h-[44px] w-full pl-10 pr-3.5 py-2.5 text-xs bg-white dark:bg-slate-800 border border-[#CBD5E1] dark:border-slate-700 rounded-xl text-[#0F172A] dark:text-white placeholder:text-[#64748B] font-medium focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:border-[#4F46E5]"
            />
          </div>

          <div>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="min-h-[44px] w-full px-3.5 py-2.5 text-xs bg-white dark:bg-slate-800 border border-[#CBD5E1] dark:border-slate-700 rounded-xl text-[#0F172A] dark:text-white font-bold focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:border-[#4F46E5]"
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
            </select>
          </div>

          <div>
            <select
              value={bucketFilter}
              onChange={(e) => {
                setBucketFilter(e.target.value);
                setPage(1);
              }}
              className="min-h-[44px] w-full px-3.5 py-2.5 text-xs bg-white dark:bg-slate-800 border border-[#CBD5E1] dark:border-slate-700 rounded-xl text-[#0F172A] dark:text-white font-bold focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:border-[#4F46E5]"
            >
              <option value="">All BOM Buckets</option>
              <option value="BOM 1">BOM 1 (0-30 Days)</option>
              <option value="BOM 2">BOM 2 (31-60 Days)</option>
              <option value="BOM 3">BOM 3 (61-90 Days)</option>
              <option value="BOM 4+">BOM 4+ (&gt;90 Days)</option>
            </select>
          </div>

          <div>
            <select
              value={priorityFilter}
              onChange={(e) => {
                setPriorityFilter(e.target.value);
                setPage(1);
              }}
              className="min-h-[44px] w-full px-3.5 py-2.5 text-xs bg-white dark:bg-slate-800 border border-[#CBD5E1] dark:border-slate-700 rounded-xl text-[#0F172A] dark:text-white font-bold focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:border-[#4F46E5]"
            >
              <option value="">All Priorities</option>
              <option value="LOW">LOW</option>
              <option value="MEDIUM">MEDIUM</option>
              <option value="HIGH">HIGH</option>
              <option value="CRITICAL">CRITICAL</option>
            </select>
          </div>

          <div>
            <select
              value={employeeFilter}
              onChange={(e) => {
                setEmployeeFilter(e.target.value);
                setPage(1);
              }}
              className="min-h-[44px] w-full px-3.5 py-2.5 text-xs bg-white dark:bg-slate-800 border border-[#CBD5E1] dark:border-slate-700 rounded-xl text-[#0F172A] dark:text-white font-bold focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:border-[#4F46E5]"
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

        {/* Filter Summary & Scroll Indicator */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
          <div className="flex items-center flex-wrap gap-2 text-[#64748B] dark:text-slate-400 font-semibold">
            <span>
              Showing <strong className="text-[#0F172A] dark:text-white">{cases.length}</strong> loaded of{' '}
              <strong className="text-[#0F172A] dark:text-white">{total}</strong> total cases
            </span>
            <span className="hidden md:inline-flex items-center gap-1 text-indigo-600 dark:text-indigo-400 font-bold ml-2">
              ← Scroll table horizontally for all 13 Excel columns →
            </span>
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="text-xs font-bold text-rose-600 dark:text-rose-400 hover:text-rose-700 flex items-center gap-1 cursor-pointer"
            >
              <span>Clear all filters</span>
              <RotateCcw className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Main Table */}
      <DataTable
        columns={columns}
        data={cases}
        keyExtractor={(item) => item.id}
        isLoading={isLoading}
        emptyMessage="No recovery cases assigned to your supervision."
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
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 space-y-3 shadow-xs transition-shadow hover:shadow-md">
              {/* Row 1: Recovery Code + Status */}
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
                <span className="font-black font-mono text-[#4F46E5] dark:text-indigo-400 text-xs sm:text-sm tracking-wide">
                  {item.recovery_code || `RC-${String(item.id).padStart(3, '0')}`}
                </span>
                <div className="flex items-center gap-1.5">
                  <PriorityBadge priority={item.priority} />
                  <StatusBadge status={item.status} />
                </div>
              </div>

              {/* Row 2: Customer Name (bold uppercase) */}
              <div>
                <h3 className="font-black text-slate-900 dark:text-white text-base leading-tight tracking-tight uppercase">
                  {item.customer_name || 'N/A'}
                </h3>
              </div>

              {/* Rows 3-5: Metadata */}
              <div className="space-y-1.5 text-xs">
                {/* Proposal */}
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">Proposal:</span>
                  <div className="flex items-center gap-1.5 font-mono font-bold text-slate-900 dark:text-slate-200">
                    <span>{proposal}</span>
                    <button
                      type="button"
                      onClick={() => handleCopy(proposal, `mgr-mob-${item.id}`)}
                      className="p-1 text-slate-400 hover:text-indigo-600 transition-colors cursor-pointer"
                      title="Copy Proposal No"
                    >
                      {copiedKey === `mgr-mob-${item.id}` ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Vehicle */}
                <div className="flex items-start justify-between gap-2">
                  <span className="text-slate-500 dark:text-slate-400 font-medium shrink-0">Vehicle:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 text-right truncate">
                    {vehicleDesc}
                  </span>
                </div>

                {/* Total Due */}
                <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800 font-mono">
                  <span className="text-slate-700 dark:text-slate-300 font-bold">Total Due:</span>
                  <span className={`text-base font-black ${totalDue > 0 ? 'text-[#DC2626] dark:text-rose-400' : 'text-[#16A34A] dark:text-emerald-400'}`}>
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
                className="w-full min-h-[44px] px-4 py-2.5 bg-gradient-to-r from-indigo-900 via-indigo-600 to-blue-600 hover:opacity-95 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Eye className="w-4 h-4" />
                <span>View Full Details</span>
              </button>

              {/* Quick Actions Grid */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCase(item);
                    setAssignEmpId(item.assigned_employee_id ? String(item.assigned_employee_id) : '');
                    setShowAssignModal(true);
                  }}
                  className="w-full min-h-[44px] flex items-center justify-center gap-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 text-xs font-bold hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition-colors cursor-pointer"
                  title="Assign Officer"
                >
                  <UserCheck className="w-4 h-4" />
                  <span>Assign Officer</span>
                </button>
              </div>
            </div>
          );
        }}
      />

      {/* Case Dossier Modal */}
      <CaseDetailsModal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        recoveryCase={selectedCase}
        onAssign={() => {
          setShowDetailModal(false);
          setAssignEmpId(selectedCase?.assigned_employee_id ? String(selectedCase.assigned_employee_id) : '');
          setShowAssignModal(true);
        }}
      />

      {/* Assign Modal */}
      <Modal
        isOpen={showAssignModal}
        onClose={() => setShowAssignModal(false)}
        title="Assign Field Officer"
      >
        <form onSubmit={handleAssignSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1.5">
              Select Field Officer
            </label>
            <select
              required
              value={assignEmpId}
              onChange={(e) => setAssignEmpId(e.target.value)}
              className="min-h-[44px] w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-[#4F46E5] focus:border-[#4F46E5]"
            >
              <option value="">Select Employee...</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.name} ({emp.department || 'Field Team'})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1.5">
              Assignment Remarks
            </label>
            <textarea
              rows={3}
              value={assignRemarks}
              onChange={(e) => setAssignRemarks(e.target.value)}
              className="w-full p-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-[#4F46E5] focus:border-[#4F46E5]"
              placeholder="Instructions for the field agent..."
            />
          </div>
          <div className="flex justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={() => setShowAssignModal(false)}
              className="min-h-[42px] px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-bold border border-slate-300 dark:border-slate-700 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="min-h-[42px] px-5 py-2.5 bg-[#4F46E5] hover:bg-[#4338CA] text-white font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              {isSubmitting ? 'Saving...' : 'Confirm Assignment'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
export default ManagerRecoveryCases;
