import React, { useState, useEffect } from 'react';
import { 
  Users, Search, Filter, RefreshCw, X, Eye, Phone, MapPin, 
  Building2, Car, ShieldAlert, FileText, CheckCircle2, ChevronDown, ChevronUp 
} from 'lucide-react';
import api from '../services/api';
import { Customer, Priority, CaseStatus } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { PriorityBadge } from '../components/PriorityBadge';
import { Modal } from '../components/Modal';

export const AdminCustomers: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customerDetails, setCustomerDetails] = useState<any>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [showOriginalData, setShowOriginalData] = useState(false);

  useEffect(() => {
    fetchCustomers();
  }, [statusFilter, priorityFilter, cityFilter]);

  const fetchCustomers = async (searchQuery?: string) => {
    setLoading(true);
    try {
      const params: any = {};
      if (searchQuery !== undefined) {
        params.search = searchQuery;
      } else if (searchTerm) {
        params.search = searchTerm;
      }
      if (statusFilter) params.status = statusFilter;
      if (priorityFilter) params.priority = priorityFilter;
      if (cityFilter) params.city = cityFilter;

      const res = await api.get('/customers', { params });
      setCustomers(res.data.customers || []);
    } catch (err) {
      console.error('Failed to fetch customers', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchCustomers(searchTerm);
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setStatusFilter('');
    setPriorityFilter('');
    setCityFilter('');
    fetchCustomers('');
  };

  const openCustomerModal = async (cust: Customer) => {
    setSelectedCustomer(cust);
    setShowOriginalData(false);
    setLoadingDetails(true);
    try {
      const res = await api.get(`/customers/${cust.id}`);
      setCustomerDetails(res.data);
    } catch (err) {
      console.error('Failed to fetch customer detail payload', err);
    } finally {
      setLoadingDetails(false);
    }
  };

  const parseRawExcelData = (rawJson: any) => {
    if (!rawJson) return null;
    if (typeof rawJson === 'object') return rawJson;
    try {
      return JSON.parse(rawJson);
    } catch (e) {
      return null;
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#111111] flex items-center gap-2 tracking-tight">
            <Users className="w-7 h-7 text-[#FACC15]" />
            Customer & Borrower Directory
          </h1>
          <p className="text-xs text-[#666666] font-medium mt-1">
            Real-time PostgreSQL search across imported loans, vehicles, and recovery accounts
          </p>
        </div>
      </div>

      {/* Main Search Bar & Quick Filter Controls */}
      <div className="bg-white border border-[#D6D6D6] rounded-2xl p-5 shadow-xs space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#666666]" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search customer, loan account, vehicle number, phone, engine no..."
              className="w-full pl-12 pr-10 py-3 bg-[#FAFAFA] border border-[#D6D6D6] rounded-xl text-xs sm:text-sm font-medium text-[#111111] placeholder-[#666666] focus:outline-none focus:border-[#FACC15] focus:ring-2 focus:ring-[#FACC15] transition-all"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => { setSearchTerm(''); fetchCustomers(''); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#666666] hover:text-[#000000]"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <button
            type="submit"
            className="px-6 py-3 bg-[#FACC15] hover:bg-[#FFD600] text-[#000000] font-black rounded-xl text-xs sm:text-sm shadow-xs transition-all flex items-center justify-center gap-2 shrink-0 border border-[#EAB308]"
          >
            <Search className="w-4 h-4" />
            Search Database
          </button>

          <button
            type="button"
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className={`px-4 py-3 border rounded-xl text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-2 shrink-0 ${
              showAdvancedFilters 
                ? 'bg-[#111111] text-white border-[#111111]' 
                : 'border-[#D6D6D6] text-[#111111] hover:bg-[#F2F2F2]'
            }`}
          >
            <Filter className="w-4 h-4 text-[#EAB308]" />
            Filters
          </button>
        </form>

        {/* Advanced Filters Panel */}
        {showAdvancedFilters && (
          <div className="pt-4 border-t border-[#D6D6D6] grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <label className="text-xs font-black text-[#111111] block mb-1">Recovery Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full p-2.5 bg-[#FAFAFA] border border-[#D6D6D6] rounded-lg text-xs font-medium text-[#111111] focus:ring-2 focus:ring-[#FACC15] focus:outline-none"
              >
                <option value="">All Statuses</option>
                <option value="PENDING">PENDING</option>
                <option value="ASSIGNED">ASSIGNED</option>
                <option value="IN_PROGRESS">IN PROGRESS</option>
                <option value="CONTACTED">CONTACTED</option>
                <option value="PROMISE_TO_PAY">PROMISE TO PAY</option>
                <option value="RECOVERED">RECOVERED</option>
                <option value="CLOSED">CLOSED</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-black text-[#111111] block mb-1">Priority Level</label>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="w-full p-2.5 bg-[#FAFAFA] border border-[#D6D6D6] rounded-lg text-xs font-medium text-[#111111] focus:ring-2 focus:ring-[#FACC15] focus:outline-none"
              >
                <option value="">All Priorities</option>
                <option value="CRITICAL">CRITICAL</option>
                <option value="HIGH">HIGH</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="LOW">LOW</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-black text-[#111111] block mb-1">City / Region</label>
              <input
                type="text"
                value={cityFilter}
                onChange={(e) => setCityFilter(e.target.value)}
                placeholder="e.g. Pune, Mumbai..."
                className="w-full p-2.5 bg-[#FAFAFA] border border-[#D6D6D6] rounded-lg text-xs font-medium text-[#111111] focus:ring-2 focus:ring-[#FACC15] focus:outline-none"
              />
            </div>

            <div className="flex items-end gap-2">
              <button
                type="button"
                onClick={handleClearFilters}
                className="w-full p-2.5 bg-[#F2F2F2] hover:bg-[#D6D6D6] text-[#111111] font-bold rounded-lg text-xs transition-all border border-[#D6D6D6]"
              >
                Reset All Filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between">
        <p className="text-xs font-black text-[#666666] uppercase tracking-wider">
          Found <span className="text-[#111111] font-black">{customers.length}</span> matching records
        </p>

        {loading && (
          <div className="flex items-center gap-2 text-xs text-[#000000] font-black">
            <RefreshCw className="w-4 h-4 animate-spin text-[#FACC15]" />
            Querying PostgreSQL Database...
          </div>
        )}
      </div>

      {/* Main Customers Data Table */}
      <div className="bg-white border border-[#D6D6D6] rounded-2xl overflow-hidden shadow-xs">
        {customers.length === 0 && !loading ? (
          <div className="text-center py-16 p-6 space-y-3">
            <Users className="w-12 h-12 text-[#666666] mx-auto" />
            <h3 className="text-lg font-black text-[#111111]">No Matching Customer Found</h3>
            <p className="text-xs text-[#666666] max-w-sm mx-auto">
              Try searching by Proposal No (e.g. B2WSTN00047989), Vehicle Registration (e.g. MH41BP3943), or Mobile Number.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left text-[#111111]">
              <thead className="bg-[#111111] text-[#FFFFFF] uppercase font-black tracking-wider text-[11px] border-b border-[#333333]">
                <tr>
                  <th className="p-3.5">Customer Name & ID</th>
                  <th className="p-3.5">Proposal / Loan Acc</th>
                  <th className="p-3.5">Phone & City</th>
                  <th className="p-3.5">Vehicle Reg & Asset</th>
                  <th className="p-3.5">POS Outstanding</th>
                  <th className="p-3.5">Total Overdue</th>
                  <th className="p-3.5">BOM / DPD</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D6D6D6]">
                {customers.map((cust) => (
                  <tr key={cust.id} className="hover:bg-[#FFFBE6]:bg-[#1A1A1A] transition-colors">
                    <td className="p-3.5">
                      <span className="font-black text-[#111111] block text-sm">{cust.full_name}</span>
                      <span className="text-[10px] text-[#666666] font-mono">{cust.customer_id || `CUST-${cust.id}`}</span>
                    </td>
                    <td className="p-3.5 font-mono font-black text-[#111111]">
                      {cust.proposal_no || cust.loan_account_number || 'N/A'}
                    </td>
                    <td className="p-3.5">
                      <div className="flex items-center gap-1 font-mono font-medium text-[#111111]">
                        <Phone className="w-3.5 h-3.5 text-[#666666]" />
                        {cust.phone}
                      </div>
                      <span className="text-[11px] text-[#666666] block">{cust.city}, {cust.state}</span>
                    </td>
                    <td className="p-3.5">
                      <span className="font-mono bg-[#111111] text-[#FFFFFF] px-2 py-0.5 rounded border border-[#333333] font-bold inline-block mb-1">
                        {cust.registration_number || 'N/A'}
                      </span>
                      <span className="text-[11px] text-[#666666] block">{cust.vehicle_model || cust.asset_desc || 'Commercial Asset'}</span>
                    </td>
                    <td className="p-3.5 font-mono font-black text-[#111111]">
                      ₹{Number(cust.outstanding_amount || 0).toLocaleString('en-IN')}
                    </td>
                    <td className="p-3.5 font-mono font-black text-[#111111]">
                      ₹{Number(cust.total_overdue || cust.outstanding_amount || 0).toLocaleString('en-IN')}
                    </td>
                    <td className="p-3.5 font-mono font-black text-[#111111]">
                      {cust.dpd ? `${cust.dpd} DPD` : cust.bom_bucket || '30 DPD'}
                    </td>
                    <td className="p-3.5">
                      <StatusBadge status={cust.case_status || 'PENDING'} />
                    </td>
                    <td className="p-3.5 text-center">
                      <button
                        onClick={() => openCustomerModal(cust)}
                        className="px-3 py-1.5 bg-[#FEF9C3] hover:bg-[#FACC15] text-[#000000] font-black rounded-lg text-xs transition-colors inline-flex items-center gap-1 border border-[#EAB308]/40"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Customer Full Detail Modal */}
      {selectedCustomer && (
        <Modal
          isOpen={!!selectedCustomer}
          onClose={() => setSelectedCustomer(null)}
          title={`Customer Case Dossier: ${selectedCustomer.full_name}`}
        >
          {loadingDetails ? (
            <div className="py-12 text-center text-[#666666]">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto text-[#FACC15] mb-2" />
              Loading database dossier...
            </div>
          ) : (
            <div className="space-y-6 text-xs text-[#111111]">
              {/* Top Banner */}
              <div className="p-4 bg-[#111111] text-white rounded-xl flex items-center justify-between border border-[#333333]">
                <div>
                  <h3 className="text-lg font-black text-white">{selectedCustomer.full_name}</h3>
                  <p className="text-xs text-[#FACC15] font-mono">Proposal No: {selectedCustomer.proposal_no || selectedCustomer.loan_account_number}</p>
                </div>
                <StatusBadge status={selectedCustomer.case_status || 'PENDING'} />
              </div>

              {/* Grid sections */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 1. Customer Personal */}
                <div className="p-4 bg-[#FAFAFA] border border-[#D6D6D6] rounded-xl space-y-2">
                  <h4 className="font-black text-[#000000] uppercase tracking-wider text-[11px]">
                    Customer Personal Info
                  </h4>
                  <p><strong className="text-[#111111] font-bold">Customer ID:</strong> {selectedCustomer.customer_id || `CUST-${selectedCustomer.id}`}</p>
                  <p><strong className="text-[#111111] font-bold">Mobile Phone:</strong> {selectedCustomer.phone}</p>
                  <p><strong className="text-[#111111] font-bold">Residence Address:</strong> {selectedCustomer.address}</p>
                  <p><strong className="text-[#111111] font-bold">City & State:</strong> {selectedCustomer.city}, {selectedCustomer.state}</p>
                </div>

                {/* 2. Loan & Financial */}
                <div className="p-4 bg-[#FAFAFA] border border-[#D6D6D6] rounded-xl space-y-2">
                  <h4 className="font-black text-[#000000] uppercase tracking-wider text-[11px]">
                    Loan & POS Overdue
                  </h4>
                  <p><strong className="text-[#111111] font-bold">Proposal No:</strong> {selectedCustomer.proposal_no || selectedCustomer.loan_account_number}</p>
                  <p><strong className="text-[#111111] font-bold">POS Outstanding:</strong> ₹{Number(selectedCustomer.outstanding_amount || 0).toLocaleString('en-IN')}</p>
                  <p><strong className="text-[#111111] font-bold">EMI Amount:</strong> ₹{Number(selectedCustomer.emi_amount || 0).toLocaleString('en-IN')}</p>
                  <p><strong className="text-[#111111] font-bold">Total Overdue:</strong> ₹{Number(selectedCustomer.total_overdue || selectedCustomer.outstanding_amount || 0).toLocaleString('en-IN')}</p>
                  <p><strong className="text-[#111111] font-bold">BOM Bucket / DPD:</strong> {selectedCustomer.dpd ? `${selectedCustomer.dpd} DPD` : '30 DPD'}</p>
                </div>

                {/* 3. Vehicle Specifications */}
                <div className="p-4 bg-[#FAFAFA] border border-[#D6D6D6] rounded-xl space-y-2 md:col-span-2">
                  <h4 className="font-black text-[#000000] uppercase tracking-wider text-[11px]">
                    Vehicle Specifications & Asset Details
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div>
                      <span className="text-[10px] text-[#666666] block uppercase font-bold">Registration No</span>
                      <span className="font-mono bg-[#111111] text-[#FFFFFF] px-2 py-0.5 rounded border border-[#333333] font-bold inline-block text-xs">
                        {selectedCustomer.registration_number || 'N/A'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#666666] block uppercase font-bold">Asset Description</span>
                      <span className="font-bold text-[#111111]">{selectedCustomer.vehicle_model || selectedCustomer.asset_desc || 'Commercial Asset'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#666666] block uppercase font-bold">Engine Number</span>
                      <span className="font-mono font-bold text-[#111111]">{selectedCustomer.engine_number || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#666666] block uppercase font-bold">Chassis Number</span>
                      <span className="font-mono font-bold text-[#111111]">{selectedCustomer.chassis_number || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 4. Expandable Section: Original Imported Data */}
              {(selectedCustomer.imported_excel_data || (customerDetails?.loans?.[0]?.imported_excel_data)) && (
                <div className="border border-[#D6D6D6] rounded-xl overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setShowOriginalData(!showOriginalData)}
                    className="w-full p-3.5 bg-[#F2F2F2] font-black text-[#111111] flex items-center justify-between hover:bg-[#D6D6D6] transition-colors border-b border-[#D6D6D6]"
                  >
                    <span className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-[#FACC15]" />
                      Original Imported Data (All Raw Excel Columns)
                    </span>
                    {showOriginalData ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>

                  {showOriginalData && (
                    <div className="p-4 bg-[#000000] text-[#D6D6D6] font-mono text-[11px] overflow-x-auto">
                      {(() => {
                        const raw = parseRawExcelData(selectedCustomer.imported_excel_data || customerDetails?.loans?.[0]?.imported_excel_data);
                        if (!raw) return <p className="text-[#666666]">No extra Excel attributes stored.</p>;
                        return (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {Object.entries(raw).map(([key, val]) => (
                              <div key={key} className="p-2 bg-[#111111] rounded border border-[#333333] flex justify-between gap-2">
                                <span className="text-[#FACC15] font-bold">{key}:</span>
                                <span className="text-white text-right">{String(val)}</span>
                              </div>
                            ))}
                          </div>
                        );
                      })()}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </Modal>
      )}
    </div>
  );
};
