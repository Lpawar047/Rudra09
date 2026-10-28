import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { CaseAssignment, User, RecoveryCase } from '../types';
import { DataTable, Column } from '../components/DataTable';
import { Modal } from '../components/Modal';
import { AssignmentSuccessModal, AssignmentData } from '../components/AssignmentSuccessModal';
import { UserCheck, Plus, Search, FileText, CheckCircle2, RotateCcw } from 'lucide-react';

export const AdminAssignments: React.FC = () => {
  const [assignments, setAssignments] = useState<CaseAssignment[]>([]);
  const [employees, setEmployees] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Quick Assignment Modal State
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignCaseId, setAssignCaseId] = useState('');
  const [assignEmpId, setAssignEmpId] = useState('');
  const [assignRemarks, setAssignRemarks] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [caseSearchQuery, setCaseSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<RecoveryCase[]>([]);
  const [isSearchingCase, setIsSearchingCase] = useState(false);
  const [selectedCasePreview, setSelectedCasePreview] = useState<RecoveryCase | null>(null);

  // Success Confirmation Modal
  const [assignmentSuccessData, setAssignmentSuccessData] = useState<AssignmentData | null>(null);

  useEffect(() => {
    fetchAssignments();
    fetchEmployees();
  }, []);

  const fetchAssignments = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/assignments');
      setAssignments(res.data.assignments || []);
    } catch (err) {
      console.error('Failed to fetch assignments', err);
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

  const handleSearchCases = async (q: string) => {
    setCaseSearchQuery(q);
    if (!q || q.trim().length < 2) {
      setSearchResults([]);
      return;
    }
    setIsSearchingCase(true);
    try {
      const res = await api.get(`/recovery-cases?search=${encodeURIComponent(q.trim())}&limit=5`);
      setSearchResults(res.data.cases || []);
    } catch (err) {
      console.error('Search cases error:', err);
    } finally {
      setIsSearchingCase(false);
    }
  };

  const handleSelectCase = (c: RecoveryCase) => {
    setSelectedCasePreview(c);
    setAssignCaseId(String(c.id));
    setSearchResults([]);
    setCaseSearchQuery(`${c.recovery_code || '#' + c.id} - ${c.loan_account_number || ''} (${c.customer_name || ''})`);
  };

  const handleAssignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignCaseId || !assignEmpId) {
      alert('Please select a recovery case and a field officer.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.post('/assignments', {
        case_id: parseInt(assignCaseId, 10),
        employee_id: parseInt(assignEmpId, 10),
        remarks: assignRemarks,
      });

      setShowAssignModal(false);
      setAssignCaseId('');
      setAssignEmpId('');
      setAssignRemarks('');
      setCaseSearchQuery('');
      setSelectedCasePreview(null);
      fetchAssignments();

      if (res.data?.assignment) {
        setAssignmentSuccessData(res.data.assignment);
      }
    } catch (err: any) {
      console.error('Case assignment error:', err);
      const errMsg = err.response?.data?.message || 'Failed to assign case. Please verify the IDs and try again.';
      alert(errMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns: Column<CaseAssignment>[] = [
    {
      header: 'Assignment ID',
      accessor: (row) => <span className="font-bold text-[#111111] font-mono">#ASN-{row.id}</span>,
    },
    {
      header: 'Case / Loan Acc',
      accessor: (row) => (
        <div>
          <p className="font-black text-[#111111]">Case #{row.case_id}</p>
          <p className="text-[11px] text-[#666666] font-mono">{row.loan_account_number}</p>
        </div>
      ),
    },
    {
      header: 'Borrower',
      accessor: (row) => <span className="font-bold text-[#111111]">{row.customer_name}</span>,
    },
    {
      header: 'Assigned Officer',
      accessor: (row) => (
        <span className="font-black text-[#000000] bg-[#FEF9C3] px-2.5 py-1 rounded-md border border-[#EAB308]/40 text-xs shadow-2xs">
          {row.employee_name}
        </span>
      ),
    },
    {
      header: 'Previous Officer',
      accessor: (row) => (
        row.previous_employee_name 
          ? <span className="font-medium text-[#111111]">{row.previous_employee_name}</span> 
          : <span className="text-[#666666] italic">None</span>
      ),
    },
    {
      header: 'Assigned By',
      accessor: (row) => <span className="font-medium text-[#111111]">{row.assigned_by_name}</span>,
    },
    {
      header: 'Date & Time',
      accessor: (row) => <span className="text-[#111111]">{new Date(row.assigned_at).toLocaleString()}</span>,
      sortable: true,
    },
    {
      header: 'Remarks',
      accessor: (row) => <span className="text-xs text-[#666666] italic">{row.remarks || 'Standard assignment'}</span>,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-[#111111] tracking-tight">Case Assignment Audit History</h1>
            <span className="px-2.5 py-0.5 rounded-lg bg-[#FEF9C3] text-[#000000] border border-[#EAB308] font-bold text-xs">
              {assignments.length} Logged
            </span>
          </div>
          <p className="text-xs text-[#666666] font-medium mt-1">
            Complete historical record of case transfers, delegations, and management audit trail.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setShowAssignModal(true);
            setSelectedCasePreview(null);
            setCaseSearchQuery('');
            setAssignRemarks('');
          }}
          className="min-h-[44px] px-5 py-2.5 bg-[#FACC15] hover:bg-[#EAB308] text-[#000000] font-black rounded-xl text-xs flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>+ Delegate / Assign Case</span>
        </button>
      </div>

      <DataTable
        columns={columns}
        data={assignments}
        keyExtractor={(item) => item.id}
        isLoading={isLoading}
        emptyMessage="No assignment history logged."
      />

      {/* Manual Quick Assignment Modal */}
      <Modal
        isOpen={showAssignModal}
        onClose={() => setShowAssignModal(false)}
        title="Assign Recovery Case to Officer"
      >
        <form onSubmit={handleAssignSubmit} className="space-y-4 text-xs text-[#111111]">
          {/* Case Lookup Search */}
          <div>
            <label className="block font-bold text-[#111111] mb-1">
              Select Recovery Case (Search by Proposal No, Borrower, or ID)
            </label>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-3 text-[#666666]" />
              <input
                type="text"
                placeholder="Type Proposal No, Customer Name, or Case #..."
                value={caseSearchQuery}
                onChange={(e) => handleSearchCases(e.target.value)}
                className="min-h-[42px] w-full pl-10 pr-3.5 py-2 bg-[#FFFFFF] border border-[#D6D6D6] rounded-xl text-[#111111] font-medium focus:ring-2 focus:ring-[#FACC15]"
              />
            </div>

            {/* Live Search Autocomplete Dropdown */}
            {searchResults.length > 0 && (
              <div className="mt-1 max-h-48 overflow-y-auto bg-[#FFFFFF] border border-[#D6D6D6] rounded-xl shadow-lg divide-y divide-[#F3F4F6] z-10">
                {searchResults.map((c) => (
                  <div
                    key={c.id}
                    onClick={() => handleSelectCase(c)}
                    className="p-2.5 hover:bg-[#FEF9C3] cursor-pointer transition-colors flex items-center justify-between"
                  >
                    <div>
                      <p className="font-bold text-[#111111]">
                        {c.customer_name} <span className="text-xs text-[#6B7280]">({c.taluka || 'Nashik'})</span>
                      </p>
                      <p className="text-[11px] font-mono text-[#4B5563]">
                        {c.loan_account_number} • Reg: {c.registration_number || 'N/A'}
                      </p>
                    </div>
                    <span className="font-bold font-mono text-xs text-[#111111] bg-[#F3F4F6] px-2 py-0.5 rounded">
                      Case #{c.id}
                    </span>
                  </div>
                ))}
              </div>
            )}
            {isSearchingCase && <p className="text-[11px] text-[#666666] mt-1">Searching matching cases...</p>}
          </div>

          {/* Selected Case Preview Tag */}
          {selectedCasePreview && (
            <div className="p-3 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl text-xs space-y-1">
              <p className="font-black text-[#111111]">Selected Case #{selectedCasePreview.id}</p>
              <p className="text-[#4B5563]">Borrower: <strong>{selectedCasePreview.customer_name}</strong></p>
              <p className="text-[#4B5563]">Proposal: <strong className="font-mono">{selectedCasePreview.loan_account_number}</strong></p>
              <p className="text-[#4B5563]">Taluka: <strong>{selectedCasePreview.taluka || 'Nashik'}</strong></p>
            </div>
          )}

          {/* Target Employee Dropdown */}
          <div>
            <label className="block font-bold text-[#111111] mb-1">
              Assign To Field Officer
            </label>
            <select
              required
              value={assignEmpId}
              onChange={(e) => setAssignEmpId(e.target.value)}
              className="min-h-[44px] w-full px-3.5 py-2.5 bg-[#FFFFFF] border border-[#D6D6D6] rounded-xl text-[#111111] font-bold focus:ring-2 focus:ring-[#FACC15]"
            >
              <option value="">Choose Field Officer...</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.name} ({emp.email}) - {emp.department || 'Field Team'}
                </option>
              ))}
            </select>
          </div>

          {/* Remarks */}
          <div>
            <label className="block font-bold text-[#111111] mb-1">
              Assignment Remarks / Instructions
            </label>
            <textarea
              rows={3}
              value={assignRemarks}
              onChange={(e) => setAssignRemarks(e.target.value)}
              className="w-full p-3 bg-[#FFFFFF] border border-[#D6D6D6] rounded-xl text-[#111111] placeholder:text-[#666666] focus:ring-2 focus:ring-[#FACC15]"
              placeholder="Provide specific directives or recovery deadlines..."
            />
          </div>

          {/* Modal Actions */}
          <div className="flex justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={() => setShowAssignModal(false)}
              className="min-h-[42px] px-4 py-2 bg-[#F2F2F2] hover:bg-[#E5E5E5] text-[#111111] rounded-xl font-bold border border-[#D6D6D6] transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !assignCaseId || !assignEmpId}
              className="min-h-[42px] px-5 py-2.5 bg-[#FACC15] hover:bg-[#EAB308] text-[#000000] font-black rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? 'Delegating...' : 'Confirm Assignment'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Assignment Success Dossier Modal */}
      <AssignmentSuccessModal
        isOpen={Boolean(assignmentSuccessData)}
        onClose={() => setAssignmentSuccessData(null)}
        assignment={assignmentSuccessData}
      />
    </div>
  );
};
export default AdminAssignments;
